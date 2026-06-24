#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
assemble.py — Assembleur de livret (Mme Le Guern)

1) Fusionne plusieurs PDF en un seul (livret généré + activités flocon/arbre…).
2) Option --cahier : imposition « cahier piqué » 2 pages A4 par face A3 paysage,
   dans l'ordre de pliage (à imprimer en recto-verso bord court, puis plier + agrafer cheval).

Exemples :
  python3 assemble.py LIVRET.pdf flocon.pdf arbre.pdf -o COMPLET.pdf
  python3 assemble.py COMPLET.pdf --cahier -o COMPLET_cahier_A3.pdf
"""
import argparse
import tempfile
from pathlib import Path
from pypdf import PdfReader, PdfWriter, PageObject, Transformation, PaperSize

A4_W, A4_H = PaperSize.A4.width, PaperSize.A4.height       # portrait (pt) ≈ 595 x 842
A3_W, A3_H = A4_W * 2, A4_H                                  # A3 paysage = 2 A4 côte à côte ≈ 1190 x 842

def merge(paths, out):
    w = PdfWriter()
    for p in paths:
        for pg in PdfReader(p).pages:
            w.add_page(pg)
    with open(out, "wb") as f:
        w.write(f)
    print(f"  [OK] fusion -> {out}  ({len(w.pages)} pages)")

def booklet_order(n):
    """Ordre cahier piqué pour n pages (complété à un multiple de 4)."""
    while n % 4: n += 1
    seq, left, right = [], n, 1
    while left > right:
        seq += [(left, right), (right + 1, left - 1)]  # face recto (G,D) puis verso (G,D)
        right += 2; left -= 2
    return n, seq  # paires de numéros de page (1-indexés ; 0 = page blanche)

def impose(in_pdf, out):
    src = PdfReader(in_pdf)
    pages = list(src.pages)
    real = len(pages)
    total, pairs = booklet_order(real)
    blank = PageObject.create_blank_page(width=A4_W, height=A4_H)
    def get(i): return pages[i-1] if 1 <= i <= real else blank
    w = PdfWriter()
    for a, b in pairs:
        sheet = PageObject.create_blank_page(width=A3_W, height=A3_H)
        # gauche
        lp = get(a)
        sheet.merge_transformed_page(lp, Transformation().scale(A4_W/float(lp.mediabox.width)))
        # droite (décalée de A4_W)
        rp = get(b)
        sheet.merge_transformed_page(rp, Transformation().scale(A4_W/float(rp.mediabox.width)).translate(A4_W, 0))
        w.add_page(sheet)
    with open(out, "wb") as f:
        w.write(f)
    sheet_count = total // 4
    sheet_label = "feuille" if sheet_count == 1 else "feuilles"
    print(
        f"  [OK] cahier A3 -> {out}  "
        f"({real} pages -> {sheet_count} {sheet_label} A3)"
    )
    print("    Imprimer recto-verso « bord court », plier au centre, agrafer à cheval.")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdfs", nargs="+")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--cahier", action="store_true", help="imposition cahier piqué A3")
    args = ap.parse_args()
    if args.cahier:
        if len(args.pdfs) > 1:
            with tempfile.TemporaryDirectory() as directory:
                src = Path(directory) / "_merged.pdf"
                merge(args.pdfs, src)
                impose(src, args.out)
        else:
            impose(args.pdfs[0], args.out)
    else:
        merge(args.pdfs, args.out)

if __name__ == "__main__":
    main()
