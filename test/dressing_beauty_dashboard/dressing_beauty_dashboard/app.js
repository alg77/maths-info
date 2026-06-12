const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => `${Number(n||0).toLocaleString('fr-FR')} €`;
const today = new Date();

const modules = [
  ['dashboard','Accueil','✦','Vue générale pastel'],['dressing','Dressing','👗','Vêtements, favoris, coût par utilisation'],['colorimetrie','Colorimétrie','🎨','Palette personnelle et harmonies'],['outfits','Tenues','🪞','Générateur selon météo et événement'],['makeup','Makeup','💄','Inventaire et alertes PAO'],['skincare','Skincare','🫧','Routine matin/soir et suivi peau'],['wishlist','Wishlist','🛍️','Budget, priorités, envies'],['inspirations','Inspirations','📌','Moodboards façon Pinterest'],['stats','Statistiques','📊','Collections, usages et beauté']
];

const sample = {
  profile:{season:'Deep Winter doux', undertone:'neutre-froid', contrast:'moyen à fort', ideal:['#6b4c7d','#b98cbf','#f3e8f1','#2f5d63','#c8d8e4','#efe8dc'], avoid:['orange vif','jaune moutarde','beige trop chaud','néon'], budget:450},
  dressing:[
    {id:1,photo:'',icon:'👗',brand:'Sézane',category:'robes',color:'lilas',material:'coton brodé',season:'printemps',size:'36',date:'2026-05-31',price:125,uses:4,fav:true},
    {id:2,photo:'',icon:'👚',brand:'Louise Misha',category:'blouses',color:'rose poudré',material:'voile de coton',season:'été',size:'S',date:'2026-06-02',price:89,uses:2,fav:true},
    {id:3,photo:'',icon:'👔',brand:'Uniqlo',category:'chemises',color:'bleu grisé',material:'lin mélangé',season:'été',size:'M',date:'2025-07-12',price:39,uses:18,fav:false},
    {id:4,photo:'',icon:'🧥',brand:'Sézane',category:'vestes',color:'beige rosé',material:'tweed léger',season:'automne',size:'36',date:'2025-10-10',price:160,uses:6,fav:false},
    {id:5,photo:'',icon:'👜',brand:'Loungefly',category:'sacs',color:'violet',material:'simili cuir',season:'toutes',size:'-',date:'2026-04-18',price:79,uses:3,fav:true}
  ],
  makeup:[
    {id:11,photo:'',icon:'🌸',brand:'Erborian',type:'BB crème',shade:'Clair doré',opened:'2026-03-10',duration:12,compat:'bon',status:'en cours',price:39},
    {id:12,photo:'',icon:'✨',brand:'Dior',type:'gloss',shade:'rose doux',opened:'2025-09-01',duration:18,compat:'excellent',status:'en cours',price:42},
    {id:13,photo:'',icon:'🖤',brand:'Zao',type:'mascara',shade:'brun noir',opened:'2026-01-01',duration:6,compat:'excellent',status:'bientôt terminé',price:24}
  ],
  skincare:[
    {id:21,photo:'',icon:'🫧',brand:'Purito',type:'sérum',freq:'matin et soir',tolerance:'excellente',efficacy:'apaise les rougeurs',opened:'2026-06-01',end:'2026-09-01',routine:'matin'},
    {id:22,photo:'',icon:'☀️',brand:'Purito',type:'SPF',freq:'chaque matin',tolerance:'bonne',efficacy:'léger, pas gras',opened:'2026-05-20',end:'2026-08-20',routine:'matin'},
    {id:23,photo:'',icon:'🌙',brand:'Beauty of Joseon',type:'crème',freq:'soir',tolerance:'bonne',efficacy:'confort',opened:'2026-04-15',end:'2026-08-15',routine:'soir'}
  ],
  wishlist:[
    {id:31,photo:'',icon:'👘',name:'Top hanbok moderne',brand:'Sewing Therapy',category:'vêtements',price:65,link:'#',note:'Pour concert BTS',priority:'haute',status:'à surveiller'},
    {id:32,photo:'',icon:'💋',name:'Dior Addict gloss',brand:'Dior',category:'maquillage',price:42,link:'#',note:'Pas trop flashy',priority:'moyenne',status:'envie'},
    {id:33,photo:'',icon:'🧴',name:'Crème barrière légère',brand:'Purito',category:'skincare',price:24,link:'#',note:'Routine simple',priority:'basse',status:'envie'}
  ],
  inspirations:[
    {id:41,photo:'',icon:'🌸',title:'Hanbok pastel moderne',board:'hanbok moderne',tags:'BTS, lilas, blanc',note:'Jupe plissée blanche + nœud cerise',link:'#'},
    {id:42,photo:'',icon:'🧺',title:'Sézane effortless',board:'Sézane',tags:'broderie, chemise, jupe',note:'Waouh sans effort',link:'#'},
    {id:43,photo:'',icon:'🍵',title:'Restaurant japonais chic',board:'voyages',tags:'matcha, Tokyo, doux',note:'Inspiration sortie famille',link:'#'}
  ],
  skinLog:[{date:'2026-06-01',note:'Peau plus apaisée, routine très courte validée.',reaction:'aucune'}]
};
let state = load();
let currentEdit = null;

function load(){ const saved=localStorage.getItem('dbd-state'); return saved?JSON.parse(saved):structuredClone(sample); }
function save(){ localStorage.setItem('dbd-state',JSON.stringify(state)); render(); }
function reset(){ localStorage.removeItem('dbd-state'); state=structuredClone(sample); render(); }

function init(){
  $('#nav').innerHTML = modules.map(([id,label,icon])=>`<button class="nav-btn ${id==='dashboard'?'active':''}" data-view="${id}">${icon} ${label}</button>`).join('');
  $('#nav').onclick=e=>{ if(e.target.matches('.nav-btn')) show(e.target.dataset.view); };
  $('#resetDemo').onclick=reset;
  render();
}
function show(id){ $$('.view').forEach(v=>v.classList.toggle('active',v.id===id)); $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===id)); window.scrollTo({top:0,behavior:'smooth'}); }

function render(){ renderDashboard(); renderDressing(); renderColor(); renderOutfits(); renderMakeup(); renderSkincare(); renderWishlist(); renderInspirations(); renderStats(); }
function head(title,desc,actions=''){return `<div class="section-head"><div><h2>${title}</h2><p>${desc}</p></div><div class="actions">${actions}</div></div>`}

function renderDashboard(){
  $('#dashboard').innerHTML = head('Tableau de bord principal','Choisis un module comme dans un carnet personnel haut de gamme.') +
  `<div class="module-grid">${modules.slice(1).map(([id,label,icon,desc])=>`<article class="module-card" onclick="show('${id}')"><div class="icon">${icon}</div><h3>${label}</h3><p>${desc}</p></article>`).join('')}</div>`;
}
const dressingFields = [['brand','Marque'],['category','Catégorie','select', ['robes','blouses','chemises','t-shirts','jupes','pantalons','shorts','vestes','manteaux','chaussures','sacs','bijoux']],['color','Couleur'],['material','Matière'],['season','Saison','select',['printemps','été','automne','hiver','toutes']],['size','Taille'],['date','Date d’achat','date'],['price','Prix','number'],['uses','Nombre d’utilisations','number'],['photo','URL photo'],['icon','Icône']];
function cost(it){return it.uses>0?(it.price/it.uses).toFixed(2):it.price}
function compatColor(color=''){let c=color.toLowerCase(); if(['lilas','violet','bleu','rose poudré','bleu grisé','bordeaux','prune'].some(x=>c.includes(x))) return 'excellent'; if(['beige rosé','crème','sauge','blanc'].some(x=>c.includes(x))) return 'bon'; if(['marron','camel','orange','moutarde'].some(x=>c.includes(x))) return 'à éviter'; return 'moyen'}
function itemThumb(it){return `<div class="thumb">${it.photo?`<img src="${it.photo}" alt="">`:(it.icon||'🌸')}</div>`}
function renderDressing(){
  const cats=['','robes','blouses','chemises','t-shirts','jupes','pantalons','shorts','vestes','manteaux','chaussures','sacs','bijoux'];
  $('#dressing').innerHTML = head('Module Dressing','Ajoute, filtre et suis le coût par utilisation de tes pièces.',`<button class="primary-btn" onclick="openForm('dressing')">+ Ajouter</button>`) +
  `<div class="filters"><input id="qDress" placeholder="Recherche marque, couleur…"><select id="catDress">${cats.map(c=>`<option>${c||'Toutes catégories'}</option>`).join('')}</select><input id="seasonDress" placeholder="Saison"><input id="colorDress" placeholder="Couleur"><input id="brandDress" placeholder="Marque"></div><div id="dressStats"></div><div class="cards-grid" id="dressCards"></div>`;
  ['qDress','catDress','seasonDress','colorDress','brandDress'].forEach(id=>setTimeout(()=>{$('#'+id).oninput=filterDressing},0)); filterDressing();
}
function filterDressing(){
  const q=$('#qDress')?.value.toLowerCase()||'', cat=$('#catDress')?.value, season=$('#seasonDress')?.value.toLowerCase()||'', color=$('#colorDress')?.value.toLowerCase()||'', brand=$('#brandDress')?.value.toLowerCase()||'';
  let list=state.dressing.filter(it=>(!q||JSON.stringify(it).toLowerCase().includes(q))&&(!cat||cat==='Toutes catégories'||it.category===cat)&&(!season||it.season.toLowerCase().includes(season))&&(!color||it.color.toLowerCase().includes(color))&&(!brand||it.brand.toLowerCase().includes(brand)));
  $('#dressStats').innerHTML=`<div class="stat-grid"><div class="stat"><strong>${state.dressing.length}</strong><small>pièces</small></div><div class="stat"><strong>${state.dressing.filter(x=>x.fav).length}</strong><small>favoris</small></div><div class="stat"><strong>${state.dressing.filter(x=>!x.uses).length}</strong><small>jamais portées</small></div><div class="stat"><strong>${money(state.dressing.reduce((a,b)=>a+Number(b.price||0),0))}</strong><small>valeur dressing</small></div></div>`;
  $('#dressCards').innerHTML=list.map(it=>cardDressing(it)).join('')||`<div class="empty panel">Aucun vêtement trouvé.</div>`;
}
function cardDressing(it){return `<article class="item-card"><button class="favorite ${it.fav?'fav-on':''}" onclick="toggleFav(${it.id})">♥</button>${itemThumb(it)}<h3>${it.brand}</h3><p>${it.category} · ${it.material}</p><div class="meta"><span class="pill">${it.color}</span><span class="pill">${it.season}</span><span class="pill">${it.size}</span><span class="pill">${compatColor(it.color)}</span></div><p><b>${money(it.price)}</b> · ${it.uses} sorties · coût/utilisation : <b>${money(cost(it))}</b></p><div class="card-actions"><button class="ghost-btn tiny" onclick="openForm('dressing',${it.id})">Modifier</button><button class="ghost-btn tiny" onclick="removeItem('dressing',${it.id})">Supprimer</button></div></article>`}
function toggleFav(id){const it=state.dressing.find(x=>x.id===id); it.fav=!it.fav; save();}

function renderColor(){
  const p=state.profile;
  $('#colorimetrie').innerHTML=head('Colorimétrie personnelle','Profil, palettes, roue décorative et compatibilité automatique.')+`<div class="split"><section class="panel"><h3>Profil</h3><p><b>Saison :</b> ${p.season}</p><p><b>Sous-ton :</b> ${p.undertone}</p><p><b>Contraste :</b> ${p.contrast}</p><h3>Couleurs idéales</h3><div class="palette">${p.ideal.map(c=>`<span class="swatch" style="background:${c}"></span>`).join('')}</div><h3>À éviter</h3><p>${p.avoid.join(' · ')}</p></section><section class="panel"><div class="wheel"></div><h3>Harmonies douces</h3><p>Lilas + crème + bleu grisé · rose poudré + sauge · prune + blanc cassé + touche dorée.</p><h3>Suggestions</h3><p>Associer une pièce forte froide à des neutres doux. Éviter les tons très chauds près du visage.</p></section></div><div class="cards-grid" style="margin-top:18px">${state.dressing.map(it=>`<article class="item-card">${itemThumb(it)}<h3>${it.brand}</h3><p>${it.color}</p><span class="pill">Compatibilité : ${compatColor(it.color)}</span></article>`).join('')}</div>`
}
function renderOutfits(){
  $('#outfits').innerHTML=head('Générateur de tenues','Propose une tenue selon météo, saison, événement et palette.')+`<div class="outfit-box"><section class="panel"><label>Événement<select id="event"><option>travail</option><option>week-end</option><option>restaurant japonais</option><option>sortie Disney</option><option>concert BTS</option><option>voyage</option><option>cérémonie</option></select></label><br><label>Saison<select id="outSeason"><option>été</option><option>printemps</option><option>automne</option><option>hiver</option></select></label><br><label>Météo<select id="weather"><option>doux</option><option>pluie légère</option><option>chaud</option><option>frais</option></select></label><br><button class="primary-btn" onclick="generateOutfit()">Générer une tenue</button></section><section class="panel outfit-result" id="outfitResult"><p>Choisis une ambiance puis lance le générateur.</p></section></div>`
}
function pick(arr,fn=()=>true){let a=arr.filter(fn);return a[Math.floor(Math.random()*a.length)]||arr[0]}
function generateOutfit(){
  const event=$('#event').value, season=$('#outSeason').value;
  const main=pick(state.dressing,x=>['robes','blouses','chemises','jupes','pantalons','shorts'].includes(x.category)&&(x.season===season||x.season==='toutes'));
  const shoes=pick(state.dressing,x=>x.category==='chaussures')||{brand:'baskets crème',category:'chaussures',color:'crème',icon:'👟'};
  const bag=pick(state.dressing,x=>x.category==='sacs')||{brand:'petit sac pastel',category:'sacs',color:'lilas',icon:'👜'};
  const jewel=pick(state.dressing,x=>x.category==='bijoux')||{brand:'bijoux dorés fins',category:'bijoux',color:'doré',icon:'💫'};
  $('#outfitResult').innerHTML=`<h3>Tenue proposée · ${event}</h3><div class="timeline"><div class="step"><span>${main.icon||'👗'}</span><b>${main.brand}</b> — ${main.category} ${main.color}</div><div class="step"><span>${shoes.icon||'👟'}</span>${shoes.brand}</div><div class="step"><span>${bag.icon||'👜'}</span>${bag.brand}</div><div class="step"><span>${jewel.icon||'💫'}</span>${jewel.brand}</div><div class="step"><span>💄</span>Makeup assorti : teint léger, blush rosé, gloss doux, mascara brun-noir.</div></div>`;
}
function expiryStatus(opened,duration){const d=new Date(opened); d.setMonth(d.getMonth()+Number(duration||12)); const days=(d-today)/86400000; return days<0?'expiré':days<45?'bientôt périmé':'OK'}
function renderMakeup(){
  $('#makeup').innerHTML=head('Module Makeup','Inventaire maquillage avec compatibilité et alertes de péremption.',`<button class="primary-btn" onclick="openForm('makeup')">+ Ajouter</button>`)+`<div class="cards-grid">${state.makeup.map(it=>{let ex=expiryStatus(it.opened,it.duration);return `<article class="item-card ${ex!=='OK'?'alert':''}">${itemThumb(it)}<h3>${it.brand}</h3><p>${it.type} · ${it.shade}</p><div class="meta"><span class="pill">${it.compat}</span><span class="pill">${it.status}</span><span class="pill">${ex}</span></div><div class="card-actions"><button class="ghost-btn tiny" onclick="openForm('makeup',${it.id})">Modifier</button><button class="ghost-btn tiny" onclick="removeItem('makeup',${it.id})">Supprimer</button></div></article>`}).join('')}</div>`
}
function renderSkincare(){
  $('#skincare').innerHTML=head('Module Skincare','Routine matin/soir, tolérance, efficacité et historique.',`<button class="primary-btn" onclick="openForm('skincare')">+ Ajouter</button>`)+`<div class="split"><section class="panel"><h3>Routine matin</h3><div class="timeline">${state.skincare.filter(x=>x.routine==='matin').map((x,i)=>`<div class="step"><span>${i+1}</span>${x.type} · <b>${x.brand}</b></div>`).join('')}</div></section><section class="panel"><h3>Routine soir</h3><div class="timeline">${state.skincare.filter(x=>x.routine==='soir').map((x,i)=>`<div class="step"><span>${i+1}</span>${x.type} · <b>${x.brand}</b></div>`).join('')}</div></section></div><div class="cards-grid" style="margin-top:18px">${state.skincare.map(it=>`<article class="item-card">${itemThumb(it)}<h3>${it.brand}</h3><p>${it.type} · ${it.freq}</p><div class="meta"><span class="pill">tolérance : ${it.tolerance}</span><span class="pill">${it.routine}</span></div><p>${it.efficacy}</p><div class="card-actions"><button class="ghost-btn tiny" onclick="openForm('skincare',${it.id})">Modifier</button><button class="ghost-btn tiny" onclick="removeItem('skincare',${it.id})">Supprimer</button></div></article>`).join('')}</div><section class="panel" style="margin-top:18px"><h3>Historique peau</h3>${state.skinLog.map(l=>`<p><b>${l.date}</b> — ${l.note} Réaction : ${l.reaction}</p>`).join('')}</section>`
}
function renderWishlist(){
 const total=state.wishlist.filter(x=>x.status!=='abandonné'&&x.status!=='acheté').reduce((a,b)=>a+Number(b.price||0),0), rem=state.profile.budget-total;
 $('#wishlist').innerHTML=head('Wishlist','Vêtements, maquillage et skincare avec budget et priorités.',`<button class="primary-btn" onclick="openForm('wishlist')">+ Ajouter</button>`)+`<div class="stat-grid"><div class="stat"><strong>${money(total)}</strong><small>total wishlist active</small></div><div class="stat"><strong>${money(rem)}</strong><small>budget restant</small></div><div class="stat"><strong>${state.wishlist.filter(x=>x.priority==='haute').length}</strong><small>priorités hautes</small></div><div class="stat"><strong>${state.wishlist.filter(x=>x.status==='acheté').length}</strong><small>achetés</small></div></div><div class="cards-grid">${state.wishlist.map(it=>`<article class="item-card">${itemThumb(it)}<h3>${it.name}</h3><p>${it.brand} · ${money(it.price)}</p><div class="meta"><span class="pill">${it.category}</span><span class="pill">${it.priority}</span><span class="pill">${it.status}</span></div><p>${it.note}</p><div class="card-actions"><button class="ghost-btn tiny" onclick="openForm('wishlist',${it.id})">Modifier</button><button class="ghost-btn tiny" onclick="removeItem('wishlist',${it.id})">Supprimer</button></div></article>`).join('')}</div>`
}
function renderInspirations(){
 $('#inspirations').innerHTML=head('Inspirations','Moodboards internes façon Pinterest luxueux.',`<button class="primary-btn" onclick="openForm('inspirations')">+ Ajouter</button>`)+`<div class="cards-grid">${state.inspirations.map(it=>`<article class="item-card">${itemThumb(it)}<h3>${it.title}</h3><p>${it.note}</p><div class="meta"><span class="pill">${it.board}</span><span class="pill">${it.tags}</span></div><div class="card-actions"><button class="ghost-btn tiny" onclick="openForm('inspirations',${it.id})">Modifier</button><button class="ghost-btn tiny" onclick="removeItem('inspirations',${it.id})">Supprimer</button></div></article>`).join('')}</div>`
}
function renderStats(){
 const by=(arr,k)=>Object.entries(arr.reduce((a,b)=>(a[b[k]]=(a[b[k]]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
 const colors=by(state.dressing,'color'), cats=by(state.dressing,'category'), brands=by(state.dressing,'brand');
 const beauty=[...state.makeup];
 $('#stats').innerHTML=head('Statistiques visuelles','Une synthèse douce de ton dressing et de ta beauté.')+`<div class="split"><section class="panel"><h3>Dressing</h3>${statBars('Couleurs dominantes',colors)}${statBars('Catégories',cats)}${statBars('Marques portées',brands)}<p>Vêtements jamais portés : <b>${state.dressing.filter(x=>!x.uses).length}</b></p><p>Favoris : <b>${state.dressing.filter(x=>x.fav).length}</b></p></section><section class="panel"><h3>Beauté</h3><div class="stat-grid"><div class="stat"><strong>${money(beauty.reduce((a,b)=>a+Number(b.price||0),0))}</strong><small>valeur makeup</small></div><div class="stat"><strong>${beauty.filter(x=>x.status==='terminé').length}</strong><small>terminés</small></div><div class="stat"><strong>${beauty.filter(x=>expiryStatus(x.opened,x.duration)==='expiré').length}</strong><small>expirés</small></div><div class="stat"><strong>${beauty.filter(x=>expiryStatus(x.opened,x.duration)==='bientôt périmé').length}</strong><small>bientôt périmés</small></div></div>${statBars('Catégories utilisées',by(beauty,'type'))}</section></div>`
}
function statBars(title,data){let max=Math.max(1,...data.map(x=>x[1]));return `<h4>${title}</h4>${data.map(([k,v])=>`<p>${k} · ${v}</p><div class="bar"><i style="width:${v/max*100}%"></i></div>`).join('')}`}

const fieldMap={
 dressing:dressingFields,
 makeup:[['brand','Marque'],['type','Type','select',['fond de teint','BB crème','correcteur','poudre','blush','highlighter','mascara','rouge à lèvres','gloss','fards']],['shade','Teinte'],['opened','Date d’ouverture','date'],['duration','Durée recommandée en mois','number'],['compat','Compatibilité colorimétrique','select',['excellent','bon','moyen','à éviter']],['status','Statut','select',['neuf','en cours','bientôt terminé','terminé','expiré']],['price','Prix','number'],['photo','URL photo'],['icon','Icône']],
 skincare:[['brand','Marque'],['type','Type','select',['nettoyant','sérum','contour des yeux','crème','SPF']],['freq','Fréquence'],['tolerance','Tolérance'],['efficacy','Efficacité ressentie'],['opened','Date d’ouverture','date'],['end','Date estimée de fin','date'],['routine','Routine','select',['matin','soir']],['photo','URL photo'],['icon','Icône']],
 wishlist:[['name','Nom'],['brand','Marque'],['category','Catégorie','select',['vêtements','maquillage','skincare']],['price','Prix','number'],['link','Lien boutique'],['note','Note personnelle'],['priority','Priorité','select',['haute','moyenne','basse']],['status','Statut','select',['envie','à surveiller','acheté','abandonné']],['photo','URL photo'],['icon','Icône']],
 inspirations:[['title','Titre'],['board','Tableau','select',['mode','hanbok moderne','Sézane','Louise Misha','tenues BTS','voyages','coiffures','maquillage']],['tags','Tags'],['note','Note personnelle'],['link','Lien source'],['photo','URL image'],['icon','Icône']]
};
function openForm(type,id=null){
 currentEdit={type,id}; const item=id?state[type].find(x=>x.id===id):{};
 $('#dialogTitle').textContent=(id?'Modifier ':'Ajouter ')+type;
 $('#formFields').innerHTML=fieldMap[type].map(([key,label,t='text',opts])=>`<label class="${['photo','note','link'].includes(key)?'wide':''}">${label}${t==='select'?`<select name="${key}">${opts.map(o=>`<option ${item[key]===o?'selected':''}>${o}</option>`).join('')}</select>`: key==='note'?`<textarea name="${key}">${item[key]||''}</textarea>`:`<input name="${key}" type="${t}" value="${item[key]??''}">`}</label>`).join('');
 $('#itemDialog').showModal();
}
$('#itemForm').addEventListener('submit',e=>{
 e.preventDefault(); const fd=new FormData(e.target), obj=Object.fromEntries(fd.entries()); ['price','uses','duration'].forEach(k=>{if(k in obj)obj[k]=Number(obj[k]||0)});
 const {type,id}=currentEdit; if(id){Object.assign(state[type].find(x=>x.id===id),obj)} else {obj.id=Date.now(); if(type==='dressing') obj.fav=false; state[type].push(obj)}
 $('#itemDialog').close(); save();
});
function removeItem(type,id){ if(confirm('Supprimer cet élément ?')){ state[type]=state[type].filter(x=>x.id!==id); save(); } }
window.show=show;window.openForm=openForm;window.removeItem=removeItem;window.toggleFav=toggleFav;window.generateOutfit=generateOutfit;
init();
