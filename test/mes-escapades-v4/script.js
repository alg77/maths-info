const STORAGE_KEY = "escapades-amara-custom-v3";
const USER_KEY = "escapades-amara-user-v3";
const origin = { name: "Lagny-sur-Marne", lat: 48.878, lng: 2.707 };

const themes = {
  zoo: { label: "Zoos & parcs animaliers", icon: "🐼" },
  attraction: { label: "Parcs d'attraction & loisirs", icon: "🎢" },
  indoor: { label: "Sorties indoor / pluie / canicule", icon: "☔" },
  jardin: { label: "Châteaux & jardins", icon: "🏰" },
  balade: { label: "Villages, balades & chien", icon: "🐕" },
  musee: { label: "Musées & culture", icon: "🖼️" },
  resto: { label: "Restos & pauses gourmandes", icon: "🍣" }
};
const themeOrder = ["zoo","attraction","indoor","jardin","balade","musee","resto"];

const basePlaces = [
  {id:"beauval",name:"ZooParc de Beauval",city:"Saint-Aignan",timeMin:160,distance:"205 km",category:"zoo",emoji:"🐼",cost:"€€€",dog:"Possible mais déconseillé",visitedDefault:true,desc:"Plan B parfait si les papiers d'identité ne sont pas prêts : tu connais, énorme valeur sûre animaux, pandas et photos.",tags:["animaux","pandas","grande journée","déjà visité"],scores:{overall:9.5,kid4:5,preteen:5,photo:5,japan:2,dog:1,budget:2,fatigue:5,food:3}},
  {id:"pairidaiza",name:"Pairi Daiza",city:"Brugelette, Belgique",timeMin:195,distance:"260 km",category:"zoo",emoji:"🐘",cost:"€€€€",dog:"Non",desc:"Grosse sortie exceptionnelle : zoo + jardins + décors immersifs. À faire seulement avec CNI/passeports des enfants.",tags:["animaux","pandas","waouh","jardins","wishlist"],scores:{overall:9.8,kid4:5,preteen:5,photo:5,japan:4,dog:0,budget:1,fatigue:5,food:4}},
  {id:"felins",name:"Parc des Félins",city:"Lumigny-Nesles-Ormeaux",timeMin:35,distance:"32 km",category:"zoo",emoji:"🐯",cost:"€€",dog:"Non",visitedDefault:true,desc:"Très proche, photogénique, parfait pour une journée animaux sans route interminable.",tags:["animaux","félins","proche","déjà visité"],scores:{overall:8.8,kid4:4,preteen:4,photo:5,japan:0,dog:0,budget:3,fatigue:2,food:2}},
  {id:"terresinges",name:"Terre de Singes",city:"Lumigny-Nesles-Ormeaux",timeMin:35,distance:"32 km",category:"zoo",emoji:"🐒",cost:"€€",dog:"Non",desc:"À coupler avec le Parc des Félins si vous avez l'énergie, ou à faire en petite sortie plus légère.",tags:["animaux","singes","proche"],scores:{overall:8.1,kid4:4,preteen:3,photo:3,japan:0,dog:0,budget:3,fatigue:2,food:2}},
  {id:"parrotworld",name:"Parrot World",city:"Crécy-la-Chapelle",timeMin:25,distance:"18 km",category:"zoo",emoji:"🦜",cost:"€€",dog:"Non",visitedDefault:true,desc:"Immersif, coloré, très proche. Bon compromis animaux + sortie facile avec les filles.",tags:["animaux","oiseaux","proche","déjà visité"],scores:{overall:8.6,kid4:5,preteen:4,photo:4,japan:0,dog:0,budget:3,fatigue:2,food:2}},
  {id:"thoiry",name:"ZooSafari de Thoiry",city:"Thoiry",timeMin:80,distance:"88 km",category:"zoo",emoji:"🦒",cost:"€€€",dog:"Non sur parcours à pied",desc:"Très chouette avec enfants grâce au safari en voiture. Bon plan si envie d'animaux sans aller jusqu'à Beauval.",tags:["animaux","safari","voiture"],scores:{overall:8.4,kid4:5,preteen:4,photo:4,japan:0,dog:0,budget:2,fatigue:3,food:2}},
  {id:"bioparc",name:"Bioparc de Doué-la-Fontaine",city:"Doué-en-Anjou",timeMin:210,distance:"310 km",category:"zoo",emoji:"🦏",cost:"€€€",dog:"Non sur parcours",desc:"Magnifique parc troglodyte, mais plutôt mini-séjour que journée depuis Lagny.",tags:["animaux","photo","trop loin journée"],scores:{overall:9.1,kid4:4,preteen:5,photo:5,japan:0,dog:0,budget:2,fatigue:5,food:3}},

  {id:"disneyland",name:"Disneyland Paris — Parc Disneyland",city:"Chessy",timeMin:15,distance:"10 km",category:"attraction",emoji:"🏰",cost:"€€€",dog:"Non",desc:"À faire en août en tarif bon plan : parade, Fantasyland, château, journée douce avec bébé.",tags:["parade","4 ans","proche","août"],scores:{overall:9.4,kid4:5,preteen:5,photo:5,japan:1,dog:0,budget:2,fatigue:4,food:3}},
  {id:"disneyadventure",name:"Disney Adventure World",city:"Chessy",timeMin:15,distance:"10 km",category:"attraction",emoji:"❄️",cost:"€€€",dog:"Non",desc:"À programmer une autre fois en 1 parc pour profiter de Frozen sans courir ni payer le supplément 2 parcs.",tags:["reine des neiges","proche","wishlist"],scores:{overall:9.0,kid4:5,preteen:4,photo:5,japan:1,dog:0,budget:2,fatigue:4,food:3}},
  {id:"asterix",name:"Parc Astérix",city:"Plailly",timeMin:55,distance:"67 km",category:"attraction",emoji:"🎢",cost:"€€€",dog:"Non",desc:"Plus intense que Disney, intéressant avec Iris, peut-être moins prioritaire avec la petite selon attractions.",tags:["attractions","préado","sensations"],scores:{overall:8.2,kid4:3,preteen:5,photo:3,japan:0,dog:0,budget:2,fatigue:4,food:2}},
  {id:"palomano",name:"Palomano Val d'Europe",city:"Chanteloup-en-Brie",timeMin:12,distance:"8 km",category:"indoor",emoji:"🎠",cost:"€€",dog:"Non",desc:"Joker pluie/canicule pour la petite. Moins passionnant pour Iris, mais efficace en sortie courte.",tags:["indoor","4 ans","proche","pluie"],scores:{overall:7.6,kid4:5,preteen:2,photo:3,japan:0,dog:0,budget:3,fatigue:1,food:2}},
  {id:"jumpcity",name:"Jump City",city:"secteur Marne-la-Vallée",timeMin:18,distance:"à compléter",category:"indoor",emoji:"🤸",cost:"€€",dog:"Non",visitedDefault:true,desc:"Plan défouloir indoor déjà testé : parfait pour pluie, canicule ou trop-plein d'énergie.",tags:["indoor","sport","pluie","déjà visité"],scores:{overall:7.8,kid4:4,preteen:4,photo:2,japan:0,dog:0,budget:3,fatigue:2,food:1}},
  {id:"cite-sciences",name:"Cité des Sciences",city:"Paris 19e",timeMin:55,distance:"38 km",category:"indoor",emoji:"🔬",cost:"€€",dog:"Non",desc:"Très compatible prof de maths/NSI + enfants. Plan pluie/canicule intelligent.",tags:["sciences","préado","pluie","indoor"],scores:{overall:8.7,kid4:4,preteen:5,photo:3,japan:0,dog:0,budget:3,fatigue:2,food:3}},
  {id:"aquarium",name:"Aquarium de Paris",city:"Paris 16e",timeMin:65,distance:"51 km",category:"indoor",emoji:"🐠",cost:"€€",dog:"Non",desc:"Très bon plan pluie avec la petite, à coupler avec Trocadéro ou goûter.",tags:["animaux","pluie","Paris"],scores:{overall:8.0,kid4:5,preteen:3,photo:3,japan:1,dog:0,budget:2,fatigue:2,food:3}},
  {id:"mnhn",name:"MNHN — Jardin des Plantes",city:"Paris 5e",timeMin:55,distance:"35 km",category:"musee",emoji:"🦖",cost:"€€",dog:"Non",desc:"À refaire avec déjeuner japonais sympa : galerie, animaux, sciences, puis sushi sur tapis roulant.",tags:["musée","animaux","Paris","japon resto"],scores:{overall:8.9,kid4:5,preteen:5,photo:4,japan:2,dog:0,budget:3,fatigue:3,food:5}},

  {id:"vaux",name:"Château de Vaux-le-Vicomte",city:"Maincy",timeMin:45,distance:"43 km",category:"jardin",emoji:"🏰",cost:"€€",dog:"Extérieurs selon conditions",desc:"Château + jardins magnifiques, très photo, moins écrasant que Versailles. Très bon potentiel sortie familiale.",tags:["château","jardins","photo","proche"],scores:{overall:9.0,kid4:4,preteen:4,photo:5,japan:1,dog:3,budget:3,fatigue:3,food:3}},
  {id:"chantilly",name:"Château de Chantilly",city:"Chantilly",timeMin:65,distance:"70 km",category:"jardin",emoji:"🐴",cost:"€€€",dog:"Parc selon conditions",desc:"Château, grandes écuries, jardins, chantilly : sortie très complète et photogénique.",tags:["château","jardins","chevaux","photo"],scores:{overall:8.8,kid4:4,preteen:4,photo:5,japan:1,dog:2,budget:2,fatigue:3,food:4}},
  {id:"fontainebleau-chateau",name:"Château de Fontainebleau",city:"Fontainebleau",timeMin:70,distance:"72 km",category:"jardin",emoji:"👑",cost:"€€",dog:"Jardins possibles",desc:"Château historique + jardins + forêt pas loin. À faire en version culture ou balade douce.",tags:["château","jardins","forêt"],scores:{overall:8.5,kid4:3,preteen:4,photo:4,japan:1,dog:3,budget:3,fatigue:3,food:3}},
  {id:"pierrefonds",name:"Château de Pierrefonds",city:"Pierrefonds",timeMin:85,distance:"100 km",category:"jardin",emoji:"🧚",cost:"€€",dog:"À vérifier",desc:"Le château de conte de fées par excellence. Gros potentiel waouh pour les filles.",tags:["château","conte de fées","photo"],scores:{overall:8.9,kid4:5,preteen:5,photo:5,japan:0,dog:1,budget:3,fatigue:3,food:2}},
  {id:"albert-kahn",name:"Musée Albert-Kahn",city:"Boulogne-Billancourt",timeMin:65,distance:"49 km",category:"jardin",emoji:"🎋",cost:"€",dog:"Non",desc:"Jardins japonais, photos, ambiance paisible : très très compatible avec tes goûts.",tags:["japon","jardin japonais","photo","Paris"],scores:{overall:9.3,kid4:3,preteen:4,photo:5,japan:5,dog:0,budget:4,fatigue:2,food:3}},
  {id:"maulevrier",name:"Parc oriental de Maulévrier",city:"Maulévrier",timeMin:225,distance:"350 km",category:"jardin",emoji:"🌸",cost:"€€",dog:"À vérifier",desc:"Ton rêve jardin japonais. Plutôt mini-séjour ou étape vacances qu'aller-retour raisonnable.",tags:["japon","jardin japonais","wishlist","trop loin journée"],scores:{overall:9.8,kid4:3,preteen:5,photo:5,japan:5,dog:1,budget:3,fatigue:5,food:2}},
  {id:"jardin-favieres",name:"Jardin japonais de Favières",city:"Favières",timeMin:25,distance:"20 km",category:"jardin",emoji:"🍵",cost:"€",dog:"À vérifier",desc:"Petite pépite locale à explorer pour l'ambiance japonisante sans partir loin.",tags:["japon","jardin","proche","wishlist"],scores:{overall:8.5,kid4:3,preteen:4,photo:4,japan:5,dog:1,budget:4,fatigue:1,food:1}},

  {id:"provins",name:"Provins",city:"Provins",timeMin:65,distance:"75 km",category:"balade",emoji:"🛡️",cost:"€€",dog:"Oui en extérieur",visitedDefault:true,desc:"Valeur sûre médiévale déjà visitée : remparts, spectacles, balade, carnet souvenir.",tags:["médiéval","chien","déjà visité"],scores:{overall:8.7,kid4:4,preteen:4,photo:5,japan:0,dog:4,budget:3,fatigue:3,food:3}},
  {id:"moret",name:"Moret-sur-Loing",city:"Seine-et-Marne",timeMin:65,distance:"70 km",category:"balade",emoji:"🎨",cost:"€",dog:"Oui",desc:"Bords du Loing, glace, photos, balade avec la chienne : sortie douce parfaite.",tags:["village","chien","photo","budget doux"],scores:{overall:9.0,kid4:4,preteen:4,photo:5,japan:1,dog:5,budget:5,fatigue:2,food:3}},
  {id:"crecy",name:"Crécy-la-Chapelle",city:"Seine-et-Marne",timeMin:20,distance:"16 km",category:"balade",emoji:"🌿",cost:"€",dog:"Oui",desc:"La Venise briarde : petit tour facile, proche, dog-friendly, à coupler avec goûter.",tags:["proche","chien","village","budget doux"],scores:{overall:8.4,kid4:4,preteen:3,photo:4,japan:0,dog:5,budget:5,fatigue:1,food:3}},
  {id:"fontainebleau-foret",name:"Forêt de Fontainebleau",city:"Fontainebleau",timeMin:65,distance:"70 km",category:"balade",emoji:"🌲",cost:"€",dog:"Oui, laisse selon période",desc:"Rochers, forêt, pique-nique, shiba heureuse. Attention aux règles de laisse au printemps.",tags:["forêt","chien","gratuit","photo"],scores:{overall:8.9,kid4:4,preteen:4,photo:5,japan:1,dog:5,budget:5,fatigue:3,food:1}},
  {id:"barbizon",name:"Barbizon",city:"Seine-et-Marne",timeMin:60,distance:"63 km",category:"balade",emoji:"🖌️",cost:"€",dog:"Oui",desc:"Village des peintres, galeries, balade douce, très photogénique.",tags:["village","art","chien","photo"],scores:{overall:8.3,kid4:3,preteen:4,photo:5,japan:0,dog:5,budget:4,fatigue:2,food:3}},
  {id:"samois",name:"Samois-sur-Seine",city:"Seine-et-Marne",timeMin:70,distance:"72 km",category:"balade",emoji:"🚶",cost:"€",dog:"Oui",desc:"Bords de Seine paisibles, parfait pour balade photo + chien + goûter.",tags:["rivière","chien","photo"],scores:{overall:8.0,kid4:3,preteen:3,photo:4,japan:0,dog:5,budget:5,fatigue:2,food:2}},

  {id:"matsuri",name:"Matsuri — sushi sur tapis roulant",city:"Paris",timeMin:50,distance:"variable",category:"resto",emoji:"🍣",cost:"€€",dog:"Non",desc:"À coupler avec MNHN ou sortie Paris : ludique pour les enfants, japonais pour toi.",tags:["japon","sushi","Paris","kids fun"],scores:{overall:8.8,kid4:5,preteen:5,photo:3,japan:4,dog:0,budget:3,fatigue:1,food:5}},
  {id:"bubbletea",name:"Pause bubble tea matcha",city:"Paris / Val d'Europe",timeMin:20,distance:"variable",category:"resto",emoji:"🧋",cost:"€",dog:"Selon lieu",desc:"Parce qu'une vraie journée Amara mérite presque toujours un bubble tea matcha.",tags:["japon","goûter","petit plaisir"],scores:{overall:8.6,kid4:4,preteen:5,photo:3,japan:3,dog:2,budget:4,fatigue:0,food:5}}
];

const filterDefs = [["all","Tout"],["wishlist","Wishlist"],["visited","Visités"],["dog","Avec chien"],["kid4","4 ans friendly"],["preteen","Préado"],["zoo","Animaux"],["attraction","Parcs"],["indoor","Pluie / indoor"],["jardin","Châteaux & jardins"],["balade","Balades"],["japon","Japonisant"],["moins60","< 1h"],["moins120","< 2h"]];
let activeFilter = "all", searchText = "", sortMode = "theme", selectedPlaceId = "pairidaiza";

function loadUser(){ try{return JSON.parse(localStorage.getItem(USER_KEY)) || {}}catch{return {}} }
function saveUser(data){ localStorage.setItem(USER_KEY, JSON.stringify(data)); }
function loadCustom(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []}catch{return []} }
function saveCustom(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function allPlaces(){ return [...basePlaces, ...loadCustom()]; }
function userFor(id){ return loadUser()[id] || {}; }
function updateUser(id, patch){ const u=loadUser(); u[id] = {...(u[id]||{}), ...patch}; saveUser(u); render(); }
function scoreOverall(p){ const u=userFor(p.id); return Number(u.overall ?? p.scores.overall); }
function isWishlist(p){ return !!userFor(p.id).wishlist || p.tags.includes("wishlist"); }
function isVisited(p){ const u=userFor(p.id); return typeof u.visited === "boolean" ? u.visited : !!p.visitedDefault; }
function timeLabel(min){ return min>=60 ? `${Math.floor(min/60)}h${String(min%60).padStart(2,"0")}` : `${min} min`; }
function mapsQuery(p){ return `${p.name} ${p.city}`; }
function mapsUrl(p){ return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.name)}&destination=${encodeURIComponent(mapsQuery(p))}&travelmode=driving`; }
function mapsSearchUrl(p){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(p))}`; }
function embedUrl(p){ return `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery(p))}&output=embed`; }
function matchesFilter(p){
  if(activeFilter==="all") return true;
  if(activeFilter==="wishlist") return isWishlist(p);
  if(activeFilter==="visited") return isVisited(p);
  if(activeFilter==="dog") return p.scores.dog>=3;
  if(activeFilter==="kid4") return p.scores.kid4>=4;
  if(activeFilter==="preteen") return p.scores.preteen>=4;
  if(activeFilter==="moins60") return p.timeMin<=60;
  if(activeFilter==="moins120") return p.timeMin<=120;
  if(activeFilter==="japon") return p.scores.japan>=3 || p.tags.includes("japon");
  return p.category===activeFilter || p.tags.includes(activeFilter);
}
function filteredPlaces(){
  let items = allPlaces().filter(matchesFilter);
  if(searchText.trim()){ const q=searchText.toLowerCase(); items=items.filter(p=>[p.name,p.city,p.category,p.desc,...p.tags].join(" ").toLowerCase().includes(q)); }
  const sorters={score:(a,b)=>scoreOverall(b)-scoreOverall(a),time:(a,b)=>a.timeMin-b.timeMin,photo:(a,b)=>b.scores.photo-a.scores.photo,kid4:(a,b)=>b.scores.kid4-a.scores.kid4,preteen:(a,b)=>b.scores.preteen-a.scores.preteen,theme:(a,b)=>themeOrder.indexOf(a.category)-themeOrder.indexOf(b.category)||a.timeMin-b.timeMin};
  return items.sort(sorters[sortMode]);
}
function renderFilters(){ const wrap=document.getElementById("filters"); wrap.innerHTML=""; filterDefs.forEach(([id,label])=>{const b=document.createElement("button"); b.className="filter"+(id===activeFilter?" active":""); b.textContent=label; b.onclick=()=>{activeFilter=id; render();}; wrap.appendChild(b);}); }
function renderStats(){ const places=allPlaces(); document.getElementById("stat-total").textContent=places.length; document.getElementById("stat-wishlist").textContent=places.filter(isWishlist).length; document.getElementById("stat-visited").textContent=places.filter(isVisited).length; document.getElementById("stat-dog").textContent=places.filter(p=>p.scores.dog>=3).length; }
function ratingRow(label,val){ return `<div class="rating"><span>${label}</span><span class="bar"><i style="width:${val*20}%"></i></span><strong>${val}/5</strong></div>`; }
function fillCard(node,p){
  const u=userFor(p.id);
  node.querySelector(".emoji").textContent=p.emoji; node.querySelector(".badge").textContent=`${scoreOverall(p).toFixed(1)}/10`;
  node.querySelector("h3").textContent=p.name; node.querySelector(".place").textContent=p.city; node.querySelector(".desc").textContent=p.desc;
  const heart=node.querySelector(".heart"); heart.textContent=isWishlist(p)?"♥":"♡"; heart.classList.toggle("active",isWishlist(p)); heart.onclick=()=>updateUser(p.id,{wishlist:!isWishlist(p)});
  const tags=node.querySelector(".tags"); p.tags.forEach(t=>{const s=document.createElement("span"); s.className="tag"; s.textContent=t; tags.appendChild(s);});
  const meta=node.querySelector(".meta-grid"); [["Trajet",timeLabel(p.timeMin)],["Distance",p.distance],["Budget",p.cost],["Chien",p.dog]].forEach(([k,v])=>{const d=document.createElement("div");d.className="meta";d.innerHTML=`<small>${k}</small><strong>${v}</strong>`;meta.appendChild(d);});
  node.querySelector(".ratings").innerHTML = [["4 ans",p.scores.kid4],["Préado",p.scores.preteen],["Photo",p.scores.photo],["Japon",p.scores.japan],["Chien",p.scores.dog],["Budget",p.scores.budget]].map(([l,v])=>ratingRow(l,v)).join("");
  const visited=node.querySelector(".visited"); visited.checked=isVisited(p); visited.onchange=()=>updateUser(p.id,{visited:visited.checked});
  const comment=node.querySelector(".comment"); comment.value=u.comment||"";
  node.querySelector(".save-comment").onclick=()=>updateUser(p.id,{comment:comment.value});
  node.querySelector(".maps").href=mapsUrl(p);
  node.querySelector(".show-map").onclick=()=>{selectedPlaceId=p.id; updateMap(); document.getElementById("map-section").scrollIntoView({behavior:"smooth"});};
}
function renderCards(){
  const root=document.getElementById("cards"), tpl=document.getElementById("card-template"); root.innerHTML=""; const places=filteredPlaces();
  document.getElementById("result-count").textContent=`${places.length} lieu${places.length>1?'x':''} affiché${places.length>1?'s':''}`;
  const grouped = sortMode==="theme" ? themeOrder.map(cat=>[cat,places.filter(p=>p.category===cat)]).filter(([,arr])=>arr.length) : [["resultats", places]];
  grouped.forEach(([cat,arr])=>{
    const block=document.createElement("section"); block.className="theme-block";
    const title=document.createElement("h3"); title.className="theme-title"; const t=themes[cat]||{label:"Résultats",icon:"📍"}; title.innerHTML=`<span>${t.icon}</span>${t.label}<small>${arr.length}</small>`; block.appendChild(title);
    const grid=document.createElement("div"); grid.className="cards-grid";
    arr.forEach(p=>{const node=tpl.content.cloneNode(true); fillCard(node,p); grid.appendChild(node);});
    block.appendChild(grid); root.appendChild(block);
  });
}
function renderMapList(){
  const wrap=document.getElementById("map-place-list"); wrap.innerHTML="";
  filteredPlaces().forEach(p=>{ const b=document.createElement("button"); b.className="map-place"+(p.id===selectedPlaceId?" active":""); b.textContent=`${p.emoji} ${p.name}`; b.onclick=()=>{selectedPlaceId=p.id; updateMap(); renderMapList();}; wrap.appendChild(b); });
}
function updateMap(){
  const p=allPlaces().find(x=>x.id===selectedPlaceId) || filteredPlaces()[0] || allPlaces()[0]; if(!p) return; selectedPlaceId=p.id;
  document.getElementById("google-map").src=embedUrl(p);
  document.getElementById("map-current-title").textContent=`${p.emoji} ${p.name} · ${timeLabel(p.timeMin)} depuis Lagny`;
  document.getElementById("map-directions").href=mapsUrl(p);
  document.getElementById("map-search").href=mapsSearchUrl(p);
  renderMapList();
}
function render(){ renderFilters(); renderStats(); renderCards(); updateMap(); }
function setup(){
  document.querySelectorAll("[data-scroll]").forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll).scrollIntoView({behavior:"smooth"}));
  document.getElementById("search").oninput=e=>{searchText=e.target.value; render();};
  document.getElementById("sort").onchange=e=>{sortMode=e.target.value; render();};
  document.getElementById("add-form").onsubmit=e=>{e.preventDefault(); const f=new FormData(e.target); const id="custom-"+Date.now(); const place={id,name:f.get("name"),city:f.get("city"),timeMin:parseInt((f.get("time").match(/\d+/)||[60])[0],10),distance:f.get("distance"),category:f.get("category"),emoji:"📍",cost:"€€",dog:"À compléter",desc:"Lieu ajouté manuellement. Tu peux compléter les infos dans le fichier JS si tu veux le personnaliser davantage.",tags:["ajout perso"],scores:{overall:7.5,kid4:3,preteen:3,photo:3,japan:0,dog:2,budget:3,fatigue:2,food:2}}; const custom=loadCustom(); custom.push(place); saveCustom(custom); e.target.reset(); render();};
  document.getElementById("export-data").onclick=()=>{const blob=new Blob([JSON.stringify({user:loadUser(),custom:loadCustom()},null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="mes-escapades-notes.json"; a.click(); URL.revokeObjectURL(a.href);};
  document.getElementById("import-data").onchange=e=>{const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{try{const data=JSON.parse(reader.result); if(data.user) saveUser(data.user); if(data.custom) saveCustom(data.custom); render();}catch{alert("Fichier JSON invalide");}}; reader.readAsText(file);};
  document.getElementById("reset-data").onclick=()=>{if(confirm("Réinitialiser commentaires, visité et wishlist ? Les visites précochées resteront cochées.")){localStorage.removeItem(USER_KEY); render();}};
  render();
}
setup();
