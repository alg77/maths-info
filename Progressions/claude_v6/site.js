/* ============================================================
   SITE.JS — en-tête de navigation + pied de page communs
   Inséré sur chaque page via <script src="site.js" defer></script>.
   La page active est repérée par l'attribut data-page du <body>
   (ex : <body data-page="ressources">).
   Le bouton « Carnet » ouvre l'URL Apps Script mémorisée
   (clé localStorage 'prog.carnetUrl' — clic droit pour la changer).
   Pour ajouter un onglet : ajoute une ligne dans LINKS ci-dessous.
   ============================================================ */
(function(){
  var LINKS=[
    ['accueil','index.html','Accueil'],
    ['progressions','progressions.html','Progressions'],
    ['ressources','ressources.html','Ressources'],
    ['productions','productions.html','Productions'],
    ['projets','projets.html','Projets']
  ];
  var page=(document.body.getAttribute('data-page')||'').trim();

  // favicon 🌸 (commun à toutes les pages)
  var head=document.head||document.getElementsByTagName('head')[0];
  function addIcon(rel,href,type){ var l=document.createElement('link'); l.rel=rel; l.href=href; if(type) l.type=type; head.appendChild(l); }
  addIcon('icon','favicon.svg','image/svg+xml');
  addIcon('apple-touch-icon','apple-touch-icon.png');

  var nav=document.createElement('nav');
  nav.className='site-nav';
  nav.setAttribute('aria-label','Navigation principale');

  var brand=document.createElement('a');
  brand.className='brand'; brand.href='index.html'; brand.textContent='🌸 Espace prof';
  nav.appendChild(brand);

  var links=document.createElement('div'); links.className='navlinks';
  LINKS.forEach(function(l){
    var a=document.createElement('a');
    a.className='navlink'+(l[0]===page?' active':'');
    a.href=l[1]; a.textContent=l[2];
    if(l[0]===page) a.setAttribute('aria-current','page');
    links.appendChild(a);
  });
  nav.appendChild(links);

  function carnetUrl(){ try{ return localStorage.getItem('prog.carnetUrl')||''; }catch(e){ return ''; } }
  var carnet=document.createElement('button');
  carnet.type='button'; carnet.className='navbtn';
  carnet.textContent='📓 Carnet';
  carnet.title='Ouvrir mon carnet (clic droit : changer l’URL)';
  carnet.addEventListener('click',function(){
    var u=carnetUrl();
    if(!u){ u=prompt('Colle l’URL de ton carnet Apps Script (souvent en /exec) :',''); if(u){ try{localStorage.setItem('prog.carnetUrl',u.trim());}catch(e){} } }
    if(u) window.open(u,'_blank');
  });
  carnet.addEventListener('contextmenu',function(e){
    e.preventDefault();
    var u=prompt('Modifier l’URL du carnet :', carnetUrl());
    if(u!==null){ try{ localStorage.setItem('prog.carnetUrl',u.trim()); }catch(_){ } }
  });
  nav.appendChild(carnet);

  document.body.insertBefore(nav, document.body.firstChild);

  var footer=document.createElement('footer');
  footer.className='site-footer';
  footer.textContent='🌸 Avec passion et bienveillance ♡';
  document.body.appendChild(footer);
})();
