#!/usr/bin/env python3
"""Construit les ressources QCM / automatismes 5e pour le pipeline SakuraMaths.

Entrées principales :
- Progressions/2026-REFERENTIEL_OBJECTIFS 5e.csv
- Progressions/2026-Automatismes 5e.csv
- Progressions/automatismes-flash-5e.html
- Progressions/progression-5e.json
- Progressions/pont-livret-5e.json

Sorties :
- Studio/config/progression-5e.json synchronisé
- Studio/config/pont-livret-5e.json synchronisé
- Studio/out/qcm/5e/automatismes-5e-generators.js
- Studio/out/qcm/5e/practice-5e-data.js
- Studio/out/qcm/5e/qcm-5e.html
- Studio/out/qcm/5e/automatismes-flash-5e.html
- Studio/out/qcm/5e/manifest-5e-practice.json
"""

from __future__ import annotations

import csv
import json
import re
import shutil
from pathlib import Path

from automatismes_spiral import write_spiral_page


ROOT = Path(__file__).resolve().parents[1]
PROG = ROOT / "Progressions"
STUDIO = ROOT / "Studio"
CONFIG = STUDIO / "config"
OUT = STUDIO / "out" / "qcm" / "5e"


def read_csv(path: Path, delimiter: str | None = None) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8-sig")
    first = text.splitlines()[0] if text.splitlines() else ""
    dialect = csv.excel
    if delimiter:
        dialect.delimiter = delimiter
    else:
        dialect = csv.Sniffer().sniff(first + "\n", delimiters=";,")
    return [{k.strip(): (v or "").strip() for k, v in row.items()} for row in csv.DictReader(text.splitlines(), dialect=dialect)]


def sync_json(name: str) -> None:
    src = PROG / name
    dst = CONFIG / name
    if not src.exists():
        return
    json.loads(src.read_text(encoding="utf-8"))
    CONFIG.mkdir(parents=True, exist_ok=True)
    if not dst.exists() or src.read_bytes() != dst.read_bytes():
        shutil.copy2(src, dst)


def load_pont() -> dict:
    path = PROG / "pont-livret-5e.json"
    if not path.exists():
        path = CONFIG / "pont-livret-5e.json"
    return json.loads(path.read_text(encoding="utf-8"))


def chapter_maps(pont: dict) -> tuple[dict[str, dict], dict[str, str]]:
    chapters = {}
    auto_to_chapter = {}
    for seq in pont.get("sequences", []):
        code = seq.get("code", "")
        chapters[code] = {"code": code, "titre": seq.get("titre", code), "theme": seq.get("theme", "")}
        for item in seq.get("automatismes", []) or []:
            auto_to_chapter[item.get("code", "")] = code
    return chapters, auto_to_chapter


def build_practice_data() -> tuple[list[dict], list[dict], dict]:
    objectifs_rows = read_csv(PROG / "2026-REFERENTIEL_OBJECTIFS 5e.csv")
    auto_rows = read_csv(PROG / "2026-Automatismes 5e.csv")
    pont = load_pont()
    chapters, auto_to_chapter = chapter_maps(pont)

    objectifs = []
    for row in objectifs_rows:
        objectifs.append({
            "ancienCode": row.get("Code actuel", ""),
            "code": row.get("Nouveau code", "") or row.get("Code actuel", ""),
            "themePedagogique": row.get("Thème pédagogique", ""),
            "intitule": row.get("Intitulé objectif", ""),
            "texte": row.get("Texte", ""),
            "famille": row.get("Famille compétence", ""),
            "niveau": "5e",
        })

    automatismes = []
    for row in auto_rows:
        code = row.get("Code actuel", "")
        chapter = auto_to_chapter.get(code, "")
        automatismes.append({
            "ancienCode": code,
            "code": row.get("Nouveau code", "") or code,
            "intitule": row.get("Intitulé automatisme", ""),
            "texte": row.get("Texte", ""),
            "niveau": "5e",
            "chapitre": chapter,
            "chapitreTitre": chapters.get(chapter, {}).get("titre", ""),
            "theme": chapters.get(chapter, {}).get("theme", ""),
        })
    return objectifs, automatismes, chapters


def extract_generators() -> str:
    html = (PROG / "automatismes-flash-5e.html").read_text(encoding="utf-8")
    match = re.search(r"<script>(?P<script>.*?)function\s+renderChaps\s*\(", html, flags=re.S)
    if not match:
        raise RuntimeError("Impossible d'extraire les générateurs depuis automatismes-flash-5e.html")
    script = match.group("script").rstrip()
    return f"""{script}

window.SAKURA_AUTOS_5E = AUTOS;
"""


def write_data_js(objectifs: list[dict], automatismes: list[dict], chapters: dict) -> None:
    payload = {
        "niveau": "5e",
        "objectifs": objectifs,
        "automatismes": automatismes,
        "chapitres": list(chapters.values()),
    }
    text = "window.SAKURA_5E_PRACTICE = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    (OUT / "practice-5e-data.js").write_text(text, encoding="utf-8")


QCM_HTML = """<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>QCM automatismes — 5e</title>
  <script src="practice-5e-data.js" defer></script>
  <script src="automatismes-5e-generators.js" defer></script>
  <style>
    :root{--ink:#3f3150;--muted:#786b79;--rose:#d98ba4;--violet:#7667ba;--paper:#fffdfc}
    *{box-sizing:border-box}body{margin:0;padding:22px;background:linear-gradient(135deg,#fff6f7,#f3f6ff);font-family:Atkinson Hyperlegible,system-ui,sans-serif;color:var(--ink)}
    main{max-width:980px;margin:auto}.hero,.card,.toolbar{background:#ffffffdc;border:1px solid #fff;border-radius:24px;box-shadow:0 12px 34px #7f5f7118}
    .hero{padding:25px;margin-bottom:16px}.hero h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.4rem);margin:.1em 0}.hero p{color:var(--muted);line-height:1.55}
    .toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:14px;margin-bottom:16px}select,button{font:inherit;border-radius:999px;border:1px solid #eadde6;padding:9px 13px;background:#fff;color:var(--ink)}button{font-weight:800;cursor:pointer}.primary{background:linear-gradient(90deg,var(--violet),var(--rose));color:white;border-color:transparent}
    .card{padding:22px}.meta{color:var(--muted);font-size:.9rem}.question{font-size:1.45rem;font-weight:850;margin:14px 0}.visual svg{max-width:100%;height:auto}.choices{display:grid;gap:10px;margin-top:14px}.choice{text-align:left;border-radius:16px;padding:13px;background:#fbf7fc;border:1px solid #eadde6}.choice.ok{background:#eaf8ef;border-color:#69b989}.choice.bad{background:#fff0f3;border-color:#c45a7a}.answer{display:none;margin-top:14px;padding:13px;border-left:5px solid #e6b450;background:#fff8ea;border-radius:12px}.answer.show{display:block}.empty{color:var(--muted)}
    a{color:#a8607c;font-weight:800}
  </style>
</head>
<body>
<main>
  <section class="hero">
    <h1>🎯 QCM automatismes — 5e</h1>
    <p>Questions aléatoires générées depuis les automatismes 5e. Les mêmes générateurs servent à la page flash : une seule banque, deux usages.</p>
    <p><a href="automatismes-flash-5e.html">Ouvrir la version flash libre →</a> · <a href="mini-eval-automatismes-5e.html">Générer une mini-éval spiralaire →</a></p>
  </section>
  <section class="toolbar">
    <label>Chapitre <select id="chapter"></select></label>
    <button class="primary" id="new" type="button">Nouvelle question</button>
    <button id="show" type="button">Afficher la réponse</button>
  </section>
  <section class="card" id="card"></section>
</main>
<script>
window.addEventListener('DOMContentLoaded',()=>{
  const autos=(window.SAKURA_AUTOS_5E||[]).filter(a=>typeof a.generate==='function');
  const data=window.SAKURA_5E_PRACTICE||{chapitres:[]};
  const chapter=document.querySelector('#chapter'),card=document.querySelector('#card');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const chapters=[...new Set(autos.map(a=>a.seq).filter(Boolean))];
  chapter.innerHTML='<option value="all">Tous les chapitres</option>'+chapters.map(c=>{
    const info=(data.chapitres||[]).find(x=>x.code===c); return `<option value="${c}">${c}${info?' — '+info.titre:''}</option>`;
  }).join('');
  let current=null;
  function shuffle(arr){return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);}
  function distractors(answer){
    const pool=new Set();
    let guard=0;
    while(pool.size<3 && guard<60){
      guard++;
      const a=autos[Math.floor(Math.random()*autos.length)];
      try{const v=a.generate().reponse; if(v!==answer) pool.add(v);}catch(e){}
    }
    while(pool.size<3) pool.add(String(Math.floor(Math.random()*30)+1));
    return [...pool].slice(0,3);
  }
  function pick(){
    const pool=autos.filter(a=>chapter.value==='all'||a.seq===chapter.value);
    if(!pool.length){card.innerHTML='<p class="empty">Aucun générateur disponible pour ce chapitre.</p>';return;}
    const auto=pool[Math.floor(Math.random()*pool.length)];
    const qa=auto.generate();
    const choices=shuffle([qa.reponse,...distractors(qa.reponse)]);
    current={auto,qa,choices,answer:qa.reponse};
    render();
  }
  function render(){
    if(!current)return;
    card.innerHTML=`<div class="meta">${esc(current.auto.seq||'5e')} · ${esc(current.auto.code)} · ${esc(current.auto.label)}</div><div class="question">${current.qa.enonce}</div><div class="choices">${current.choices.map((c,i)=>`<button class="choice" data-i="${i}" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="answer">Réponse attendue : <strong>${esc(current.answer)}</strong></div>`;
    card.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
      card.querySelectorAll('.choice').forEach(b=>b.disabled=true);
      const ok=btn.dataset.value===current.answer;
      btn.classList.add(ok?'ok':'bad');
      card.querySelectorAll('.choice').forEach(b=>{if(b.dataset.value===current.answer)b.classList.add('ok')});
      card.querySelector('.answer').classList.add('show');
    }));
  }
  document.querySelector('#new').addEventListener('click',pick);
  document.querySelector('#show').addEventListener('click',()=>card.querySelector('.answer')?.classList.add('show'));
  chapter.addEventListener('change',pick);
  pick();
});
</script>
</body>
</html>
"""


def write_manifest(objectifs: list[dict], automatismes: list[dict]) -> None:
    manifest = {
        "niveau": "5e",
        "objectifs": len(objectifs),
        "automatismes": len(automatismes),
        "generateursFlash": "automatismes-5e-generators.js",
        "qcm": "qcm-5e.html",
        "flash": "automatismes-flash-5e.html",
        "miniEvalSpiralaire": "mini-eval-automatismes-5e.html",
        "regleMiniEval": {
            "questions": 20,
            "strategie": "spiralaire",
            "repartition": "6 + 6 sur les 2 automatismes les plus récents, puis 4 + 4 sur 2 automatismes anciens",
        },
        "sources": [
            "Progressions/2026-REFERENTIEL_OBJECTIFS 5e.csv",
            "Progressions/2026-Automatismes 5e.csv",
            "Progressions/automatismes-flash-5e.html",
            "Progressions/pont-livret-5e.json",
        ],
    }
    (OUT / "manifest-5e-practice.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "README.md").write_text(
        "# QCM et automatismes 5e\n\n"
        "Ces fichiers sont générés par `python builders/build_5e_practice.py`.\n\n"
        "- `qcm-5e.html` : QCM autocorrectif à partir des générateurs d'automatismes.\n"
        "- `automatismes-flash-5e.html` : version flash libre issue de la progression.\n"
        "- `mini-eval-automatismes-5e.html` : mini-évaluations spiralaires 20 questions, sujets + corrigés.\n"
        "- `practice-5e-data.js` : objectifs, automatismes et chapitres normalisés.\n"
        "- `automatismes-5e-generators.js` : générateurs aléatoires utilisés par le QCM.\n",
        encoding="utf-8",
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sync_json("progression-5e.json")
    sync_json("pont-livret-5e.json")
    objectifs, automatismes, chapters = build_practice_data()
    write_data_js(objectifs, automatismes, chapters)
    (OUT / "automatismes-5e-generators.js").write_text(extract_generators(), encoding="utf-8")
    shutil.copy2(PROG / "automatismes-flash-5e.html", OUT / "automatismes-flash-5e.html")
    (OUT / "qcm-5e.html").write_text(QCM_HTML, encoding="utf-8")
    write_manifest(objectifs, automatismes)
    write_spiral_page(OUT, "5e", OUT / "manifest-5e-practice.json")
    print(f"OK Ressources 5e generees dans {OUT.relative_to(ROOT)}")
    print(f"  · {len(objectifs)} objectifs")
    print(f"  · {len(automatismes)} automatismes")


if __name__ == "__main__":
    main()
