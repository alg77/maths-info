const origin = { name: "Lagny-sur-Marne", lat: 48.878, lng: 2.706 };
const STORAGE_KEY = "escapades-amara-v2";
const USER_KEY = "escapades-amara-userdata-v2";

const basePlaces = [
  {id:"disneyland",name:"Disneyland Park",city:"Chessy",lat:48.8738,lng:2.7758,timeMin:18,distance:"13 km",category:"parc",emoji:"🏰",cost:"€€€",dog:"Non",desc:"Parade, château, Fantasyland et journée douce avec la petite. À réserver en août pour les bons plans.",tags:["4 ans","préado","magie","parade"],scores:{overall:9.4,kid4:5,preteen:4,photo:5,japan:1,dog:0,budget:2,fatigue:3,food:3}},
  {id:"disneyadventure",name:"Disney Adventure World / Frozen",city:"Chessy",lat:48.8664,lng:2.7792,timeMin:18,distance:"13 km",category:"parc",emoji:"❄️",cost:"€€€",dog:"Non",desc:"À garder pour une deuxième journée 1 parc : profiter vraiment de la Reine des Neiges sans courir.",tags:["wishlist","Frozen","4 ans","spectacles"],scores:{overall:9.2,kid4:5,preteen:4,photo:5,japan:1,dog:0,budget:2,fatigue:3,food:3}},
  {id:"palomano",name:"Palomano Val d'Europe",city:"Chanteloup-en-Brie",lat:48.854,lng:2.738,timeMin:12,distance:"8 km",category:"indoor",emoji:"🎠",cost:"€",dog:"Non",desc:"Plan pluie/canicule parfait pour la petite. Moins intéressant pour Iris, mais très pratique en récompense après une corvée.",tags:["indoor","pluie","canicule","0-10 ans"],scores:{overall:7.6,kid4:5,preteen:2,photo:2,japan:0,dog:0,budget:4,fatigue:1,food:2}},
  {id:"parrotworld",name:"Parrot World",city:"Crécy-la-Chapelle",lat:48.864,lng:2.929,timeMin:25,distance:"22 km",category:"zoo",emoji:"🦜",cost:"€€",dog:"Non",desc:"Très proche, immersif, coloré, facile à caser sur une demi-journée prolongée avec goûter à Crécy.",tags:["animaux","proche","photos","enfants"],scores:{overall:8.5,kid4:4,preteen:4,photo:4,japan:1,dog:0,budget:3,fatigue:2,food:2}},
  {id:"felins",name:"Parc des Félins",city:"Lumigny-Nesles-Ormeaux",lat:48.728,lng:2.951,timeMin:35,distance:"31 km",category:"zoo",emoji:"🐆",cost:"€€",dog:"Non",desc:"Grand classique animalier tout près : félins, photos, sortie nature peu stressante.",tags:["animaux","félins","photo","proche"],scores:{overall:8.8,kid4:4,preteen:4,photo:5,japan:0,dog:0,budget:3,fatigue:2,food:2}},
  {id:"singes",name:"Terre de Singes",city:"Lumigny-Nesles-Ormeaux",lat:48.728,lng:2.951,timeMin:35,distance:"31 km",category:"zoo",emoji:"🐒",cost:"€€",dog:"Non",desc:"À coupler ou non avec les félins selon l'énergie. Très sympa pour les enfants qui aiment observer les comportements.",tags:["animaux","singes","proche"],scores:{overall:8.0,kid4:4,preteen:4,photo:4,japan:0,dog:0,budget:3,fatigue:2,food:2}},
  {id:"thoiry",name:"ZooSafari de Thoiry",city:"Thoiry",lat:48.865,lng:1.793,timeMin:85,distance:"95 km",category:"zoo",emoji:"🦒",cost:"€€€",dog:"Non",desc:"Safari voiture + zoo : très familial et différent de Beauval. Plus loin, mais faisable sans nuit.",tags:["safari","animaux","voiture","journée"],scores:{overall:8.4,kid4:5,preteen:4,photo:4,japan:0,dog:0,budget:2,fatigue:3,food:2}},
  {id:"beauval",name:"ZooParc de Beauval",city:"Saint-Aignan",lat:47.247,lng:1.353,timeMin:155,distance:"225 km",category:"zoo",emoji:"🐼",cost:"€€€",dog:"Contraignant",desc:"Plan B parfait si les papiers ne sont pas prêts : tu connais, tu aimes, les filles verront du très lourd.",tags:["pandas","animaux","journée XXL","connu"],scores:{overall:9.5,kid4:5,preteen:5,photo:5,japan:1,dog:1,budget:2,fatigue:5,food:3}},
  {id:"pairidaiza",name:"Pairi Daiza",city:"Brugelette, Belgique",lat:50.587,lng:3.887,timeMin:195,distance:"250 km",category:"zoo",emoji:"🐼",cost:"€€€€",dog:"Non",desc:"La grosse expédition waouh si les CNI arrivent : zoo, jardins, décors immersifs, effet voyage garanti.",tags:["wishlist","pandas","décors","Belgique"],scores:{overall:9.8,kid4:5,preteen:5,photo:5,japan:4,dog:0,budget:1,fatigue:5,food:3}},
  {id:"mnhn",name:"MNHN + Jardin des Plantes",city:"Paris 5e",lat:48.843,lng:2.359,timeMin:55,distance:"37 km",category:"musee",emoji:"🦖",cost:"€€",dog:"Non",desc:"Dinos, sciences, animaux naturalisés puis resto japonais à Paris : combo très toi.",tags:["Paris","sciences","pluie","resto jap"],scores:{overall:9.0,kid4:4,preteen:5,photo:4,japan:2,dog:0,budget:3,fatigue:2,food:5}},
  {id:"matsuri",name:"Matsuri / sushi sur tapis roulant",city:"Paris",lat:48.871,lng:2.333,timeMin:60,distance:"39 km",category:"resto",emoji:"🍣",cost:"€€",dog:"Non",desc:"À associer à une sortie parisienne. Ludique pour les enfants, japonais, parfait pour carnet resto.",tags:["japonais","resto","insolite","enfants"],scores:{overall:8.7,kid4:4,preteen:4,photo:3,japan:5,dog:0,budget:3,fatigue:1,food:5}},
  {id:"albertkahn",name:"Musée Albert-Kahn",city:"Boulogne-Billancourt",lat:48.843,lng:2.228,timeMin:65,distance:"55 km",category:"jardin",emoji:"🌸",cost:"€€",dog:"Non",desc:"Jardins japonais, photos, ambiance calme et esthétique. Très haut dans ta wishlist logique.",tags:["japon","jardin","photo","Paris ouest"],scores:{overall:9.3,kid4:3,preteen:4,photo:5,japan:5,dog:0,budget:4,fatigue:2,food:4}},
  {id:"maulevrier",name:"Parc oriental de Maulévrier",city:"Maulévrier",lat:47.011,lng:-0.742,timeMin:230,distance:"345 km",category:"jardin",emoji:"⛩️",cost:"€€",dog:"À vérifier",desc:"Le rêve jardin japonais. Trop loin pour une simple journée raisonnable, mais à garder en mini-séjour.",tags:["japon","wishlist","photo","mini-séjour"],scores:{overall:9.8,kid4:3,preteen:5,photo:5,japan:5,dog:2,budget:3,fatigue:5,food:3}},
  {id:"favieres",name:"Jardin japonais de Favières",city:"Favières",lat:48.767,lng:2.780,timeMin:25,distance:"20 km",category:"jardin",emoji:"🎋",cost:"€",dog:"À vérifier",desc:"Petite piste japonisante très proche à explorer pour une sortie douce ou photo.",tags:["japon","proche","balade","photo"],scores:{overall:8.2,kid4:2,preteen:3,photo:4,japan:4,dog:2,budget:4,fatigue:1,food:1}},
  {id:"moret",name:"Moret-sur-Loing",city:"Seine-et-Marne",lat:48.373,lng:2.816,timeMin:65,distance:"65 km",category:"balade",emoji:"🛶",cost:"€",dog:"Oui",desc:"Bords du Loing, ruelles, glace, photos. Très bon plan avec la chienne et sans exploser le budget.",tags:["chien","balade","photo","village"],scores:{overall:9.0,kid4:3,preteen:4,photo:5,japan:1,dog:5,budget:5,fatigue:2,food:3}},
  {id:"crecy",name:"Crécy-la-Chapelle",city:"Seine-et-Marne",lat:48.858,lng:2.908,timeMin:22,distance:"20 km",category:"balade",emoji:"🌿",cost:"€",dog:"Oui",desc:"Venise briarde, balade courte et mignonne, très pratique à associer à Parrot World.",tags:["chien","proche","balade","goûter"],scores:{overall:8.4,kid4:3,preteen:3,photo:4,japan:1,dog:5,budget:5,fatigue:1,food:3}},
  {id:"provins",name:"Provins",city:"Seine-et-Marne",lat:48.560,lng:3.299,timeMin:70,distance:"80 km",category:"patrimoine",emoji:"🏰",cost:"€€",dog:"Oui dehors",desc:"Médiéval, remparts, spectacles, vrai dépaysement en journée. Déjà connu mais toujours efficace.",tags:["patrimoine","chien","spectacles","médiéval"],scores:{overall:8.8,kid4:4,preteen:4,photo:5,japan:0,dog:4,budget:3,fatigue:3,food:3}},
  {id:"fontainebleau",name:"Forêt & château de Fontainebleau",city:"Fontainebleau",lat:48.402,lng:2.699,timeMin:60,distance:"67 km",category:"chateau",emoji:"🌳",cost:"€",dog:"Oui forêt",desc:"Forêt pour la chienne, rochers pour les enfants, château si envie patrimoine. Ultra modulable.",tags:["chien","forêt","château","pique-nique"],scores:{overall:9.1,kid4:4,preteen:4,photo:5,japan:1,dog:5,budget:5,fatigue:2,food:3}},
  {id:"barbizon",name:"Barbizon",city:"Seine-et-Marne",lat:48.443,lng:2.603,timeMin:55,distance:"63 km",category:"balade",emoji:"🎨",cost:"€",dog:"Oui",desc:"Village des peintres, petite balade esthétique, galeries, forêt à côté. Parfait slow day.",tags:["chien","photo","village","forêt"],scores:{overall:8.5,kid4:2,preteen:4,photo:5,japan:1,dog:5,budget:5,fatigue:1,food:3}},
  {id:"vaux",name:"Château de Vaux-le-Vicomte",city:"Maincy",lat:48.565,lng:2.714,timeMin:45,distance:"48 km",category:"chateau",emoji:"🕯️",cost:"€€",dog:"Oui jardins",desc:"Magnifique, photogénique, familial. Les soirées aux chandelles peuvent devenir une sortie magique.",tags:["château","jardins","photo","famille"],scores:{overall:9.0,kid4:4,preteen:4,photo:5,japan:1,dog:3,budget:3,fatigue:2,food:3}},
  {id:"chantilly",name:"Château de Chantilly",city:"Chantilly",lat:49.194,lng:2.485,timeMin:70,distance:"78 km",category:"chateau",emoji:"🐎",cost:"€€€",dog:"Oui parc",desc:"Château, Grandes Écuries, crème chantilly : très belle journée patrimoine chic et photos.",tags:["château","chevaux","photo","jardins"],scores:{overall:8.8,kid4:4,preteen:4,photo:5,japan:1,dog:3,budget:2,fatigue:3,food:4}},
  {id:"pierrefonds",name:"Château de Pierrefonds",city:"Oise",lat:49.348,lng:2.980,timeMin:80,distance:"88 km",category:"chateau",emoji:"🐉",cost:"€€",dog:"Extérieur",desc:"Château de conte de fées, potentiel waouh pour les filles, très photogénique.",tags:["château","conte de fées","photo","journée"],scores:{overall:8.9,kid4:4,preteen:5,photo:5,japan:0,dog:2,budget:3,fatigue:3,food:2}},
  {id:"jumpcity",name:"Jump City",city:"à vérifier",lat:48.854,lng:2.70,timeMin:15,distance:"à compléter",category:"indoor",emoji:"🤸",cost:"€€",dog:"Non",desc:"Plan défouloir indoor pour jour de pluie ou trop-plein d'énergie. À compléter avec l'adresse exacte.",tags:["indoor","sport","pluie","défouloir"],scores:{overall:7.8,kid4:4,preteen:4,photo:2,japan:0,dog:0,budget:3,fatigue:2,food:1}},
  {id:"aquarium",name:"Aquarium de Paris",city:"Paris 16e",lat:48.862,lng:2.288,timeMin:65,distance:"51 km",category:"musee",emoji:"🐠",cost:"€€",dog:"Non",desc:"Très bon plan pluie/canicule avec la petite, à coupler avec Trocadéro ou goûter.",tags:["indoor","animaux","pluie","Paris"],scores:{overall:8.0,kid4:5,preteen:3,photo:3,japan:1,dog:0,budget:2,fatigue:2,food:3}},
  {id:"citesciences",name:"Cité des Sciences",city:"Paris 19e",lat:48.895,lng:2.388,timeMin:55,distance:"38 km",category:"musee",emoji:"🔬",cost:"€€",dog:"Non",desc:"Très compatible prof de maths/NSI + enfants. Expos, Cité des enfants, plan pluie solide.",tags:["sciences","indoor","pluie","préado"],scores:{overall:8.7,kid4:4,preteen:5,photo:3,japan:0,dog:0,budget:3,fatigue:2,food:3}}
];

const filterDefs = [
  ["all","Tout"],["wishlist","Wishlist"],["visited","Visités"],["dog","Avec chien"],["kid4","4 ans friendly"],["preteen","Préado"],["zoo","Animaux"],["jardin","Japon / jardins"],["chateau","Châteaux"],["indoor","Pluie / canicule"],["moins60","< 1h"],["moins120","< 2h"]
];
let activeFilter = "all";
let searchText = "";
let sortMode = "score";
let map, markersLayer;

function loadUser(){ try{return JSON.parse(localStorage.getItem(USER_KEY)) || {}}catch{return {}} }
function saveUser(data){ localStorage.setItem(USER_KEY, JSON.stringify(data)); }
function loadCustom(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []}catch{return []} }
function saveCustom(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function allPlaces(){ return [...basePlaces, ...loadCustom()]; }
function userFor(id){ const u=loadUser(); return u[id] || {}; }
function updateUser(id, patch){ const u=loadUser(); u[id] = {...(u[id]||{}), ...patch}; saveUser(u); render(); }
function stars(v){ const n=Math.round(v); return "★".repeat(n)+"☆".repeat(5-n); }
function mapsUrl(p){ return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin.name)}&destination=${p.lat},${p.lng}&travelmode=driving`; }
function colorFor(min){ if(min<30) return "green"; if(min<60) return "blue"; if(min<120) return "yellow"; if(min<180) return "orange"; return "red"; }
function markerIcon(p){ const c=colorFor(p.timeMin); return L.divIcon({className:`marker marker-${c}`, html:`<span>${p.emoji}</span>`, iconSize:[38,38], iconAnchor:[19,38], popupAnchor:[0,-34]}); }
function scoreOverall(p){ const u=userFor(p.id); return Number(u.overall ?? p.scores.overall); }
function isWishlist(p){ return !!userFor(p.id).wishlist || p.tags.includes("wishlist"); }
function isVisited(p){ return !!userFor(p.id).visited; }
function matchesFilter(p){
  if(activeFilter==="all") return true;
  if(activeFilter==="wishlist") return isWishlist(p);
  if(activeFilter==="visited") return isVisited(p);
  if(activeFilter==="dog") return p.scores.dog>=3;
  if(activeFilter==="kid4") return p.scores.kid4>=4;
  if(activeFilter==="preteen") return p.scores.preteen>=4;
  if(activeFilter==="moins60") return p.timeMin<=60;
  if(activeFilter==="moins120") return p.timeMin<=120;
  if(activeFilter==="jardin") return p.category==="jardin" || p.scores.japan>=4;
  return p.category===activeFilter || p.tags.includes(activeFilter);
}
function filteredPlaces(){
  let items = allPlaces().filter(p=>matchesFilter(p));
  if(searchText.trim()){
    const q=searchText.toLowerCase();
    items=items.filter(p => [p.name,p.city,p.category,p.desc,...p.tags].join(" ").toLowerCase().includes(q));
  }
  const sorters={score:(a,b)=>scoreOverall(b)-scoreOverall(a),time:(a,b)=>a.timeMin-b.timeMin,photo:(a,b)=>b.scores.photo-a.scores.photo,kid4:(a,b)=>b.scores.kid4-a.scores.kid4,preteen:(a,b)=>b.scores.preteen-a.scores.preteen};
  return items.sort(sorters[sortMode]);
}
function renderFilters(){
  const wrap=document.getElementById("filters"); wrap.innerHTML="";
  filterDefs.forEach(([id,label])=>{const b=document.createElement("button"); b.className="filter"+(id===activeFilter?" active":""); b.textContent=label; b.onclick=()=>{activeFilter=id; render();}; wrap.appendChild(b);});
}
function renderStats(){
  const places=allPlaces(), users=loadUser();
  document.getElementById("stat-total").textContent=places.length;
  document.getElementById("stat-wishlist").textContent=places.filter(isWishlist).length;
  document.getElementById("stat-visited").textContent=places.filter(isVisited).length;
  document.getElementById("stat-dog").textContent=places.filter(p=>p.scores.dog>=3).length;
}
function renderCards(){
  const cards=document.getElementById("cards"), tpl=document.getElementById("card-template"); cards.innerHTML="";
  const places=filteredPlaces(); document.getElementById("result-count").textContent = `${places.length} lieu${places.length>1?'x':''} affiché${places.length>1?'s':''}`;
  places.forEach(p=>{
    const u=userFor(p.id); const node=tpl.content.cloneNode(true); const card=node.querySelector(".card");
    node.querySelector(".emoji").textContent=p.emoji; node.querySelector(".badge").textContent=`${scoreOverall(p).toFixed(1)}/10`;
    node.querySelector("h3").textContent=p.name; node.querySelector(".place").textContent=p.city; node.querySelector(".desc").textContent=p.desc;
    const heart=node.querySelector(".heart"); heart.textContent=isWishlist(p)?"♥":"♡"; heart.classList.toggle("active",isWishlist(p)); heart.onclick=()=>updateUser(p.id,{wishlist:!isWishlist(p)});
    const tags=node.querySelector(".tags"); p.tags.forEach(t=>{const s=document.createElement("span"); s.className="tag"; s.textContent=t; tags.appendChild(s);});
    const meta=node.querySelector(".meta-grid"); const metas=[["Trajet",p.timeMin>=60?`${Math.floor(p.timeMin/60)}h${String(p.timeMin%60).padStart(2,"0")}`:`${p.timeMin} min`],["Distance",p.distance],["Budget",p.cost],["Chien",p.dog]];
    metas.forEach(([k,v])=>{const d=document.createElement("div");d.className="meta";d.innerHTML=`<small>${k}</small><strong>${v}</strong>`;meta.appendChild(d);});
    const ratings=node.querySelector(".ratings"); const ratingRows=[["4 ans",p.scores.kid4],["Préado",p.scores.preteen],["Photo",p.scores.photo],["Japon",p.scores.japan],["Chien",p.scores.dog],["Budget",p.scores.budget]];
    ratingRows.forEach(([label,val])=>{const r=document.createElement("div"); r.className="rating"; r.innerHTML=`<span>${label}</span><span class="bar"><i style="width:${val*20}%"></i></span><strong>${val}/5</strong>`; ratings.appendChild(r);});
    const visited=node.querySelector(".visited"); visited.checked=isVisited(p); visited.onchange=()=>updateUser(p.id,{visited:visited.checked});
    const comment=node.querySelector(".comment"); comment.value=u.comment||"";
    node.querySelector(".save-comment").onclick=()=>updateUser(p.id,{comment:comment.value});
    node.querySelector(".maps").href=mapsUrl(p);
    cards.appendChild(node);
  });
}
function renderMap(){
  if(!map){ map=L.map("map",{scrollWheelZoom:false}).setView([48.79,2.72],8); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(map); markersLayer=L.layerGroup().addTo(map); L.marker([origin.lat,origin.lng],{icon:L.divIcon({className:"origin-marker",html:"🏠",iconSize:[34,34],iconAnchor:[17,17]})}).addTo(map).bindPopup("<b>Départ : Lagny-sur-Marne</b>"); }
  markersLayer.clearLayers(); const places=filteredPlaces();
  places.forEach(p=>{ L.marker([p.lat,p.lng],{icon:markerIcon(p)}).addTo(markersLayer).bindPopup(`<div class="popup-title">${p.emoji} ${p.name}</div><div class="popup-meta">${p.city}<br>${p.timeMin} min · ${p.distance} · ${scoreOverall(p).toFixed(1)}/10</div><a class="popup-link" target="_blank" href="${mapsUrl(p)}">Ouvrir l'itinéraire</a>`); });
}
function render(){ renderFilters(); renderStats(); renderCards(); renderMap(); }
function setup(){
  document.querySelectorAll("[data-scroll]").forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll).scrollIntoView({behavior:"smooth"}));
  document.getElementById("search").oninput=e=>{searchText=e.target.value; render();};
  document.getElementById("sort").onchange=e=>{sortMode=e.target.value; render();};
  document.getElementById("add-form").onsubmit=e=>{e.preventDefault(); const f=new FormData(e.target); const id="custom-"+Date.now(); const place={id,name:f.get("name"),city:f.get("city"),lat:origin.lat,lng:origin.lng,timeMin:parseInt((f.get("time").match(/\d+/)||[60])[0],10),distance:f.get("distance"),category:f.get("category"),emoji:"📍",cost:"€€",dog:"À compléter",desc:"Lieu ajouté manuellement. Coordonnées à ajuster dans le fichier JS si tu veux un marqueur précis.",tags:["ajout perso"],scores:{overall:7.5,kid4:3,preteen:3,photo:3,japan:0,dog:2,budget:3,fatigue:2,food:2}}; const custom=loadCustom(); custom.push(place); saveCustom(custom); e.target.reset(); render();};
  document.getElementById("export-data").onclick=()=>{const blob=new Blob([JSON.stringify({user:loadUser(),custom:loadCustom()},null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="mes-escapades-notes.json"; a.click(); URL.revokeObjectURL(a.href);};
  document.getElementById("import-data").onchange=e=>{const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{try{const data=JSON.parse(reader.result); if(data.user) saveUser(data.user); if(data.custom) saveCustom(data.custom); render();}catch{alert("Fichier JSON invalide");}}; reader.readAsText(file);};
  document.getElementById("reset-data").onclick=()=>{if(confirm("Réinitialiser commentaires, visité et wishlist ?")){localStorage.removeItem(USER_KEY); render();}};
  render();
}
setup();
