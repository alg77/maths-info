#!/usr/bin/env python3
"""Génère une progression annuelle d'automatismes / mini-évaluations."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "Studio" / "assets" / "fonts"
OUT = ROOT / "Studio" / "out" / "pdf" / "automatismes"


THEME_COLORS = {
    "N": colors.HexColor("#8fb3d9"),
    "G": colors.HexColor("#e6a18c"),
    "D": colors.HexColor("#8fd3b3"),
    "A": colors.HexColor("#b9a3dd"),
    "C": colors.HexColor("#e7bf78"),
    "M": colors.HexColor("#e7bf78"),
}


def register_fonts() -> tuple[str, str, str]:
    regular = FONTS / "Atkinson-Regular.ttf"
    bold = FONTS / "Atkinson-Bold.ttf"
    title = FONTS / "Baloo2.ttf"
    if regular.exists():
        pdfmetrics.registerFont(TTFont("Atkinson", regular))
    if bold.exists():
        pdfmetrics.registerFont(TTFont("Atkinson-Bold", bold))
    if title.exists():
        pdfmetrics.registerFont(TTFont("Baloo", title))
    return (
        "Atkinson" if regular.exists() else "Helvetica",
        "Atkinson-Bold" if bold.exists() else "Helvetica-Bold",
        "Baloo" if title.exists() else "Helvetica-Bold",
    )


def load_pont(level: str) -> dict:
    for path in [
        ROOT / "Progressions" / f"pont-livret-{level}.json",
        ROOT / "Studio" / "config" / f"pont-livret-{level}.json",
    ]:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    raise FileNotFoundError(f"pont-livret-{level}.json introuvable")


def esc(text: object) -> str:
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def period_for_sequence(index: int, seq: dict, periods: list[dict]) -> int:
    """Répartit les séquences dans les périodes selon les durées en semaines."""
    current = 1
    elapsed = 0.0
    boundaries = []
    total = 0.0
    for p in periods:
        total += float(p.get("semaines") or 0)
        boundaries.append((int(p.get("periode", len(boundaries) + 1)), total))
    target = elapsed
    # Recalcul par cumul des séquences précédentes fait dans enrich_sequences.
    return current


def enrich_sequences(pont: dict) -> list[dict]:
    periods = pont.get("periodes") or []
    boundaries = []
    total = 0.0
    for p in periods:
        total += float(p.get("semaines") or 0)
        boundaries.append((int(p.get("periode", len(boundaries) + 1)), total))
    if not boundaries:
        boundaries = [(1, 999)]
    elapsed = 0.0
    enriched = []
    for seq in pont.get("sequences", []):
        period = boundaries[-1][0]
        for pnum, limit in boundaries:
            if elapsed < limit:
                period = pnum
                break
        item = dict(seq)
        item["periode"] = period
        enriched.append(item)
        elapsed += float(seq.get("semaines") or 1)
    return enriched


def mini_eval_label(seq: dict) -> str:
    autos = seq.get("automatismes") or []
    if not autos:
        return "Pas de mini-évaluation dédiée : entretien oral / flash possible."
    return "Mini-éval spiralaire : 20 questions, règle 6+6+4+4 dès que 4 automatismes sont débloqués."


def build(level: str, annee: str, prof: str, out: Path) -> Path:
    regular, bold, title_font = register_fonts()
    pont = load_pont(level)
    seqs = enrich_sequences(pont)
    periods = pont.get("periodes") or []
    out.parent.mkdir(parents=True, exist_ok=True)

    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "title", parent=base["Title"], fontName=title_font, fontSize=24, leading=28,
            textColor=colors.HexColor("#4e3b62"), alignment=TA_CENTER, spaceAfter=8,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=base["BodyText"], fontName=regular, fontSize=10.5, leading=14,
            textColor=colors.HexColor("#7a6c7e"), alignment=TA_CENTER, spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName=title_font, fontSize=16, leading=19,
            textColor=colors.HexColor("#5d4baa"), spaceBefore=8, spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body", parent=base["BodyText"], fontName=regular, fontSize=9.2, leading=12.2,
            textColor=colors.HexColor("#3f3540"),
        ),
        "small": ParagraphStyle(
            "small", parent=base["BodyText"], fontName=regular, fontSize=7.8, leading=9.6,
            textColor=colors.HexColor("#5e5362"),
        ),
        "strong": ParagraphStyle(
            "strong", parent=base["BodyText"], fontName=bold, fontSize=9.4, leading=12,
            textColor=colors.HexColor("#263f84"),
        ),
    }

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(regular, 7.5)
        canvas.setFillColor(colors.HexColor("#8c78a5"))
        canvas.drawString(15 * mm, 9 * mm, f"SakuraMaths - Automatismes {level} - {annee} - {prof}")
        canvas.drawRightString(195 * mm, 9 * mm, str(doc.page))
        canvas.restoreState()

    doc = BaseDocTemplate(
        str(out), pagesize=A4, rightMargin=13 * mm, leftMargin=13 * mm,
        topMargin=14 * mm, bottomMargin=16 * mm,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])

    story = [
        Paragraph(f"Progression automatismes - {level}", styles["title"]),
        Paragraph(f"Mini-évaluations de calcul mental et automatismes - {annee} - {prof}", styles["subtitle"]),
    ]
    summary = [
        [Paragraph("<b>Principe</b>", styles["strong"]), Paragraph("Rituels courts en classe, puis mini-évaluation obligatoire. La note compte dans la moyenne.", styles["body"])],
        [Paragraph("<b>Rattrapage</b>", styles["strong"]), Paragraph("Un rattrapage possible une fois, sur les mêmes automatismes, après entraînement ciblé.", styles["body"])],
        [Paragraph("<b>Format officiel SakuraMaths</b>", styles["strong"]), Paragraph("20 questions, 10 à 15 minutes, barème /20 : 1 point par question. Correction rapide pour garder le rythme.", styles["body"])],
        [Paragraph("<b>Spirale</b>", styles["strong"]), Paragraph("Règle standard : 6 + 6 questions sur les 2 automatismes les plus récents, puis 4 + 4 questions sur 2 automatismes plus anciens.", styles["body"])],
        [Paragraph("<b>Adaptation</b>", styles["strong"]), Paragraph("Si moins de 4 automatismes sont débloqués : 1 automatisme = 20 ; 2 automatismes = 10 + 10 ; 3 automatismes = 8 + 7 + 5.", styles["body"])],
    ]
    table = Table(summary, colWidths=[34 * mm, 137 * mm], hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff7fb")),
        ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#ead8e5")),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#ead8e5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.extend([table, Spacer(1, 6 * mm)])

    for period in sorted({s.get("periode", 1) for s in seqs}):
        pmeta = next((p for p in periods if int(p.get("periode", 0)) == period), {})
        label = f"Période {period}"
        if pmeta.get("debut") and pmeta.get("fin"):
            label += f" - {pmeta['debut']} au {pmeta['fin']}"
        story.append(Paragraph(label, styles["h2"]))
        rows = [[
            Paragraph("Chapitre", styles["strong"]),
            Paragraph("Automatismes travaillés", styles["strong"]),
            Paragraph("Mini-éval", styles["strong"]),
        ]]
        for seq in [s for s in seqs if s.get("periode") == period]:
            autos = seq.get("automatismes") or []
            auto_text = "<br/>".join(
                f"<b>{esc(a.get('code'))}</b> {esc(a.get('texte'))}" for a in autos[:6]
            )
            if len(autos) > 6:
                auto_text += f"<br/><i>+ {len(autos) - 6} automatisme(s) à répartir en entraînement.</i>"
            if not autos:
                auto_text = "<i>Entretien spiralé, pas d'automatisme dédié dans le pont.</i>"
            rows.append([
                Paragraph(f"<b>{esc(seq.get('code'))}</b><br/>{esc(seq.get('titre'))}", styles["body"]),
                Paragraph(auto_text, styles["small"]),
                Paragraph(mini_eval_label(seq), styles["small"]),
            ])
        t = Table(rows, colWidths=[42 * mm, 86 * mm, 43 * mm], repeatRows=1, hAlign="CENTER")
        period_color = colors.HexColor(["#fff0f4", "#eef5ff", "#edf9f2", "#fff7e8", "#f5efff"][(period - 1) % 5])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7667ba")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("BACKGROUND", (0, 1), (-1, -1), period_color),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#dfd7eb")),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#dfd7eb")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 4 * mm))

    doc.build(story)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Génère une progression PDF d'automatismes / mini-évaluations.")
    parser.add_argument("--niveau", default="4e")
    parser.add_argument("--annee", default="2026-2027")
    parser.add_argument("--prof", default="Mme Le Guern")
    parser.add_argument("--out")
    args = parser.parse_args()
    output = Path(args.out) if args.out else OUT / args.niveau / f"progression-automatismes-{args.niveau}.pdf"
    output = output if output.is_absolute() else ROOT / output
    result = build(args.niveau, args.annee, args.prof, output)
    print(f"PDF généré : {result}")


if __name__ == "__main__":
    main()
