#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_livret.py (v3) — Générateur de livrets (Mme Le Guern)
Source unique -> PROF / ÉLÈVE, PDF + HTML web + SÉLECTEUR interactif.

v3 :
  - Ligne compétences mappée sur le référentiel (codes Ca3, Mo1… -> libellés)
  - Polices portables (cherchées à côté du script, dossier ./fonts)
  - Mode interactif + générateur de SÉLECTEUR HTML (--builder) :
    cocher des chapitres, choisir la période, basculer prof/élève,
    exporter en HTML, imprimer en PDF, exporter un manifeste .txt.
"""
import argparse, base64, html, io, json, re
from pathlib import Path
from weasyprint import HTML

try:
    import qrcode
    HAS_QR = True
except ImportError:
    HAS_QR = False

FONT_DIR = Path(__file__).resolve().parent / "fonts"   # portable
THEME = {"N": "#3B82C4", "G": "#E05A6B", "D": "#2BA98E", "A": "#8B6FB0", "C": "#E0A23B"}
PONT, EXOMAP = {}, {}   # pont-livret (objectifs auto) + map objectif->URL MathALÉA

# Référentiel (extrait du Gantt 4e — libellés à ajuster librement)
COMP_MAP = {
    "Ch1": "Extraire des informations et les reformuler",
    "Mo1": "Reconnaître et utiliser un modèle mathématique",
    "Mo2": "Traduire en langage mathématique une situation réelle",
    "Re1": "Choisir et relier des cadres (numérique, algébrique, géométrique)",
    "Re3": "Représenter des données (tableaux, graphiques)",
    "Re4": "Représenter des solides et des situations spatiales",
    "Ra3": "Démontrer : raisonner logiquement pour conclure",
    "Ca2": "Contrôler la vraisemblance (ordres de grandeur, encadrements)",
    "Ca3": "Calculer en utilisant le langage algébrique",
    "Co1": "Faire le lien entre langage naturel et langage algébrique",
    "Co2": "Expliquer à l'oral ou à l'écrit",
}

# ============================================================ INLINE
def make_qr(url):
    if not HAS_QR:
        return f'<span class="qr-missing">[QR: {html.escape(url)}]</span>'
    img = qrcode.make(url)
    buf = io.BytesIO(); img.save(buf, format="PNG")
    return f'<img class="qr" src="data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}" alt="QR"/>'

def mathify(s):
    """Mini-convertisseur LaTeX → HTML (sous-ensemble collège)."""
    cmds = []
    s = re.sub(r'\\[a-zA-Z]+', lambda m: cmds.append(m.group(0)) or f'\x00{len(cmds)-1}\x00', s)
    s = re.sub(r'[A-Za-z]+', lambda m: f'<em>{m.group()}</em>', s)          # variables en italique
    s = re.sub(r'\x00(\d+)\x00', lambda m: cmds[int(m.group(1))], s)        # restaure les commandes
    for k, v in {'\\times':'×','\\div':'÷','\\cdot':'·','\\pm':'±','\\leq':'≤','\\le':'≤',
                 '\\geq':'≥','\\ge':'≥','\\neq':'≠','\\ne':'≠','\\approx':'≈','\\pi':'π',
                 '\\ldots':'…','\\dots':'…','\\%':'%','\\,':'\u2009'}.items():
        s = s.replace(k, v)
    s = re.sub(r'\\sqrt\{([^{}]*)\}', r'√<span class="sqrtarg">\1</span>', s)
    for _ in range(4):
        s2 = re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}',
                    r'<span class="frac"><span class="fnum">\1</span><span class="fden">\2</span></span>', s)
        if s2 == s: break
        s = s2
    s = re.sub(r'\^\{([^{}]*)\}', r'<sup>\1</sup>', s)
    s = re.sub(r'\^(<em>\w</em>|\w)', r'<sup>\1</sup>', s)
    s = re.sub(r'_\{([^{}]*)\}', r'<sub>\1</sub>', s)
    s = re.sub(r'_(<em>\w</em>|\w)', r'<sub>\1</sub>', s)
    return f'<span class="math">{s}</span>'

def _inline_basic(text):
    text = re.sub(r'\[qr:([^\]]+)\]', lambda m: make_qr(m.group(1).strip()), text)
    text = re.sub(r'\^\{([^}]+)\}', r'<sup>\1</sup>', text)
    text = re.sub(r'\^(\w)', r'<sup>\1</sup>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    return text

def inline(text):
    out, last = [], 0
    for m in re.finditer(r'\$(.+?)\$', text):
        out.append(_inline_basic(text[last:m.start()]))
        out.append(mathify(m.group(1)))
        last = m.end()
    out.append(_inline_basic(text[last:]))
    return "".join(out)

def blank_width(ans):
    n = len(re.sub(r'[*^{}]', '', ans))
    return max(2.5, min(n * 0.55, 30))

def process(text, mode):
    out, last = [], 0
    for m in re.finditer(r'\[\[(.+?)\]\]', text):
        out.append(inline(text[last:m.start()]))
        ans = m.group(1)
        if mode == "prof":
            out.append(f'<span class="rep">{inline(ans)}</span>')
        elif mode == "inter":
            out.append(f'<span class="ans">{inline(ans)}</span>')
        else:
            out.append(f'<span class="blank" style="min-width:{blank_width(ans):.1f}em"></span>')
        last = m.end()
    out.append(inline(text[last:]))
    return "".join(out)

# ============================================================ PARSER
def load_source(path, _seen=None):
    _seen = _seen or set()
    p = Path(path).resolve()
    if p in _seen: return ""
    _seen.add(p)
    out = []
    for ln in p.read_text(encoding="utf-8").split("\n"):
        m = re.match(r'\s*@include\s+(.+)\s*$', ln)
        out.append(load_source(p.parent / m.group(1).strip(), _seen) if m else ln)
    return "\n".join(out)

def parse(src):
    lines = src.split("\n"); blocks, i = [], 0
    while i < len(lines):
        s = lines[i].strip()
        if not s: i += 1; continue
        if s.startswith("# "):
            parts = [p.strip() for p in s[2:].split("|")]
            blocks.append(("header", (parts[0] if parts else "",
                                      parts[1] if len(parts) > 1 else "",
                                      parts[2] if len(parts) > 2 else "",
                                      parts[3] if len(parts) > 3 else ""))); i += 1; continue
        if s.startswith("## "):
            blocks.append(("section", s[3:].strip())); i += 1; continue
        if s.startswith(":::"):
            head = s[3:].strip(); btype, _, btitle = head.partition("|")
            btype, btitle = btype.strip(), btitle.strip()
            body, i = [], i + 1
            while i < len(lines) and lines[i].strip() != ":::":
                body.append(lines[i]); i += 1
            i += 1
            blocks.append(("box", (btype, btitle, body))); continue
        para = []
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(("#", ":::")):
            para.append(lines[i]); i += 1
        blocks.append(("para", para))
    return blocks

# ============================================================ RENDU
def render_table(rows, mode):
    def cells(r): return [c.strip() for c in r.strip().strip('|').split('|')]
    has_sep = len(rows) > 1 and set(rows[1].replace('|','').replace('-','').replace(':','').strip()) == set()
    out, start = [], 0
    if has_sep:
        out.append("<tr>" + "".join(f"<th>{process(c, mode)}</th>" for c in cells(rows[0])) + "</tr>")
        start = 2
    for r in rows[start:]:
        out.append("<tr>" + "".join(f"<td>{process(c, mode)}</td>" for c in cells(r)) + "</tr>")
    return f'<table class="grid">{"".join(out)}</table>'

def lines_html(body, mode):
    out, i, n, in_ul = [], 0, len(body), False
    while i < n:
        ln = body[i]; t = ln.strip()
        if t.startswith('<svg'):
            if in_ul: out.append("</ul>"); in_ul = False
            buf = [ln]
            while '</svg>' not in ln and i + 1 < n:
                i += 1; ln = body[i]; buf.append(ln)
            out.append("\n".join(buf)); i += 1; continue
        if t.startswith('|'):
            if in_ul: out.append("</ul>"); in_ul = False
            rows = []
            while i < n and body[i].strip().startswith('|'):
                rows.append(body[i].strip()); i += 1
            out.append(render_table(rows, mode)); continue
        if not t:
            if in_ul: out.append("</ul>"); in_ul = False
            i += 1; continue
        if t.startswith("- "):
            if not in_ul: out.append("<ul>"); in_ul = True
            out.append(f"<li>{process(t[2:], mode)}</li>"); i += 1; continue
        if in_ul: out.append("</ul>"); in_ul = False
        out.append(f"<p>{process(t, mode)}</p>"); i += 1
    if in_ul: out.append("</ul>")
    return "\n".join(out)

BOX_LABEL = {"def":"Définition","regle":"Règle","prop":"Propriété","methode":"Méthode",
             "reussite":"Critères de réussite","rappel":"Je me souviens","retenu":"J'ai retenu",
             "ressources":"Pour aller plus loin"}

def fox_svg():
    return ('<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" class="cover-animal">'
      '<polygon points="128,150 192,120 178,170 150,182" fill="#6BA3D6"/>'
      '<polygon points="178,170 192,120 196,158" fill="#3B6FA0"/>'
      '<polygon points="150,182 178,170 158,196" fill="#EAF2FB"/>'
      '<polygon points="100,120 150,200 50,200" fill="#3B82C4"/>'
      '<polygon points="100,120 128,200 72,200" fill="#6BA3D6"/>'
      '<polygon points="100,150 118,200 82,200" fill="#EAF2FB"/>'
      '<polygon points="60,200 76,200 70,184" fill="#2E5E8C"/>'
      '<polygon points="124,200 140,200 130,184" fill="#2E5E8C"/>'
      '<polygon points="52,78 46,26 88,62" fill="#3B82C4"/>'
      '<polygon points="148,78 154,26 112,62" fill="#3B82C4"/>'
      '<polygon points="58,70 54,40 80,62" fill="#2E5E8C"/>'
      '<polygon points="142,70 146,40 120,62" fill="#2E5E8C"/>'
      '<polygon points="60,66 140,66 132,104 100,132 68,104" fill="#6BA3D6"/>'
      '<polygon points="60,66 100,80 68,104" fill="#3B82C4"/>'
      '<polygon points="140,66 100,80 132,104" fill="#3B82C4"/>'
      '<polygon points="76,100 124,100 100,132" fill="#FDF6E3"/>'
      '<polygon points="80,90 90,86 86,96" fill="#2E3A4C"/>'
      '<polygon points="120,90 110,86 114,96" fill="#2E3A4C"/>'
      '<polygon points="94,122 106,122 100,132" fill="#2E3A4C"/></svg>')

def parse_cover(box_body):
    meta, chaps, in_chaps = {}, [], False
    for l in box_body:
        ls = l.strip()
        if ls.startswith("- ") and in_chaps: chaps.append(ls[2:]); continue
        if ":" in ls:
            k, _, v = ls.partition(":"); k = k.strip().lower(); v = v.strip()
            if k == "chapitres":
                in_chaps = True
                if v: chaps.append(v)
            else:
                in_chaps = False; meta[k] = v
    meta["chapitres"] = chaps
    return meta

ASSET_DIR = Path(__file__).resolve().parent / "assets"

def _img_b64(name):
    for base in (ASSET_DIR, Path("/home/claude/assets")):
        p = base / f"{name}.png"
        if p.exists():
            return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()
    return ""

def sakura(color="#F6C6D8", heart="#F7B7CB"):
    petals = "".join(f'<ellipse cx="50" cy="24" rx="13" ry="22" transform="rotate({a} 50 50)"/>'
                     for a in range(0, 360, 72))
    return (f'<svg viewBox="0 0 100 100" class="petal-svg" xmlns="http://www.w3.org/2000/svg">'
            f'<g fill="{color}">{petals}</g><circle cx="50" cy="50" r="8" fill="{heart}"/></svg>')

def _petals():
    spots = [("top:7mm;left:9mm", 34, .85, 15, "#F4A9C4"),
             ("top:20mm;right:13mm", 26, .7, -20, "#F6C6D8"),
             ("top:46mm;left:16mm", 19, .6, 0, "#F8D3E0"),
             ("bottom:34mm;right:18mm", 30, .65, 30, "#F4A9C4"),
             ("bottom:16mm;left:12mm", 23, .6, -12, "#F6C6D8"),
             ("bottom:48mm;left:46%", 16, .5, 8, "#F8D3E0")]
    return "".join(
        f'<div class="petal" style="{pos};width:{s}px;height:{s}px;opacity:{o};transform:rotate({r}deg)">{sakura(c)}</div>'
        for pos, s, o, r, c in spots)

def render_cover_vacances(meta, mode):
    img = _img_b64(meta.get("illustration", "panda"))
    animal = f'<img class="cv-animal" src="{img}" alt=""/>' if img else fox_svg()
    somm = "".join(
        f'<li><span class="case-somm"></span><span class="c-code">{html.escape(c.split("|")[0].strip())}</span>'
        f'<span class="c-titre">{html.escape(c.split("|",1)[1].strip() if "|" in c else "")}</span></li>'
        for c in meta.get("chapitres", []))
    appartient = ("" if mode == "prof" else
        '<div class="cv-appartient"><b>Ce cahier appartient à :</b> …………………………………………<br>'
        '<b>Classe :</b> ……………………</div>')
    return (f'<section class="cover cover-vac">{_petals()}'
        f'<div class="cv-banner"><div class="cv-eyebrow">CAHIER DE COURS</div>'
        f'<h1 class="cv-title">{html.escape(meta.get("matiere","Mathématiques"))}</h1>'
        f'<div class="cv-sub">{html.escape(meta.get("niveau","4ᵉ"))} · {html.escape(meta.get("periode",""))}</div>'
        f'<div class="cv-by">par {html.escape(meta.get("prof","Mme Le Guern"))} · Maths &amp; NSI</div></div>'
        f'{animal}{appartient}'
        f'<div class="cv-somm-box"><div class="cv-somm-title">Au programme</div>'
        f'<ul class="sommaire">{somm}</ul></div>'
        f'<div class="cv-foot">{html.escape(meta.get("annee",""))}</div></section>')

def render_cover(meta, mode="eleve"):
    if meta.get("style") == "vacances":
        return render_cover_vacances(meta, mode)
    somm = "".join(
        f'<li><span class="case-somm"></span><span class="c-code">{html.escape(c.split("|")[0].strip())}</span>'
        f'<span class="c-titre">{html.escape(c.split("|",1)[1].strip() if "|" in c else "")}</span></li>'
        for c in meta.get("chapitres", []))
    id_block = ("" if mode == "prof" else
      '<div class="cover-id"><div class="idbox"><b>NOM :</b> ………………………<br><b>PRÉNOM :</b> ………………………</div>'
      '<div class="idbox"><b>CLASSE :</b> …………………</div></div>')
    return (f'<section class="cover"><div class="cover-corner tl"></div><div class="cover-corner br"></div>'
      f'{id_block}'
      f'<h1 class="cover-title">{html.escape(meta.get("titre","Cahier de cours"))}</h1>'
      f'<div class="cover-sub">{html.escape(meta.get("matiere","Mathématiques"))} '
      f'<span class="lvl">{html.escape(meta.get("niveau","4ᵉ"))}</span></div>{fox_svg()}'
      f'<div class="cover-periode"><div class="periode-label">{html.escape(meta.get("periode",""))}</div>'
      f'<ul class="sommaire">{somm}</ul></div>'
      f'<div class="cover-foot"><span class="prof">{html.escape(meta.get("prof",""))}</span>'
      f'<span class="annee">{html.escape(meta.get("annee",""))}</span></div></section>')

def render_comp(comp):
    if not comp: return ""
    pills = []
    for c in (x.strip() for x in comp.split(",")):
        if not c: continue
        lab = COMP_MAP.get(c, "")
        pills.append(f'<span class="comp-pill"><b>{html.escape(c)}</b> {html.escape(lab)}</span>')
    return f'<div class="competences">{"".join(pills)}</div>'

def bandeau_html(code, title, niveau):
    return (f'<div class="bandeau"><span class="code">{html.escape(code)}</span>'
            f'<span class="titre">{html.escape(title.upper())}</span>'
            f'<span class="niveau">{html.escape(niveau)}</span></div>')

def render_body(body, mode):
    parts = []
    for kind, data in body:
        if kind == "section":
            parts.append(f'<h2>{process(data, mode)}</h2>')
        elif kind == "para":
            parts.append(lines_html(data, mode))
        elif kind == "box":
            btype, btitle, bbody = data
            if btype == "raw":
                parts.append("\n".join(bbody)); continue
            label = btitle or BOX_LABEL.get(btype, "")
            if btype == "reussite":
                items = "".join(f'<li><span class="case"></span>{process(l.strip(), mode)}</li>'
                                for l in bbody if l.strip())
                inner = f'<ul class="checklist">{items}</ul>'
            elif btype == "ressources":
                items = []
                for l in bbody:
                    ls = l.strip()
                    if ls.startswith("- "):
                        lab, _, url = ls[2:].partition("|")
                        lab, url = lab.strip(), url.strip()
                        qr = make_qr(url) if url else ""
                        items.append(f'<li><span class="res-txt">{inline(lab)}<br>'
                                     f'<span class="res-url">{html.escape(url)}</span></span>{qr}</li>')
                inner = f'<ul class="ressources">{"".join(items)}</ul>'
            else:
                inner = lines_html(bbody, mode)
            lab = f'<span class="box-label">{inline(label)}</span>' if label else ""
            parts.append(f'<div class="box box-{btype}">{lab}{inner}</div>')
    return "\n".join(parts)

def split_chapters(blocks):
    cover, chaps, cur = None, [], None
    for kind, data in blocks:
        if kind == "box" and data[0] == "couverture":
            cover = parse_cover(data[2]); continue
        if kind == "header":
            cur = {"header": data, "body": []}; chaps.append(cur)
        elif cur is not None:
            cur["body"].append((kind, data))
    return cover, chaps


# ===================== CHAPITRE MODÈLE : objectifs auto (depuis pont-livret) =====================
NIV_COL = {"6e":"#e0922f","5e":"#d98ba4","4e":"#6f9bd6","3e":"#5aa98a"}
def _niv_badge(niv):
    return f'<span class="niv-badge" style="background:{NIV_COL.get(niv,"#888")}">{html.escape(niv)}</span>' if niv else ""
FACE = {
 "ok":'<svg viewBox="0 0 24 24" class="face"><circle cx="12" cy="12" r="10" fill="#eafaf0" stroke="#2BA98E" stroke-width="1.4"/><circle cx="8.5" cy="10.2" r="1.15" fill="#2BA98E"/><circle cx="15.5" cy="10.2" r="1.15" fill="#2BA98E"/><path d="M7.8 14q4.2 3.2 8.4 0" fill="none" stroke="#2BA98E" stroke-width="1.5" stroke-linecap="round"/></svg>',
 "mid":'<svg viewBox="0 0 24 24" class="face"><circle cx="12" cy="12" r="10" fill="#fdf6e6" stroke="#E0A23B" stroke-width="1.4"/><circle cx="8.5" cy="10.2" r="1.15" fill="#E0A23B"/><circle cx="15.5" cy="10.2" r="1.15" fill="#E0A23B"/><path d="M8 15h8" fill="none" stroke="#E0A23B" stroke-width="1.5" stroke-linecap="round"/></svg>',
 "no":'<svg viewBox="0 0 24 24" class="face"><circle cx="12" cy="12" r="10" fill="#fdeeee" stroke="#c0392b" stroke-width="1.4"/><circle cx="8.5" cy="10.2" r="1.15" fill="#c0392b"/><circle cx="15.5" cy="10.2" r="1.15" fill="#c0392b"/><path d="M7.8 15.5q4.2 -3.2 8.4 0" fill="none" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/></svg>',
}
def render_objectifs_vises(seq, mode):
    objs = seq.get("objectifs", []) or []
    if not objs: return ""
    lis = "".join(f'<li>{_niv_badge(o.get("niveau",""))}{inline(o.get("texte",""))}</li>' for o in objs)
    return ('<div class="box box-objectifs"><span class="box-label">Objectifs visés</span>'
            "<p class=\"obj-intro\">Dans ce chapitre, j'apprends à&nbsp;:</p>"
            f'<ul class="obj-list">{lis}</ul></div>')
def render_capable(seq, mode):
    objs = seq.get("objectifs", []) or []
    if not objs: return ""
    qrcol = any(EXOMAP.get(o.get("code")) for o in objs)
    extra = '<th class="cap-exo">Pour m\'entraîner</th>' if qrcol else ''
    head = (f'<tr><th class="cap-obj">Je sais…</th>'
            f'<th>{FACE["ok"]}<br><span class="cap-h">oui&nbsp;!</span></th>'
            f'<th>{FACE["mid"]}<br><span class="cap-h">avec aide</span></th>'
            f'<th>{FACE["no"]}<br><span class="cap-h">à retravailler</span></th>{extra}</tr>')
    rows = []
    for o in objs:
        url = EXOMAP.get(o.get("code"))
        cell = (f'<td class="cap-exo">{make_qr(url)}</td>' if url else '<td class="cap-exo"></td>') if qrcol else ''
        rows.append(f'<tr><td class="cap-obj">{_niv_badge(o.get("niveau",""))}{inline(o.get("texte",""))}</td>'
                    f'<td class="cap-tick"></td><td class="cap-tick"></td><td class="cap-tick"></td>{cell}</tr>')
    return ('<div class="capable"><div class="cap-title">Je suis maintenant capable de&nbsp;…</div>'
            f'<table class="grid cap-grid">{head}{"".join(rows)}</table>'
            '<div class="cap-note">Je colorie ou je coche la case qui me correspond pour chaque objectif.</div></div>')

def render(blocks, mode):
    cover, chaps = split_chapters(blocks)
    parts = []
    if cover: parts.append(render_cover(cover, mode))
    for i, ch in enumerate(chaps):
        code, title, niveau, comp = ch["header"]
        theme = THEME.get(code[:1].upper(), THEME["N"])
        brk = "chap-break" if i > 0 else ""
        parts.append(f'<div class="chapitre {brk}" style="--c:{theme}">')
        parts.append(bandeau_html(code, title, niveau))
        parts.append(render_comp(comp))
        seqp = PONT.get(code) or PONT.get(code.upper())
        if seqp: parts.append(render_objectifs_vises(seqp, mode))
        parts.append(render_body(ch["body"], mode))
        if seqp: parts.append(render_capable(seqp, mode))
        parts.append("</div>")
    return "\n".join(parts)

# ============================================================ CSS
def font_faces_file():
    css = []
    def face(fam, fn, w="normal", st="normal"):
        p = FONT_DIR / fn
        return (f'@font-face{{font-family:"{fam}";src:url("file://{p}");font-weight:{w};font-style:{st};}}'
                if p.exists() else "")
    for w, st, f in [("normal","normal","Atkinson-Regular.ttf"),("bold","normal","Atkinson-Bold.ttf"),
                     ("normal","italic","Atkinson-Italic.ttf"),("bold","italic","Atkinson-BoldItalic.ttf")]:
        css.append(face("Atkinson", f, w, st))
    for w, st, f in [("normal","normal","OpenDyslexic-Regular.otf"),("bold","normal","OpenDyslexic-Bold.otf"),
                     ("normal","italic","OpenDyslexic-Italic.otf")]:
        css.append(face("OpenDyslexic", f, w, st))
    css.append(face("Titre", "GrandHotel-Regular.ttf"))
    css.append(face("Bubbly", "Baloo2.ttf"))
    css.append(face("MathVar", "KaTeX_Math-Italic.ttf"))
    return "\n".join(css)

def font_faces_b64():
    faces = [("Atkinson","Atkinson-Regular.ttf","normal","normal"),
             ("Atkinson","Atkinson-Bold.ttf","bold","normal"),
             ("Atkinson","Atkinson-Italic.ttf","normal","italic"),
             ("OpenDyslexic","OpenDyslexic-Regular.otf","normal","normal"),
             ("OpenDyslexic","OpenDyslexic-Bold.otf","bold","normal"),
             ("OpenDyslexic","OpenDyslexic-Italic.otf","normal","italic"),
             ("Titre","GrandHotel-Regular.ttf","normal","normal"),
             ("Bubbly","Baloo2.ttf","normal","normal"),
             ("MathVar","KaTeX_Math-Italic.ttf","normal","normal")]
    out = []
    for fam, fn, w, st in faces:
        p = FONT_DIR / fn
        if not p.exists(): continue
        b = base64.b64encode(p.read_bytes()).decode()
        ext = "otf" if fn.endswith(".otf") else "ttf"
        fmt = "opentype" if ext == "otf" else "truetype"
        out.append(f'@font-face{{font-family:"{fam}";src:url(data:font/{ext};base64,{b}) format("{fmt}");'
                   f'font-weight:{w};font-style:{st};}}')
    return "\n".join(out)

FONT_STACK = {"atkinson":'"Atkinson", sans-serif', "opendyslexic":'"OpenDyslexic", sans-serif'}

def blocks_css(nb, rep_color):
    return f"""
p {{ margin:.35em 0; }}
ul {{ margin:.3em 0 .3em 1.1em; padding:0; }}
li {{ margin:.22em 0; }}
em {{ font-style:italic; }} sup {{ font-size:.72em; }}
.math {{ }}
.frac {{ display:inline-block; vertical-align:middle; text-align:center; margin:0 .12em; font-size:.9em; }}
.fnum {{ display:block; border-bottom:1.3px solid currentColor; padding:0 .3em; line-height:1.2; }}
.fden {{ display:block; padding:0 .3em; line-height:1.2; }}
.sqrtarg {{ border-top:1.3px solid currentColor; padding:0 .15em; }}
.math em {{ font-family:"MathVar", serif; font-style:normal; }}
svg.fig {{ display:block; float:right; width:200px; margin:0 0 6px 12px; }}
.chapitre h2 {{ color:{'#222' if nb else 'var(--c)'}; border-bottom:2px solid {'#999' if nb else 'var(--c)'};
  padding-bottom:2px; margin:14px 0 6px; }}
.competences {{ margin:-2px 0 9px; display:flex; flex-wrap:wrap; gap:5px; }}
.comp-pill {{ font-size:.74em; background:{'#eee' if nb else 'color-mix(in srgb, var(--c) 12%, white)'};
  border:1px solid {'#bbb' if nb else 'color-mix(in srgb, var(--c) 40%, white)'};
  border-radius:20px; padding:2px 9px; color:#333; }}
.comp-pill b {{ color:{'#222' if nb else 'var(--c)'}; }}
.box {{ position:relative; border:1.5px solid #888; border-radius:8px; padding:9px 11px 8px; margin:9px 0;
  break-inside:avoid; page-break-inside:avoid; }}
.box-label {{ display:inline-block; font-weight:bold; margin-bottom:3px; }}
.box-def {{ border-color:{'#888' if nb else '#c0392b'}; {'' if nb else 'background:#fdf0f0;'} }}
.box-def .box-label {{ color:{'#222' if nb else '#c0392b'}; }}
.box-regle,.box-prop {{ border-color:{'#888' if nb else '#27ae60'}; {'' if nb else 'background:#eefbf2;'} }}
.box-regle .box-label,.box-prop .box-label {{ color:{'#222' if nb else '#1e8a4c'}; }}
.box-methode {{ border-color:{'#888' if nb else '#3B82C4'}; {'' if nb else 'background:#eef5fc;'} }}
.box-methode .box-label {{ color:{'#222' if nb else '#2b6cb0'}; }}
.box-rappel {{ border-style:dashed; border-color:{'#888' if nb else '#8B6FB0'}; {'' if nb else 'background:#f5f0fb;'} }}
.box-rappel .box-label {{ color:{'#222' if nb else '#7a5aa6'}; }}
.box-retenu {{ border:2px solid {'#555' if nb else '#E0A23B'}; {'' if nb else 'background:#fff7e8;'} }}
.box-retenu .box-label {{ color:{'#222' if nb else '#b9791a'}; font-size:1.05em; }}
.box-reussite {{ border-color:{'#888' if nb else '#c0392b'}; }}
.box-reussite .box-label {{ color:{'#222' if nb else '#c0392b'}; text-decoration:underline; }}
.rep {{ color:{rep_color}; font-weight:{'bold' if nb else '600'}; }}
.blank {{ display:inline-block; border-bottom:1.4px dotted #555; height:1.15em; vertical-align:bottom; margin:0 2px; }}
.checklist {{ list-style:none; margin-left:.2em; }}
.checklist li {{ display:flex; align-items:flex-start; gap:7px; }}
.case {{ flex:0 0 auto; width:.9em; height:.9em; border:1.5px solid #444; border-radius:2px; margin-top:.15em; }}
.qr {{ height:3.1em; vertical-align:middle; margin-left:4px; }} .qr-missing {{ font-size:.8em; color:#999; }}
table.grid {{ border-collapse:collapse; margin:8px 0; width:auto; }}
table.grid th, table.grid td {{ border:1px solid {'#888' if nb else '#9bb6d4'}; padding:4px 9px; text-align:center; }}
table.grid th {{ background:{'#eee' if nb else '#eaf2fb'}; color:{'#222' if nb else '#2b6cb0'}; font-weight:bold; }}
table.grid .qr {{ height:2.4em; }}
.box-ressources {{ border:2px dashed {'#666' if nb else '#2BA98E'}; {'' if nb else 'background:#eefbf6;'} }}
.box-ressources .box-label {{ color:{'#222' if nb else '#1f8f76'}; }}
.box-objectifs {{ border-color:{'#888' if nb else 'var(--c)'}; {'' if nb else 'background:color-mix(in srgb, var(--c) 8%, white);'} }}
.box-objectifs .box-label {{ color:{'#222' if nb else 'var(--c)'}; }}
.obj-intro {{ margin:.1em 0 .3em; font-style:italic; }}
.obj-list {{ list-style:none; margin-left:.1em; }}
.obj-list li {{ margin:.3em 0; }}
.niv-badge {{ display:inline-block; color:#fff; font-size:.66em; font-weight:bold; border-radius:5px; padding:1px 6px; margin-right:6px; vertical-align:.12em; }}
.capable {{ break-inside:avoid; page-break-inside:avoid; margin:12px 0 4px; border:2px solid {'#555' if nb else 'var(--c)'}; border-radius:12px; padding:9px 11px; {'' if nb else 'background:color-mix(in srgb, var(--c) 6%, white);'} }}
.cap-title {{ font-weight:bold; font-size:1.08em; margin-bottom:6px; color:{'#222' if nb else 'var(--c)'}; }}
.cap-grid {{ width:100%; }}
.cap-grid th, .cap-grid td {{ border-color:{'#888' if nb else 'color-mix(in srgb, var(--c) 45%, white)'}; padding:5px 7px; }}
.cap-grid th {{ background:{'#eee' if nb else 'color-mix(in srgb, var(--c) 12%, white)'}; color:#333; vertical-align:middle; }}
.cap-obj {{ text-align:left !important; }}
.cap-h {{ font-size:.7em; font-weight:600; display:inline-block; }}
.face {{ width:1.5em; height:1.5em; vertical-align:middle; }}
.cap-tick {{ width:2.2em; }}
.cap-exo {{ width:3.4em; }}
.cap-note {{ font-size:.78em; color:#777; font-style:italic; margin-top:4px; }}
.ressources {{ list-style:none; margin:0; padding:0; }}
.ressources li {{ display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:5px 0; border-bottom:1px dotted #ccc; }}
.res-txt {{ flex:1; }} .res-url {{ font-size:.78em; color:#888; }}
"""

def bandeau_css(nb):
    badge = "#444" if nb else "var(--c)"
    return f"""
.bandeau {{ display:flex; align-items:center; gap:10px;
  background:{'#eee' if nb else 'color-mix(in srgb, var(--c) 14%, white)'};
  border:2px solid {badge}; border-radius:12px; padding:7px 12px; margin:0 0 6px; }}
.bandeau .code {{ background:{badge}; color:#fff; font-weight:bold; padding:4px 11px; border-radius:8px; letter-spacing:1px; }}
.bandeau .titre {{ flex:1; text-align:center; font-weight:bold; letter-spacing:2px; color:{'#222' if nb else 'var(--c)'}; }}
.bandeau .niveau {{ background:{badge}; color:#fff; font-weight:bold; padding:4px 9px; border-radius:8px; }}
.chap-break {{ break-before:page; page-break-before:always; }}
"""

def cover_css(nb):
    accent = "#9DB9DE" if nb else "#3B82C4"; accent2 = "#E7D27A" if nb else "#F4D06F"
    return f"""
.cover {{ position:relative; text-align:center; padding:6mm 0; break-after:page; page-break-after:always;
  border:2px dashed {accent}; border-radius:18px; min-height:255mm; }}
.cover-corner {{ position:absolute; width:46px; height:46px; border-radius:10px; transform:rotate(12deg); z-index:0; }}
.cover-corner.tl {{ top:8px; left:6px; background:{accent2}; }}
.cover-corner.br {{ bottom:14px; right:16px; background:{accent}; opacity:.5; }}
.cover-id {{ position:relative; z-index:2; display:flex; justify-content:space-between; padding:0 16px; margin:8mm 0; text-align:left; }}
.idbox {{ background:{'#f4f4f4' if nb else '#eaf2fb'}; border-radius:10px; padding:8px 14px; font-size:.95em; }}
.cover-title {{ font-family:"Titre", cursive; font-size:52pt; color:{'#222' if nb else '#2E5E8C'}; margin:4mm 0 0; font-weight:normal; }}
.cover-sub {{ font-family:"Titre", cursive; font-size:30pt; color:{'#444' if nb else '#6BA3D6'}; margin-bottom:2mm; }}
.cover-animal {{ width:132px; height:auto; margin:2mm auto; display:block; }}
.cover-periode {{ width:78%; margin:4mm auto 0; background:{'#f6f6f6' if nb else '#eaf2fb'};
  border:2px dashed {accent}; border-radius:14px; padding:10px 16px; text-align:left; }}
.periode-label {{ font-family:"Titre", cursive; font-size:24pt; text-align:center; color:{'#222' if nb else '#2E5E8C'}; margin-bottom:4px; }}
.sommaire {{ list-style:none; margin:0; padding:0; }}
.sommaire li {{ display:flex; align-items:center; gap:9px; margin:5px 0; }}
.case-somm {{ width:1em; height:1em; border:1.6px solid {'#555' if nb else '#3B82C4'}; border-radius:3px; flex:0 0 auto; }}
.c-code {{ font-weight:bold; color:{'#222' if nb else '#3B82C4'}; min-width:2.4em; }}
.cover-foot {{ display:flex; justify-content:center; gap:18px; align-items:baseline; margin-top:7mm; }}
.cover-foot .prof {{ font-family:"Titre", cursive; font-size:22pt; color:{'#222' if nb else '#2E5E8C'}; }}
.cover-foot .annee {{ letter-spacing:2px; color:#666; }}
"""

def cover_vacances_css():
    return """
.cover-vac { position:relative; border:none; padding:0; min-height:262mm; text-align:center; overflow:hidden; }
.cv-banner { background:linear-gradient(135deg,#ECE0F6 0%,#F7E5E6 55%,#FCEFE0 100%);
  border-radius:0 0 42px 42px; padding:16mm 10mm 11mm; position:relative; }
.cv-eyebrow { letter-spacing:5px; font-weight:bold; color:#9A7BC0; font-size:.92em; }
.cv-title { font-family:"Bubbly", sans-serif; font-size:48pt; color:#6A4C9C; margin:2mm 0 0; font-weight:normal; line-height:1.05; }
.cv-sub { font-family:"Bubbly", sans-serif; font-size:21pt; color:#C77B9E; }
.cv-by { color:#8a7ea0; margin-top:2mm; font-size:.95em; }
.cv-animal { display:block; width:60%; max-width:300px; margin:7mm auto 4mm; }
.cv-appartient { width:74%; margin:0 auto 4mm; border:2px dashed #C9B6E0; border-radius:16px;
  padding:12px 18px; text-align:left; color:#5a5168; }
.cv-somm-box { width:80%; margin:1mm auto; background:#FFF7FB; border:2px dashed #E3B7CE;
  border-radius:18px; padding:9px 20px 12px; }
.cv-somm-title { font-family:"Bubbly", sans-serif; color:#6A4C9C; font-size:18pt; text-align:center; margin-bottom:3px; }
.cv-somm-box .sommaire .case-somm { border-color:#C77B9E; }
.cv-somm-box .sommaire .c-code { color:#9A7BC0; }
.cv-foot { color:#9a8ea8; letter-spacing:3px; margin-top:5mm; font-size:.9em; }
.petal { position:absolute; z-index:1; } .petal-svg { width:100%; height:100%; display:block; }
.cv-banner > * { position:relative; z-index:2; }
"""

def build_print_css(police, taille, interligne, couleur):
    fam = FONT_STACK.get(police, FONT_STACK["atkinson"]); nb = (couleur == "nb")
    return f"""{font_faces_file()}
@page {{ size:A4 portrait; margin:14mm 15mm; }}
* {{ box-sizing:border-box; }}
body {{ font-family:{fam}; font-size:{taille}pt; line-height:{interligne}; color:#1a1a1a; margin:0; }}
{bandeau_css(nb)}{cover_css(nb)}{cover_vacances_css()}{blocks_css(nb, '#1a1a1a' if nb else '#c0392b')}
"""

def build_web_css(police):
    fam = FONT_STACK.get(police, FONT_STACK["atkinson"])
    return f"""{font_faces_file()}
:root {{ --rose:#F6E9EE; --lilas:#ECE6F6; }}
* {{ box-sizing:border-box; }}
body {{ font-family:{fam}; font-size:16px; line-height:1.6; color:#2a2a33; margin:0; padding:24px 12px;
  background:linear-gradient(135deg,var(--lilas),var(--rose)); }}
.wrap {{ max-width:820px; margin:0 auto; background:rgba(255,255,255,.74); border-radius:22px;
  padding:26px 30px; box-shadow:0 10px 40px rgba(120,100,160,.18); }}
{bandeau_css(False)}{cover_css(False)}{cover_vacances_css()}{blocks_css(False, '#c0392b')}
.cover {{ break-after:auto; page-break-after:auto; min-height:auto; }}
.chap-break {{ break-before:auto; page-break-before:auto; }}
.blank {{ min-width:3em !important; border-bottom:1.6px dotted #b48fc4; }}
"""

# ============================================================ DOC
def html_doc(body, css, web=False):
    wo, wc = ('<div class="wrap">', '</div>') if web else ('', '')
    return (f"<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'>"
            f"<meta name='viewport' content='width=device-width, initial-scale=1'>"
            f"<style>{css}</style></head><body>{wo}{body}{wc}</body></html>")

# ============================================================ SÉLECTEUR (builder)
def build_builder(blocks, outdir, stem, cover_meta_master):
    cover, chaps = split_chapters(blocks)
    cover = cover or cover_meta_master or {}
    data = []
    for ch in chaps:
        code, title, niveau, comp = ch["header"]
        theme = THEME.get(code[:1].upper(), THEME["N"])
        comps = [{"c": c.strip(), "l": COMP_MAP.get(c.strip(), "")} for c in comp.split(",") if c.strip()]
        frag = (f'<div class="chapitre" style="--c:{theme}">'
                f'{bandeau_html(code, title, niveau)}{render_comp(comp)}'
                f'{render_body(ch["body"], "inter")}</div>')
        data.append({"code": code, "title": title, "niveau": niveau or cover.get("niveau", "4ᵉ"),
                     "theme": theme, "comps": comps, "html": frag})
    css = (font_faces_b64() + bandeau_css(False) + cover_css(False) + cover_vacances_css() + blocks_css(False, '#c0392b'))
    tmpl = BUILDER_TMPL
    repl = {
        "__CSS__": css,
        "__CHAPTERS__": json.dumps(data, ensure_ascii=False),
        "__FOX__": json.dumps(fox_svg()),
        "__TITRE__": json.dumps(cover.get("titre", "Cahier de cours")),
        "__MATIERE__": json.dumps(cover.get("matiere", "Mathématiques")),
        "__NIVEAU__": json.dumps(cover.get("niveau", "4ᵉ")),
        "__PERIODE__": json.dumps(cover.get("periode", "Période ")),
        "__ANNEE__": json.dumps(cover.get("annee", "2025 – 2026")),
        "__PROF__": json.dumps(cover.get("prof", "Mme Le Guern")),
    }
    for k, v in repl.items():
        tmpl = tmpl.replace(k, v)
    out = outdir / f"{stem}__selecteur.html"
    out.write_text(tmpl, encoding="utf-8")
    print(f"  ✓ {out.name}")
    return out

BUILDER_TMPL = r"""<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sélecteur de livret</title>
<style>
__CSS__
:root{--ff:"Atkinson",sans-serif;--fs:12pt;}
*{box-sizing:border-box;}
body{margin:0;font-family:"Atkinson",sans-serif;background:#eef0f6;color:#222;}
.app{display:grid;grid-template-columns:300px 1fr;min-height:100vh;}
.panel{background:#fff;border-right:1px solid #dde;padding:16px;overflow:auto;position:sticky;top:0;height:100vh;}
.panel h1{font-size:17px;margin:0 0 12px;color:#2E5E8C;}
.panel h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#889;border:0;margin:16px 0 6px;}
.field{margin:8px 0;} .field label{display:block;font-size:13px;color:#445;margin-bottom:3px;}
.field input,.field select{width:100%;padding:6px 8px;border:1px solid #ccd;border-radius:8px;font:inherit;}
.chaplist{list-style:none;margin:0;padding:0;}
.chaprow{display:flex;align-items:center;gap:7px;padding:6px 7px;border:1px solid #e3e6f0;border-radius:9px;margin:5px 0;background:#fafbff;}
.chaprow input{margin:0;} .chaprow .cc{font-weight:bold;min-width:26px;color:#3B82C4;}
.chaprow .ct{flex:1;font-size:13px;} .chaprow .mv{display:flex;flex-direction:column;gap:1px;}
.chaprow .mv button{border:1px solid #ccd;background:#fff;border-radius:5px;cursor:pointer;line-height:1;padding:0 5px;font-size:11px;}
.seg{display:flex;gap:0;border:1px solid #ccd;border-radius:9px;overflow:hidden;}
.seg button{flex:1;border:0;background:#fff;padding:7px;cursor:pointer;font:inherit;}
.seg button.on{background:#3B82C4;color:#fff;}
.btn{display:block;width:100%;margin:7px 0;padding:9px;border:0;border-radius:10px;background:#2E5E8C;color:#fff;font:inherit;cursor:pointer;}
.btn.alt{background:#5a8f6f;} .btn.ghost{background:#eef;color:#2E5E8C;}
.stagewrap{padding:24px;overflow:auto;}
.stage{max-width:820px;margin:0 auto;background:#fff;box-shadow:0 6px 30px rgba(80,80,140,.12);border-radius:10px;padding:26px 30px;font-family:var(--ff);font-size:var(--fs);line-height:1.5;}
.stage.mode-prof .ans{color:#c0392b;font-weight:600;}
.stage.mode-prof .cover-id{display:none;}
.stage.mode-eleve .ans{color:transparent;border-bottom:1.4px dotted #555;}
.hint{font-size:12px;color:#889;margin-top:4px;}
@media print{
  .panel{display:none;} .app{display:block;} .stagewrap{padding:0;}
  .stage{box-shadow:none;border-radius:0;max-width:none;padding:0;}
  .chapitre{break-before:page;page-break-before:always;} .chapitre:first-of-type{break-before:auto;}
  .cover{break-after:page;} @page{size:A4 portrait;margin:14mm 15mm;}
  body{background:#fff;}
}
</style></head>
<body>
<div class="app">
  <div class="panel">
    <h1>🦊 Sélecteur de livret</h1>
    <div class="field"><label>Période (titre)</label><input id="periode"></div>
    <div class="field"><label>Niveau</label><input id="niveau"></div>
    <div class="field"><label>Année</label><input id="annee"></div>

    <h2>Chapitres (ordre = livret)</h2>
    <ul class="chaplist" id="chaplist"></ul>

    <h2>Affichage</h2>
    <div class="field"><label>Version</label>
      <div class="seg" id="seg-mode">
        <button data-v="eleve" class="on">Élève</button><button data-v="prof">Prof</button></div></div>
    <div class="field"><label>Police</label>
      <select id="police"><option value="atkinson">Atkinson Hyperlegible</option>
      <option value="opendyslexic">OpenDyslexic</option></select></div>
    <div class="field"><label>Taille</label>
      <select id="taille"><option>11</option><option selected>12</option><option>13</option><option>14</option></select></div>

    <h2>Exporter</h2>
    <button class="btn" onclick="printPDF()">🖨️ Imprimer / PDF</button>
    <button class="btn alt" onclick="downloadHTML()">⬇️ Télécharger HTML</button>
    <button class="btn ghost" onclick="exportManifest()">📄 Manifeste .txt (pour le script)</button>
    <p class="hint">Pour le PDF : « Enregistrer en PDF », marges « par défaut », cocher les graphiques d'arrière-plan.</p>
  </div>

  <div class="stagewrap"><div class="stage mode-eleve" id="stage"></div></div>
</div>

<script>
const CHAPTERS = __CHAPTERS__;
const FOX = __FOX__;
const META = {titre:__TITRE__, matiere:__MATIERE__, niveau:__NIVEAU__,
              periode:__PERIODE__, annee:__ANNEE__, prof:__PROF__};
const FONTSTACK = {atkinson:'"Atkinson", sans-serif', opendyslexic:'"OpenDyslexic", sans-serif'};

let order = CHAPTERS.map((_,i)=>i);
let selected = new Set(order);

function esc(s){return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");}

function coverHTML(){
  const chosen = order.filter(i=>selected.has(i));
  const somm = chosen.map(i=>{
    const c=CHAPTERS[i];
    return `<li><span class="case-somm"></span><span class="c-code">${esc(c.code)}</span><span class="c-titre">${esc(c.title)}</span></li>`;
  }).join("");
  return `<section class="cover"><div class="cover-corner tl"></div><div class="cover-corner br"></div>
    <div class="cover-id"><div class="idbox"><b>NOM :</b> ………………………<br><b>PRÉNOM :</b> ………………………</div>
    <div class="idbox"><b>CLASSE :</b> …………………</div></div>
    <h1 class="cover-title">${esc(META.titre)}</h1>
    <div class="cover-sub">${esc(META.matiere)} <span class="lvl">${esc(document.getElementById('niveau').value||META.niveau)}</span></div>
    ${FOX}
    <div class="cover-periode"><div class="periode-label">${esc(document.getElementById('periode').value||META.periode)}</div>
    <ul class="sommaire">${somm}</ul></div>
    <div class="cover-foot"><span class="prof">${esc(META.prof)}</span><span class="annee">${esc(document.getElementById('annee').value||META.annee)}</span></div></section>`;
}

function renderPreview(){
  const stage = document.getElementById('stage');
  const chosen = order.filter(i=>selected.has(i));
  stage.innerHTML = coverHTML() + chosen.map(i=>CHAPTERS[i].html).join("");
  const mode = document.querySelector('#seg-mode .on').dataset.v;
  stage.className = "stage mode-"+mode;
  stage.style.setProperty('--ff', FONTSTACK[document.getElementById('police').value]);
  stage.style.setProperty('--fs', document.getElementById('taille').value+'pt');
}

function renderList(){
  const ul = document.getElementById('chaplist'); ul.innerHTML="";
  order.forEach((idx,pos)=>{
    const c = CHAPTERS[idx];
    const li = document.createElement('li'); li.className="chaprow";
    li.innerHTML = `<input type="checkbox" ${selected.has(idx)?'checked':''}>
      <span class="cc">${esc(c.code)}</span><span class="ct">${esc(c.title)}</span>
      <span class="mv"><button data-d="-1">▲</button><button data-d="1">▼</button></span>`;
    li.querySelector('input').onchange = e=>{ e.target.checked?selected.add(idx):selected.delete(idx); renderPreview(); };
    li.querySelectorAll('.mv button').forEach(b=> b.onclick=()=>{
      const np = pos + (+b.dataset.d);
      if(np<0||np>=order.length) return;
      [order[pos],order[np]]=[order[np],order[pos]]; renderList(); renderPreview();
    });
    ul.appendChild(li);
  });
}

document.querySelectorAll('#seg-mode button').forEach(b=> b.onclick=()=>{
  document.querySelectorAll('#seg-mode button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); renderPreview();
});
['periode','niveau','annee','police','taille'].forEach(id=>
  document.getElementById(id).addEventListener('input', renderPreview));

function fullCSS(){ return document.querySelector('style').textContent; }

function downloadHTML(){
  const mode = document.querySelector('#seg-mode .on').dataset.v;
  const ff = FONTSTACK[document.getElementById('police').value];
  const fs = document.getElementById('taille').value+'pt';
  const content = document.getElementById('stage').innerHTML;
  const doc = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Livret</title>
<style>${fullCSS()}
body{margin:0;background:#fff;}
.stage{max-width:820px;margin:0 auto;padding:22px;font-family:${ff};font-size:${fs};line-height:1.5;}
.stage.mode-prof .ans{color:#c0392b;font-weight:600;}
.stage.mode-prof .cover-id{display:none;}
.stage.mode-eleve .ans{color:transparent;border-bottom:1.4px dotted #555;}
.tgl{position:fixed;top:10px;right:10px;z-index:9;}
.tgl button{border:1px solid #ccd;background:#fff;border-radius:8px;padding:6px 10px;cursor:pointer;}
@media print{.tgl{display:none;}.chapitre{break-before:page;}.chapitre:first-of-type{break-before:auto;}.cover{break-after:page;}@page{size:A4;margin:14mm 15mm;}}
</style></head><body>
<div class="tgl"><button onclick="t()">Prof / Élève</button></div>
<div class="stage mode-${mode}" id="s">${content}</div>
<script>function t(){var s=document.getElementById('s');s.classList.toggle('mode-prof');s.classList.toggle('mode-eleve');}<\/script>
</body></html>`;
  const blob = new Blob([doc],{type:'text/html'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download = 'Livret-'+(document.getElementById('periode').value||'export').replace(/\s+/g,'_')+'.html'; a.click();
}

function exportManifest(){
  const chosen = order.filter(i=>selected.has(i));
  let txt = ":::couverture\n";
  txt += "titre: "+META.titre+"\nmatiere: "+META.matiere+"\nniveau: "+(document.getElementById('niveau').value||META.niveau)+"\n";
  txt += "periode: "+(document.getElementById('periode').value||META.periode)+"\nannee: "+(document.getElementById('annee').value||META.annee)+"\nprof: "+META.prof+"\nchapitres:\n";
  chosen.forEach(i=> txt += "- "+CHAPTERS[i].code+" | "+CHAPTERS[i].title+"\n");
  txt += ":::\n\n";
  chosen.forEach(i=> txt += "@include "+CHAPTERS[i].code+".txt\n");
  const blob = new Blob([txt],{type:'text/plain'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='periode.txt'; a.click();
}

function printPDF(){ window.print(); }

// init
document.getElementById('periode').value = META.periode;
document.getElementById('niveau').value = META.niveau;
document.getElementById('annee').value = META.annee;
renderList(); renderPreview();
</script>
</body></html>"""

# ============================================================ MAIN
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--mode", choices=["prof","eleve","both"], default="both")
    ap.add_argument("--police", choices=["atkinson","opendyslexic"], default="atkinson")
    ap.add_argument("--taille", type=float, default=14)
    ap.add_argument("--interligne", type=float, default=1.5)
    ap.add_argument("--couleur", choices=["couleur","nb"], default="couleur")
    ap.add_argument("--html", action="store_true")
    ap.add_argument("--builder", action="store_true", help="générer le sélecteur HTML interactif")
    ap.add_argument("--pont", default=None, help="pont-livret JSON : objectifs visés + grille auto")
    ap.add_argument("--exomap", default=None, help="JSON {code: url} : colonne QR MathALÉA")
    ap.add_argument("--out", default="/home/claude/out")
    args = ap.parse_args()

    global PONT, EXOMAP
    if args.pont:
        pj = json.loads(Path(args.pont).read_text(encoding="utf-8"))
        PONT = {s["code"]: s for s in pj.get("sequences", [])}
        print(f"  · pont-livret : {len(PONT)} chapitre(s) avec objectifs")
    if args.exomap:
        EXOMAP = json.loads(Path(args.exomap).read_text(encoding="utf-8"))
    src = load_source(args.source)
    blocks = parse(src)
    outdir = Path(args.out); outdir.mkdir(parents=True, exist_ok=True)
    stem = Path(args.source).stem

    if args.builder:
        cover, _ = split_chapters(blocks)
        print(f"[{stem}] sélecteur HTML")
        build_builder(blocks, outdir, stem, cover)
        return

    modes = ["prof","eleve"] if args.mode == "both" else [args.mode]
    print(f"[{stem}] {args.police} {args.taille}pt int={args.interligne} {args.couleur}" + (" +html" if args.html else ""))
    for m in modes:
        body = render(blocks, m)
        suffix = f"{m}_{args.police}_{int(args.taille)}pt_{args.couleur}"
        pdf = outdir / f"{stem}__{suffix}.pdf"
        HTML(string=html_doc(body, build_print_css(args.police, args.taille, args.interligne, args.couleur))).write_pdf(str(pdf))
        print(f"  ✓ {pdf.name}")
        if args.html:
            webfile = outdir / f"{stem}__{m}_web.html"
            webfile.write_text(html_doc(body, build_web_css(args.police), web=True), encoding="utf-8")
            print(f"  ✓ {webfile.name}")

if __name__ == "__main__":
    main()
