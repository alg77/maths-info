
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
