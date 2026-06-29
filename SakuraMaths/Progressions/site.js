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
  /* Deux espaces. Une page « verrouillée » porte data-zone sur son <body>
     (ex : data-zone="prof") : elle force cet espace et le mémorise.
     Les pages partagées (entrainement, productions) n'ont pas de data-zone
     et suivent l'espace en cours. La page d'accueil index.html (deux portes)
     n'inclut pas ce script. */
  var ZONES={
    prof:{ brand:'🌸 Espace prof', home:'accueil.html', carnet:true, links:[
      ['accueil','accueil.html','Accueil'],
      ['progressions','progressions.html','Progressions'],
      ['ressources','ressources.html','Ressources'],
      ['entrainement','entrainement.html','Entraînement'],
      ['productions','productions.html','Productions'],
      ['projets','projets.html','Projets']
    ]},
    eleves:{ brand:'🎒 Espace élèves & familles', home:'eleves.html', carnet:false, links:[
      ['eleves-accueil','eleves.html','Accueil'],
      ['entrainement','entrainement.html','S’entraîner'],
      ['productions','productions.html','Productions']
    ]}
  };
  var page=(document.body.getAttribute('data-page')||'').trim();
  var dz=(document.body.getAttribute('data-zone')||'').trim();
  var zone;
  if(dz==='prof'||dz==='eleves'){ zone=dz; try{ localStorage.setItem('site.zone',zone); }catch(e){} }
  else { try{ zone=localStorage.getItem('site.zone'); }catch(e){} if(zone!=='prof'&&zone!=='eleves') zone='eleves'; }
  var Z=ZONES[zone];

  // favicon 🌸 (commun à toutes les pages)
  var head=document.head||document.getElementsByTagName('head')[0];
  function addIcon(rel,href,type){ var l=document.createElement('link'); l.rel=rel; l.href=href; if(type) l.type=type; head.appendChild(l); }
  addIcon('icon','favicon.svg','image/svg+xml');
  addIcon('apple-touch-icon','apple-touch-icon.png');

  // Style du menu : injecté UNIQUEMENT si la charte du site (site-commun.css)
  // n'est pas déjà chargée — ainsi les pages qui ont une autre charte
  // (ex : les progressions avec progression-commun.css) ont quand même le menu,
  // sans conflit. Le menu et le pied de page sont masqués à l'impression.
  if(!document.querySelector('link[href*="site-commun.css"]') && !document.getElementById('site-nav-css')){
    var ncss=document.createElement('style'); ncss.id='site-nav-css';
    ncss.textContent=
      '.site-nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 18px;background:linear-gradient(120deg,rgba(253,238,241,.92),rgba(238,243,251,.88));border-bottom:1px solid var(--line,rgba(255,255,255,.72));box-shadow:0 4px 18px rgba(150,110,125,.12);backdrop-filter:blur(12px)}'
     +'.site-nav .brand{font-family:Georgia,serif;font-weight:700;font-size:1.1rem;color:var(--accent-ink,#a8607c);text-decoration:none;margin-right:auto}'
     +'.site-nav .navlinks{display:flex;gap:6px;flex-wrap:wrap}'
     +'.site-nav a.navlink{color:var(--accent-ink,#a8607c);text-decoration:none;font-weight:700;font-size:.94rem;padding:7px 12px;border-radius:10px;transition:background .15s,color .15s}'
     +'.site-nav a.navlink:hover{background:rgba(255,255,255,.55)}'
     +'.site-nav a.navlink.active{background:var(--accent,#d98ba4);color:#fff}'
     +'.site-nav .navbtn{font:inherit;font-weight:800;font-size:.92rem;cursor:pointer;color:var(--accent-ink,#a8607c);background:rgba(255,255,255,.6);border:1px solid rgba(216,139,164,.45);border-radius:10px;padding:7px 12px;transition:background .15s}'
     +'.site-nav .navbtn:hover{background:#fdeef1}'
     +'.site-footer{text-align:center;color:var(--muted,#9c8d96);margin:30px auto 0;padding:24px 20px 40px;font-family:Georgia,serif}'
     +'@media(max-width:680px){.site-nav{padding:9px 12px}.site-nav .brand{width:100%;margin-bottom:4px}}'
     +'@media print{.site-nav,.site-footer{display:none!important}}';
    head.appendChild(ncss);
  }

  var nav=document.createElement('nav');
  nav.className='site-nav';
  nav.setAttribute('aria-label','Navigation principale');

  var brand=document.createElement('a');
  brand.className='brand'; brand.href=Z.home; brand.textContent=Z.brand;
  nav.appendChild(brand);

  var links=document.createElement('div'); links.className='navlinks';
  Z.links.forEach(function(l){
    var a=document.createElement('a');
    a.className='navlink'+(l[0]===page?' active':'');
    a.href=l[1]; a.textContent=l[2];
    if(l[0]===page) a.setAttribute('aria-current','page');
    links.appendChild(a);
  });
  nav.appendChild(links);

  if(Z.carnet){
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
  }

  var swap=document.createElement('a');
  swap.className='navbtn'; swap.href='index.html'; swap.textContent='↩ Espace';
  swap.title='Changer d’espace (prof / élèves & familles)';
  swap.style.textDecoration='none';
  nav.appendChild(swap);

  document.body.insertBefore(nav, document.body.firstChild);

  var footer=document.createElement('footer');
  footer.className='site-footer';
  footer.textContent='🌸 Avec passion et bienveillance ♡';
  document.body.appendChild(footer);
})();
