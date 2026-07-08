(function(){
  const data=window.ORAL_NSI;
  const byId=new Map(data.exercices.map(e=>[e.id,e]));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function selectedExercises(selects){return selects.map(select=>byId.get(select.value));}
  function validatePassage(selects,requireCandidate=false){
    const exercises=selectedExercises(selects),warning=document.querySelector('.warning'),candidate=document.querySelector('#candidate-name').value.trim();
    if(requireCandidate&&!candidate){warning.textContent='Indique le nom du candidat.';return null;}
    if(!exercises[0]||!exercises[1]||exercises[0].theme===exercises[1].theme){warning.textContent='Choisis deux exercices appartenant à deux thèmes différents.';return null;}
    warning.textContent='';return {candidate,exercises};
  }
  function renderSelectedCorrections(selects,print=false){
    const passage=validatePassage(selects);if(!passage)return;
    const panel=document.querySelector('#selected-corrections'),wrap=panel.querySelector('.selected-corrections-grid');
    document.querySelector('#corrections-title').textContent=passage.candidate?`Corrigés de ${passage.candidate}`:'Corrigés des deux exercices';
    wrap.innerHTML=passage.exercises.map(exercise=>{const correction=window.ORAL_CORRECTIONS[exercise.id];return `<article class="selected-correction theme-${exercise.theme}"><div class="selected-correction-title"><span>${exercise.id.toUpperCase()}</span><div><h3>${esc(exercise.titre)}</h3><small>${esc(exercise.themeLabel)}</small></div></div><ol>${correction.answers.map(answer=>`<li>${answer}</li>`).join('')}</ol><p class="relance"><strong>Relance orale :</strong> ${correction.relance}</p></article>`}).join('');
    panel.hidden=false;
    if(print){document.body.classList.add('print-selected-corrections');const cleanup=()=>document.body.classList.remove('print-selected-corrections');window.addEventListener('afterprint',cleanup,{once:true});window.print();setTimeout(cleanup,1500);}else panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function exerciseCard(e){const correction=window.ORAL_CORRECTIONS?.[e.id];const correctionHtml=correction?`<section class="correction"><h3>✅ Corrigé professeur</h3><ol>${correction.answers.map(answer=>`<li>${answer}</li>`).join('')}</ol><p class="relance"><strong>Relance orale :</strong> ${correction.relance}</p></section>`:'';return `<article class="exercise" id="ex-${e.id}" data-theme="${e.theme}"><div class="exercise-head"><span class="num">${e.id.toUpperCase()}</span><div><h2>${esc(e.titre)}</h2><div class="theme">${esc(e.themeLabel)}</div></div></div><div class="actions"><button class="btn preview-btn" type="button">Aperçu</button><button class="btn correction-btn" type="button">Voir le corrigé</button><button class="btn print-correction-btn" type="button">Imprimer le corrigé</button><a class="btn" href="${e.pdf}" target="_blank" rel="noopener">Ouvrir le PDF ↗</a><a class="btn primary" href="${e.pdf}" target="_blank" rel="noopener">Exporter / imprimer le PDF</a></div><div class="preview"><iframe loading="lazy" title="${esc(e.titre)}"></iframe></div>${correctionHtml}</article>`}
  function initProf(){
    const grid=document.querySelector('.oral-grid'); if(!grid)return;
    grid.innerHTML=data.exercices.map(exerciseCard).join('');
    const selects=[...document.querySelectorAll('.exercise-select')];
    const options=data.exercices.map(e=>`<option value="${e.id}">${e.themeLabel} — n°${e.numero}</option>`).join('');
    selects.forEach((s,i)=>s.innerHTML='<option value="">Choisir un exercice…</option>'+options);
    document.querySelectorAll('[data-pair]').forEach(button=>button.addEventListener('click',()=>{
      const pair=button.dataset.pair.split(','); selects.forEach((select,index)=>select.value=pair[index]);
      document.querySelector('.composer').scrollIntoView({behavior:'smooth',block:'start'});
    }));
    grid.addEventListener('click',event=>{
      const card=event.target.closest('.exercise'); if(!card)return; const e=byId.get(card.id.slice(3));
      if(event.target.closest('.preview-btn')){const box=card.querySelector('.preview'); box.classList.toggle('open'); if(box.classList.contains('open'))box.querySelector('iframe').src=e.pdf;}
      if(event.target.closest('.correction-btn')){const box=card.querySelector('.correction');box.classList.toggle('open');event.target.textContent=box.classList.contains('open')?'Masquer le corrigé':'Voir le corrigé';}
      if(event.target.closest('.print-correction-btn')){document.querySelectorAll('.print-target').forEach(x=>x.classList.remove('print-target'));card.classList.add('print-target');window.print();}
    });
    setupFilters(grid);
    document.querySelector('#show-selected-corrections').addEventListener('click',()=>renderSelectedCorrections(selects));
    document.querySelector('#print-selected-corrections').addEventListener('click',()=>renderSelectedCorrections(selects,true));
    document.querySelector('#close-selected-corrections').addEventListener('click',()=>document.querySelector('#selected-corrections').hidden=true);
    initEvaluation(selects);
  }

  const criteria=[
    {id:'connaissances',label:'Connaissances et vocabulaire',weight:30,help:'Mobiliser les notions du programme et employer précisément le vocabulaire de NSI.'},
    {id:'raisonnement',label:'Raisonnement et justification',weight:30,help:'Construire une démarche cohérente, expliquer les étapes et justifier les choix.'},
    {id:'exactitude',label:'Traitement des deux exercices',weight:25,help:'Répondre correctement, exploiter les données et rectifier une erreur éventuelle.'},
    {id:'oral',label:'Expression et interaction orales',weight:15,help:'Présenter clairement, écouter les relances et répondre de façon structurée.'}
  ];
  const levels=['Non maîtrisé','Insuffisant','Fragile','Satisfaisant','Très bonne maîtrise'];
  function initEvaluation(selects){
    const panel=document.querySelector('#evaluation-panel'),grid=document.querySelector('.criteria-grid');
    if(!panel||!grid)return;
    grid.innerHTML=criteria.map(c=>`<article class="criterion" data-criterion="${c.id}"><div class="criterion-title"><div><h3>${c.label}</h3><p>${c.help}</p></div><span>${c.weight} %</span></div><div class="mastery-buttons">${levels.map((label,score)=>`<label><input type="radio" name="score-${c.id}" value="${score}" ${score===0?'checked':''}><span><b>${score}/4</b><small>${label}</small></span></label>`).join('')}</div><div class="criterion-contribution">Contribution : <strong>0,00</strong> / ${(20*c.weight/100).toLocaleString('fr-FR')}</div></article>`).join('');
    const updateMark=()=>{
      let mark=0;
      criteria.forEach(c=>{const score=Number(document.querySelector(`input[name="score-${c.id}"]:checked`)?.value||0);const contribution=score/4*20*c.weight/100;mark+=contribution;document.querySelector(`[data-criterion="${c.id}"] .criterion-contribution strong`).textContent=contribution.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});});
      document.querySelector('#final-mark').textContent=mark.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
      return mark;
    };
    grid.addEventListener('change',updateMark);
    document.querySelector('#open-evaluation').addEventListener('click',()=>{
      const passage=validatePassage(selects,true);if(!passage)return;const {candidate,exercises}=passage;
      document.querySelector('#evaluation-title').textContent=candidate;
      document.querySelector('#evaluation-subjects').textContent=`${exercises[0].id.toUpperCase()} — ${exercises[0].titre} · ${exercises[1].id.toUpperCase()} — ${exercises[1].titre}`;
      panel.dataset.exercise1=exercises[0].id;panel.dataset.exercise2=exercises[1].id;panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'});updateMark();
    });
    document.querySelector('#save-evaluation').addEventListener('click',()=>{
      const candidate=document.querySelector('#candidate-name').value.trim();if(!candidate||!panel.dataset.exercise1)return;
      const scores=Object.fromEntries(criteria.map(c=>[c.id,Number(document.querySelector(`input[name="score-${c.id}"]:checked`)?.value||0)]));
      const record={id:panel.dataset.recordId||(crypto.randomUUID?.()||String(Date.now())),candidate,date:new Date().toISOString(),exercices:[panel.dataset.exercise1,panel.dataset.exercise2],scores,note:updateMark(),notes:document.querySelector('#evaluation-notes').value};
      const key='sakura-oral-controle-evaluations',records=JSON.parse(localStorage.getItem(key)||'[]'),existing=records.findIndex(item=>item.id===record.id);existing>=0?records.splice(existing,1,record):records.push(record);localStorage.setItem(key,JSON.stringify(records));panel.dataset.recordId=record.id;
      const used=new Set(JSON.parse(localStorage.getItem('sakura-oral-controle-used')||'[]'));record.exercices.forEach(id=>used.add(id));localStorage.setItem('sakura-oral-controle-used',JSON.stringify([...used]));
      document.querySelector('#save-status').textContent=`Évaluation ${existing>=0?'mise à jour':'enregistrée'} — ${record.note.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}/20`;
    });
    document.querySelector('#reset-evaluation').addEventListener('click',()=>{
      panel.hidden=true;delete panel.dataset.recordId;document.querySelector('#candidate-name').value='';selects.forEach(s=>s.value='');grid.querySelectorAll('input[value="0"]').forEach(input=>input.checked=true);document.querySelector('#evaluation-notes').value='';document.querySelector('#save-status').textContent='';window.scrollTo({top:document.querySelector('.composer').offsetTop-20,behavior:'smooth'});
    });
    const editId=new URLSearchParams(location.search).get('edit');
    if(editId){const records=JSON.parse(localStorage.getItem('sakura-oral-controle-evaluations')||'[]'),record=records.find(item=>item.id===editId);if(record){document.querySelector('#candidate-name').value=record.candidate;selects.forEach((select,index)=>select.value=record.exercices[index]);document.querySelector('#open-evaluation').click();Object.entries(record.scores).forEach(([id,score])=>{const input=document.querySelector(`input[name="score-${id}"][value="${score}"]`);if(input)input.checked=true;});document.querySelector('#evaluation-notes').value=record.notes||'';panel.dataset.recordId=record.id;grid.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#save-status').textContent='Évaluation chargée : tu peux modifier les niveaux puis enregistrer.';}}
  }
  function setupFilters(grid){
    const buttons=[...document.querySelectorAll('[data-filter]')],search=document.querySelector('[data-search]');let active='all';
    const refresh=()=>grid.querySelectorAll('.exercise').forEach(card=>card.hidden=!(active==='all'||card.dataset.theme===active)||!card.textContent.toLowerCase().includes((search?.value||'').toLowerCase()));
    buttons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;buttons.forEach(x=>x.classList.toggle('active',x===b));refresh()})); search?.addEventListener('input',refresh);
  }
  function initDashboard(){
    const body=document.querySelector('#exercises-body');if(!body)return;const key='sakura-oral-controle-used';const used=new Set(JSON.parse(localStorage.getItem(key)||'[]'));
    body.innerHTML=data.exercices.map(e=>`<tr data-theme="${e.theme}" class="${used.has(e.id)?'used':''}"><td><input class="status" type="checkbox" data-id="${e.id}" ${used.has(e.id)?'checked':''}></td><td><strong>${e.id.toUpperCase()}</strong></td><td>${esc(e.themeLabel)}</td><td>Exercice ${e.numero}</td><td><a href="prof.html#ex-${e.id}">Sujet + corrigé →</a></td><td><a href="${e.pdf}" target="_blank" rel="noopener">PDF ↗</a></td></tr>`).join('');
    body.addEventListener('change',event=>{if(!event.target.matches('.status'))return;event.target.checked?used.add(event.target.dataset.id):used.delete(event.target.dataset.id);localStorage.setItem(key,JSON.stringify([...used]));event.target.closest('tr').classList.toggle('used',event.target.checked);update()});
    const update=()=>{document.querySelector('#used-count').textContent=used.size;document.querySelector('#remaining-count').textContent=data.exercices.length-used.size};update();
    const buttons=[...document.querySelectorAll('[data-filter]')];buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.toggle('active',x===b));body.querySelectorAll('tr').forEach(r=>r.hidden=!(b.dataset.filter==='all'||r.dataset.theme===b.dataset.filter))}));
    const evaluations=JSON.parse(localStorage.getItem('sakura-oral-controle-evaluations')||'[]'),evaluationBody=document.querySelector('#evaluations-body');
    document.querySelector('#evaluation-count').textContent=evaluations.length;
    if(evaluations.length&&evaluationBody){document.querySelector('.empty-evaluations').hidden=true;document.querySelector('.evaluations-wrap').hidden=false;evaluationBody.innerHTML=evaluations.map(record=>`<tr><td><strong>${esc(record.candidate)}</strong><small>${new Date(record.date).toLocaleString('fr-FR')}</small></td><td>${record.exercices.map(id=>id.toUpperCase()).join(' + ')}</td><td>${record.scores.connaissances??'—'}/4</td><td>${record.scores.raisonnement??'—'}/4</td><td>${record.scores.exactitude??'—'}/4</td><td>${record.scores.oral??'—'}/4</td><td><strong>${Number(record.note).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})}/20</strong></td><td><a class="btn edit-evaluation" href="prof.html?edit=${encodeURIComponent(record.id)}">Modifier</a></td></tr>`).join('');}
  }
  document.addEventListener('DOMContentLoaded',()=>{initProf();initDashboard()});
})();
