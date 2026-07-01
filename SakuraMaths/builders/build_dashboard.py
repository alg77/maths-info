#!/usr/bin/env python3
"""Génère le mini-dashboard local de production SakuraMaths."""

from __future__ import annotations

import html
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Studio" / "out" / "web" / "dashboard-production.html"


def exists(pattern: str) -> bool:
    return any(ROOT.glob(pattern))


def badge(ok: bool, label: str, link: str | None = None) -> str:
    text = f"{'✔' if ok else '○'} {html.escape(label)}"
    body = f'<a href="{html.escape(link)}">{text}</a>' if ok and link else text
    return f'<span class="badge {"ok" if ok else "todo"}">{body}</span>'


def main() -> None:
    cards = []
    manifests = sorted((ROOT / "livrets" / "manifests").glob("*-P*.json"))
    for manifest in manifests:
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
        except Exception:
            continue
        level = data.get("niveau", manifest.stem.split("-")[0])
        pid = data.get("periode_id") or next((part for part in manifest.stem.split("-") if part.startswith("P")), "P1")
        eleve = ROOT / data.get("livret", f"livrets/dist/{level}/{pid}/livret-{level}-{pid}-eleve.pdf")
        prof = ROOT / data.get("livret_prof", f"livrets/dist/{level}/{pid}/livret-{level}-{pid}-prof.pdf")
        html_pages = [ROOT / p for chapter in data.get("chapitres", []) for p in (chapter.get("html") or {}).values()]
        all_html = bool(html_pages) and all(path.exists() for path in html_pages)
        rel = lambda p: "../../../" + p.relative_to(ROOT).as_posix()
        badges = [badge(eleve.exists(), "Livret élève", rel(eleve) if eleve.exists() else None),
                  badge(prof.exists(), "Livret prof", rel(prof) if prof.exists() else None),
                  badge(all_html, "Pages web"),
                  badge(exists(f"Studio/out/qcm/*{level[0]}*"), "QCM"),
                  badge(exists(f"Studio/out/qcm/*{level[0]}*.xlsx"), "Kahoot"),
                  badge(exists(f"**/*{level}*{pid}*evaluation*"), "Évaluation"),
                  badge(exists(f"**/*{level}*{pid}*corrige*"), "Corrigé")]
        cards.append(f'<article><div class="card-title"><b>{html.escape(level)}</b><span>📖 {html.escape(pid)}</span></div><div class="badges">{"".join(badges)}</div></article>')
    document = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Production SakuraMaths</title><style>
body{{margin:0;background:linear-gradient(135deg,#eeeafd,#f8edf3);font-family:system-ui,sans-serif;color:#31354d}}main{{max-width:1050px;margin:auto;padding:32px}}h1{{color:#324f91;margin-bottom:4px}}.sub{{color:#73758a;margin-bottom:24px}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px}}article{{background:white;border-radius:20px;padding:18px;box-shadow:0 10px 32px #51487b1c}}.card-title{{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}}.card-title b{{font-size:1.5rem;color:#6656ba}}.card-title span{{font-weight:700;color:#53649a}}.badges{{display:flex;flex-wrap:wrap;gap:8px}}.badge{{padding:7px 10px;border-radius:999px;font-size:.84rem;font-weight:650}}.ok{{background:#e8f8ef;color:#287454}}.todo{{background:#f2f0f7;color:#8b8799}}a{{color:inherit;text-decoration:none}}footer{{margin-top:22px;color:#77798b;font-size:.8rem}}
</style></head><body><main><h1>🌸 Production SakuraMaths</h1><p class="sub">État des ressources détectées dans le projet.</p><section class="grid">{"".join(cards) or '<p>Aucun manifeste trouvé.</p>'}</section><footer>Relancer <code>python builders/build_dashboard.py</code> après une génération.</footer></main></body></html>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(document, encoding="utf-8")
    print(f"Dashboard généré : {OUT}")


if __name__ == "__main__":
    main()
