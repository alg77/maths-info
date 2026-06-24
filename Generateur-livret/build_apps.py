#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Construit QCM.html et dashboard.html (autonomes) — Mme Le Guern."""
import base64, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANDA = "data:image/png;base64," + base64.b64encode(
    (ROOT / "assets" / "panda.png").read_bytes()).decode()
MATHVAR = "data:font/ttf;base64," + base64.b64encode(
    (ROOT / "fonts" / "KaTeX_Math-Italic.ttf").read_bytes()).decode()

# ============================ BANQUE DE QUESTIONS ============================
# t=thème, q=énoncé, o=options, c=index correct, e=explication. Maths en $...$.
QUESTIONS = [
 # Relatifs
 {"t":"Relatifs","q":r"$(-7)+(-5)=$ ?","o":[r"$-12$",r"$12$",r"$-2$",r"$2$"],"c":0,"e":r"Mêmes signes : on additionne les distances et on garde le signe : $-12$."},
 {"t":"Relatifs","q":r"$(-3)-(-8)=$ ?","o":[r"$5$",r"$-11$",r"$-5$",r"$11$"],"c":0,"e":r"Soustraire, c'est ajouter l'opposé : $-3+8=5$."},
 {"t":"Relatifs","q":r"$-3+4\times(-2)=$ ?","o":[r"$-11$",r"$-2$",r"$14$",r"$5$"],"c":0,"e":r"Priorité à $\times$ : $4\times(-2)=-8$, puis $-3-8=-11$."},
 {"t":"Relatifs","q":r"$(-2)^3=$ ?","o":[r"$-8$",r"$8$",r"$-6$",r"$6$"],"c":0,"e":r"Trois facteurs négatifs (impair) : résultat négatif, $-8$."},
 # Fractions
 {"t":"Fractions","q":r"$\frac{3}{4}+\frac{5}{6}=$ ?","o":[r"$\frac{19}{12}$",r"$\frac{8}{10}$",r"$\frac{8}{12}$",r"$\frac{15}{24}$"],"c":0,"e":r"Dénominateur commun $12$ : $\frac{9}{12}+\frac{10}{12}=\frac{19}{12}$."},
 {"t":"Fractions","q":r"$\frac{3}{4}\times\frac{8}{9}=$ ?","o":[r"$\frac{2}{3}$",r"$\frac{24}{36}$",r"$\frac{11}{13}$",r"$\frac{27}{32}$"],"c":0,"e":r"On multiplie en ligne : $\frac{24}{36}=\frac{2}{3}$ (pense à simplifier !)."},
 {"t":"Fractions","q":r"$2-\frac{3}{7}=$ ?","o":[r"$\frac{11}{7}$",r"$\frac{1}{7}$",r"$\frac{14}{7}$",r"$\frac{-1}{7}$"],"c":0,"e":r"$\frac{14}{7}-\frac{3}{7}=\frac{11}{7}$."},
 {"t":"Fractions","q":r"$\frac{5}{6}\div\frac{10}{3}=$ ?","o":[r"$\frac{1}{4}$",r"$\frac{50}{18}$",r"$4$",r"$\frac{15}{60}$"],"c":0,"e":r"Diviser = multiplier par l'inverse : $\frac{5}{6}\times\frac{3}{10}=\frac{1}{4}$."},
 # Puissances
 {"t":"Puissances","q":r"$(-2)^4=$ ?","o":[r"$16$",r"$-16$",r"$8$",r"$-8$"],"c":0,"e":r"Nombre pair de facteurs négatifs : résultat positif, $16$."},
 {"t":"Puissances","q":r"$10^{-2}=$ ?","o":[r"$0,01$",r"$100$",r"$-100$",r"$-20$"],"c":0,"e":r"$10^{-2}=\frac{1}{100}=0,01$."},
 {"t":"Puissances","q":r"$2^3\times2^4=$ ?","o":[r"$2^7$",r"$2^{12}$",r"$4^7$",r"$2^1$"],"c":0,"e":r"On additionne les exposants : $2^{3+4}=2^7$."},
 {"t":"Puissances","q":r"$34\,000$ en notation scientifique :","o":[r"$3,4\times10^4$",r"$34\times10^3$",r"$3,4\times10^{-4}$",r"$0,34\times10^5$"],"c":0,"e":r"Un seul chiffre non nul avant la virgule : $3,4\times10^4$."},
 # Calcul littéral
 {"t":"Calcul littéral","q":r"Réduire $3x+5x-2x$ :","o":[r"$6x$",r"$6x^3$",r"$10x$",r"$x$"],"c":0,"e":r"$3+5-2=6$, donc $6x$."},
 {"t":"Calcul littéral","q":r"Développer $3(x+4)$ :","o":[r"$3x+12$",r"$3x+4$",r"$x+12$",r"$3x+7$"],"c":0,"e":r"$3\times x+3\times4=3x+12$."},
 {"t":"Calcul littéral","q":r"Développer $(x+2)(x+5)$ :","o":[r"$x^2+7x+10$",r"$x^2+10$",r"$x^2+7x+7$",r"$2x+10$"],"c":0,"e":r"$x^2+5x+2x+10=x^2+7x+10$."},
 {"t":"Calcul littéral","q":r"$5x-(3x-4)=$ ?","o":[r"$2x+4$",r"$2x-4$",r"$8x-4$",r"$2x+1$"],"c":0,"e":r"Le $-$ change les signes : $5x-3x+4=2x+4$."},
 # Équations
 {"t":"Équations","q":r"Résoudre $3x=18$ :","o":[r"$x=6$",r"$x=15$",r"$x=21$",r"$x=54$"],"c":0,"e":r"On divise par $3$ : $x=6$."},
 {"t":"Équations","q":r"Résoudre $2x+3=11$ :","o":[r"$x=4$",r"$x=7$",r"$x=5$",r"$x=8$"],"c":0,"e":r"$2x=8$ donc $x=4$."},
 {"t":"Équations","q":r"Résoudre $3x+2=x+10$ :","o":[r"$x=4$",r"$x=3$",r"$x=6$",r"$x=2$"],"c":0,"e":r"$2x=8$ donc $x=4$."},
 {"t":"Équations","q":r"Un nombre $\times4$ puis $+6$ donne $30$. Ce nombre :","o":[r"$6$",r"$9$",r"$24$",r"$8$"],"c":0,"e":r"$4x+6=30$ ; $4x=24$ ; $x=6$."},
 # Pythagore
 {"t":"Pythagore","q":r"$ABC$ rectangle en $A$, $AB=3$, $AC=4$. $BC=$ ?","o":[r"$5$",r"$7$",r"$25$",r"$1$"],"c":0,"e":r"$BC^2=9+16=25$ donc $BC=5$."},
 {"t":"Pythagore","q":r"$RST$ rectangle en $R$, $ST=13$ (hyp.), $RS=5$. $RT=$ ?","o":[r"$12$",r"$18$",r"$8$",r"$144$"],"c":0,"e":r"$RT^2=169-25=144$ donc $RT=12$."},
 {"t":"Pythagore","q":r"Un triangle a pour côtés $6$, $8$, $10$. Est-il rectangle ?","o":[r"Oui",r"Non"],"c":0,"e":r"$6^2+8^2=100=10^2$ : par la réciproque, il est rectangle."},
 {"t":"Pythagore","q":r"La réciproque de Pythagore sert surtout à :","o":[r"prouver un angle droit",r"calculer une aire",r"tracer un cercle",r"mesurer un angle"],"c":0,"e":r"Si l'égalité est vraie, le triangle est rectangle."},
 # Proportions & %
 {"t":"Proportions & %","q":r"$25\%$ de $80$ :","o":[r"$20$",r"$25$",r"$55$",r"$16$"],"c":0,"e":r"$80\times\frac{25}{100}=20$."},
 {"t":"Proportions & %","q":r"$4$ croissants coûtent $4,40$ €. $7$ croissants ?","o":[r"$7,70$ €",r"$8,80$ €",r"$7$ €",r"$11$ €"],"c":0,"e":r"$1$ croissant $=1,10$ € ; $7\times1,10=7,70$ €."},
 {"t":"Proportions & %","q":r"Un article à $40$ € augmente de $10\%$. Nouveau prix ?","o":[r"$44$ €",r"$50$ €",r"$36$ €",r"$41$ €"],"c":0,"e":r"$40\times1,10=44$ €."},
 {"t":"Proportions & %","q":r"$50$ € : $+20\%$ puis $-20\%$. Prix final ?","o":[r"$48$ €",r"$50$ €",r"$52$ €",r"$40$ €"],"c":0,"e":r"$\times1,2\times0,8=0,96$ : $50\times0,96=48$ €."},
 # Quadrilatères
 {"t":"Quadrilatères","q":r"Parallélogramme à diagonales perpendiculaires :","o":[r"losange",r"rectangle",r"trapèze",r"cerf-volant"],"c":0,"e":r"Diagonales perpendiculaires → losange."},
 {"t":"Quadrilatères","q":r"Parallélogramme à diagonales de même longueur :","o":[r"rectangle",r"losange",r"carré",r"trapèze"],"c":0,"e":r"Diagonales de même longueur → rectangle."},
 {"t":"Quadrilatères","q":r"Un carré est :","o":[r"rectangle ET losange",r"seulement un losange",r"seulement un rectangle",r"un trapèze"],"c":0,"e":r"Le carré cumule les deux propriétés."},
 {"t":"Quadrilatères","q":r"Parallélogramme $ABCD$ avec $\widehat{DAB}=70°$. $\widehat{ABC}=$ ?","o":[r"$110°$",r"$70°$",r"$90°$",r"$140°$"],"c":0,"e":r"Angles consécutifs supplémentaires : $180-70=110°$."},
 # Statistiques
 {"t":"Statistiques","q":r"Moyenne de $12 ; 15 ; 9 ; 14 ; 10$ :","o":[r"$12$",r"$60$",r"$14$",r"$11$"],"c":0,"e":r"$\frac{60}{5}=12$."},
 {"t":"Statistiques","q":r"Étendue de $18 ; 22 ; 15 ; 25 ; 19 ; 21$ :","o":[r"$10$",r"$25$",r"$15$",r"$7$"],"c":0,"e":r"$25-15=10$."},
 {"t":"Statistiques","q":r"Sur $25$ élèves, $10$ viennent à pied. Fréquence ?","o":[r"$40\%$",r"$25\%$",r"$10\%$",r"$35\%$"],"c":0,"e":r"$\frac{10}{25}=0,4=40\%$."},
 {"t":"Statistiques","q":r"Moyenne pondérée : $0(\times5),1(\times10),2(\times7),3(\times3)$ :","o":[r"$1,32$",r"$1,5$",r"$2$",r"$33$"],"c":0,"e":r"$\frac{0+10+14+9}{25}=\frac{33}{25}=1,32$."},
]
THEMES = ["Relatifs","Fractions","Puissances","Calcul littéral","Équations",
          "Pythagore","Proportions & %","Quadrilatères","Statistiques"]
EMOJI = {"Relatifs":"🔢","Fractions":"🍰","Puissances":"⚡","Calcul littéral":"✏️",
         "Équations":"⚖️","Pythagore":"📐","Proportions & %":"📊","Quadrilatères":"🔷","Statistiques":"📈"}

# ============================ CSS COMMUN (maths + palette) ============================
SHARED_CSS = """
:root{--lilas:#ECE6F6;--rose:#F6E9EE;--sauge:#E6F0E8;--beige:#FBF6EF;--plum:#6A4C9C;
  --rosefonce:#C77B9E;--sauge2:#5C9A7B;--ink:#3b3346;--line:#e3d9ef;}
*{box-sizing:border-box;}
body{margin:0;font-family:"Nunito",ui-rounded,"Segoe UI",system-ui,sans-serif;color:var(--ink);
  background:linear-gradient(135deg,var(--lilas),var(--rose) 60%,var(--beige));min-height:100vh;}
.bubbly{font-family:"Baloo 2",ui-rounded,system-ui,sans-serif;}
@font-face{font-family:"MathVar";src:url(/*MATHVARFONT*/) format("truetype");font-display:swap;}
.math em{font-family:"MathVar",serif;font-style:normal;}
.math .frac{display:inline-block;vertical-align:middle;text-align:center;margin:0 .12em;font-size:.9em;}
.math .fnum{display:block;border-bottom:1.4px solid currentColor;padding:0 .3em;line-height:1.2;}
.math .fden{display:block;padding:0 .3em;line-height:1.2;}
.math .sqrtarg{border-top:1.4px solid currentColor;padding:0 .15em;}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;}}
"""

MATH_JS = r"""
function mathify(s){let c=[];
 s=s.replace(/\\[a-zA-Z]+/g,m=>{c.push(m);return '\u0000'+(c.length-1)+'\u0000';});
 s=s.replace(/[A-Za-z]+/g,m=>'<em>'+m+'</em>');
 s=s.replace(/\u0000(\d+)\u0000/g,(_,i)=>c[+i]);
 const r={'\\times':'×','\\div':'÷','\\cdot':'·','\\pm':'±','\\leq':'≤','\\le':'≤','\\geq':'≥','\\ge':'≥','\\neq':'≠','\\ne':'≠','\\approx':'≈','\\pi':'π','\\ldots':'…','\\dots':'…','\\,':'\u2009','\\%':'%','\\widehat':''};
 for(const k in r) s=s.split(k).join(r[k]);
 s=s.replace(/\\sqrt\{([^{}]*)\}/g,'√<span class="sqrtarg">$1</span>');
 for(let k=0;k<4;k++){let t=s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'<span class="frac"><span class="fnum">$1</span><span class="fden">$2</span></span>'); if(t===s)break; s=t;}
 s=s.replace(/\^\{([^{}]*)\}/g,'<sup>$1</sup>').replace(/\^(<em>\w<\/em>|\w)/g,'<sup>$1</sup>');
 s=s.replace(/_\{([^{}]*)\}/g,'<sub>$1</sub>').replace(/_(<em>\w<\/em>|\w)/g,'<sub>$1</sub>');
 return '<span class="math">'+s+'</span>';}
function tex(t){return (t||'').replace(/\$(.+?)\$/g,(_,e)=>mathify(e));}
"""

# ============================ QCM ============================
QCM_TMPL = r"""<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>QCM Maths 4ᵉ · Mme Le Guern</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>
/*SHARED*/
.wrap{max-width:720px;margin:0 auto;padding:22px 16px 60px;}
header{text-align:center;margin:10px 0 18px;}
.mascot{width:120px;height:auto;filter:drop-shadow(0 6px 14px rgba(150,110,90,.25));}
h1{font-size:30px;color:var(--plum);margin:6px 0 2px;}
.sub{color:var(--rosefonce);font-weight:700;}
.card{background:rgba(255,255,255,.72);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.6);
  border-radius:22px;padding:22px;box-shadow:0 12px 40px rgba(130,100,160,.16);}
.themes{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:14px 0;}
.chip{border:2px solid var(--line);background:#fff;border-radius:999px;padding:9px 15px;cursor:pointer;
  font:inherit;font-weight:700;color:var(--ink);transition:transform .12s,border-color .12s;}
.chip:hover{transform:translateY(-2px);} .chip.on{border-color:var(--plum);background:var(--lilas);color:var(--plum);}
.btn{border:0;border-radius:14px;background:var(--plum);color:#fff;font:inherit;font-weight:700;
  padding:12px 22px;cursor:pointer;transition:filter .12s,transform .12s;}
.btn:hover{filter:brightness(1.05);transform:translateY(-1px);} .btn.sec{background:var(--sauge2);}
.btn.ghost{background:#fff;color:var(--plum);border:2px solid var(--line);}
.bar{height:10px;border-radius:999px;background:var(--lilas);overflow:hidden;margin:4px 0 16px;}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--rosefonce),var(--plum));width:0;transition:width .3s;}
.qmeta{display:flex;justify-content:space-between;align-items:center;color:#8a7ea0;font-weight:700;font-size:14px;margin-bottom:6px;}
.qtheme{background:var(--sauge);color:var(--sauge2);border-radius:999px;padding:3px 12px;}
.q{font-size:20px;margin:8px 0 16px;line-height:1.5;}
.opts{display:grid;gap:10px;}
.opt{text-align:left;border:2px solid var(--line);background:#fff;border-radius:14px;padding:13px 16px;
  cursor:pointer;font:inherit;font-size:17px;transition:border-color .12s,background .12s,transform .1s;}
.opt:hover:not(:disabled){border-color:var(--plum);transform:translateX(2px);}
.opt.good{border-color:var(--sauge2);background:#e9f6ee;} .opt.bad{border-color:#d98aa6;background:#fbe9f0;}
.opt:disabled{cursor:default;}
.fb{margin:14px 0 4px;padding:12px 14px;border-radius:14px;font-weight:600;display:none;}
.fb.show{display:block;} .fb.ok{background:#e9f6ee;color:#2f7d57;} .fb.no{background:#fbe9f0;color:#b3527a;}
.row{display:flex;gap:10px;justify-content:flex-end;margin-top:14px;}
.bubble{display:inline-block;background:#fff;border:2px solid var(--line);border-radius:16px;padding:10px 16px;
  position:relative;font-weight:700;color:var(--plum);margin-top:10px;}
.center{text-align:center;}
.score{font-size:54px;color:var(--plum);font-weight:700;}
.hidden{display:none;}
footer{text-align:center;color:#9a8ea8;font-size:13px;margin-top:22px;}
</style></head>
<body><div class="wrap">
<header>
  <img class="mascot" src="/*PANDA*/" alt="">
  <h1 class="bubbly">QCM Maths 4ᵉ</h1>
  <div class="sub">Teste-toi, à ton rythme — par Mme Le Guern</div>
</header>

<!-- START -->
<section id="start" class="card">
  <p class="center" style="margin-top:0;font-weight:700;color:var(--plum)">Choisis un thème (ou tout mélanger) :</p>
  <div class="themes" id="themes"></div>
  <div class="center"><button class="btn" id="go">Commencer ▸</button></div>
  <p class="center" id="best" style="color:#9a8ea8;font-weight:700;margin-bottom:0"></p>
</section>

<!-- QUIZ -->
<section id="quiz" class="card hidden">
  <div class="qmeta"><span class="qtheme" id="qtheme"></span><span id="qcount"></span></div>
  <div class="bar"><i id="prog"></i></div>
  <div class="q math" id="qtext"></div>
  <div class="opts" id="opts"></div>
  <div class="fb" id="fb"></div>
  <div class="row"><button class="btn" id="next" disabled>Suivant ▸</button></div>
</section>

<!-- END -->
<section id="end" class="card center hidden">
  <img class="mascot" src="/*PANDA*/" alt="">
  <div class="score"><span id="sc"></span></div>
  <div class="bubble" id="msg"></div>
  <div class="row" style="justify-content:center;margin-top:18px">
    <button class="btn ghost" id="again">Rejouer</button>
    <button class="btn" id="home">Changer de thème</button>
  </div>
</section>

<footer>Conçu avec ❤ — Mme Le Guern · Maths &amp; NSI</footer>
</div>
<script>
/*MATHJS*/
const QUESTIONS=/*QUESTIONS*/;
const THEMES=/*THEMES*/, EMOJI=/*EMOJI*/;
let theme="*", queue=[], idx=0, score=0;

const $=id=>document.getElementById(id);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}

// thèmes
const tw=$("themes");
[["*","Tout mélanger","🎲"],...THEMES.map(t=>[t,t,EMOJI[t]])].forEach(([v,lab,em])=>{
  const b=document.createElement("button");b.className="chip"+(v==="*"?" on":"");b.dataset.v=v;
  b.innerHTML=em+" "+lab;b.onclick=()=>{document.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));b.classList.add("on");theme=v;};
  tw.appendChild(b);
});
try{const bs=localStorage.getItem("qcm_best");if(bs)$("best").textContent="🏆 Meilleur score : "+bs;}catch(e){}

$("go").onclick=()=>{
  let qs=QUESTIONS.filter(q=>theme==="*"||q.t===theme);
  queue=shuffle(qs.slice()); idx=0; score=0;
  $("start").classList.add("hidden"); $("end").classList.add("hidden"); $("quiz").classList.remove("hidden");
  showQ();
};
function showQ(){
  const q=queue[idx];
  $("qtheme").textContent=(EMOJI[q.t]||"")+" "+q.t;
  $("qcount").textContent=`Question ${idx+1} / ${queue.length} · Score ${score}`;
  $("prog").style.width=(idx/queue.length*100)+"%";
  $("qtext").innerHTML=tex(q.q);
  const ow=$("opts");ow.innerHTML="";
  const arr=shuffle(q.o.map((t,i)=>({t,ok:i===q.c})));
  arr.forEach(item=>{
    const b=document.createElement("button");b.className="opt math";b.innerHTML=tex(item.t);
    b._ok=item.ok;b.onclick=()=>answer(b);ow.appendChild(b);
  });
  const fb=$("fb");fb.className="fb";fb.innerHTML="";
  $("next").disabled=true;
  $("next").textContent=idx===queue.length-1?"Voir mon score ▸":"Suivant ▸";
}
function answer(btn){
  const q=queue[idx];const opts=[...document.querySelectorAll(".opt")];
  opts.forEach(o=>o.disabled=true);
  const fb=$("fb");
  if(btn._ok){btn.classList.add("good");score++;fb.className="fb show ok";fb.innerHTML="✓ Bravo ! "+tex(q.e);}
  else{btn.classList.add("bad");opts.find(o=>o._ok).classList.add("good");fb.className="fb show no";fb.innerHTML="✗ Pas tout à fait. "+tex(q.e);}
  $("next").disabled=false;
}
$("next").onclick=()=>{ idx++; if(idx<queue.length) showQ(); else finish(); };
function finish(){
  $("quiz").classList.add("hidden"); $("end").classList.remove("hidden");
  $("sc").textContent=score+" / "+queue.length;
  const r=score/queue.length;
  $("msg").textContent = r>=.9?"Au top ! La 3ᵉ peut trembler 🌟" : r>=.6?"Bien joué ! Revois juste les thèmes qui ont hésité." : "Pas de panique : refais quelques modules, tu vas y arriver 💪";
  try{const b=+(localStorage.getItem("qcm_best")||0);const v=score; if(v>b)localStorage.setItem("qcm_best",v);}catch(e){}
}
$("again").onclick=$("go").onclick;
$("home").onclick=()=>{ $("end").classList.add("hidden"); $("start").classList.remove("hidden");
  try{const bs=localStorage.getItem("qcm_best");if(bs)$("best").textContent="🏆 Meilleur score : "+bs;}catch(e){} };
</script></body></html>"""

# ============================ DASHBOARD ============================
DASH_TMPL = r"""<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tableau de bord · Mme Le Guern</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>
/*SHARED*/
.wrap{max-width:1040px;margin:0 auto;padding:24px 18px 70px;}
header{display:flex;align-items:center;gap:16px;margin:6px 0 8px;}
header img{width:74px;height:auto;filter:drop-shadow(0 6px 12px rgba(150,110,90,.25));}
h1{font-size:28px;color:var(--plum);margin:0;} .tag{color:var(--rosefonce);font-weight:700;}
.toolbar{display:flex;justify-content:flex-end;gap:10px;margin:8px 0 18px;}
.btn{border:0;border-radius:13px;background:var(--plum);color:#fff;font:inherit;font-weight:700;padding:10px 18px;cursor:pointer;}
.btn.ghost{background:#fff;color:var(--plum);border:2px solid var(--line);}
.sec{margin:22px 0 10px;display:flex;align-items:center;gap:10px;}
.sec h2{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#8a7ea0;margin:0;}
.sec .line{flex:1;height:2px;background:var(--line);border-radius:2px;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
.tile{position:relative;display:block;text-decoration:none;color:var(--ink);
  background:rgba(255,255,255,.72);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.6);
  border-radius:18px;padding:16px;box-shadow:0 10px 30px rgba(130,100,160,.13);
  transition:transform .14s,box-shadow .14s;}
.tile:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(130,100,160,.22);}
.tile .em{font-size:26px;} .tile .ti{font-weight:700;margin:6px 0 2px;color:var(--plum);}
.tile .ur{font-size:12px;color:#9a8ea8;word-break:break-all;}
.tile.builtin{border-left:5px solid var(--sauge2);}
.del{position:absolute;top:8px;right:10px;border:0;background:transparent;color:#c89;cursor:pointer;
  font-size:16px;display:none;} .editing .del{display:block;}
.modal{position:fixed;inset:0;background:rgba(60,50,70,.45);display:none;align-items:center;justify-content:center;padding:16px;}
.modal.show{display:flex;}
.sheet{background:#fff;border-radius:20px;padding:22px;max-width:420px;width:100%;}
.sheet h3{margin:0 0 12px;color:var(--plum);} .field{margin:10px 0;}
.field label{display:block;font-weight:700;font-size:13px;color:#665;margin-bottom:4px;}
.field input,.field select{width:100%;padding:10px;border:2px solid var(--line);border-radius:12px;font:inherit;}
footer{text-align:center;color:#9a8ea8;font-size:13px;margin-top:28px;}
</style></head>
<body><div class="wrap">
<header><img src="/*PANDA*/" alt="">
  <div><h1 class="bubbly">Tableau de bord pédagogique</h1>
  <span class="tag">Mme Le Guern · Maths &amp; NSI · 2024-2025</span></div>
</header>
<div class="toolbar">
  <button class="btn ghost" id="edit">✎ Éditer</button>
  <button class="btn" id="add">+ Ajouter</button>
</div>
<div id="board"></div>
<footer>Tes liens sont enregistrés dans ce navigateur. Bouton « Ajouter » pour de nouveaux cours/livrets.</footer>
</div>

<div class="modal" id="modal"><div class="sheet">
  <h3>Ajouter un lien</h3>
  <div class="field"><label>Titre</label><input id="f-title" placeholder="Ex. Cours — Théorème de Pythagore"></div>
  <div class="field"><label>Lien (URL)</label><input id="f-url" placeholder="https://… ou fichier.html"></div>
  <div class="field"><label>Catégorie</label><select id="f-cat"></select></div>
  <div class="field"><label>Emoji</label><input id="f-em" value="🔗" maxlength="2"></div>
  <div class="toolbar"><button class="btn ghost" id="cancel">Annuler</button><button class="btn" id="save">Enregistrer</button></div>
</div></div>

<script>
const SECTIONS=["Mes cours (HTML)","Livrets (PDF)","Outils"];
const SEED=[
 {cat:"Outils",em:"🎛️",ti:"Sélecteur de livret",ur:"SELECTEUR_annee.html",builtin:true},
 {cat:"Outils",em:"❓",ti:"QCM Maths 4ᵉ",ur:"QCM.html",builtin:true},
 {cat:"Livrets (PDF)",em:"📘",ti:"Livret P1 — 2024-2025",ur:"#",builtin:false},
 {cat:"Livrets (PDF)",em:"📗",ti:"Livret P2 — 2024-2025",ur:"#",builtin:false},
 {cat:"Livrets (PDF)",em:"📙",ti:"Livret P3 — 2024-2025",ur:"#",builtin:false},
 {cat:"Mes cours (HTML)",em:"🌐",ti:"Mon site de cours",ur:"#",builtin:false},
];
const $=id=>document.getElementById(id);
function load(){try{const d=localStorage.getItem("dash_items");if(d)return JSON.parse(d);}catch(e){} return SEED.slice();}
function persist(){try{localStorage.setItem("dash_items",JSON.stringify(items));}catch(e){}}
let items=load(), editing=false;

function render(){
  const board=$("board");board.innerHTML="";
  SECTIONS.forEach(sec=>{
    const list=items.filter(i=>i.cat===sec);
    const head=document.createElement("div");head.className="sec";
    head.innerHTML=`<h2>${sec}</h2><span class="line"></span>`;board.appendChild(head);
    const g=document.createElement("div");g.className="grid"+(editing?" editing":"");
    list.forEach((it)=>{
      const a=document.createElement("a");a.className="tile"+(it.builtin?" builtin":"");
      a.href=it.ur||"#"; if((it.ur||"").startsWith("http"))a.target="_blank";
      a.innerHTML=`<div class="em">${it.em||"🔗"}</div><div class="ti">${it.ti}</div>`+
        (it.ur&&it.ur!=="#"?`<div class="ur">${it.ur}</div>`:`<div class="ur">à compléter</div>`);
      if(!it.builtin){const d=document.createElement("button");d.className="del";d.textContent="✕";
        d.onclick=e=>{e.preventDefault();items=items.filter(x=>x!==it);persist();render();};a.appendChild(d);}
      g.appendChild(a);
    });
    board.appendChild(g);
  });
}
$("edit").onclick=()=>{editing=!editing;$("edit").textContent=editing?"✓ Terminé":"✎ Éditer";render();};
const sel=$("f-cat");SECTIONS.forEach(s=>{const o=document.createElement("option");o.value=s;o.textContent=s;sel.appendChild(o);});
$("add").onclick=()=>$("modal").classList.add("show");
$("cancel").onclick=()=>$("modal").classList.remove("show");
$("save").onclick=()=>{
  const ti=$("f-title").value.trim(); if(!ti)return;
  items.push({cat:$("f-cat").value,em:$("f-em").value||"🔗",ti,ur:$("f-url").value.trim()||"#",builtin:false});
  persist();$("f-title").value="";$("f-url").value="";$("modal").classList.remove("show");render();
};
render();
</script></body></html>"""

def build(tmpl, **repl):
    out = tmpl.replace("/*SHARED*/", SHARED_CSS).replace("/*MATHJS*/", MATH_JS).replace("/*PANDA*/", PANDA)
    out = out.replace("/*MATHVARFONT*/", MATHVAR)
    for k, v in repl.items():
        out = out.replace(k, v)
    return out

OUT = ROOT / "dist" / "apps"
OUT.mkdir(parents=True, exist_ok=True)
qcm = build(QCM_TMPL,
            **{"/*QUESTIONS*/": json.dumps(QUESTIONS, ensure_ascii=False),
               "/*THEMES*/": json.dumps(THEMES, ensure_ascii=False),
               "/*EMOJI*/": json.dumps(EMOJI, ensure_ascii=False)})
(OUT / "QCM.html").write_text(qcm, encoding="utf-8")
(OUT / "dashboard.html").write_text(build(DASH_TMPL), encoding="utf-8")
print("QCM.html", len(qcm)//1024, "Ko ·", len(QUESTIONS), "questions")
print("dashboard.html OK")
