document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.ece-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.ece-card')];
  const numberOf = card => Number((card.querySelector('.ece-num')?.textContent || '').match(/\d+/)?.[0] || 999);
  cards.sort((a, b) => numberOf(a) - numberOf(b)).forEach(card => {
    const number = String(numberOf(card)).padStart(2, '0');
    card.id = `sujet-26-${number}`;
    card.dataset.eceId = `26-${number}`;
    grid.appendChild(card);
  });

  try {
    const manifest = await ECEManifest.load();
    const byId = new Map(manifest.sujets.map(subject => [subject.id, subject]));
    cards.forEach(card => {
      const subject = byId.get(card.dataset.eceId);
      if (!subject) return;
      const tags = card.querySelector('.ece-tags');
      if (!tags) return;
      tags.querySelectorAll('.tag-theme').forEach(tag => tag.remove());
      (subject.themes || []).forEach(theme => {
        const tag = document.createElement('span'); tag.className='tag-theme'; tag.textContent=theme; tags.appendChild(tag);
      });
    });
  } catch(error) {
    console.warn(error);
  }

  const themes = [...new Set(cards.flatMap(card => [...card.querySelectorAll('.tag-theme')].map(tag => tag.textContent.trim())))].sort((a, b) => a.localeCompare(b, 'fr'));
  const selected = new Set();
  const toolbar = document.createElement('section');
  toolbar.className = 'ece-filters';
  toolbar.innerHTML = '<div class="filter-head"><div><strong>Filtrer les sujets</strong><span>Plusieurs thèmes peuvent être combinés.</span></div><input type="search" placeholder="Rechercher un sujet…" aria-label="Rechercher un sujet"></div><div class="theme-filters"></div><div class="filter-result" aria-live="polite"></div>';
  grid.before(toolbar);
  const themeWrap = toolbar.querySelector('.theme-filters');
  const search = toolbar.querySelector('input');
  const result = toolbar.querySelector('.filter-result');

  function refresh() {
    const query = search.value.trim().toLocaleLowerCase('fr');
    let visible = 0;
    cards.forEach(card => {
      const cardThemes = new Set([...card.querySelectorAll('.tag-theme')].map(tag => tag.textContent.trim()));
      const themeMatch = [...selected].every(theme => cardThemes.has(theme));
      const textMatch = !query || card.textContent.toLocaleLowerCase('fr').includes(query);
      card.hidden = !(themeMatch && textMatch);
      if (!card.hidden) visible += 1;
    });
    result.textContent = `${visible} sujet${visible > 1 ? 's' : ''} affiché${visible > 1 ? 's' : ''} sur ${cards.length}`;
  }
  themes.forEach(theme => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = theme;
    button.addEventListener('click', () => {
      selected.has(theme) ? selected.delete(theme) : selected.add(theme);
      button.classList.toggle('active', selected.has(theme));
      refresh();
    });
    themeWrap.appendChild(button);
  });
  search.addEventListener('input', refresh);
  refresh();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView({block: 'start'});

  const editorLinks = [...document.querySelectorAll('a.edit-btn[href*="console.basthon.fr"]')];
  if (editorLinks.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'python-editor-dialog';
    dialog.innerHTML = '<div class="editor-head"><strong>🐍 Éditeur Python — Basthon</strong><div><a target="_blank" rel="noopener" class="editor-new-tab">Ouvrir dans un onglet ↗</a><button type="button" class="editor-close">Fermer</button></div></div><iframe title="Éditeur Python Basthon" loading="lazy"></iframe><p class="editor-help">Si l’éditeur ne s’affiche pas dans ce navigateur, utilise « Ouvrir dans un onglet ».</p>';
    document.body.appendChild(dialog);
    const frame=dialog.querySelector('iframe'), external=dialog.querySelector('.editor-new-tab');
    dialog.querySelector('.editor-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{frame.src='about:blank';});
    editorLinks.forEach(link => link.addEventListener('click',event => {
      event.preventDefault(); frame.src=link.href; external.href=link.href; dialog.showModal();
    }));
  }
});
