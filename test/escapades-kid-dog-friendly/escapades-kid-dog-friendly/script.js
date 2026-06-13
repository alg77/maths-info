const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.place-card');
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const filter = chip.dataset.filter;
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    card.classList.toggle('hide', filter !== 'all' && !tags.includes(filter));
  });
}));

const form = document.querySelector('#noteForm');
const journal = document.querySelector('#journal');
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#placeName').value.trim();
  const type = document.querySelector('#placeType').value;
  const rating = document.querySelector('#placeRating').value;
  if (!name) return;
  const item = document.createElement('article');
  item.innerHTML = `<strong>${name}</strong><br><span>${type} • envie ${rating}/10</span><p>À compléter : trajet, budget, météo idéale, chien oui/non, repas possible, fatigue prévue.</p>`;
  journal.prepend(item);
  form.reset();
});
