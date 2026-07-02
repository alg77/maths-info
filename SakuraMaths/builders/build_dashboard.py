#!/usr/bin/env python3
"""Génère le cockpit de production SakuraMaths depuis l'arborescence réelle."""

from __future__ import annotations

import html
import json
import os
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / "Studio"
OUT = STUDIO / "out" / "web" / "dashboard-production.html"
CONFIG_DIRS = (STUDIO / "config", ROOT / "Progressions")


def esc(value: object) -> str:
    return html.escape(str(value or ""))


def rel(path: Path) -> str:
    return "../../../" + path.relative_to(ROOT).as_posix()


def first_existing(patterns: list[str]) -> Path | None:
    for pattern in patterns:
        matches = sorted(p for p in ROOT.glob(pattern) if p.is_file() and "vendor" not in p.parts and "tmp" not in p.parts)
        if matches:
            return matches[-1]
    return None


def indexed_files() -> list[Path]:
    """Indexe le projet une fois en ignorant les dépendances et fichiers temporaires."""
    result = []
    ignored = {".git", ".agents", ".codex", "vendor", "tmp", "node_modules", "__pycache__"}
    for folder, dirs, files in os.walk(ROOT):
        dirs[:] = [name for name in dirs if name not in ignored]
        result.extend(Path(folder) / name for name in files)
    return result


def optional_resource(files: list[Path], full_code: str, words: tuple[str, ...], suffixes: tuple[str, ...] = ()) -> Path | None:
    code = re.compile(re.escape(full_code.lower()) + r"(?!\d)")
    matches = []
    for path in files:
        value = path.as_posix().lower()
        if code.search(value) and any(word in value for word in words) and (not suffixes or path.suffix.lower() in suffixes):
            matches.append(path)
    return sorted(matches)[-1] if matches else None


def progression_files() -> list[Path]:
    found: dict[str, Path] = {}
    for folder in reversed(CONFIG_DIRS):
        if folder.exists():
            for path in folder.glob("progression-*.json"):
                found[path.stem.removeprefix("progression-")] = path
    return [found[level] for level in sorted(found, key=lambda value: (not value[:1].isdigit(), value))]


def assign_periods(chapters: list[dict]) -> list[int]:
    explicit = []
    for chapter in chapters:
        match = re.search(r"\d+", str(chapter.get("periode") or chapter.get("period") or ""))
        explicit.append(int(match.group()) if match else 0)
    if any(explicit):
        return [value or 1 for value in explicit]
    total = sum(float(chapter.get("weeks") or 1) for chapter in chapters) or 1
    target = total / 5
    periods, cumulative, period = [], 0.0, 1
    for chapter in chapters:
        weight = float(chapter.get("weeks") or 1)
        if period < 5 and cumulative and cumulative + weight > target * period:
            period += 1
        periods.append(period)
        cumulative += weight
    return periods


def metadata_for(level: str, full_code: str) -> dict:
    candidates = [
        STUDIO / "sources" / level / full_code / "metadata.json",
        STUDIO / "sources" / level / f"{full_code}.metadata.json",
    ]
    for path in candidates:
        if path.exists():
            try:
                return json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                return {"status": "draft"}
    return {}


def resource_state(level: str, chapter: dict, period: int, questions: str, files: list[Path]) -> dict:
    code = str(chapter.get("code") or "").upper()
    prefix = re.match(r"\d+", level)
    full = code if prefix and code.startswith(prefix.group()) else f"{prefix.group() if prefix else ''}{code}"
    source = STUDIO / "sources" / level / f"{full}.md"
    md_text = source.read_text(encoding="utf-8", errors="ignore") if source.exists() else ""
    student_pdf = first_existing([f"Studio/out/pdf/{full}__eleve*.pdf"])
    teacher_pdf = first_existing([f"Studio/out/pdf/{full}__prof*.pdf"])
    web_student = STUDIO / "out" / "web" / f"{full}.html"
    web_teacher = STUDIO / "out" / "web" / f"{full}-prof.html"
    html_path = web_student if web_student.exists() else web_teacher if web_teacher.exists() else None
    qcm = code in questions or full in questions or ":::qcm" in md_text or ":::mathalea" in md_text
    kahoot = optional_resource(files, full, ("kahoot",), (".xlsx", ".xls"))
    flashcards = optional_resource(files, full, ("flashcard", "flashcards"))
    evaluation = optional_resource(files, full, ("evaluation", "évaluation", "eval-", "eval_"))
    correction = optional_resource(files, full, ("corrige", "corrigé", "correction", "bareme", "barème"))
    notebook = optional_resource(files, full, (full.lower(),), (".ipynb",))
    qr = "[qr:" in md_text or ":::mathalea" in md_text
    metadata = metadata_for(level, full)
    core = bool(source.exists() and student_pdf and teacher_pdf and html_path)
    status = metadata.get("status") or ("verified" if core else "review" if source.exists() else "draft")
    return {
        "code": code, "full": full, "title": chapter.get("title") or chapter.get("titre") or code,
        "period": period, "md": source if source.exists() else None, "student_pdf": student_pdf,
        "teacher_pdf": teacher_pdf, "html": html_path, "qcm": qcm, "kahoot": kahoot,
        "flashcards": flashcards, "evaluation": evaluation, "correction": correction,
        "notebook": notebook, "qr": qr, "core": core, "status": status,
    }


def icon(value: object, link: Path | None = None) -> str:
    if not value:
        return '<span class="no" title="À produire">○</span>'
    mark = '<span class="yes" title="Disponible">✓</span>'
    return f'<a class="resource-link" href="{esc(rel(link))}">{mark}</a>' if link else mark


def status_label(status: str) -> str:
    labels = {"verified": ("🟢", "Vérifié"), "review": ("🟡", "À relire"), "draft": ("🔴", "Brouillon")}
    symbol, label = labels.get(status, ("🟡", status))
    return f'<span class="status status-{esc(status)}">{symbol} {esc(label)}</span>'


def progress(value: int) -> str:
    return f'<div class="progress" aria-label="{value} %"><i style="width:{value}%"></i></div><b class="pct">{value} %</b>'


def level_panel(level: str, chapters: list[dict]) -> str:
    done = sum(item["core"] for item in chapters)
    percent = round(done * 100 / len(chapters)) if chapters else 0
    periods = []
    for number in range(1, 6):
        items = [item for item in chapters if item["period"] == number]
        value = round(sum(item["core"] for item in items) * 100 / len(items)) if items else 0
        periods.append(f'<div class="period"><span>P{number}</span>{progress(value)}</div>')
    detail_rows, table_rows = [], []
    for item in chapters:
        resources = [
            ("Markdown", item["md"]), ("PDF élève", item["student_pdf"]),
            ("PDF professeur", item["teacher_pdf"]), ("HTML", item["html"]),
            ("QR codes", item["qr"]), ("QCM / MathALÉA", item["qcm"]),
            ("Kahoot", item["kahoot"]), ("Flashcards", item["flashcards"]),
            ("Évaluation", item["evaluation"]), ("Corrigé", item["correction"]),
            ("Notebook", item["notebook"]),
        ]
        detail = "".join(f'<span class="detail-chip {"ready" if value else "missing"}">{"✓" if value else "○"} {esc(label)}</span>' for label, value in resources)
        detail_rows.append(f'''<details class="chapter"><summary>
          <span class="chapter-code">{esc(item["code"])}</span><span class="chapter-title">{esc(item["title"])}</span>
          <span class="chapter-period">P{item["period"]}</span>{status_label(item["status"])}
        </summary><div class="chapter-detail">{detail}</div></details>''')
        table_rows.append(f'''<div class="table-row"><span><b>{esc(item["code"])}</b><small>{esc(item["title"])}</small></span>
          {icon(item["md"], item["md"])}{icon(item["student_pdf"], item["student_pdf"])}
          {icon(item["teacher_pdf"], item["teacher_pdf"])}{icon(item["html"], item["html"])}
          {icon(item["qcm"])}{icon(item["kahoot"], item["kahoot"])}{icon(item["flashcards"], item["flashcards"])}
          {icon(item["evaluation"], item["evaluation"])}{icon(item["correction"], item["correction"])}</div>''')
    return f'''<section class="level-panel" id="level-{esc(level)}">
      <header><div><span class="level-kicker">Niveau</span><h2>🌸 {esc(level)}</h2><p>{done} chapitre(s) complet(s) sur {len(chapters)}</p></div><div class="level-progress">{progress(percent)}</div></header>
      <div class="periods">{"".join(periods)}</div>
      <div class="chapters">{"".join(detail_rows) or '<p>Aucun chapitre détecté.</p>'}</div>
      <div class="resource-table"><div class="table-head"><span>Chapitre</span><span>MD</span><span>PDF él.</span><span>PDF prof</span><span>HTML</span><span>QCM</span><span>Kahoot</span><span>Flash.</span><span>Éval.</span><span>Corr.</span></div>
      {''.join(table_rows)}</div>
    </section>'''


def main() -> None:
    questions_path = STUDIO / "out" / "qcm" / "questions.js"
    questions = questions_path.read_text(encoding="utf-8", errors="ignore") if questions_path.exists() else ""
    files = indexed_files()
    levels: list[tuple[str, list[dict]]] = []
    for path in progression_files():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        level = path.stem.removeprefix("progression-")
        source = data.get("seq") or data.get("chapitres") or data.get("sequences") or []
        periods = assign_periods(source)
        levels.append((level, [resource_state(level, chapter, period, questions, files) for chapter, period in zip(source, periods)]))

    total = sum(len(items) for _, items in levels)
    finished = sum(item["core"] for _, items in levels for item in items)
    overall = round(finished * 100 / total) if total else 0
    summary = "".join(f'<a href="#level-{esc(level)}"><b>{esc(level)}</b><span>{sum(i["core"] for i in items)} / {len(items)}</span></a>' for level, items in levels)
    panels = "".join(level_panel(level, items) for level, items in levels)
    document = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cockpit SakuraMaths</title><script type="module">import {{ guardProf }} from "../../../auth/auth.js"; guardProf();</script><style>
:root{{--ink:#3f3150;--muted:#827484;--rose:#d783a4;--violet:#7667ba;--blue:#4c79a6;--green:#3d936c;--paper:rgba(255,255,255,.88)}}*{{box-sizing:border-box}}html.auth-checking body{{visibility:hidden}}body{{margin:0;background:linear-gradient(145deg,#fff4f6,#eef3fb);font-family:Atkinson Hyperlegible,system-ui,sans-serif;color:var(--ink)}}main{{max-width:1280px;margin:auto;padding:30px 18px 60px}}h1,h2{{font-family:Georgia,serif}}h1{{font-size:clamp(2rem,5vw,3.5rem);margin:.15em 0}}.hero{{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;margin-bottom:24px}}.hero-card,.global-card,.level-panel{{background:var(--paper);border:1px solid #fff;border-radius:26px;box-shadow:0 14px 42px #6f58751a;backdrop-filter:blur(12px)}}.hero-card,.global-card{{padding:25px}}.eyebrow,.level-kicker{{color:var(--rose);font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.76rem}}.hero p{{color:var(--muted)}}.global-card strong{{font-size:2.5rem;color:var(--violet)}}.global-card>span{{display:block;color:var(--muted);margin-bottom:13px}}.global-links{{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:14px}}.global-links a{{display:flex;justify-content:space-between;padding:9px 12px;border-radius:12px;background:#f6f1fa;color:inherit;text-decoration:none}}.progress{{height:10px;min-width:130px;background:#ede8f3;border-radius:999px;overflow:hidden;flex:1}}.progress i{{display:block;height:100%;background:linear-gradient(90deg,var(--rose),var(--violet));border-radius:inherit}}.pct{{min-width:44px;text-align:right;color:var(--violet)}}.level-panel{{padding:24px;margin:20px 0}}.level-panel>header{{display:flex;justify-content:space-between;gap:20px;align-items:center}}.level-panel h2{{font-size:2rem;margin:3px 0}}.level-panel header p{{margin:0;color:var(--muted)}}.level-progress{{display:flex;align-items:center;gap:10px;min-width:250px}}.periods{{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:20px 0}}.period{{background:#f7f4fa;border-radius:14px;padding:10px}}.period>span{{font-weight:800;color:var(--blue)}}.period .progress{{height:7px;margin:7px 0 5px}}.period .pct{{font-size:.75rem}}.chapter{{border-top:1px solid #eee6f0}}.chapter summary{{display:grid;grid-template-columns:55px 1fr 45px 110px;gap:9px;align-items:center;padding:12px 6px;cursor:pointer}}.chapter-code{{font-weight:900;color:var(--violet)}}.chapter-title{{font-weight:700}}.chapter-period{{color:var(--blue);font-weight:800}}.status{{font-size:.76rem}}.chapter-detail{{display:flex;flex-wrap:wrap;gap:7px;padding:0 6px 15px 60px}}.detail-chip{{font-size:.76rem;padding:6px 9px;border-radius:999px}}.detail-chip.ready{{background:#e6f6ed;color:#287353}}.detail-chip.missing{{background:#f1eef4;color:#91899a}}.resource-table{{margin-top:20px;overflow-x:auto}}.table-head,.table-row{{display:grid;grid-template-columns:minmax(220px,2fr) repeat(9,minmax(65px,.55fr));align-items:center;min-width:930px;text-align:center}}.table-head{{font-size:.72rem;font-weight:800;color:#fff;background:linear-gradient(90deg,var(--blue),var(--violet));border-radius:12px 12px 0 0;padding:10px 6px}}.table-row{{padding:9px 6px;border-bottom:1px solid #eee8f0}}.table-row>span:first-child{{text-align:left;display:flex;gap:8px}}.table-row small{{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}.table-row .yes{{color:var(--green);font-weight:900}}.table-row .no{{color:#b8b0bc}}.resource-link{{text-decoration:none}}footer{{text-align:center;color:var(--muted);margin-top:30px}}@media(max-width:760px){{.hero{{grid-template-columns:1fr}}.periods{{grid-template-columns:1fr 1fr}}.level-panel>header{{align-items:flex-start;flex-direction:column}}.level-progress{{width:100%;min-width:0}}.chapter summary{{grid-template-columns:48px 1fr 40px}}.status{{grid-column:2/4}}.chapter-detail{{padding-left:6px}}}}
</style></head><body><main><section class="hero"><div class="hero-card"><span class="eyebrow">Centre de pilotage</span><h1>🌸 SakuraMaths</h1><p>Production des ressources pédagogiques, détectée automatiquement depuis les progressions, les sources et les sorties générées.</p>{progress(overall)}</div><div class="global-card"><strong>{finished} / {total}</strong><span>chapitres complets · {overall} %</span><div class="global-links">{summary}</div></div></section>{panels or '<p>Aucune progression détectée.</p>'}<footer>Relancer <code>python builders/build_dashboard.py</code> après une génération.</footer></main></body></html>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(document, encoding="utf-8")
    print(f"Dashboard généré : {OUT}")


if __name__ == "__main__":
    main()
