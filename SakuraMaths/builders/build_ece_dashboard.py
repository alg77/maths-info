#!/usr/bin/env python3
"""Génère le dashboard ECE SakuraNSI depuis manifest-ece.json."""

from __future__ import annotations

import html
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "Studio" / "references" / "nsi" / "ece" / "manifest-ece.json"
OUT = ROOT / "Studio" / "out" / "web" / "nsi" / "ece" / "dashboard.html"


def href(project_path: str | None) -> str:
    if not project_path:
        return ""
    return Path(os.path.relpath(ROOT / project_path, OUT.parent)).as_posix()


def row(subject: dict) -> str:
    interactive = subject["statut"] == "interactive"
    themes = " · ".join(subject.get("themes") or []) or "À indexer"
    train = f'<a class="quick-link" href="{href(subject["entrainement"])}#sujet-{subject["id"].lower()}">S’entraîner →</a>' if interactive else '<span class="muted">—</span>'
    source = f'<a href="{href(subject["sourcePdf"])}">PDF</a>' if subject.get("sourcePdf") else '<span class="muted">—</span>'
    archive = f'<a class="zip-link" href="{href(subject["zip"])}" download>ZIP ↓</a>' if (ROOT / subject["zip"]).exists() else '<span class="muted">—</span>'
    status = '<span class="badge done">Interactif</span>' if interactive else '<span class="badge todo">Référence</span>'
    return f'''<tr class="{'row-done' if interactive else ''}" data-ece-id="{html.escape(subject['id'])}" data-themes="{html.escape('|'.join(subject.get('themes') or []))}"><td class="cell-num">{html.escape(subject['id'])}</td><td><strong>{html.escape(subject['titre'])}</strong><small class="ece-theme-list">{html.escape(themes)}</small></td><td>{status}</td><td>{train}</td><td>{source}</td><td>{archive}</td></tr>'''


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    subjects = data["sujets"]
    groups = []
    for year in (2026, 2024):
        items = [s for s in subjects if s["annee"] == year]
        done = sum(s["statut"] == "interactive" for s in items)
        rows = "".join(row(s) for s in items)
        groups.append(f'''<section class="year-section"><h2>BNS {year}<span>{done}/{len(items)} interactifs</span></h2><div class="table-inner"><table><thead><tr><th>Réf.</th><th>Sujet et thèmes</th><th>Statut</th><th>Entraînement</th><th>Source</th><th>ZIP</th></tr></thead><tbody>{rows}</tbody></table></div></section>''')
    done = sum(s["statut"] == "interactive" for s in subjects)
    percent = round(done * 100 / len(subjects))
    document = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard ECE — SakuraNSI</title><link rel="stylesheet" href="ece-sakura.css"><script type="module">import {{ guardProf }} from "../../../../../auth/auth.js"; guardProf();</script><script src="ece-manifest-data.js" defer></script><script src="ece-manifest.js" defer></script><script src="ece-dashboard-filters.js" defer></script><style>
.dash-main{{max-width:1180px;margin:auto;padding:32px 18px 60px}}.dash-hero{{padding:28px;border-radius:26px;text-align:left!important;box-shadow:0 14px 40px #6f58751a}}.dash-hero h1{{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.2rem);margin:0 0 8px}}.dash-hero p{{margin:0!important}}.stats{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}}.stat{{background:var(--glass);padding:17px;border-radius:18px;border:1px solid #fff}}.stat b{{font-size:1.7rem;color:var(--accent)}}.bar{{height:8px;background:#e9e2ef;border-radius:99px;overflow:hidden;margin-top:9px}}.bar i{{display:block;height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent));border-radius:inherit}}.dash-filters{{padding:16px 18px;border-radius:18px;background:var(--glass);border:1px solid #fff}}.dash-filters>span,.dash-filter-count{{display:block;color:var(--text2);font-size:.76rem}}.dash-theme-buttons{{display:flex;flex-wrap:wrap;gap:7px;margin:11px 0}}.dash-theme-buttons button{{border:1px solid var(--border);background:#fff;border-radius:99px;padding:6px 10px;font:700 .75rem Inter,sans-serif;cursor:pointer}}.dash-theme-buttons button.active{{background:var(--accent);color:#fff}}.year-section{{margin:28px 0}}.year-section h2{{font-family:Georgia,serif;display:flex;align-items:center;gap:10px}}.year-section h2 span{{font:700 .75rem Inter,sans-serif;padding:5px 9px;border-radius:99px;background:#eee9f7;color:var(--accent)}}.table-inner{{overflow:auto;border-radius:18px}}table{{width:100%;border-collapse:collapse;background:#fff;min-width:850px}}th{{padding:11px;text-align:left;background:linear-gradient(90deg,#5c4e87,#7667ba);color:#fff;font-size:.75rem}}td{{padding:10px 11px;border-bottom:1px solid #eee8f0;font-size:.84rem}}td small{{display:block;color:var(--text2);margin-top:3px}}.row-done{{background:#f2fbf6}}.cell-num{{font-family:'JetBrains Mono',Consolas,monospace;color:var(--accent);font-weight:800}}.badge{{padding:4px 8px;border-radius:99px;font-size:.7rem;font-weight:800}}.badge.done{{background:#ddf5e8;color:#287353}}.badge.todo{{background:#f0edf3;color:#807687}}.quick-link,.zip-link{{font-weight:800;text-decoration:none}}.muted{{color:#aaa}}@media(max-width:700px){{.stats{{grid-template-columns:1fr}}}}
</style></head><body><nav><a href="../../../../../accueil.html" class="nav-brand">🌸 Sakura<span>NSI</span></a><div class="nav-links"><a href="../../dashboard-production.html">Cockpit</a><a class="active" href="dashboard.html">Dashboard ECE</a><a href="index.html">Entraînement</a><a href="prof.html">Professeur</a><a href="../../../../../Progressions/progression-gantt-nsi-terminale.html">Progression Terminale</a></div><span class="nav-badge">Terminale · ECE 2024/2026</span></nav><main class="dash-main"><section class="dash-hero"><h1>🎯 Pilotage des ECE</h1><p>71 sujets officiels indexés. Les sujets 2025 reprennent la banque 2024 dans un ordre différent.</p></section><section class="stats"><div class="stat"><b>{done}/{len(subjects)}</b><div>fiches interactives</div><div class="bar"><i style="width:{percent}%"></i></div></div><div class="stat"><b>23</b><div>sujets 2026</div></div><div class="stat"><b>48</b><div>sujets 2024</div></div></section>{''.join(groups)}</main></body></html>'''
    stripe_css = """<style>
tbody tr:nth-child(odd){background:#fff9fc}
tbody tr:nth-child(even){background:#f2f5ff}
tbody tr:hover{background:#eee9fb}
tbody tr.row-done{box-shadow:inset 4px 0 #70b690}
</style>"""
    document = document.replace("</head>", stripe_css + "</head>")
    OUT.write_text(document, encoding="utf-8")
    print(f"Dashboard ECE : {OUT}")


if __name__ == "__main__":
    main()
