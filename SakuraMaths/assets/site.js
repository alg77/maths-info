/* ============================================================
   SITE.JS — en-tête de navigation + pied de page communs
   Inséré sur chaque page depuis le dossier assets/.
   La page active est repérée par l'attribut data-page du <body>
   (ex : <body data-page="ressources">).
   Le bouton « Carnet » ouvre l'URL Apps Script mémorisée
   (clé localStorage 'prog.carnetUrl' — clic droit pour la changer).
   Pour ajouter un onglet : ajoute une ligne dans LINKS ci-dessous.
   ============================================================ */
(function(){
  var script=document.currentScript;
  var siteRoot=script && script.src ? new URL('../',script.src) : new URL('./',document.baseURI);
  function siteUrl(path){ return new URL(path,siteRoot).href; }

  var ZONES={
    prof:{brand:'🌸 Espace prof',home:'accueil.html',carnet:true,links:[
      ['accueil','accueil.html','Accueil'],
      ['planner','planner.html','Planner'],
      ['progressions','Progressions/progressions.html','Progressions'],
      ['ressources','Progressions/ressources.html','Ressources'],
      ['entrainement','Progressions/entrainement.html','Entraînement'],
      ['productions','Productions/productions.html','Productions'],
      ['projets','Productions/projets.html','Projets']
    ]},
    eleves:{brand:'🎒 Espace élèves & familles',home:'eleves.html',carnet:false,links:[
      ['eleves-accueil','eleves.html','Accueil'],
      ['entrainement','Progressions/entrainement.html','S’entraîner'],
      ['productions','Productions/productions.html','Productions']
    ]}
  };
  var page=(document.body.getAttribute('data-page')||'').trim();
  var dz=(document.body.getAttribute('data-zone')||'').trim();
  var zone;
  if(dz==='prof'||dz==='eleves'){ zone=dz; try{localStorage.setItem('site.zone',zone);}catch(e){} }
  else { try{zone=localStorage.getItem('site.zone');}catch(e){} if(zone!=='prof'&&zone!=='eleves') zone='eleves'; }
  var Z=ZONES[zone];

  // Une page explicitement professeur reste invisible tant que Firebase
  // n'a pas confirmé que le compte appartient à la liste des professeurs.
  if(dz==='prof'){
    document.documentElement.classList.add('auth-checking');
    var authCss=document.createElement('style');
    authCss.textContent='html.auth-checking body{visibility:hidden!important}';
    (document.head||document.documentElement).appendChild(authCss);
    import(siteUrl('auth/auth.js')).then(function(module){ module.guardProf(); })
      .catch(function(){ location.replace(siteUrl('index.html?auth=prof-required')); });
  }

  // favicon 🌸 (commun à toutes les pages)
  var head=document.head||document.getElementsByTagName('head')[0];
  function addIcon(rel,href,type){ var l=document.createElement('link'); l.rel=rel; l.href=href; if(type) l.type=type; head.appendChild(l); }
  addIcon('icon',siteUrl('favicon.svg'),'image/svg+xml');
  addIcon('apple-touch-icon',siteUrl('assets/apple-touch-icon.png'));

  var nav=document.createElement('nav');
  nav.className='site-nav';
  nav.setAttribute('aria-label','Navigation principale');

  var brand=document.createElement('a');
  brand.className='brand'; brand.href=siteUrl(Z.home); brand.textContent=Z.brand;
  nav.appendChild(brand);

  var links=document.createElement('div'); links.className='navlinks';
  Z.links.forEach(function(l){
    var a=document.createElement('a');
    a.className='navlink'+(l[0]===page?' active':'');
    a.href=siteUrl(l[1]); a.textContent=l[2];
    if(l[0]===page) a.setAttribute('aria-current','page');
    links.appendChild(a);
  });
  nav.appendChild(links);

  if(Z.carnet){
    function carnetUrl(){ try{ return localStorage.getItem('prog.carnetUrl')||''; }catch(e){ return ''; } }
    var carnet=document.createElement('button');
    carnet.type='button'; carnet.className='navbtn'; carnet.textContent='📓 Carnet';
    carnet.title='Ouvrir mon carnet (clic droit : changer l’URL)';
    carnet.addEventListener('click',function(){
      var u=carnetUrl();
      if(!u){ u=prompt('Colle l’URL de ton carnet Apps Script (souvent en /exec) :',''); if(u){ try{localStorage.setItem('prog.carnetUrl',u.trim());}catch(e){} } }
      if(u) window.open(u,'_blank');
    });
    carnet.addEventListener('contextmenu',function(e){
      e.preventDefault(); var u=prompt('Modifier l’URL du carnet :',carnetUrl());
      if(u!==null){ try{localStorage.setItem('prog.carnetUrl',u.trim());}catch(_){} }
    });
    nav.appendChild(carnet);
  }

  var swap=document.createElement('a');
  swap.className='navbtn'; swap.href=siteUrl('index.html'); swap.textContent='↩ Espace';
  swap.title='Changer d’espace'; swap.style.textDecoration='none'; nav.appendChild(swap);

  var logout=document.createElement('button');
  logout.type='button'; logout.className='navbtn'; logout.textContent='Déconnexion';
  logout.title='Se déconnecter pour utiliser un autre compte Google'; logout.hidden=true;
  nav.appendChild(logout);
  import(siteUrl('auth/auth.js')).then(function(module){
    module.observe(function(user){ logout.hidden=!user; });
    logout.addEventListener('click',async function(){
      logout.disabled=true; await module.logoutGoogle(); location.replace(siteUrl('index.html'));
    });
  });

  document.body.insertBefore(nav, document.body.firstChild);

  var footer=document.createElement('footer');
  footer.className='site-footer';
  footer.textContent='🌸 Avec passion et bienveillance ♡';
  document.body.appendChild(footer);
})();
