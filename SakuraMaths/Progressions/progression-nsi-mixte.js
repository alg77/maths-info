(function(){
  'use strict';
  var isTerminale=/terminale/i.test(document.title);
  var currentLevel=isTerminale?'Terminale':'Première';
  var FIELDS={bo:'objectifsBO',bac:'objectifsBacECE',pyxel:'objectifsPyxel'};
  var LABELS={bo:'🎯 Objectifs BO',bac:'🧪 Objectifs Bac / ECE',pyxel:'🎮 Objectifs Pyxel / Projet'};
  var DEFAULT_FORMAT={
    intro:'10-20 min : notion, exemple ou problème déclencheur',
    papier:'20-30 min : exercices papier, raisonnement, lecture de code',
    pratique:'40-60 min : mise en pratique Python / Pyxel / SQL / réseau',
    bilan:'5-10 min : trace écrite, test rapide, commit ou export'
  };

  function uniq(values){var seen={};return (values||[]).filter(function(v){if(seen[v])return false;seen[v]=1;return true;});}
  function copyFormat(value){return Object.assign({},DEFAULT_FORMAT,value||{});}
  function inferSupports(s){
    var values=['Papier','PC'];
    if((s.objectifsPyxel||[]).length||/pyxel|jeu|projet/i.test(s.title||'')) values.push('Projet');
    if(/eval|ece|bac/i.test(s.title||'')) values.push('Évaluation');
    return values;
  }
  function defaultsFor(code,title){
    var result={bac:[],pyxel:[]}, key=(code+' '+title).toLowerCase();
    if(isTerminale){
      result.bac=/eval|ece/i.test(key)?['ECE10','ECE11','ECE12']:['BAC10','BAC11','ECE12'];
      if(/^d1\b/i.test(code)) result.pyxel=['PYX20','PYX21','PYX22'];
      else if(/^b1\b/i.test(code)) result.pyxel=['PYX29'];
      else if(/^o1\b/i.test(code)) result.pyxel=['PYX23'];
      else if(/^p1\b/i.test(code)) result.pyxel=['PYX24','PYX25'];
      else if(/^d2\b/i.test(code)) result.pyxel=['PYX26'];
      else if(/^d3\b/i.test(code)) result.pyxel=['PYX27'];
      else if(/^l1\b/i.test(code)) result.pyxel=['PYX28'];
    }else{
      result.bac=['BAC1','BAC2'];
      if(/^p1\b/i.test(code)) result.pyxel=['PYX1','PYX2'];
      else if(/^d2\b/i.test(code)) result.pyxel=['PYX4','PYX5','PYX6'];
      else if(/^p2\b/i.test(code)) result.pyxel=['PYX1','PYX2','PYX3'];
      else if(/^l1\b/i.test(code)) result.pyxel=['PYX3','PYX7','PYX8'];
      else if(/^t1\b/i.test(code)) result.pyxel=['PYX9','PYX10'];
      else if(/^w1\b/i.test(code)) result.pyxel=['PYX11','PYX12'];
      else if(/^p3\b/i.test(code)) result.pyxel=['PYX12','PYX13'];
      if(/^p|^d2|^l/i.test(code)) result.bac.push('ECE1','ECE2');
    }
    return result;
  }
  function migrateState(st,seedDefaults){
    if(!st||!Array.isArray(st.seq)) return st;
    st.seq.forEach(function(s){
      var defaults=defaultsFor(s.code||'',s.title||'');
      s.objectifsBO=uniq((s.objectifsBO||[]).concat(s.objectifs||[],s.objTheorie||[],s.objPratique||[]));
      s.objectifsBacECE=uniq(s.objectifsBacECE||((seedDefaults!==false)?defaults.bac:[]));
      s.objectifsPyxel=uniq(s.objectifsPyxel||((seedDefaults!==false)?defaults.pyxel:[]));
      s.formatSeance=copyFormat(s.formatSeance);
      s.typeSupports=uniq(s.typeSupports||inferSupports(s));
      s.evaluationPossible=typeof s.evaluationPossible==='boolean'?s.evaluationPossible:/eval|ece|bac/i.test(s.title||'');
      delete s.objectifs; delete s.objTheorie; delete s.objPratique;
    });
    return st;
  }

  var boItems=(window.RALL||[]).map(function(o){return Object.assign({},o,{category:'bo',niveau:currentLevel,support:'Papier / PC'});});
  var bacItems=((window.REFNSIBACECE||{}).objectifs||[]).filter(function(o){return o.niveau===currentLevel;}).map(function(o){return {id:o.code,code:o.code,texte:o.texte,theme:'L',sousTheme:'Bac / ECE',category:'bac',niveau:o.niveau,support:o.support};});
  var pyxelItems=((window.REFNSIPYXEL||{}).objectifs||[]).filter(function(o){return o.niveau===currentLevel;}).map(function(o){return {id:o.code,code:o.code,texte:o.texte,theme:o.theme||'P',sousTheme:'Projet Pyxel',category:'pyxel',niveau:o.niveau,support:o.support};});
  RALL=boItems.concat(bacItems,pyxelItems);
  RBY={}; RALL.forEach(function(o){RBY[o.id]=o;});

  var originalDefaultState=defaultState;
  defaultState=function(){return migrateState(originalDefaultState(),true);};
  S=migrateState(S,true);
  var dragFromField=null;

  function fieldForId(id){var o=RBY[id];return FIELDS[o&&o.category]||'objectifsBO';}
  placedInZone=function(id){var out=[];S.seq.forEach(function(s,i){Object.keys(FIELDS).forEach(function(k){if((s[FIELDS[k]]||[]).indexOf(id)!==-1)out.push(i);});});return uniq(out);};
  allPlacedObj=function(){var set={};S.seq.forEach(function(s){Object.keys(FIELDS).forEach(function(k){(s[FIELDS[k]]||[]).forEach(function(id){set[id]=1;});});});return set;};
  objTheme=function(id){return (RBY[id]||{}).theme||'P';};
  objText=function(id){return (RBY[id]||{}).texte||id;};
  objShort=function(id){var t=objText(id);return t.length>70?t.slice(0,68)+'…':t;};
  objChipHTML=function(id,i,field){
    return '<span class="objchip" draggable="true" data-id="'+id+'" data-from="'+i+'" data-field="'+field+'" title="'+esc(objText(id))+'"><span class="oc-code" style="background:var(--'+objTheme(id)+')">'+esc(id)+'</span><span class="oc-txt">'+esc(objShort(id))+'</span><button type="button" class="oc-rm" data-id="'+id+'" data-i="'+i+'" data-field="'+field+'" title="Retirer">×</button></span>';
  };
  function zone(category,s,i){
    var field=FIELDS[category],arr=s[field]||[],body=arr.length?arr.map(function(id){return objChipHTML(id,i,field);}).join(''):'<span class="oz-empty">Glisse un objectif ici</span>';
    return '<div class="oz-wrap oz-'+category+'"><div class="oz-label">'+LABELS[category]+'</div><div class="obj-zone" data-i="'+i+'" data-category="'+category+'" data-field="'+field+'">'+body+'</div></div>';
  }
  ozoneHTML=function(s,i){return '<div class="objective-grid">'+zone('bo',s,i)+zone('bac',s,i)+zone('pyxel',s,i)+'</div><div class="mixed-session" data-session="'+i+'"><div class="oz-label">⏱️ Séance mixte</div>'+Object.keys(DEFAULT_FORMAT).map(function(k){return '<label><span>'+({intro:'Introduction',papier:'Papier',pratique:'Pratique',bilan:'Bilan'})[k]+'</span><input data-format="'+k+'" value="'+esc(s.formatSeance[k])+'"></label>';}).join('')+'<div class="support-row">'+['Papier','PC','Projet','Évaluation'].map(function(v){return '<label><input type="checkbox" data-support="'+v+'" '+(s.typeSupports.indexOf(v)!==-1?'checked':'')+'> '+v+'</label>';}).join('')+'<label><input type="checkbox" data-evaluation '+(s.evaluationPossible?'checked':'')+'> évaluation possible</label></div></div>';};
  wireObjZone=function(el,i){
    if(el.dataset.mixedWired)return;el.dataset.mixedWired='1';
    var field=el.dataset.field,category=el.dataset.category;
    el.addEventListener('dragover',function(e){var id=dragObjCode||e.dataTransfer.getData('text/plain');if(id&&fieldForId(id)===field){e.preventDefault();el.classList.add('dragover');}});
    el.addEventListener('dragleave',function(){el.classList.remove('dragover');});
    el.addEventListener('drop',function(e){e.preventDefault();el.classList.remove('dragover');var id=dragObjCode||e.dataTransfer.getData('text/plain');if(!id||!RBY[id]||fieldForId(id)!==field)return;if(dragFromSeq!=null&&dragFromField){var src=S.seq[dragFromSeq][dragFromField]||[],k=src.indexOf(id);if(k!==-1)src.splice(k,1);}if(S.seq[i][field].indexOf(id)===-1)S.seq[i][field].push(id);dragObjCode=null;dragFromSeq=null;dragFromField=null;armedObj=null;save();renderAll();});
    el.addEventListener('click',function(e){if(e.target.closest('.oc-rm')||!armedObj||fieldForId(armedObj)!==field)return;if(S.seq[i][field].indexOf(armedObj)===-1)S.seq[i][field].push(armedObj);armedObj=null;save();renderAll();renderBank();});
  };

  renderBankFilters=function(){
    var wrap=document.getElementById('bankFilters');wrap.innerHTML='';
    [['all','Tout'],['bo','BO'],['bac','Bac/ECE'],['pyxel','Pyxel'],['Première','Première'],['Terminale','Terminale'],['Papier','Papier'],['PC','PC'],['Projet','Projet'],['Évaluation','Évaluation']].forEach(function(t){var b=document.createElement('button');b.type='button';b.textContent=t[1];if(bankFilter===t[0])b.classList.add('active');b.addEventListener('click',function(){bankFilter=t[0];renderBank();});wrap.appendChild(b);});
  };
  renderBank=function(){
    renderBankFilters();var placed=allPlacedObj(),q=bankQuery;
    var items=RALL.filter(function(o){if(bankFilter!=='all'&&bankFilter!==o.category&&bankFilter!==o.niveau&&String(o.support||'').indexOf(bankFilter)===-1)return false;return !q||normTxt(o.code+' '+o.texte+' '+o.sousTheme+' '+o.support).indexOf(q)!==-1;});
    var list=document.getElementById('bankList');list.innerHTML='';if(!items.length){list.innerHTML='<div class="oz-empty">Aucun objectif ne correspond.</div>';return;}
    items.forEach(function(o){var where=placedInZone(o.id),div=document.createElement('div');div.className='bankobj'+(where.length?' placed':'')+(armedObj===o.id?' armed':'');div.draggable=true;div.innerHTML='<span class="bank-kind">'+({bo:'BO',bac:'ECE',pyxel:'🎮'})[o.category]+'</span><span class="bo-code" style="background:var(--'+o.theme+')">'+esc(o.code)+'</span><span class="bo-txt">'+esc(o.texte)+'</span>'+(where.length?'<span class="bo-in">placé</span>':'');div.title=(o.sousTheme||'')+' · '+(o.support||'');div.addEventListener('dragstart',function(e){dragObjCode=o.id;dragFromSeq=null;dragFromField=null;e.dataTransfer.setData('text/plain',o.id);e.dataTransfer.effectAllowed='copy';});div.addEventListener('click',function(){armedObj=armedObj===o.id?null:o.id;renderBank();});list.appendChild(div);});
  };

  var baseRenderSeq=renderSeq;
  renderSeq=function(){
    baseRenderSeq();
    document.querySelectorAll('.obj-zone').forEach(function(zone){var i=+zone.dataset.i;wireObjZone(zone,i);});
    document.querySelectorAll('.objchip').forEach(function(chip){chip.addEventListener('dragstart',function(e){dragObjCode=chip.dataset.id;dragFromSeq=+chip.dataset.from;dragFromField=chip.dataset.field;e.dataTransfer.setData('text/plain',chip.dataset.id);e.dataTransfer.effectAllowed='move';});});
    document.querySelectorAll('.mixed-session').forEach(function(box){var i=+box.dataset.session,s=S.seq[i];box.querySelectorAll('[data-format]').forEach(function(input){input.addEventListener('change',function(){s.formatSeance[input.dataset.format]=input.value;save();});});box.querySelectorAll('[data-support]').forEach(function(input){input.addEventListener('change',function(){var v=input.dataset.support,k=s.typeSupports.indexOf(v);if(input.checked&&k===-1)s.typeSupports.push(v);if(!input.checked&&k!==-1)s.typeSupports.splice(k,1);save();});});box.querySelector('[data-evaluation]').addEventListener('change',function(){s.evaluationPossible=this.checked;save();});});
  };
  var baseRenderAll=renderAll;
  renderAll=function(){S=migrateState(S,true);baseRenderAll();};

  var basePrint=renderPrintDoc;
  renderPrintDoc=function(withDetails){
    basePrint(withDetails);
    document.querySelectorAll('#printDoc .pdoc-seq').forEach(function(block,i){var s=S.seq[i];if(!s)return;var extra=document.createElement('div');extra.className='pdoc-objectives';extra.innerHTML=[['Objectifs BO',s.objectifsBO],['Objectifs Bac / ECE',s.objectifsBacECE],['Objectifs Pyxel / Projet',s.objectifsPyxel]].map(function(row){return '<div><b>'+row[0]+' :</b> '+(row[1].length?row[1].map(function(id){return esc(id+' — '+objText(id));}).join(' · '):'—')+'</div>';}).join('')+'<div><b>Modalités :</b> '+esc(s.typeSupports.join(' · '))+(s.evaluationPossible?' · évaluation possible':'')+' · '+esc(s.weeks)+' semaine(s)</div><div><b>Séance mixte :</b> '+Object.keys(s.formatSeance).map(function(k){return esc(s.formatSeance[k]);}).join(' · ')+'</div>';block.appendChild(extra);});
  };

  var style=document.createElement('style');
  style.textContent='.objective-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.objective-grid .oz-wrap{margin:0;padding:9px;border:1px solid #eee;border-left:4px solid var(--P);border-radius:12px;background:rgba(255,255,255,.65)}.objective-grid .oz-bac{border-left-color:var(--L)}.objective-grid .oz-pyxel{border-left-color:#9b7fd1}.mixed-session{margin-top:10px;padding:10px;border-radius:12px;background:#f7f4fa}.mixed-session>label{display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center;margin:5px 0;font-size:12px}.mixed-session input[type=text],.mixed-session>label input{width:100%;border:1px solid #ddd;border-radius:7px;padding:6px}.support-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:12px}.support-row input{width:auto}.bank-kind{font-size:10px;font-weight:800;color:#765b78;background:#f3eaf5;border-radius:5px;padding:2px 5px}.pdoc-objectives{font-size:11px;color:#544b55;margin:5px 0 9px;padding-left:10px;border-left:3px solid #d9b5ca}.pdoc-objectives>div{margin:3px 0}@media(max-width:850px){.objective-grid{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  save();renderAll();
})();
