#!/usr/bin/env python3
"""Construit les ressources QCM / automatismes 4e pour le pipeline SakuraMaths."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from automatismes_spiral import write_spiral_page


ROOT = Path(__file__).resolve().parents[1]
PROG = ROOT / "Progressions"
STUDIO = ROOT / "Studio"
CONFIG = STUDIO / "config"
OUT = STUDIO / "out" / "qcm" / "4e"


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
    path = PROG / "pont-livret-4e.json"
    if not path.exists():
        path = CONFIG / "pont-livret-4e.json"
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_from_pont(pont: dict) -> tuple[list[dict], list[dict], list[dict]]:
    objectifs, automatismes, chapters = [], [], []
    for seq in pont.get("sequences", []):
        code = seq.get("code", "")
        chapters.append({"code": code, "titre": seq.get("titre", code), "theme": seq.get("theme", "")})
        for item in seq.get("objectifs", []) or []:
            objectifs.append({
                "code": item.get("code", ""),
                "texte": item.get("texte", ""),
                "famille": item.get("famille", ""),
                "niveau": item.get("niveau", "4e"),
                "chapitre": code,
                "chapitreTitre": seq.get("titre", code),
                "theme": seq.get("theme", ""),
            })
        for item in seq.get("automatismes", []) or []:
            automatismes.append({
                "code": item.get("code", ""),
                "texte": item.get("texte", ""),
                "famille": item.get("famille", ""),
                "niveau": item.get("niveau", "4e"),
                "chapitre": code,
                "chapitreTitre": seq.get("titre", code),
                "theme": seq.get("theme", ""),
            })
    return objectifs, automatismes, chapters


GENERATOR_JS = r"""
(function(){
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function choice(a){return a[ri(0,a.length-1)];}
function fmt(n){return String(Math.round(n*1000)/1000).replace('.', ',');}
function frac(a,b){return a+'/'+b;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){let t=a%b;a=b;b=t;}return a||1;}
function simp(a,b){let g=gcd(a,b);return (a/g)+'/'+(b/g);}
function autoQuestion(text){return {enonce:text, reponse:'Réponse attendue : expliquer la méthode, donner un exemple correct et employer le vocabulaire du chapitre.'};}
function make(code,seq,theme,label,text,fn){return {code,seq,theme,label,text,generate:fn||function(){return autoQuestion(text)}};}
function generator(code,text){
  switch(code){
    case 'aOPR1': return function(){let a=ri(-12,12),b=ri(-12,12),op=choice(['+','−']);let r=op==='+'?a+b:a-b;return {enonce:'Calcule : '+a+' '+op+' ('+b+')',reponse:String(r)}};
    case 'aOPR2': return function(){let a=ri(-15,15);return {enonce:"Donne l'opposé de "+a+". Puis calcule "+a+" + son opposé.",reponse:"opposé : "+(-a)+" ; somme : 0"}};
    case 'aOPR3': return function(){let a=ri(2,12),b=ri(2,12);return {enonce:'Calcule : '+a+' × '+b,reponse:String(a*b)}};
    case 'aOPR4':
    case 'aPUI2': return function(){let n=ri(12,999)/10, k=choice([10,100,1000]), op=choice(['×','÷']);let r=op==='×'?n*k:n/k;return {enonce:'Calcule : '+fmt(n)+' '+op+' '+k,reponse:fmt(r)}};
    case 'aOPR5': return function(){let a=ri(2,12),b=ri(2,12),p=a*b;return {enonce:'Complète : '+a+' × … = '+p,reponse:String(b)}};
    case 'aOPR6': return function(){let a=ri(2,9),n=ri(3,6);return {enonce:'Écris sous forme de multiplication : '+Array(n).fill(a).join(' + '),reponse:n+' × '+a+' = '+(n*a)}};
    case 'aPRP1': return function(){let pct=choice([1,10,25,50,100]), c=ri(2,20)*10;return {enonce:'Calcule '+pct+' % de '+c+'.',reponse:fmt(c*pct/100)}};
    case 'aPRP2': return function(){let pct=choice([10,20,25,30,40,50]), n=choice([100,120,150,200,250,1000]);return {enonce:'Complète : '+pct+' % de '+n+' = …',reponse:fmt(pct*n/100)}};
    case 'aLIT1': return function(){let x=ri(-5,8);return {enonce:'Pour x = '+x+', calcule 3x + 2.',reponse:String(3*x+2)}};
    case 'aLIT2': return function(){if(Math.random()<0.5){let x=ri(-8,8),b=ri(-9,9);return {enonce:'Résous : x + '+b+' = '+(x+b),reponse:'x = '+x}}let a=choice([2,3,4,5,-2,-3]),x=ri(-8,8);return {enonce:'Résous : '+a+'x = '+(a*x),reponse:'x = '+x}};
    case 'aLIT3': return function(){let k=ri(2,9);return {enonce:'Simplifie l’écriture : '+k+' × x',reponse:k+'x'}};
    case 'aLIT4': return function(){let a=ri(2,8),b=ri(2,8);return {enonce:'Réduis : '+a+'x + '+b+'x',reponse:(a+b)+'x'}};
    case 'aLIT5': return function(){let n=ri(-10,10),q=choice(['double','triple','moitié','carré','successeur','prédécesseur']);let r={double:2*n,triple:3*n,moitié:fmt(n/2),carré:n*n,successeur:n+1,prédécesseur:n-1}[q];return {enonce:'Donne le '+q+' de '+n+'.',reponse:String(r)}};
    case 'aLIT6': return function(){let x=ri(-5,8),a=ri(2,6),b=ri(-5,5);return {enonce:'Teste si x = '+x+' vérifie '+a+'x + '+b+' = '+(a*x+b)+'.',reponse:'Oui, car '+a+' × '+x+' + '+b+' = '+(a*x+b)}};
    case 'aPUI1':
    case 'aRAC1': return function(){let n=ri(0,12);return {enonce:'Calcule '+n+'².',reponse:String(n*n)}};
    case 'aPUI3': return function(){let a=choice([2,3,4,5,10]),e=choice([2,3]);return {enonce:'Calcule '+a+(e===2?'²':'³')+'.',reponse:String(a**e)}};
    case 'aPUI4': return function(){let e=choice([2,3,4]);return {enonce:'Calcule 10'+(e===2?'²':e===3?'³':'⁴')+'.',reponse:String(10**e)}};
    case 'aRAT1': return function(){let d=choice([3,4,5,6,8,10]),a=ri(1,d-1),b=ri(1,d-1),op=choice(['+','−']);if(op==='−'&&b>a){let t=a;a=b;b=t;}return {enonce:'Calcule : '+frac(a,d)+' '+op+' '+frac(b,d),reponse:frac(op==='+'?a+b:a-b,d)}};
    case 'aRAT2': return function(){let d=choice([4,5,6,8,10]),a=ri(1,d-1),b=ri(1,d-1);while(a===b)b=ri(1,d-1);return {enonce:'Compare : '+frac(a,d)+' et '+frac(b,d),reponse:frac(a,d)+(a>b?' > ':' < ')+frac(b,d)}};
    case 'aRAT3': return function(){let a=ri(1,12),b=ri(2,12);return {enonce:'Écris le quotient de '+a+' par '+b+' sous forme de fraction.',reponse:frac(a,b)}};
    case 'aRAT4': return function(){let a=ri(1,5),b=ri(a+1,10),n=b*ri(2,8);return {enonce:'Calcule '+frac(a,b)+' de '+n+'.',reponse:String(a*n/b)}};
    case 'aSTA1': return function(){let a=ri(4,18),b=ri(4,18),c=ri(4,18);return {enonce:'Calcule la moyenne de '+a+', '+b+' et '+c+'.',reponse:fmt((a+b+c)/3)}};
    case 'aSTA2': return function(){let total=ri(20,40),a=ri(3,10),b=ri(3,10),c=total-a-b;return {enonce:'Total : '+total+'. Deux effectifs valent '+a+' et '+b+'. Quel est l’effectif manquant ?',reponse:String(c)}};
    case 'aSTA3': return function(){let total=choice([20,25,40,50,100]),eff=ri(1,total-1);return {enonce:'Dans un groupe de '+total+', un effectif vaut '+eff+'. Donne la fréquence.',reponse:frac(eff,total)+' = '+fmt(eff/total*100)+' %'}};
    case 'aESP4': return function(){let b=ri(3,12),h=ri(3,12);return {enonce:"Aire d'un triangle de base "+b+" cm et hauteur "+h+" cm.",reponse:fmt(b*h/2)+' cm²'}};
    case 'aESP2': return function(){let L=ri(2,8),l=ri(2,8),h=ri(2,8);return {enonce:"Volume d'un pavé droit : "+L+" × "+l+" × "+h+".",reponse:String(L*l*h)}};
    default: return null;
  }
}
window.SAKURA_AUTOS_4E=(window.SAKURA_AUTOS_4E_META||[]).map(m=>make(m.code,m.chapitre,m.theme,m.intitule||m.code,m.texte,generator(m.code,m.texte)));
})();
"""


QCM_HTML = """<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>QCM automatismes — 4e</title>
  <script src="practice-4e-data.js" defer></script>
  <script src="automatismes-4e-generators.js" defer></script>
  <style>
    :root{--ink:#304263;--muted:#667085;--blue:#6f9bd6;--violet:#7667ba;--paper:#fffdfc}
    *{box-sizing:border-box}body{margin:0;padding:22px;background:linear-gradient(135deg,#eef7ff,#f7f2ff);font-family:Atkinson Hyperlegible,system-ui,sans-serif;color:var(--ink)}
    main{max-width:980px;margin:auto}.hero,.card,.toolbar{background:#ffffffdc;border:1px solid #fff;border-radius:24px;box-shadow:0 12px 34px #5c6f9418}
    .hero{padding:25px;margin-bottom:16px}.hero h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.4rem);margin:.1em 0}.hero p{color:var(--muted);line-height:1.55}
    .toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:14px;margin-bottom:16px}select,button{font:inherit;border-radius:999px;border:1px solid #d8e3f1;padding:9px 13px;background:#fff;color:var(--ink)}button{font-weight:800;cursor:pointer}.primary{background:linear-gradient(90deg,var(--blue),var(--violet));color:white;border-color:transparent}
    .card{padding:22px}.meta{color:var(--muted);font-size:.9rem}.question{font-size:1.45rem;font-weight:850;margin:14px 0}.choices{display:grid;gap:10px;margin-top:14px}.choice{text-align:left;border-radius:16px;padding:13px;background:#f8fbff;border:1px solid #d8e3f1}.choice.ok{background:#eaf8ef;border-color:#69b989}.choice.bad{background:#fff0f3;border-color:#c45a7a}.answer{display:none;margin-top:14px;padding:13px;border-left:5px solid #6f9bd6;background:#eef7ff;border-radius:12px}.answer.show{display:block}.empty{color:var(--muted)}a{color:#557fbd;font-weight:800}
  </style>
</head>
<body>
<main>
  <section class="hero">
    <h1>🎯 QCM automatismes — 4e</h1>
    <p>Questions générées depuis les automatismes du pont-livret 4e. Les questions calculatoires sont aléatoires ; les notions géométriques servent de relances flash.</p>
    <p><a href="automatismes-flash-4e.html">Ouvrir la version flash libre →</a> · <a href="mini-eval-automatismes-4e.html">Générer une mini-éval spiralaire →</a></p>
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
  const autos=(window.SAKURA_AUTOS_4E||[]).filter(a=>typeof a.generate==='function');
  const data=window.SAKURA_4E_PRACTICE||{chapitres:[]};
  const chapter=document.querySelector('#chapter'),card=document.querySelector('#card');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const chapters=[...new Set(autos.map(a=>a.seq).filter(Boolean))];
  chapter.innerHTML='<option value="all">Tous les chapitres</option>'+chapters.map(c=>{const info=(data.chapitres||[]).find(x=>x.code===c);return `<option value="${esc(c)}">${esc(c)}${info?' — '+esc(info.titre):''}</option>`}).join('');
  let current=null;
  function shuffle(arr){return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);}
  function distractors(answer){const pool=new Set();let guard=0;while(pool.size<3&&guard<80){guard++;const a=autos[Math.floor(Math.random()*autos.length)];try{const v=a.generate().reponse;if(v!==answer&&String(v).length<80)pool.add(v)}catch(e){}}while(pool.size<3)pool.add(String(Math.floor(Math.random()*40)-10));return [...pool].slice(0,3)}
  function pick(){const pool=autos.filter(a=>chapter.value==='all'||a.seq===chapter.value);if(!pool.length){card.innerHTML='<p class="empty">Aucun automatisme disponible.</p>';return}const auto=pool[Math.floor(Math.random()*pool.length)],qa=auto.generate(),choices=shuffle([qa.reponse,...distractors(qa.reponse)]);current={auto,qa,choices,answer:qa.reponse};render()}
  function render(){if(!current)return;card.innerHTML=`<div class="meta">${esc(current.auto.seq||'4e')} · ${esc(current.auto.code)} · ${esc(current.auto.label)}</div><div class="question">${current.qa.enonce}</div><div class="choices">${current.choices.map((c,i)=>`<button class="choice" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="answer">Réponse attendue : <strong>${esc(current.answer)}</strong></div>`;card.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{card.querySelectorAll('.choice').forEach(b=>b.disabled=true);const ok=btn.dataset.value===current.answer;btn.classList.add(ok?'ok':'bad');card.querySelectorAll('.choice').forEach(b=>{if(b.dataset.value===current.answer)b.classList.add('ok')});card.querySelector('.answer').classList.add('show')}))}
  document.querySelector('#new').addEventListener('click',pick);document.querySelector('#show').addEventListener('click',()=>card.querySelector('.answer')?.classList.add('show'));chapter.addEventListener('change',pick);pick();
});
</script>
</body>
</html>
"""


FLASH_HTML = """<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Automatismes flash — 4e</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
  <script src="practice-4e-data.js" defer></script>
  <script src="automatismes-4e-generators.js" defer></script>
  <style>
    :root{--bg:#f3f8ff;--card:#fff;--border:#dce9f7;--ink:#304263;--muted:#6d7890;--accent:#7fa8dc;--accent-ink:#4d73ae;--N:#8fb3d9;--G:#e6a18c;--D:#8fd3b3;--A:#b9a3dd}
    *{box-sizing:border-box}
    body{font-family:'Atkinson Hyperlegible',sans-serif;margin:0;background:linear-gradient(145deg,#eef7ff,#f7f2ff);color:var(--ink);line-height:1.5}
    h1,h2,h3{font-family:'Baloo 2',sans-serif}
    .wrap{max-width:980px;margin:0 auto;padding:1.6rem 1.4rem 4rem}
    header{text-align:center;margin-bottom:1.6rem}
    h1{font-size:clamp(1.5rem,4vw,2.1rem);color:var(--accent-ink);margin:0 0 .3rem}
    .sub{color:var(--muted);font-size:.9rem}
    .panel{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:1.3rem 1.5rem;margin-bottom:1.4rem;box-shadow:0 4px 18px rgba(80,110,150,.08)}
    .panel h2{font-size:1.1rem;color:var(--accent-ink);margin:0 0 .8rem;border-bottom:1px solid var(--border);padding-bottom:.5rem}
    .chaps{display:flex;flex-wrap:wrap;gap:.4rem}
    .chap-chip{display:inline-flex;align-items:center;gap:5px;border:1.5px solid var(--border);border-radius:999px;padding:.3rem .7rem;font-size:.8rem;cursor:pointer;user-select:none;background:#fff}
    .chap-chip.on{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
    .chap-chip .dot{width:8px;height:8px;border-radius:50%}
    .row-controls{display:flex;gap:.8rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem}
    .btn{background:var(--accent);color:#fff;border:none;border-radius:10px;padding:.7rem 1.3rem;font-size:.95rem;font-weight:700;cursor:pointer;font-family:'Baloo 2',sans-serif;text-decoration:none}
    .btn:hover{background:var(--accent-ink)}
    .btn.ghost{background:#fff;color:var(--accent-ink);border:1px solid var(--border)}
    .count-note{font-size:.82rem;color:var(--muted)}
    .flash-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.9rem;margin-top:1rem}
    .flashcard{border:1.5px solid var(--border);border-radius:14px;padding:1rem 1.1rem;background:#fffdfc;cursor:pointer;position:relative;min-height:100px}
    .flashcard .fc-theme{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
    .flashcard .fc-code{font-size:.68rem;color:var(--muted);font-family:monospace}
    .flashcard .fc-q{margin-top:.5rem;font-size:1.02rem;font-weight:600}
    .flashcard .fc-a{margin-top:.6rem;padding-top:.5rem;border-top:1px dashed var(--border);color:var(--accent-ink);font-weight:700;display:none}
    .flashcard.revealed .fc-a{display:block}
    .flashcard .fc-hint{font-size:.72rem;color:var(--muted);margin-top:.5rem;font-style:italic}
    footer{text-align:center;color:var(--muted);font-size:.82rem;padding:2rem 0 0}
  </style>
</head>
<body><div class="wrap">
<header><h1>⚡ Automatismes flash — 4e</h1><div class="sub">Pioche rapide pour début de séance : clique une carte pour afficher la réponse attendue.</div></header>
<section class="panel">
  <h2>📚 Choisir les chapitres</h2>
  <div class="chaps" id="chapsList"></div>
</section>
<section class="panel">
  <h2>🎲 Pioche flash du jour</h2>
  <div class="row-controls"><label>Nombre de questions : <input type="number" id="flashCount" value="5" min="5" max="10" style="width:60px"></label><button class="btn" id="draw" type="button">Tirer 5 questions</button><button class="btn ghost" id="reveal" type="button">Tout révéler</button><a class="btn ghost" href="qcm-4e.html">🎯 Version QCM</a><span class="count-note">Cliquer une carte pour révéler la réponse.</span></div>
  <div class="flash-grid" id="grid"></div>
</section>
<footer>SakuraMaths — banque d'automatismes 4e générée depuis le pont-livret</footer>
</div><script>
window.addEventListener('DOMContentLoaded',()=>{
const autos=window.SAKURA_AUTOS_4E||[],data=window.SAKURA_4E_PRACTICE||{chapitres:[]},chips=document.querySelector('#chapsList'),grid=document.querySelector('#grid');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const colors={N:'var(--N)',G:'var(--G)',D:'var(--D)',A:'var(--A)'};
const chapters=[...new Set(autos.map(a=>a.seq).filter(Boolean))], selected=new Set(chapters);
chips.innerHTML=chapters.map(c=>{const info=(data.chapitres||[]).find(x=>x.code===c)||{},theme=(info.theme||c[0]||'N').slice(0,1);return `<span class="chap-chip on" data-code="${esc(c)}"><i class="dot" style="background:${colors[theme]||'var(--accent)'}"></i>${esc(c)} · ${esc(info.titre||c)}</span>`}).join('');
chips.querySelectorAll('.chap-chip').forEach(chip=>chip.addEventListener('click',()=>{const c=chip.dataset.code;selected.has(c)?selected.delete(c):selected.add(c);chip.classList.toggle('on',selected.has(c));draw()}));
function choice(arr){return arr[Math.floor(Math.random()*arr.length)]}
function pickNRepeat(arr,n){const out=[];if(!arr.length)return out;for(let i=0;i<n;i++)out.push(choice(arr));return out}
function draw(){const pool=autos.filter(a=>selected.has(a.seq));const n=Math.max(5,Math.min(10,+document.querySelector('#flashCount').value||5));document.querySelector('#draw').textContent='Tirer '+n+' questions';const chosen=pickNRepeat(pool,n);grid.innerHTML=chosen.length?chosen.map(a=>{const qa=a.generate();const theme=(a.theme||a.seq?.[0]||'N').slice(0,1);return `<article class="flashcard"><span class="fc-theme" style="background:${colors[theme]||'var(--accent)'}"></span><span class="fc-code">${esc(a.seq)} · ${esc(a.code)}</span><div class="fc-q">${qa.enonce}</div><div class="fc-a">${esc(qa.reponse)}</div><div class="fc-hint">${esc(a.label)}</div></article>`}).join(''):'<p class="count-note">Sélectionne au moins un chapitre.</p>';grid.querySelectorAll('.flashcard').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('revealed')))}
document.querySelector('#draw').addEventListener('click',draw);document.querySelector('#reveal').addEventListener('click',()=>grid.querySelectorAll('.flashcard').forEach(c=>c.classList.add('revealed')));draw();
});
</script></body></html>
"""


def write_outputs(objectifs: list[dict], automatismes: list[dict], chapters: list[dict]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    payload = {"niveau": "4e", "objectifs": objectifs, "automatismes": automatismes, "chapitres": chapters}
    (OUT / "practice-4e-data.js").write_text("window.SAKURA_4E_PRACTICE = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\nwindow.SAKURA_AUTOS_4E_META = " + json.dumps(automatismes, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    (OUT / "automatismes-4e-generators.js").write_text(GENERATOR_JS, encoding="utf-8")
    (OUT / "qcm-4e.html").write_text(QCM_HTML, encoding="utf-8")
    (OUT / "automatismes-flash-4e.html").write_text(FLASH_HTML, encoding="utf-8")
    write_spiral_page(OUT, "4e")
    manifest = {
        "niveau": "4e",
        "objectifs": len(objectifs),
        "automatismes": len(automatismes),
        "generateursFlash": "automatismes-4e-generators.js",
        "qcm": "qcm-4e.html",
        "flash": "automatismes-flash-4e.html",
        "miniEvalSpiralaire": "mini-eval-automatismes-4e.html",
        "regleMiniEval": {
            "questions": 20,
            "strategie": "spiralaire",
            "repartition": "6 + 6 sur les 2 automatismes les plus récents, puis 4 + 4 sur 2 automatismes anciens",
            "adaptation": {
                "1 automatisme": "20",
                "2 automatismes": "10 + 10",
                "3 automatismes": "8 + 7 + 5",
                "4 automatismes et plus": "6 + 6 + 4 + 4",
            },
        },
        "sources": ["Progressions/pont-livret-4e.json", "Progressions/progression-4e.json"],
    }
    (OUT / "manifest-4e-practice.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "README.md").write_text(
        "# QCM et automatismes 4e\n\n"
        "Ces fichiers sont générés par `python builders/build_4e_practice.py`.\n\n"
        "- `qcm-4e.html` : QCM autocorrectif à partir des automatismes du pont-livret.\n"
        "- `automatismes-flash-4e.html` : pioche flash de début de séance.\n"
        "- `mini-eval-automatismes-4e.html` : mini-évaluations spiralaires 20 questions, sujets + corrigés.\n"
        "- `practice-4e-data.js` : objectifs, automatismes et chapitres normalisés.\n"
        "- `automatismes-4e-generators.js` : générateurs aléatoires et relances flash.\n",
        encoding="utf-8",
    )


def main() -> None:
    sync_json("progression-4e.json")
    sync_json("pont-livret-4e.json")
    objectifs, automatismes, chapters = normalize_from_pont(load_pont())
    write_outputs(objectifs, automatismes, chapters)
    print(f"OK Ressources 4e generees dans {OUT.relative_to(ROOT)}")
    print(f"  · {len(objectifs)} objectifs")
    print(f"  · {len(automatismes)} automatismes")


if __name__ == "__main__":
    main()
