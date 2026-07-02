#!/usr/bin/env python3
"""Génère le cockpit de production SakuraMaths depuis l'arborescence réelle."""

from __future__ import annotations

import html
import json
import os
import re
from datetime import datetime
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
    level_metadata = STUDIO / "sources" / level / "metadata.json"
    if level_metadata.exists():
        try:
            data = json.loads(level_metadata.read_text(encoding="utf-8"))
            code = full_code
            prefix = re.match(r"\d+", level)
            if prefix and code.startswith(prefix.group()):
                code = code[len(prefix.group()):]
            value = (data.get("chapitres") or {}).get(code)
            if value:
                return value
        except Exception:
            pass
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
    student_pdf = first_existing([f"Studio/out/pdf/{level}/{full}__eleve*.pdf", f"Studio/out/pdf/{full}__eleve*.pdf"])
    teacher_pdf = first_existing([f"Studio/out/pdf/{level}/{full}__prof*.pdf", f"Studio/out/pdf/{full}__prof*.pdf"])
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


def detail_chip(label: str, value: object) -> str:
    css = "ready" if value else "missing"
    content = f'{"✓" if value else "○"} {esc(label)}'
    if isinstance(value, Path):
        return f'<a class="detail-chip {css}" href="{esc(rel(value))}">{content}</a>'
    return f'<span class="detail-chip {css}">{content}</span>'


def status_label(status: str) -> str:
    labels = {"verified": ("🟢", "Vérifié"), "review": ("🟡", "À relire"), "draft": ("🔴", "Brouillon")}
    symbol, label = labels.get(status, ("🟡", status))
    return f'<span class="status status-{esc(status)}">{symbol} {esc(label)}</span>'


def progress(value: int) -> str:
    return f'<div class="progress" aria-label="{value} %"><i style="width:{value}%"></i></div><b class="pct">{value} %</b>'


def display_level(level: str) -> str:
    return {
        "nsi-premiere": "Première",
        "nsi-terminale": "Terminale",
    }.get(level, level)


def level_panel(level: str, chapters: list[dict]) -> str:
    done = sum(item["core"] for item in chapters)
    percent = round(done * 100 / len(chapters)) if chapters else 0
    periods = []
    for number in range(1, 6):
        items = [item for item in chapters if item["period"] == number]
        value = round(sum(item["core"] for item in items) * 100 / len(items)) if items else 0
        periods.append(f'<div class="period"><span>P{number}</span>{progress(value)}</div>')
    detail_rows = {number: [] for number in range(1, 6)}
    table_rows = []
    for item in chapters:
        resources = [
            ("Markdown", item["md"]), ("PDF élève", item["student_pdf"]),
            ("PDF professeur", item["teacher_pdf"]), ("HTML", item["html"]),
            ("QR codes", item["qr"]), ("QCM / MathALÉA", item["qcm"]),
            ("Kahoot", item["kahoot"]), ("Flashcards", item["flashcards"]),
            ("Évaluation", item["evaluation"]), ("Corrigé", item["correction"]),
            ("Notebook", item["notebook"]),
        ]
        detail = "".join(detail_chip(label, value) for label, value in resources)
        detail_rows.setdefault(item["period"], []).append(f'''<details class="chapter" data-status="{esc(item["status"])}"><summary>
          <span class="chapter-code">{esc(item["code"])}</span><span class="chapter-title">{esc(item["title"])}</span>
          <span class="chapter-period">P{item["period"]}</span>{status_label(item["status"])}
        </summary><div class="chapter-detail">{detail}</div></details>''')
        table_rows.append(f'''<div class="table-row p{item["period"]}" data-status="{esc(item["status"])}"><span><b>{esc(item["code"])}</b><small>{esc(item["title"])}</small></span>
          {icon(item["md"], item["md"])}{icon(item["student_pdf"], item["student_pdf"])}
          {icon(item["teacher_pdf"], item["teacher_pdf"])}{icon(item["html"], item["html"])}
          {icon(item["qcm"])}{icon(item["kahoot"], item["kahoot"])}{icon(item["flashcards"], item["flashcards"])}
          {icon(item["evaluation"], item["evaluation"])}{icon(item["correction"], item["correction"])}</div>''')
    period_blocks = "".join(
        f'''<section class="period-group period-{number}"><h3>P{number}</h3>
        <div class="chapters">{"".join(detail_rows.get(number, [])) or '<p class="empty">Aucun chapitre prévu.</p>'}</div></section>'''
        for number in range(1, 6)
    )
    return f'''<details class="level-panel" id="level-{esc(level)}">
      <summary class="level-summary"><div><span class="level-kicker">Niveau</span><h2>🌸 {esc(display_level(level))}</h2><p>{done} chapitre(s) complet(s) sur {len(chapters)}</p></div><div class="level-progress">{progress(percent)}</div></summary>
      <div class="level-content"><div class="periods">{"".join(periods)}</div>
      <div class="period-groups">{period_blocks}</div>
      <div class="resource-table"><div class="table-caption"><strong>Vue synthétique</strong><span>QR codes et Notebook exclus · les coches ouvrent les fichiers disponibles.</span></div><div class="table-head"><span>Chapitre</span><span>MD</span><span>PDF él.</span><span>PDF prof</span><span>HTML</span><span>QCM</span><span>Kahoot</span><span>Flash.</span><span>Éval.</span><span>Corr.</span></div>
      {''.join(table_rows)}</div></div>
    </details>'''


def domain_panel(title: str, icon_value: str, levels: list[tuple[str, list[dict]]]) -> str:
    if not levels:
        return ""
    panels = "".join(level_panel(level, items) for level, items in levels)
    count = sum(len(items) for _, items in levels)
    done = sum(item["core"] for _, items in levels for item in items)
    percent = round(done * 100 / count) if count else 0
    domain_progress = f'''<div class="domain-progress" title="{done} chapitre(s) complet(s) sur {count}"><div class="progress"><i style="width:{percent}%"></i></div><b>{percent} %</b></div>'''
    ece_dashboard = STUDIO / "out" / "web" / "nsi" / "ece" / "dashboard.html"
    extra_link = f'<a class="domain-tool" href="{esc(rel(ece_dashboard))}">🎯 Dashboard ECE</a>' if title == "NSI" and ece_dashboard.exists() else ""
    return f'''<details class="domain-group" open><summary class="domain-summary"><span>{icon_value}</span><strong>{esc(title)}</strong><small>{done} / {count} chapitres</small>{domain_progress}{extra_link}</summary><div class="domain-content">{panels}</div></details>'''


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
    generated_at = datetime.now().astimezone().strftime("%d/%m/%Y à %H:%M")
    summary = "".join(f'<a href="#level-{esc(level)}"><b>{esc(display_level(level))}</b><span>{sum(i["core"] for i in items)} / {len(items)}</span></a>' for level, items in levels)
    maths = [(level, items) for level, items in levels if not level.startswith("nsi-")]
    nsi = [(level, items) for level, items in levels if level.startswith("nsi-")]
    panels = domain_panel("Maths", "📐", maths) + domain_panel("NSI", "💻", nsi)
    document = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cockpit SakuraMaths</title><script type="module">import {{ guardProf }} from "../../../auth/auth.js"; guardProf();</script><style>
:root{{--ink:#3f3150;--muted:#827484;--rose:#d783a4;--violet:#7667ba;--blue:#4c79a6;--green:#3d936c;--paper:rgba(255,255,255,.88)}}*{{box-sizing:border-box}}html.auth-checking body{{visibility:hidden}}body{{margin:0;background:linear-gradient(145deg,#fff4f6,#eef3fb);font-family:Atkinson Hyperlegible,system-ui,sans-serif;color:var(--ink)}}main{{max-width:1280px;margin:auto;padding:30px 18px 60px}}h1,h2{{font-family:Georgia,serif}}h1{{font-size:clamp(2rem,5vw,3.5rem);margin:.15em 0}}summary{{list-style:none}}summary::-webkit-details-marker{{display:none}}.hero{{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;margin-bottom:24px}}.hero-card,.global-card,.level-panel{{background:var(--paper);border:1px solid #fff;border-radius:26px;box-shadow:0 14px 42px #6f58751a;backdrop-filter:blur(12px)}}.hero-card,.global-card{{padding:25px}}.eyebrow,.level-kicker{{color:var(--rose);font-weight:800;text-transform:uppercase;letter-spacing:.08em;font-size:.76rem}}.hero p{{color:var(--muted)}}.global-card strong{{font-size:2.5rem;color:var(--violet)}}.global-card>span{{display:block;color:var(--muted);margin-bottom:13px}}.global-links{{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:14px}}.global-links a{{display:flex;justify-content:space-between;padding:9px 12px;border-radius:12px;background:#f6f1fa;color:inherit;text-decoration:none}}.progress{{height:10px;min-width:130px;background:#ede8f3;border-radius:999px;overflow:hidden;flex:1}}.progress i{{display:block;height:100%;background:linear-gradient(90deg,var(--rose),var(--violet));border-radius:inherit}}.pct{{min-width:44px;text-align:right;color:var(--violet)}}.domain-group{{margin:24px 0}}.domain-summary{{display:flex;align-items:center;gap:13px;padding:18px 23px;border-radius:22px;background:linear-gradient(100deg,#513d68,#7667ba);color:#fff;cursor:pointer;box-shadow:0 12px 32px #59466d2b}}.domain-summary>span{{font-size:1.8rem}}.domain-summary strong{{font-family:Georgia,serif;font-size:1.8rem}}.domain-summary small{{margin-left:auto;opacity:.82}}.domain-summary::after{{content:'▾';font-size:1.25rem;transition:.2s}}.domain-group:not([open])>.domain-summary::after{{transform:rotate(-90deg)}}.domain-content{{padding:1px 5px}}.level-panel{{margin:20px 0;overflow:hidden}}.level-summary{{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:24px;cursor:pointer}}.level-summary::after{{content:'▾';color:var(--violet);font-size:1.25rem}}.level-panel:not([open])>.level-summary::after{{transform:rotate(-90deg)}}.level-panel h2{{font-size:2rem;margin:3px 0}}.level-summary p{{margin:0;color:var(--muted)}}.level-content{{padding:0 24px 24px}}.level-progress{{display:flex;align-items:center;gap:10px;min-width:250px;margin-left:auto}}.periods{{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:0 0 20px}}.period{{background:#f7f4fa;border-radius:14px;padding:10px}}.period>span{{font-weight:800;color:var(--blue)}}.period .progress{{height:7px;margin:7px 0 5px}}.period .pct{{font-size:.75rem}}.period-groups{{display:grid;gap:12px}}.period-group{{border-radius:18px;padding:12px 15px}}.period-group h3{{margin:0 0 5px;color:var(--ink)}}.period-1{{background:#fff0f4}}.period-2{{background:#eef5ff}}.period-3{{background:#edf9f2}}.period-4{{background:#fff7e8}}.period-5{{background:#f5efff}}.empty{{margin:5px 0;color:var(--muted);font-style:italic}}.chapter{{border-top:1px solid #ffffffa8}}.chapter summary{{display:grid;grid-template-columns:55px 1fr 45px 110px;gap:9px;align-items:center;padding:12px 6px;cursor:pointer}}.chapter-code{{font-weight:900;color:var(--violet)}}.chapter-title{{font-weight:700}}.chapter-period{{color:var(--blue);font-weight:800}}.status{{font-size:.76rem}}.chapter-detail{{display:flex;flex-wrap:wrap;gap:7px;padding:0 6px 15px 60px}}.detail-chip{{font-size:.76rem;padding:6px 9px;border-radius:999px}}.detail-chip.ready{{background:#e6f6ed;color:#287353}}.detail-chip.missing{{background:#f1eef4;color:#91899a}}.resource-table{{margin-top:20px;overflow-x:auto}}.table-head,.table-row{{display:grid;grid-template-columns:minmax(220px,2fr) repeat(9,minmax(65px,.55fr));align-items:center;min-width:930px;text-align:center}}.table-head{{font-size:.72rem;font-weight:800;color:#fff;background:linear-gradient(90deg,var(--blue),var(--violet));border-radius:12px 12px 0 0;padding:10px 6px}}.table-row{{padding:9px 6px;border-bottom:1px solid #eee8f0}}.table-row.p1{{background:#fff8fa}}.table-row.p2{{background:#f7faff}}.table-row.p3{{background:#f6fcf8}}.table-row.p4{{background:#fffbf3}}.table-row.p5{{background:#faf7ff}}.table-row>span:first-child{{text-align:left;display:flex;gap:8px}}.table-row small{{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}.table-row .yes{{color:var(--green);font-weight:900}}.table-row .no{{color:#b8b0bc}}.resource-link{{text-decoration:none}}footer{{text-align:center;color:var(--muted);margin-top:30px}}@media(max-width:760px){{.hero{{grid-template-columns:1fr}}.periods{{grid-template-columns:1fr 1fr}}.level-summary{{align-items:flex-start;flex-wrap:wrap}}.level-progress{{width:100%;min-width:0;margin-left:0}}.level-content{{padding:0 12px 16px}}.chapter summary{{grid-template-columns:48px 1fr 40px}}.status{{grid-column:2/4}}.chapter-detail{{padding-left:6px}}}}
</style></head><body><main><section class="hero"><div class="hero-card"><span class="eyebrow">Centre de pilotage</span><h1>🌸 SakuraMaths</h1><p>Production des ressources pédagogiques, détectée automatiquement depuis les progressions, les sources et les sorties générées.</p>{progress(overall)}<div class="analysis-time">Dernière analyse : {esc(generated_at)}</div></div><div class="global-card"><strong>{finished} / {total}</strong><span>chapitres complets · {overall} %</span><div class="global-links">{summary}</div></div></section><div class="dashboard-tools"><label class="filter-toggle"><input id="todo-filter" type="checkbox"><span>Afficher seulement les non-vérifiés</span></label><button id="sort-levels" type="button">Trier les niveaux par avancement</button></div>{panels or '<p>Aucune progression détectée.</p>'}<footer>Relancer <code>python builders/build_dashboard.py</code> après une génération.</footer></main><script>
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `.analysis-time{{margin-top:13px;color:var(--muted);font-size:.8rem}}.dashboard-tools{{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 15px;background:#ffffffb8;border:1px solid #fff;border-radius:18px;box-shadow:0 8px 24px #6f587512}}.filter-toggle{{display:flex;align-items:center;gap:9px;font-weight:800;cursor:pointer}}.filter-toggle input{{width:19px;height:19px;accent-color:var(--violet)}}.dashboard-tools button{{margin-left:auto;border:0;border-radius:999px;padding:9px 14px;background:#eee9f7;color:var(--ink);font-weight:800;cursor:pointer}}.show-todo-only [data-status="verified"]{{display:none!important}}.period-group.filter-empty{{display:none}}.detail-chip{{text-decoration:none}}a.detail-chip:hover{{outline:2px solid currentColor}}.table-caption{{display:flex;gap:8px;align-items:baseline;padding:0 3px 9px;color:var(--muted);font-size:.78rem}}.table-caption strong{{color:var(--ink)}}`;
document.head.appendChild(dashboardStyle);
dashboardStyle.textContent += `.domain-progress{{display:flex;align-items:center;gap:9px;min-width:190px}}.domain-progress .progress{{background:rgba(255,255,255,.28)}}.domain-progress .progress i{{background:linear-gradient(90deg,#ffd5e4,#fff)}}.domain-progress b{{min-width:42px;color:#fff;font-size:.82rem}}.domain-tool{{padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;text-decoration:none;font-size:.78rem;font-weight:800;white-space:nowrap}}.domain-tool:hover{{background:rgba(255,255,255,.28)}}@media(max-width:760px){{.domain-summary{{flex-wrap:wrap}}.domain-progress{{width:100%;min-width:0}}.domain-summary small{{margin-left:auto}}}}`;
document.body.style.background = "linear-gradient(rgba(255,248,246,.18),rgba(255,248,246,.40)),url('../../../fond-sakura-maths.png') center top / cover fixed no-repeat";
const todoFilter = document.getElementById('todo-filter');
todoFilter?.addEventListener('change', () => {{
  document.body.classList.toggle('show-todo-only', todoFilter.checked);
  document.querySelectorAll('.period-group').forEach(group => {{
    const visible = [...group.querySelectorAll('.chapter')].some(row => !row.hidden && getComputedStyle(row).display !== 'none');
    group.classList.toggle('filter-empty', todoFilter.checked && !visible);
  }});
}});
document.getElementById('sort-levels')?.addEventListener('click', event => {{
  document.querySelectorAll('.domain-content').forEach(container => {{
    [...container.children].sort((a,b) => {{
      const pa = Number(a.querySelector('.level-progress .pct')?.textContent.replace(/\\D/g,'')) || 0;
      const pb = Number(b.querySelector('.level-progress .pct')?.textContent.replace(/\\D/g,'')) || 0;
      return pa - pb;
    }}).forEach(node => container.appendChild(node));
  }});
  event.currentTarget.textContent = 'Niveaux triés : priorité au reste à faire';
}});
</script></body></html>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(document, encoding="utf-8")
    print(f"Dashboard généré : {OUT}")


if __name__ == "__main__":
    main()
