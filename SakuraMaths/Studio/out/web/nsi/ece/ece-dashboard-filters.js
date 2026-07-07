document.addEventListener('DOMContentLoaded', async () => {
  const rows = [...document.querySelectorAll('tbody tr[data-ece-id]')];
  if (!rows.length || !window.ECEManifest) return;
  try {
    const manifest = await ECEManifest.load();
    const byId = new Map(manifest.sujets.map(subject => [subject.id, subject]));
    rows.forEach(row => {
      const subject = byId.get(row.dataset.eceId);
      if (!subject) return;
      row.dataset.themes = (subject.themes || []).join('|');
      const label = row.querySelector('.ece-theme-list');
      if (label) label.textContent = subject.themes?.length ? subject.themes.join(' · ') : 'À indexer';
    });
    const themes = [...new Set(manifest.sujets.flatMap(subject => subject.themes || []))].sort((a,b) => a.localeCompare(b,'fr'));
    const selected = new Set();
    const toolbar = document.createElement('section');
    toolbar.className = 'dash-filters';
    toolbar.innerHTML = '<strong>Filtrer par thème</strong><span>Sélection multiple possible</span><div class="dash-theme-buttons"></div><div class="dash-filter-count"></div>';
    document.querySelector('.stats').after(toolbar);
    const wrap = toolbar.querySelector('.dash-theme-buttons');
    const count = toolbar.querySelector('.dash-filter-count');
    function refresh(){
      let visible=0;
      rows.forEach(row => {
        const rowThemes = new Set((row.dataset.themes || '').split('|').filter(Boolean));
        row.hidden = ![...selected].every(theme => rowThemes.has(theme));
        if(!row.hidden) visible += 1;
      });
      document.querySelectorAll('.year-section').forEach(section => section.hidden = !section.querySelector('tbody tr:not([hidden])'));
      count.textContent = `${visible} sujet${visible>1?'s':''} affiché${visible>1?'s':''}`;
    }
    themes.forEach(theme => {
      const button=document.createElement('button');button.type='button';button.textContent=theme;
      button.addEventListener('click',()=>{selected.has(theme)?selected.delete(theme):selected.add(theme);button.classList.toggle('active',selected.has(theme));refresh();});
      wrap.appendChild(button);
    });
    refresh();
  } catch(error) {
    console.warn(error);
  }
});
