
var CAL = { rentree:'2026-09-01', fin:'2027-06-18',
  vac:[{nom:'Toussaint',sat:'2026-10-17',resume:'2026-11-02'},
       {nom:'Noël',sat:'2026-12-19',resume:'2027-01-04'},
       {nom:'Hiver',sat:'2027-02-06',resume:'2027-02-22'},
       {nom:'Printemps',sat:'2027-04-03',resume:'2027-04-19'}] };
var SEQ = [
  {code:'N1',theme:'N',weeks:1.5,title:'Nombres décimaux'},
  {code:'G1',theme:'G',weeks:1,title:'Symétries axiale/centrale'},
  {code:'N2',theme:'N',weeks:1.5,title:'Calcul littéral 1'},
  {code:'G2',theme:'G',weeks:1.5,title:'Cylindre, prisme, volumes'},
  {code:'N3',theme:'N',weeks:1,title:'Nombres rationnels'},
  {code:'G3',theme:'G',weeks:2,title:'Triangle, droites remarquables'},
  {code:'N4',theme:'N',weeks:1.5,title:'Nombres entiers'},
  {code:'D1',theme:'D',weeks:1.5,title:'Proportionnalité'},
  {code:'D_FCT',theme:'D',weeks:1.5,title:'Notion de fonction'},
  {code:'G4',theme:'G',weeks:1,title:'Symétrie centrale (démo)'},
  {code:'N5',theme:'N',weeks:2,title:'Relatifs & repérage'},
  {code:'G5',theme:'G',weeks:1,title:'Angles particuliers'},
  {code:'N6',theme:'N',weeks:1.5,title:'Fractions égales'},
  {code:'G6',theme:'G',weeks:1.5,title:'Angles du triangle'},
  {code:'N7',theme:'N',weeks:1,title:'Additionner les relatifs'},
  {code:'D2',theme:'D',weeks:1.5,title:'Pourcentages, échelles'},
  {code:'G7',theme:'G',weeks:1.5,title:'Parallélogramme'},
  {code:'N8',theme:'N',weeks:1.5,title:'Additionner les fractions'},
  {code:'D3',theme:'D',weeks:1.5,title:'Statistiques'},
  {code:'A1',theme:'A',weeks:1,title:'Algo & tableur'},
  {code:'N9',theme:'N',weeks:1,title:'Développer, factoriser'},
  {code:'N10',theme:'N',weeks:1,title:'Résoudre une équation'},
  {code:'D4',theme:'D',weeks:1,title:'Probabilités'}
];

function addDays(d,n){ var r=new Date(d); r.setDate(r.getDate()+n); return r; }
function parseD(s){ var p=s.split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
function isVac(d){
  return CAL.vac.some(function(v){ var a=parseD(v.sat), b=parseD(v.resume); return d>=a && d<b; });
}
function computeSeqEndDates(){
  var cur = parseD(CAL.rentree);
  var ends = {};
  SEQ.forEach(function(s){
    var weeksLeft = s.weeks;
    while(weeksLeft > 0){
      cur = addDays(cur,7);
      while(isVac(cur)){
        var v = CAL.vac.filter(function(vv){ var a=parseD(vv.sat); return cur>=a && cur<parseD(vv.resume); })[0];
        cur = parseD(v.resume);
      }
      weeksLeft -= 1;
    }
    ends[s.code] = new Date(cur);
  });
  return ends;
}
var SEQ_END = computeSeqEndDates();

function ri(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }

/* ---------- petites briques SVG réutilisables ---------- */
function svgWrap(vb, inner, w, h){ return '<svg viewBox="0 0 '+vb[0]+' '+vb[1]+'" width="'+(w||vb[0])+'" height="'+(h||vb[1])+'" style="display:block;margin:.6rem auto" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>'; }
function svgLine(x1,y1,x2,y2,opt){ opt=opt||{}; return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(opt.stroke||'#3f3540')+'" stroke-width="'+(opt.w||2)+'"'+(opt.dash?' stroke-dasharray="'+opt.dash+'"':'')+'/>'; }
function svgDot(x,y,opt){ opt=opt||{}; return '<circle cx="'+x+'" cy="'+y+'" r="'+(opt.r||4)+'" fill="'+(opt.fill||'#a8607c')+'"/>'; }
function svgText(x,y,t,opt){ opt=opt||{}; return '<text x="'+x+'" y="'+y+'" font-size="'+(opt.size||13)+'" fill="'+(opt.fill||'#3f3540')+'" text-anchor="'+(opt.anchor||'middle')+'" font-family="Atkinson Hyperlegible, sans-serif" font-weight="'+(opt.w||400)+'">'+t+'</text>'; }
function svgPoly(pts,opt){ opt=opt||{}; return '<polygon points="'+pts.map(function(p){return p[0]+','+p[1];}).join(' ')+'" fill="'+(opt.fill||'none')+'" stroke="'+(opt.stroke||'#3f3540')+'" stroke-width="'+(opt.w||2)+'"/>'; }
function svgRect(x,y,w,h,opt){ opt=opt||{}; return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(opt.fill||'#fff')+'" stroke="'+(opt.stroke||'#3f3540')+'" stroke-width="'+(opt.w||2)+'"/>'; }

function choice(arr){ return arr[ri(0,arr.length-1)]; }
function fmtNum(n){ return String(n).replace('.', ','); }

var AUTOS = [
 {code:'0✖🅰4', theme:'N', seq:'N1', label:'Produits type table (décimaux)', generate:function(){
   if(Math.random()<0.5){
     var a = ri(1,9)/10, b = ri(2,9);
     return {enonce:'Calcule : '+fmtNum(a)+' × '+b, reponse: fmtNum(Math.round(a*b*100)/100)};
   } else {
     var d = choice([10,20,30,40,50,60,70,80,90]), e = ri(1,9)/100;
     return {enonce:'Calcule : '+d+' × '+fmtNum(e), reponse: fmtNum(Math.round(d*e*1000)/1000)};
   }
 }},
 {code:'0✖🅰5', theme:'N', seq:'N1', label:'Multiplier/diviser par 10, 100, 1000', generate:function(){
   var n = ri(2,9999)/choice([1,10,100]);
   var op = choice(['× 10','× 100','× 1 000','÷ 10','÷ 100']);
   var fac = op.indexOf('×')!==-1 ? parseFloat(op.replace(/[× ]/g,'').replace('\u00a0','')) : 1/parseFloat(op.replace(/[÷ ]/g,''));
   var res = n*fac;
   return {enonce:'Calcule : '+fmtNum(n)+' '+op, reponse: fmtNum(Math.round(res*10000)/10000)};
 }},
 {code:'0➖🅰7', theme:'N', seq:'N1', label:'Additionner/soustraire des décimaux', generate:function(){
   var a = ri(10,99)/10, b = ri(10,99)/10;
   var op = choice(['+','−']);
   if(op==='−' && b>a){ var tmp=a; a=b; b=tmp; } // pas de relatifs a ce stade : a >= b
   var res = op==='+' ? a+b : a-b;
   return {enonce:'Calcule : '+fmtNum(a)+' '+op+' '+fmtNum(b), reponse: fmtNum(Math.round(res*100)/100)};
 }},
 {code:'0✖🅰2', theme:'N', seq:'N4', label:'Division euclidienne (quotient, reste)', generate:function(){
   var d = ri(2,9), q = ri(2,12), r = ri(0,d-1), n = d*q+r;
   return {enonce:'Division euclidienne de '+n+' par '+d+' : donne le quotient et le reste.', reponse:'q = '+q+' et r = '+r};
 }},
 {code:'0➗🅰13', theme:'N', seq:'N6', label:'Fractions égales (compléter)', generate:function(){
   var a = ri(1,8), b = ri(a+1,12), k = ri(2,6);
   return {enonce:'Complète : '+a+'/'+b+' = …/'+(b*k), reponse: String(a*k)};
 }},
 {code:'0➗🅰14', theme:'N', seq:'N6', label:'Comparer deux fractions', generate:function(){
   var b = choice([4,5,6,7,8,9,10]);
   var a1 = ri(1,b-1), a2 = ri(1,b-1);
   while(a2===a1) a2 = ri(1,b-1);
   var symb = a1>a2 ? '>' : '<';
   return {enonce:'Compare : '+a1+'/'+b+' et '+a2+'/'+b, reponse: a1+'/'+b+' '+symb+' '+a2+'/'+b};
 }},
 {code:'0⬆🅰20', theme:'N', seq:'N2', label:'Tables de multiplication', generate:function(){
   var a = ri(2,10), b = ri(2,10);
   return {enonce:'Calcule : '+a+' × '+b, reponse: String(a*b)};
 }},
 {code:'0🔤🅰22', theme:'N', seq:'D_FCT', label:"Suite de motifs évolutive (arithmétique)", generate:function(){
   var start = ri(1,10), step = ri(2,6);
   var terms = [start, start+step, start+2*step, start+3*step];
   return {enonce:'Cette suite continue de la même façon : '+terms.join(' ; ')+' ; … Quel est le terme suivant ?', reponse: String(start+4*step)};
 }},
 {code:'0📐🅰35', theme:'G', seq:'G6', label:'Angle droit/plat (connaissance)', generate:function(){
   var q = choice(['droit','plat']);
   return {enonce:"Quelle est la mesure d'un angle "+q+' ?', reponse: q==='droit' ? '90°' : '180°'};
 }},
 {code:'0🔺🅰39', theme:'G', seq:'G6', label:"Somme des angles d'un triangle", generate:function(){
   var a = ri(30,100), b = ri(20, Math.max(20,140-a));
   if(a+b>=170){ b = 170-a; }
   var c = 180-a-b;
   return {enonce:'Un triangle a deux angles de '+a+'° et '+b+'°. Quelle est la mesure du 3ᵉ angle ?', reponse: c+'°'};
 }},
 {code:'0🎲🅰45', theme:'D', seq:'D4', label:'« une chance sur N » ↔ fraction', generate:function(){
   var n = ri(2,10);
   if(Math.random()<0.5){
     return {enonce:'Traduis par une fraction : « une chance sur '+n+' ».', reponse:'1/'+n};
   } else {
     return {enonce:'Traduis par une phrase « une chance sur … » la probabilité 1/'+n+'.', reponse:'une chance sur '+n};
   }
 }},
 {code:'0∝🅰47', theme:'D', seq:'D1', label:"Proportionnalité (retour à l'unité)", generate:function(){
   var unite = ri(2,9), qte1 = ri(2,9), prix1 = unite*qte1, qte2 = ri(2,12);
   while(qte2===qte1){ qte2 = ri(2,12); }
   return {enonce: qte1+' '+choice(['stylos','cahiers','bonbons','billets'])+' coûtent '+prix1+' €. Combien coûtent '+qte2+' du même article (même prix unitaire) ?', reponse: (unite*qte2)+' €'};
 }},

 /* ===================== LOT GÉOMÉTRIE (15 générateurs) =====================
    Certains items du référentiel sont intrinsèquement visuels (patrons, vues
    de cubes en perspective) : adaptés ici en version texte/description la
    plus fidèle possible, mais un vrai support visuel resterait préférable. */

 {code:'0🧭🅰26', theme:'G', seq:'N5', label:"Placer un décimal sur une demi-droite graduée", generate:function(){
   var e = ri(0,9), d = ri(1,9), x = Math.round((e+d/10)*10)/10;
   var svg = svgLine(20,60,280,60,{w:2});
   for(var i=0;i<=10;i++){ var gx=20+i*26; var big=(i===0||i===10); svg+=svgLine(gx,big?48:54,gx,big?72:66,{w:big?2:1.3}); }
   svg += svgText(20,84,String(e),{w:700}); svg += svgText(280,84,String(e+1),{w:700});
   var img = svgWrap([300,95], svg, 300, 95);
   return {enonce:"Cette demi-droite graduée va de "+e+' à '+(e+1)+", divisée en 10 parties égales (dixièmes). Combien de petits traits après "+e+" faut-il compter pour placer le point d'abscisse "+fmtNum(x)+" ?"+img, reponse: d+' petit(s) trait(s) après '+e};
 }},
 {code:'0🧭🅰27', theme:'G', seq:'N5', label:"Lire un décimal sur une demi-droite graduée", generate:function(){
   var e = ri(0,9), p = ri(1,9);
   var x = Math.round((e+p/10)*10)/10;
   var svg = svgLine(20,60,280,60,{w:2});
   for(var i=0;i<=10;i++){ var gx=20+i*26; var big=(i===0||i===10); svg+=svgLine(gx,big?48:54,gx,big?72:66,{w:big?2:1.3}); }
   svg += svgText(20,84,String(e),{w:700}); svg += svgText(280,84,String(e+1),{w:700});
   var markX = 20+p*26;
   svg += svgDot(markX, 60, {fill:'#a8607c', r:5}) + svgText(markX, 38, 'A', {w:700, fill:'#a8607c'});
   var img = svgWrap([300,95], svg, 300, 95);
   return {enonce:"Cette demi-droite graduée va de "+e+' à '+(e+1)+", divisée en 10 parties égales. Quelle est l'abscisse du point A ?"+img, reponse: fmtNum(x)};
 }},
 {code:'0🧭🅰28', theme:'G', seq:'G2', label:"Vue de dessus d'un empilement de cubes", generate:function(){
   var rows = ri(2,3), cols = ri(2,3), grid=[], occupied=0;
   for(var i=0;i<rows;i++){ var row=[]; for(var j=0;j<cols;j++){ var h=ri(0,3); row.push(h); if(h>0)occupied++; } grid.push(row); }
   var s=42, svg='';
   for(var i=0;i<rows;i++){ for(var j=0;j<cols;j++){
     var h=grid[i][j];
     svg += svgRect(10+j*s,10+i*s,s,s,{fill: h>0?'#f3ecf0':'#fff', stroke:'#a8607c'});
     svg += svgText(10+j*s+s/2, 10+i*s+s/2+5, String(h), {size:16, w:700});
   }}
   var img = svgWrap([20+cols*s, 20+rows*s], svg, cols*s+20, rows*s+20);
   return {enonce:"Ce plan indique le nombre de cubes empilés à chaque emplacement. Combien d'emplacements sont occupés (= nombre de carrés vus depuis le dessus) ?"+img, reponse: String(occupied)+(occupied<=1?' emplacement':' emplacements')};
 }},
 {code:'0🧭🅰29', theme:'G', seq:'G2', label:"Dénombrer des cubes dans un empilement", generate:function(){
   var rows = ri(2,3), cols = ri(2,3), grid=[], total=0;
   for(var i=0;i<rows;i++){ var row=[]; for(var j=0;j<cols;j++){ var h=ri(0,3); row.push(h); total+=h; } grid.push(row); }
   var s=42, svg='';
   for(var i=0;i<rows;i++){ for(var j=0;j<cols;j++){
     var h=grid[i][j];
     svg += svgRect(10+j*s,10+i*s,s,s,{fill: h>0?'#f3ecf0':'#fff', stroke:'#a8607c'});
     svg += svgText(10+j*s+s/2, 10+i*s+s/2+5, String(h), {size:16, w:700});
   }}
   var img = svgWrap([20+cols*s, 20+rows*s], svg, cols*s+20, rows*s+20);
   return {enonce:"Ce plan indique le nombre de cubes empilés à chaque emplacement. Combien de cubes au total compose cet empilement ?"+img, reponse: String(total)+(total<=1?' cube':' cubes')};
 }},
 {code:'0🧭🅰30', theme:'G', seq:'G2', label:"Cube ou pavé droit en perspective cavalière", generate:function(){
   var isCube = Math.random()<0.5;
   var L = ri(3,6)*15, l, h;
   if(isCube){ l=L; h=L; } else { l=ri(3,6)*12; h=ri(3,6)*12; while(Math.abs(l-L)<8 && Math.abs(h-L)<8){ l=ri(3,6)*12; } }
   var ox=40, oy=140, dx=30, dy=-18; // decalage perspective cavaliere
   var A=[ox,oy], B=[ox+L,oy], C=[ox+L,oy-h], D=[ox,oy-h];
   var Ap=[A[0]+dx,A[1]+dy], Bp=[B[0]+dx,B[1]+dy], Cp=[C[0]+dx,C[1]+dy], Dp=[D[0]+dx,D[1]+dy];
   var svg = svgPoly([A,B,C,D],{stroke:'#3f3540',w:2});
   svg += svgLine(D[0],D[1],Dp[0],Dp[1],{w:1.6,dash:'4,3'}) + svgLine(A[0],A[1],Ap[0],Ap[1],{w:2}) + svgLine(B[0],B[1],Bp[0],Bp[1],{w:2}) + svgLine(C[0],C[1],Cp[0],Cp[1],{w:2});
   svg += svgLine(Ap[0],Ap[1],Bp[0],Bp[1],{w:2}) + svgLine(Bp[0],Bp[1],Cp[0],Cp[1],{w:2}) + svgLine(Ap[0],Ap[1],Dp[0],Dp[1],{w:1.6,dash:'4,3'}) + svgLine(Dp[0],Dp[1],Cp[0],Cp[1],{w:1.6,dash:'4,3'});
   svg += svgText((A[0]+B[0])/2, oy+18, (L/15)+' cm', {size:12});
   svg += svgText(A[0]-22, (A[1]+D[1])/2, (h/15)+' cm', {size:12});
   svg += svgText((A[0]+Ap[0])/2-4, (A[1]+Ap[1])/2+14, (l/12)+' cm', {size:12});
   var img = svgWrap([220,190], svg, 220, 190);
   return {enonce:"Voici un solide en perspective cavalière avec ses dimensions. S'agit-il d'un cube ou d'un pavé droit (non cube) ?"+img, reponse: isCube ? 'un cube' : 'un pavé droit (non cube)'};
 }},
 {code:'0🧭🅰31', theme:'G', seq:'G2', label:"Reconnaître un patron du cube", generate:function(){
   // 6 patrons valides + 4 invalides, TOUS vérifiés par simulation de pliage (aucune collision de face)
   var valides = [
     [[0,0],[0,1],[0,2],[1,1],[2,1],[3,1]],
     [[0,1],[1,1],[2,1],[3,0],[3,1],[3,2]],
     [[0,2],[1,0],[1,1],[1,2],[1,3],[2,3]],
     [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]],
     [[1,0],[0,1],[1,1],[2,1],[1,2],[1,3]],
     [[0,1],[1,1],[2,1],[2,2],[3,0],[3,1]]
   ];
   var invalides = [
     [[0,1],[0,2],[1,0],[1,1],[1,2],[1,3]],
     [[0,1],[1,1],[2,0],[2,1],[3,0],[3,1]],
     [[0,0],[0,2],[1,0],[1,1],[1,2],[2,1]],
     [[0,2],[1,2],[2,0],[2,1],[2,2],[2,3]]
   ];
   var isValide = Math.random()<0.55;
   var layout = isValide ? choice(valides) : choice(invalides);
   var s = 34, ox=20, oy=10;
   var svg = layout.map(function(p){ return svgRect(ox+p[0]*s, oy+p[1]*s, s, s, {fill:'#f3ecf0', stroke:'#a8607c'}); }).join('');
   var img = svgWrap([20+4*s+20,10+4*s+20], svg, 220, 220);
   return {enonce:'Voici un patron à 6 carrés. Se replie-t-il pour former un cube ?'+img, reponse: isValide ? 'Oui, ce patron forme un cube.' : 'Non, ce patron ne forme pas un cube (au moins deux faces se superposeraient ou il manque une face au bon endroit).'};
 }},
 {code:'0🔄🅰32', theme:'G', seq:'G1', label:"Symétrique par un axe (quadrillage)", generate:function(){
   var axeVert = Math.random()<0.5;
   var x = ri(-4,4), y = ri(-4,4), k = ri(-2,2);
   var s=28, ox=140, oy=110; // centre du repere au pixel (ox,oy) = origine (0,0)
   function px(gx){ return ox+gx*s; } function py(gy){ return oy-gy*s; }
   var svg='';
   for(var g=-5;g<=5;g++){ svg+=svgLine(px(g),py(-5),px(g),py(5),{stroke:'#e5dade',w:1}); svg+=svgLine(px(-5),py(g),px(5),py(g),{stroke:'#e5dade',w:1}); }
   svg += svgLine(px(-5),py(0),px(5),py(0),{stroke:'#8a7f8a',w:1.5}) + svgLine(px(0),py(-5),px(0),py(5),{stroke:'#8a7f8a',w:1.5});
   svg += svgDot(px(x),py(y),{fill:'#a8607c'}) + svgText(px(x)+10,py(y)-6,'A',{anchor:'start',w:700});
   if(axeVert){ svg += svgLine(px(k),py(-5),px(k),py(5),{stroke:'#7a5bc7',w:2,dash:'5,3'}); svg += svgText(px(k),py(-5)-6,'x = '+k,{fill:'#7a5bc7',w:700}); }
   else { svg += svgLine(px(-5),py(k),px(5),py(k),{stroke:'#7a5bc7',w:2,dash:'5,3'}); svg += svgText(px(5)+22,py(k)+4,'y = '+k,{fill:'#7a5bc7',w:700,anchor:'start'}); }
   var img = svgWrap([280,220], svg, 260, 200);
   if(axeVert){
     var xs = 2*k - x;
     return {enonce:"Quelles sont les coordonnées du symétrique de A par rapport à l'axe tracé ?"+img, reponse:'('+xs+' ; '+y+')'};
   } else {
     var ys = 2*k - y;
     return {enonce:"Quelles sont les coordonnées du symétrique de A par rapport à l'axe tracé ?"+img, reponse:'('+x+' ; '+ys+')'};
   }
 }},
 {code:'0🔄🅰33', theme:'G', seq:'G4', label:"Symétrique par rapport à un point", generate:function(){
   var x = ri(-4,4), y = ri(-4,4), a = ri(-3,3), b = ri(-3,3);
   var s=28, ox=140, oy=110;
   function px(gx){ return ox+gx*s; } function py(gy){ return oy-gy*s; }
   var svg='';
   for(var g=-5;g<=5;g++){ svg+=svgLine(px(g),py(-5),px(g),py(5),{stroke:'#e5dade',w:1}); svg+=svgLine(px(-5),py(g),px(5),py(g),{stroke:'#e5dade',w:1}); }
   svg += svgLine(px(-5),py(0),px(5),py(0),{stroke:'#8a7f8a',w:1.5}) + svgLine(px(0),py(-5),px(0),py(5),{stroke:'#8a7f8a',w:1.5});
   svg += svgDot(px(x),py(y),{fill:'#a8607c'}) + svgText(px(x)+10,py(y)-6,'A',{anchor:'start',w:700});
   svg += svgDot(px(a),py(b),{fill:'#7a5bc7',r:5}) + svgText(px(a)+10,py(b)-6,'O',{anchor:'start',w:700,fill:'#7a5bc7'});
   var img = svgWrap([280,220], svg, 260, 200);
   var xs = 2*a-x, ys = 2*b-y;
   return {enonce:"O est le centre de symétrie. Quelles sont les coordonnées du symétrique A' de A par rapport à O ?"+img, reponse:'('+xs+' ; '+ys+')'};
 }},
 {code:'0📐🅰34', theme:'G', seq:'G5', label:"Classer un angle (aigu, droit, obtus, plat)", generate:function(){
   var options = [ [ri(20,70),'aigu'], [90,'droit'], [ri(110,160),'obtus'], [180,'plat'] ];
   var pick = choice(options);
   var deg = pick[0], rad = deg*Math.PI/180;
   var cx=95, cy=95, r=70;
   var svg = svgLine(cx,cy,cx+r,cy,{w:2});
   var x2 = cx + r*Math.cos(-rad), y2 = cy + r*Math.sin(-rad);
   svg += svgLine(cx,cy,x2,y2,{w:2,stroke:'#a8607c'});
   var largeArc = deg>180?1:0;
   svg += '<path d="M '+(cx+22)+' '+cy+' A 22 22 0 '+largeArc+' 1 '+(cx+22*Math.cos(-rad))+' '+(cy+22*Math.sin(-rad))+'" fill="none" stroke="#7a5bc7" stroke-width="1.5"/>';
   svg += svgDot(cx,cy,{fill:'#3f3540',r:3});
   var img = svgWrap([200,140], svg, 200, 140);
   return {enonce:'Comment qualifie-t-on cet angle (aigu, droit, obtus ou plat) ?'+img, reponse: pick[1]+' ('+deg+'°)'};
 }},
 {code:'0📐🅰36', theme:'G', seq:'G5', label:"Bissectrice (définition et calcul)", generate:function(){
   var a = ri(2,89)*2; // toujours pair, pour une moitie entiere
   return {enonce:"La bissectrice d'un angle de "+a+"° partage cet angle en deux angles égaux. Quelle est la mesure de chacun d'eux ?", reponse: (a/2)+'°'};
 }},
 {code:'0📐🅰37', theme:'G', seq:'G5', label:"Angles de l'équerre", generate:function(){
   var typ = choice(['3060','4545']);
   if(typ==='3060'){
     var known = choice([['90°','60°','30°'],['90°','30°','60°']]);
     return {enonce:"Une équerre a des angles de "+known[0]+', '+known[1]+" et … ?", reponse: known[2]};
   } else {
     return {enonce:"Une équerre a des angles de 90°, 45° et … ?", reponse:'45°'};
   }
 }},
 {code:'0🔺🅰38', theme:'G', seq:'G6', label:"Nature d'un triangle à partir d'un schéma codé", generate:function(){
   var iso = Math.random()<0.5, rect = Math.random()<0.5, equi = iso && Math.random()<0.3;
   if(equi) rect = false;
   var desc = [], nature = [];
   if(equi){ desc.push('ses 3 côtés sont codés égaux'); nature.push('équilatéral'); }
   else if(iso){ desc.push('deux côtés sont codés égaux (même symbole)'); nature.push('isocèle'); }
   if(rect){ desc.push("un angle est codé droit (petit carré)"); nature.push('rectangle'); }
   if(!desc.length){ desc.push("aucun côté ni angle n'est codé particulier"); nature.push('quelconque'); }
   // sommets
   var A=[40,150], B=[190,150], C = rect ? [40,40] : (equi ? [115,35] : [90,45]);
   function mid(P,Q){ return [(P[0]+Q[0])/2,(P[1]+Q[1])/2]; }
   function tickMark(P,Q,n){ var m=mid(P,Q); var dx=Q[0]-P[0],dy=Q[1]-P[1]; var len=Math.sqrt(dx*dx+dy*dy); var nx=-dy/len,ny=dx/len; var out=''; for(var k=0;k<n;k++){ var off=(k-(n-1)/2)*5; var mx=m[0]+ (dx/len)*off, my=m[1]+(dy/len)*off; out+=svgLine(mx-nx*5,my-ny*5,mx+nx*5,my+ny*5,{w:1.6,stroke:'#a8607c'}); } return out; }
   var svg = svgPoly([A,B,C],{stroke:'#3f3540',w:2});
   svg += svgText(A[0]-14,A[1]+5,'A',{w:700}) + svgText(B[0]+14,B[1]+5,'B',{w:700}) + svgText(C[0],C[1]-10,'C',{w:700});
   if(equi){ svg += tickMark(A,B,1)+tickMark(B,C,1)+tickMark(A,C,1); }
   else if(iso){ svg += tickMark(A,C,1)+tickMark(B,C,1); }
   if(rect){ svg += svgRect(A[0],A[1]-16,16,16,{fill:'none',stroke:'#7a5bc7',w:1.6}); }
   var img = svgWrap([230,180], svg, 230, 180);
   return {enonce:'Voici un triangle codé. Quelle est sa nature la plus précise ?'+img, reponse: 'triangle '+nature.join(' et ')};
 }},
 {code:'0🔺🅰40', theme:'G', seq:'G3', label:"Médiatrice et cercle circonscrit (définitions)", generate:function(){
   var q = choice(['med','cc']);
   if(q==='med') return {enonce:"La médiatrice d'un segment [AB] est l'ensemble des points qui vérifient quelle propriété ?", reponse:'être équidistants de A et de B (à la même distance de A et de B)'};
   return {enonce:"Le centre du cercle circonscrit à un triangle est le point d'intersection de quelles droites remarquables ?", reponse:'les 3 médiatrices du triangle'};
 }},
 {code:'0🔷🅰41', theme:'G', seq:'G7', label:"Identifier un quadrilatère à partir de sa forme codée", generate:function(){
   function tick(P,Q,n){ var m=[(P[0]+Q[0])/2,(P[1]+Q[1])/2]; var dx=Q[0]-P[0],dy=Q[1]-P[1]; var len=Math.sqrt(dx*dx+dy*dy); var nx=-dy/len,ny=dx/len; var out=''; for(var k=0;k<n;k++){ var off=(k-(n-1)/2)*5; var mx=m[0]+(dx/len)*off, my=m[1]+(dy/len)*off; out+=svgLine(mx-nx*5,my-ny*5,mx+nx*5,my+ny*5,{w:1.6,stroke:'#a8607c'}); } return out; }
   function rightBox(P,dir1,dir2){ var s=14; var p1=[P[0]+dir1[0]*s,P[1]+dir1[1]*s], p2=[P[0]+dir1[0]*s+dir2[0]*s,P[1]+dir1[1]*s+dir2[1]*s], p3=[P[0]+dir2[0]*s,P[1]+dir2[1]*s]; return '<polyline points="'+p1.join(',')+' '+p2.join(',')+' '+p3.join(',')+'" fill="none" stroke="#7a5bc7" stroke-width="1.5"/>'; }
   var shapes = {
     carre: {pts:[[50,150],[170,150],[170,30],[50,30]], sides:[1,1,1,1], right:true},
     rectangle: {pts:[[30,150],[190,150],[190,50],[30,50]], sides:[0,0,0,0], right:true},
     losange: {pts:[[100,150],[170,90],[100,30],[30,90]], sides:[1,1,1,1], right:false},
     parallelogramme: {pts:[[40,150],[180,150],[150,30],[10,30]], sides:[0,0,0,0], right:false},
     trapeze: {pts:[[20,150],[190,150],[150,30],[60,30]], sides:[0,0,0,0], right:false}
   };
   var items = [
     ['carre','un carré'], ['rectangle','un rectangle'], ['losange','un losange'],
     ['parallelogramme','un parallélogramme (non particulier)'], ['trapeze','un trapèze']
   ];
   var pick = choice(items);
   var sh = shapes[pick[0]];
   var P = sh.pts;
   var svg = svgPoly(P,{stroke:'#3f3540',w:2});
   if(pick[0]==='carre' || pick[0]==='losange'){ for(var i=0;i<4;i++){ svg += tick(P[i],P[(i+1)%4],1); } }
   if(sh.right){ // boite d'angle droit sur le premier sommet
     var A=P[0], B=P[1], D=P[3];
     var d1=[(B[0]-A[0]),(B[1]-A[1])], len1=Math.sqrt(d1[0]*d1[0]+d1[1]*d1[1]); d1=[d1[0]/len1,d1[1]/len1];
     var d2=[(D[0]-A[0]),(D[1]-A[1])], len2=Math.sqrt(d2[0]*d2[0]+d2[1]*d2[1]); d2=[d2[0]/len2,d2[1]/len2];
     svg += rightBox(A,d1,d2);
   }
   var img = svgWrap([210,175], svg, 210, 175);
   return {enonce:"Voici un quadrilatère avec son codage (marques d'égalité, angle droit). Quelle est sa nature ?"+img, reponse: pick[1]};
 }},
 {code:'0🔷🅰42', theme:'G', seq:'G7', label:"Codage d'une figure : parallélogramme particulier", generate:function(){
   var right = Math.random()<0.5, equalSides = Math.random()<0.5, equalDiag = (!right) && Math.random()<0.5;
   var desc = [];
   if(right) desc.push('un angle codé droit');
   if(equalSides) desc.push('deux côtés consécutifs codés égaux');
   if(equalDiag) desc.push('les diagonales codées de même longueur');
   if(!desc.length) desc.push('aucun codage particulier autre que les côtés parallèles');
   var isRect = right || equalDiag; // angle droit OU diagonales egales caracterisent un rectangle
   var nature = 'un parallélogramme';
   if(isRect && equalSides) nature = 'un carré';
   else if(isRect) nature = 'un rectangle';
   else if(equalSides) nature = 'un losange';
   return {enonce:'Un parallélogramme porte '+desc.join(' et ')+'. Quelle est sa nature la plus précise ?', reponse: nature};
 }}
];
var AUTO_BY_CODE = {}; AUTOS.forEach(function(a){ AUTO_BY_CODE[a.code]=a; });

var manualOverride = {};

function autoUnlocked(code, todayStr){
  var today = parseD(todayStr);
  var end = SEQ_END[code];
  return end ? today >= end : false;
}
function isUnlocked(seqCode, todayStr){
  if(manualOverride.hasOwnProperty(seqCode)) return manualOverride[seqCode];
  return autoUnlocked(seqCode, todayStr);
}

window.SAKURA_AUTOS_5E = AUTOS;
