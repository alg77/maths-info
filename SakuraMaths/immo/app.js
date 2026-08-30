const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const cards = document.querySelector("#cards"), template = document.querySelector("#card-template");
const saved = JSON.parse(localStorage.getItem("immo-watch") || "{}");
const dpeRank = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, NC: 8 };
let filter = "all", query = "", cityFilter = "all", sortMode = "added-desc";
let lightboxPhotos = [], lightboxIndex = 0;
const budgetDefaults = { down: 0, years: 25, rate: 3.5, notary: 8, car: 10000, carEnabled: true };
let budgetSettings = { ...budgetDefaults, ...JSON.parse(localStorage.getItem("immo-budget-settings") || "{}") };
function cityOf(p) {
  if (p.city) return p.city;
  const location = p.location || "";
  const knownCities = ["Lagny-sur-Marne", "Saint-Thibault-des-Vignes", "Thorigny-sur-Marne", "Dampmart", "Couilly-Pont-aux-Dames", "Pomponne", "Conches-sur-Gondoire"];
  return knownCities.find(city => location.toLocaleLowerCase("fr").includes(city.toLocaleLowerCase("fr")))
    || location.split(/\s*(?:·|•|\||—)\s*/)[0].trim();
}
function listingsOf(p) { return p.listings?.length ? p.listings : [{ source: p.source, url: p.url, price: p.price }]; }
function bestPrice(p) { return Math.min(...listingsOf(p).map(item => item.price ?? p.price)); }
function energyBudget(p) {
  if (!p.energyCost?.min || !p.energyCost?.max) return null;
  const annual = (p.energyCost.min + p.energyCost.max) / 2;
  return { annual, monthly: annual / 12 };
}
function projectBudget(p) {
  const extraCar = budgetSettings.carEnabled && cityOf(p) !== "Lagny-sur-Marne" ? Number(budgetSettings.car) : 0;
  const purchasePrice = bestPrice(p);
  const fees = purchasePrice * Number(budgetSettings.notary) / 100;
  const project = purchasePrice + fees + extraCar;
  const principal = Math.max(0, project - Number(budgetSettings.down));
  const months = Math.max(1, Number(budgetSettings.years) * 12);
  const monthlyRate = Number(budgetSettings.rate) / 100 / 12;
  const mortgage = monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
  const energy = energyBudget(p);
  return { purchasePrice, extraCar, fees, project, principal, mortgage, energy, knownMonthly: mortgage + (energy?.monthly || 0) };
}
function commuteFit(p) {
  if (p.commute) return p.commute;
  const city = cityOf(p);
  return {
    "Lagny-sur-Marne": { level: "excellent", label: "Travail/écoles : énorme potentiel", text: "Si Saint-Laurent est faisable à pied, c’est un très gros bonus : votre appart actuel est à 7 min du collège et 3 min de la maternelle, donc il faut comparer sévèrement." },
    "Saint-Thibault-des-Vignes": { level: "good", label: "Travail/écoles : équilibré", text: "Proche de Lagny, et mieux placé vers Chelles que les communes plus à l’est." },
    "Thorigny-sur-Marne": { level: "good", label: "Travail/écoles : bon côté Lagny", text: "Très cohérent pour Lagny ; trajet vers GGSB Chelles à tester aux heures de pointe." },
    "Dampmart": { level: "medium", label: "Travail/écoles : Lagny facile", text: "Pratique pour Lagny ; Chelles peut devenir le trajet sensible du matin." },
    "Couilly-Pont-aux-Dames": { level: "watch", label: "Travail/écoles : à chronométrer", text: "Plus éloigné du trio Lagny/Chelles ; à vérifier en vrai sur une matinée type." }
  }[city] || { level: "medium", label: "Travail/écoles : à vérifier", text: "À comparer avec les trajets vers Lagny et Chelles." };
}
function showLightbox(index) {
  if (!lightboxPhotos.length) return;
  const box = document.querySelector("#lightbox"), img = box.querySelector("img");
  lightboxIndex = (index + lightboxPhotos.length) % lightboxPhotos.length;
  img.src = lightboxPhotos[lightboxIndex];
  img.alt = `Photo ${lightboxIndex + 1} sur ${lightboxPhotos.length}`;
  box.querySelector(".lightbox-count").textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
  box.classList.add("is-open");
  box.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}
function closeLightbox() {
  const box = document.querySelector("#lightbox");
  box.classList.remove("is-open");
  box.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}
function compareBy(mode) {
  const addedIndex = new Map(PROPERTIES.map((p, i) => [p.id, i]));
  const numeric = key => (a, b) => (a[key] ?? Infinity) - (b[key] ?? Infinity);
  const numericDesc = key => (a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity);
  return {
    "price-asc": (a, b) => bestPrice(a) - bestPrice(b),
    "price-desc": (a, b) => bestPrice(b) - bestPrice(a),
    "sqm-asc": (a, b) => bestPrice(a) / a.surface - bestPrice(b) / b.surface,
    "surface-desc": numericDesc("surface"),
    "land-desc": numericDesc("land"),
    "city-asc": (a, b) => cityOf(a).localeCompare(cityOf(b), "fr") || bestPrice(a) - bestPrice(b),
    "dpe-asc": (a, b) => (dpeRank[a.dpe] || 99) - (dpeRank[b.dpe] || 99) || bestPrice(a) - bestPrice(b),
    "score-desc": (a, b) => (b.familyFit?.score ?? -1) - (a.familyFit?.score ?? -1) || bestPrice(a) - bestPrice(b),
    "added-desc": (a, b) => addedIndex.get(b.id) - addedIndex.get(a.id)
  }[mode] || ((a, b) => addedIndex.get(b.id) - addedIndex.get(a.id));
}
function populateCityFilter() {
  const select = document.querySelector("#city-filter");
  const cities = [...new Set(PROPERTIES.map(cityOf))].sort((a, b) => a.localeCompare(b, "fr"));
  select.innerHTML = `<option value="all">Toutes</option>` + cities.map(city => `<option value="${city}">${city}</option>`).join("");
}
function renderInsights(items) {
  const insights = document.querySelector("#insights");
  if (!items.length) { insights.innerHTML = ""; return; }
  const bestSqm = items.reduce((best, p) => bestPrice(p) / p.surface < bestPrice(best) / best.surface ? p : best, items[0]);
  const cheapest = items.reduce((best, p) => bestPrice(p) < bestPrice(best) ? p : best, items[0]);
  const largestLand = items.reduce((best, p) => p.land > best.land ? p : best, items[0]);
  const watchEnergy = items.filter(p => ["E", "F", "G"].includes(p.dpe)).length;
  const documentedEnergy = items.map(energyBudget).filter(Boolean);
  const averageEnergy = documentedEnergy.length ? documentedEnergy.reduce((sum, item) => sum + item.monthly, 0) / documentedEnergy.length : null;
  insights.innerHTML = `
    <article><span>Moins cher</span><strong>${money.format(bestPrice(cheapest))}</strong><small>${cityOf(cheapest)} · ${cheapest.surface} m²</small></article>
    <article><span>Meilleur €/m²</span><strong>${money.format(bestPrice(bestSqm) / bestSqm.surface)}/m²</strong><small>${cityOf(bestSqm)} · ${money.format(bestPrice(bestSqm))}</small></article>
    <article><span>Plus grand terrain</span><strong>${largestLand.land.toLocaleString("fr-FR")} m²</strong><small>${cityOf(largestLand)} · ${largestLand.rooms} pièces</small></article>
    <article><span>DPE à surveiller</span><strong>${watchEnergy}</strong><small>E/F/G dans la sélection</small></article>
    <article><span>Énergie moyenne</span><strong>${averageEnergy ? `${money.format(averageEnergy)}/mois` : "—"}</strong><small>${documentedEnergy.length} bien${documentedEnergy.length > 1 ? "s" : ""} documenté${documentedEnergy.length > 1 ? "s" : ""}</small></article>
  `;
}
function persist(id, patch) { saved[id] = { ...(saved[id] || {}), ...patch }; localStorage.setItem("immo-watch", JSON.stringify(saved)); render(); }
function render() {
  cards.innerHTML = "";
  const items = PROPERTIES.filter(p => {
    const state = saved[p.id] || {};
    const effectiveStatus = state.status || p.defaultStatus || "new";
    const matches = JSON.stringify(p).toLowerCase().includes(query);
    const cityMatches = cityFilter === "all" || cityOf(p) === cityFilter;
    return matches && cityMatches && (filter === "all" || (filter === "favorite" && state.favorite) || effectiveStatus === filter);
  }).sort(compareBy(sortMode));
  document.querySelector("#result-count").textContent = items.length;
  document.querySelector(".hero-stats span").textContent = items.length > 1 ? "biens suivis" : "bien suivi";
  renderInsights(items);
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
      img.onclick = () => { lightboxPhotos = photos; showLightbox(photoIndex); };
      node.querySelector(".visual").onclick = event => {
        if (event.target.closest(".gallery-nav, .thumbnails, .heart")) return;
        lightboxPhotos = photos;
        showLightbox(photoIndex);
      };
    } else { img.hidden = true; previous.hidden = next.hidden = count.hidden = true; }
    node.querySelector(".source").textContent = p.source; node.querySelector("h2").textContent = p.title;
    const offers = listingsOf(p), lowestPrice = bestPrice(p);
    node.querySelector(".location").textContent = p.location; node.querySelector(".price").textContent = `${offers.length > 1 ? "dès " : ""}${money.format(lowestPrice)}`;
    const address = node.querySelector(".address");
    if (p.address) {
      address.hidden = false;
      address.textContent = `Adresse : ${p.address}`;
    }
    const bedroomText = p.mainBedrooms != null
      ? `<b>${p.mainBedrooms}</b> ch. maison${p.outbuildingBedrooms ? ` + ${p.outbuildingBedrooms} dépendance` : ""}`
      : `<b>${p.bedrooms}</b> ch.`;
    node.querySelector(".facts").innerHTML = `<span><b>${p.surface}</b> m²</span><span><b>${p.rooms}</b> pièces</span><span>${bedroomText}</span><span><b>${p.land}</b> m² terrain</span><span><b>${money.format(lowestPrice / p.surface)}</b>/m²</span><span class="energy dpe energy-${String(p.dpe).toLowerCase()}">DPE ${p.dpe}</span><span class="energy ges energy-${String(p.ges).toLowerCase()}">GES ${p.ges}</span>`;
    node.querySelector(".description").textContent = p.description;
    node.querySelector(".tags").innerHTML = p.tags.map(t => `<span>${t}</span>`).join("");
    const familyPreview = node.querySelector(".family-preview");
    if (p.familyFit) {
      const commute = commuteFit(p);
      familyPreview.hidden = false;
      familyPreview.innerHTML = `<strong>Compatibilité famille : ${p.familyFit.score}/5</strong><span>${p.familyFit.verdict}</span><em class="commute ${commute.level}">${commute.label}</em><small>${commute.text}</small>`;
    }
    const budget = projectBudget(p), budgetBox = node.querySelector(".budget-summary");
    const energyText = budget.energy
      ? `<span><b>${money.format(budget.energy.monthly)}/mois</b><small>énergie moyenne · ${money.format(p.energyCost.min)}–${money.format(p.energyCost.max)}/an</small></span>`
      : `<span><b>Énergie non communiquée</b><small>non ajoutée au total mensuel</small></span>`;
    budgetBox.innerHTML = `<div><span><b>${money.format(budget.mortgage)}/mois</b><small>crédit estimé hors assurance</small></span>${energyText}<span class="budget-total"><b>${money.format(budget.knownMonthly)}/mois</b><small>total connu</small></span></div><p>Projet : <strong>${money.format(budget.project)}</strong>${budget.extraCar ? ` · voiture ${money.format(budget.extraCar)} incluse` : ""}</p>`;
    const listingLinks = node.querySelector(".listing-links");
    listingLinks.innerHTML = `<strong>${offers.length} annonce${offers.length > 1 ? "s" : ""} pour cette maison</strong><div>${offers.map(offer => `<a href="${offer.url}" target="_blank" rel="noopener" class="${offer.price === lowestPrice ? "best-offer" : ""}"><span>${offer.source}</span><b>${offer.price ? money.format(offer.price) : "Prix non indiqué"}</b>${offer.price === lowestPrice && offers.some(other => (other.price ?? Infinity) > lowestPrice) ? "<em>Meilleur prix</em>" : ""}</a>`).join("")}</div>`;
    const updates = node.querySelector(".updates");
    if (p.updates?.length) {
      updates.hidden = false;
      updates.querySelector("ul").innerHTML = p.updates.map(update => `<li><time>${update.date}</time><span>${update.text}</span></li>`).join("");
    }
    const map = node.querySelector(".map");
    const mapQuery = p.mapQuery || p.address;
    if (mapQuery) {
      const encodedMapQuery = encodeURIComponent(mapQuery);
      map.hidden = false;
      map.querySelector("iframe").src = `https://www.google.com/maps?q=${encodedMapQuery}&output=embed`;
      map.querySelector("iframe").title = `Carte — ${p.title}`;
      map.querySelector(".map-label").textContent = p.mapLabel || (p.address ? "Adresse connue" : mapQuery);
      map.querySelector(".map-link").href = p.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
    }
    const heart = node.querySelector(".heart"); heart.textContent = state.favorite ? "♥" : "♡"; heart.classList.toggle("liked", !!state.favorite); heart.onclick = () => persist(p.id, { favorite: !state.favorite });
    const status = node.querySelector(".status"); status.value = state.status || p.defaultStatus || "new"; status.onchange = e => persist(p.id, { status: e.target.value });
    const note = node.querySelector("textarea"); note.value = state.note || ""; note.onchange = e => persist(p.id, { note: e.target.value });
    const link = node.querySelector(".primary"); link.href = offers[0].url; link.textContent = offers.length > 1 ? "Voir les annonces ↑" : "Voir l’annonce ↗"; if (offers.length > 1) link.onclick = e => { e.preventDefault(); listingLinks.scrollIntoView({ behavior: "smooth", block: "center" }); };
    node.querySelector(".details-link").href = `detail.html?id=${encodeURIComponent(p.id)}`;
    node.querySelector(".copy").onclick = async e => { await navigator.clipboard.writeText(`${p.title} — ${p.location}\n${money.format(lowestPrice)} · ${p.surface} m² · ${p.bedrooms} chambres · DPE ${p.dpe}\n${offers.map(offer => `${offer.source}: ${offer.url}`).join("\n")}`); e.target.textContent = "Résumé copié ✓"; };
    cards.appendChild(node);
  });
  if (!items.length) cards.innerHTML = `<p class="empty">Aucun bien ne correspond à ce filtre.</p>`;
}
document.querySelector("#search").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); render(); });
document.querySelector("#city-filter").addEventListener("change", e => { cityFilter = e.target.value; render(); });
document.querySelector("#sort").addEventListener("change", e => { sortMode = e.target.value; render(); });
document.querySelector("#reset-filters").onclick = () => {
  query = ""; cityFilter = "all"; sortMode = "added-desc"; filter = "all";
  document.querySelector("#search").value = "";
  document.querySelector("#city-filter").value = "all";
  document.querySelector("#sort").value = "added-desc";
  document.querySelector("[data-filter].active").classList.remove("active");
  document.querySelector("[data-filter='all']").classList.add("active");
  render();
};
document.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => { document.querySelector("[data-filter].active").classList.remove("active"); b.classList.add("active"); filter = b.dataset.filter; render(); });
document.querySelector(".lightbox-close").onclick = closeLightbox;
document.querySelector(".lightbox-prev").onclick = () => showLightbox(lightboxIndex - 1);
document.querySelector(".lightbox-next").onclick = () => showLightbox(lightboxIndex + 1);
document.querySelector("#lightbox").onclick = e => {
  if (e.target.id === "lightbox") closeLightbox();
  if (e.target.tagName === "IMG") showLightbox(lightboxIndex + 1);
};
document.addEventListener("keydown", e => {
  if (!document.querySelector("#lightbox").classList.contains("is-open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showLightbox(lightboxIndex - 1);
  if (e.key === "ArrowRight") showLightbox(lightboxIndex + 1);
});
populateCityFilter();
function setupBudgetPlanner() {
  const fields = { down: "budget-down", years: "budget-years", rate: "budget-rate", notary: "budget-notary", car: "budget-car", carEnabled: "budget-car-enabled" };
  Object.entries(fields).forEach(([key, id]) => {
    const input = document.querySelector(`#${id}`);
    if (input.type === "checkbox") input.checked = Boolean(budgetSettings[key]); else input.value = budgetSettings[key];
    input.addEventListener("input", () => {
      budgetSettings[key] = input.type === "checkbox" ? input.checked : Number(input.value);
      localStorage.setItem("immo-budget-settings", JSON.stringify(budgetSettings));
      render();
    });
  });
}
setupBudgetPlanner();
render();
