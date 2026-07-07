(function(){
  const data=window.ORAL_NSI;
  const byId=new Map(data.exercices.map(e=>[e.id,e]));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function exerciseCard(e){return `<article class="exercise" id="ex-${e.id}" data-theme="${e.theme}"><div class="exercise-head"><span class="num">${e.id.toUpperCase()}</span><div><h2>${esc(e.titre)}</h2><div class="theme">${esc(e.themeLabel)}</div></div></div><div class="actions"><button class="btn preview-btn" type="button">Aperçu</button><a class="btn" href="${e.pdf}" target="_blank" rel="noopener">PDF original ↗</a><button class="btn export-btn" type="button">Exporter cette fiche en PDF</button></div><div class="preview"><iframe loading="lazy" title="${esc(e.titre)}"></iframe></div><div class="print-content"><h1>${esc(e.titre)}</h1><p>Document officiel à joindre : <strong>${esc(e.pdf)}</strong></p></div></article>`}
  function initProf(){
    const grid=document.querySelector('.oral-grid'); if(!grid)return;
    grid.innerHTML=data.exercices.map(exerciseCard).join('');
    const selects=[...document.querySelectorAll('.exercise-select')];
    const options=data.exercices.map(e=>`<option value="${e.id}">${e.themeLabel} — n°${e.numero}</option>`).join('');
    selects.forEach((s,i)=>s.innerHTML='<option value="">Choisir un exercice…</option>'+options);
    grid.addEventListener('click',event=>{
      const card=event.target.closest('.exercise'); if(!card)return; const e=byId.get(card.id.slice(3));
      if(event.target.closest('.preview-btn')){const box=card.querySelector('.preview'); box.classList.toggle('open'); if(box.classList.contains('open'))box.querySelector('iframe').src=e.pdf;}
      if(event.target.closest('.export-btn')){document.querySelectorAll('.print-target').forEach(x=>x.classList.remove('print-target'));card.classList.add('print-target');window.print();}
    });
    setupFilters(grid);
    document.querySelector('#export-composed')?.addEventListener('click',()=>{
      const [a,b]=selects.map(s=>byId.get(s.value)); const warning=document.querySelector('.warning');
      if(!a||!b||a.theme===b.theme){warning.textContent='Choisis deux exercices appartenant à deux thèmes différents.';return;}
      warning.textContent='';
      const candidate=document.querySelector('#candidate-name').value.trim();
      document.querySelector('.candidate-sheet').innerHTML=`<h1>NSI — Oral de contrôle</h1><div class="identity"><span>Candidat : <span class="line">${esc(candidate||'')}</span></span><span>Date : <span class="line"></span></span></div><div class="rules"><strong>Préparation : 20 minutes · Entretien : 20 minutes</strong><br>Le candidat peut s’appuyer sur les notes prises pendant la préparation.</div>${[a,b].map((e,i)=>`<section class="part"><h2>Question ${i+1} — ${esc(e.themeLabel)}</h2><h3>${esc(e.titre)}</h3><p class="pdf-note">Énoncé officiel : ${esc(e.pdf)}</p></section>`).join('')}`;
      document.querySelectorAll('.print-target').forEach(x=>x.classList.remove('print-target')); window.print();
    });
  }
  function setupFilters(grid){
    const buttons=[...document.querySelectorAll('[data-filter]')],search=document.querySelector('[data-search]');let active='all';
    const refresh=()=>grid.querySelectorAll('.exercise').forEach(card=>card.hidden=!(active==='all'||card.dataset.theme===active)||!card.textContent.toLowerCase().includes((search?.value||'').toLowerCase()));
    buttons.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;buttons.forEach(x=>x.classList.toggle('active',x===b));refresh()})); search?.addEventListener('input',refresh);
  }
  function initDashboard(){
    const body=document.querySelector('tbody');if(!body)return;const key='sakura-oral-controle-used';const used=new Set(JSON.parse(localStorage.getItem(key)||'[]'));
    body.innerHTML=data.exercices.map(e=>`<tr data-theme="${e.theme}" class="${used.has(e.id)?'used':''}"><td><input class="status" type="checkbox" data-id="${e.id}" ${used.has(e.id)?'checked':''}></td><td><strong>${e.id.toUpperCase()}</strong></td><td>${esc(e.themeLabel)}</td><td>Exercice ${e.numero}</td><td><a href="prof.html#ex-${e.id}">Fiche prof →</a></td><td><a href="${e.pdf}" target="_blank" rel="noopener">PDF ↗</a></td></tr>`).join('');
    body.addEventListener('change',event=>{if(!event.target.matches('.status'))return;event.target.checked?used.add(event.target.dataset.id):used.delete(event.target.dataset.id);localStorage.setItem(key,JSON.stringify([...used]));event.target.closest('tr').classList.toggle('used',event.target.checked);update()});
    const update=()=>{document.querySelector('#used-count').textContent=used.size;document.querySelector('#remaining-count').textContent=data.exercices.length-used.size};update();
    const buttons=[...document.querySelectorAll('[data-filter]')];buttons.forEach(b=>b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.toggle('active',x===b));body.querySelectorAll('tr').forEach(r=>r.hidden=!(b.dataset.filter==='all'||r.dataset.theme===b.dataset.filter))}));
  }
  document.addEventListener('DOMContentLoaded',()=>{initProf();initDashboard()});
})();
