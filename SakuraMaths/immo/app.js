const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const cards = document.querySelector("#cards"), template = document.querySelector("#card-template");
const saved = JSON.parse(localStorage.getItem("immo-watch") || "{}");
let filter = "all", query = "";
function persist(id, patch) { saved[id] = { ...(saved[id] || {}), ...patch }; localStorage.setItem("immo-watch", JSON.stringify(saved)); render(); }
function render() {
  cards.innerHTML = "";
  const items = PROPERTIES.filter(p => {
    const state = saved[p.id] || {};
    const matches = JSON.stringify(p).toLowerCase().includes(query);
    return matches && (filter === "all" || (filter === "favorite" && state.favorite) || state.status === filter);
  });
  document.querySelector("#result-count").textContent = items.length;
  document.querySelector(".hero-stats span").textContent = items.length > 1 ? "biens suivis" : "bien suivi";
  items.forEach(p => {
    const node = template.content.cloneNode(true), card = node.querySelector(".card"), state = saved[p.id] || {};
    const img = node.querySelector("img"), placeholder = node.querySelector(".placeholder"), photos = p.images || (p.image ? [p.image] : []);
    let photoIndex = 0;
    const previous = node.querySelector(".previous"), next = node.querySelector(".next"), count = node.querySelector(".photo-count"), thumbs = node.querySelector(".thumbnails");
    const showPhoto = index => {
      photoIndex = (index + photos.length) % photos.length;
      img.src = photos[photoIndex]; img.alt = `${p.title} — photo ${photoIndex + 1} sur ${photos.length}`;
      count.textContent = `${photoIndex + 1} / ${photos.length}`;
      thumbs.querySelectorAll("button").forEach((button, i) => button.classList.toggle("active", i === photoIndex));
    };
    if (photos.length) {
      placeholder.hidden = true;
      photos.forEach((photo, index) => { const button = document.createElement("button"); button.type = "button"; button.setAttribute("aria-label", `Afficher la photo ${index + 1}`); button.style.backgroundImage = `url('${photo}')`; button.onclick = () => showPhoto(index); thumbs.appendChild(button); });
      previous.onclick = () => showPhoto(photoIndex - 1); next.onclick = () => showPhoto(photoIndex + 1); showPhoto(0);
    } else { img.hidden = true; previous.hidden = next.hidden = count.hidden = true; }
    node.querySelector(".source").textContent = p.source; node.querySelector("h2").textContent = p.title;
    node.querySelector(".location").textContent = p.location; node.querySelector(".price").textContent = money.format(p.price);
    node.querySelector(".facts").innerHTML = `<span><b>${p.surface}</b> m²</span><span><b>${p.rooms}</b> pièces</span><span><b>${p.bedrooms}</b> ch.</span><span><b>${p.land}</b> m² terrain</span><span><b>${money.format(p.pricePerSqm)}</b>/m²</span><span class="dpe dpe-${p.dpe.toLowerCase()}">DPE ${p.dpe}</span>`;
    node.querySelector(".description").textContent = p.description;
    node.querySelector(".tags").innerHTML = p.tags.map(t => `<span>${t}</span>`).join("");
    const heart = node.querySelector(".heart"); heart.textContent = state.favorite ? "♥" : "♡"; heart.classList.toggle("liked", !!state.favorite); heart.onclick = () => persist(p.id, { favorite: !state.favorite });
    const status = node.querySelector(".status"); status.value = state.status || "new"; status.onchange = e => persist(p.id, { status: e.target.value });
    const note = node.querySelector("textarea"); note.value = state.note || ""; note.onchange = e => persist(p.id, { note: e.target.value });
    const link = node.querySelector("a"); link.href = p.url;
    node.querySelector(".copy").onclick = async e => { await navigator.clipboard.writeText(`${p.title} — ${p.location}\n${money.format(p.price)} · ${p.surface} m² · ${p.bedrooms} chambres · DPE ${p.dpe}\n${p.url}`); e.target.textContent = "Résumé copié ✓"; };
    cards.appendChild(node);
  });
  if (!items.length) cards.innerHTML = `<p class="empty">Aucun bien ne correspond à ce filtre.</p>`;
}
document.querySelector("#search").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); render(); });
document.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { document.querySelector("[data-filter].active").classList.remove("active"); b.classList.add("active"); filter = b.dataset.filter; render(); });
render();
