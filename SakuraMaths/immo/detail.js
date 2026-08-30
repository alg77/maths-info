const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const id = new URLSearchParams(location.search).get("id");
const property = PROPERTIES.find(p => p.id === id) || PROPERTIES[0];
const card = document.querySelector("#detail-card");
const cityOf = p => {
  if (p.city) return p.city;
  const location = p.location || "";
  const knownCities = ["Lagny-sur-Marne", "Saint-Thibault-des-Vignes", "Thorigny-sur-Marne", "Dampmart", "Couilly-Pont-aux-Dames", "Pomponne", "Conches-sur-Gondoire"];
  return knownCities.find(city => location.toLocaleLowerCase("fr").includes(city.toLocaleLowerCase("fr")))
    || location.split(/\s*(?:·|•|\||—)\s*/)[0].trim();
};
function commuteFit(p) {
  if (p.commute) return p.commute;
  const city = cityOf(p);
  return {
    "Lagny-sur-Marne": { level: "excellent", label: "Très fort potentiel quotidien", text: "Si Saint-Laurent est faisable à pied, c’est un énorme bonus. Votre référence actuelle est très dure à battre : 7 min à pied du collège et 3 min à pied de la maternelle." },
    "Saint-Thibault-des-Vignes": { level: "good", label: "Équilibre Lagny / Chelles", text: "Bon compromis géographique : Lagny reste proche pour école/collège, et Chelles paraît moins pénalisant que depuis les communes plus à l’est." },
    "Thorigny-sur-Marne": { level: "good", label: "Très cohérent côté Lagny", text: "Pratique pour Saint-Laurent et Saint-Joseph. Le trajet vers GGSB Chelles doit être testé en conditions matin/soir." },
    "Dampmart": { level: "medium", label: "Lagny facile, Chelles à surveiller", text: "Intéressant pour les trajets vers Lagny. Pour GGSB Chelles, il faudra vérifier le temps réel aux heures de pointe." },
    "Couilly-Pont-aux-Dames": { level: "watch", label: "À chronométrer sérieusement", text: "Cadre séduisant, mais plus éloigné de vos trois repères. À tester avant de s’emballer, surtout le matin." }
  }[city] || { level: "medium", label: "À vérifier", text: "À comparer avec les trajets vers Saint-Laurent, Saint-Joseph et GGSB Chelles." };
}

document.title = `${property.title} · Mon radar immo`;
document.querySelector("#detail-title").textContent = property.title;
document.querySelector("#detail-location").textContent = property.location;

const photos = property.images || [];
const mapQuery = property.mapQuery || property.address;
const encodedMapQuery = mapQuery ? encodeURIComponent(mapQuery) : "";
const fullDescription = property.fullDescription || [property.description];
const fit = property.familyFit || { score: "?", verdict: "Analyse à compléter.", pros: [], cons: [], criteria: [] };
const commute = commuteFit(property);
const listings = property.listings?.length ? property.listings : [{ source: property.source, url: property.url, price: property.price }];
const purchasePrice = Math.min(...listings.map(item => item.price ?? property.price));
const budgetDefaults = { down: 0, years: 25, rate: 3.5, notary: 8, car: 10000, carEnabled: true };
const budgetSettings = { ...budgetDefaults, ...JSON.parse(localStorage.getItem("immo-budget-settings") || "{}") };
const energy = property.energyCost?.min && property.energyCost?.max ? { annual: (property.energyCost.min + property.energyCost.max) / 2, monthly: (property.energyCost.min + property.energyCost.max) / 24 } : null;
const extraCar = budgetSettings.carEnabled && cityOf(property) !== "Lagny-sur-Marne" ? Number(budgetSettings.car) : 0;
const fees = purchasePrice * Number(budgetSettings.notary) / 100;
const projectCost = purchasePrice + fees + extraCar;
const principal = Math.max(0, projectCost - Number(budgetSettings.down));
const months = Math.max(1, Number(budgetSettings.years) * 12);
const monthlyRate = Number(budgetSettings.rate) / 100 / 12;
const mortgage = monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
const knownMonthly = mortgage + (energy?.monthly || 0);

card.innerHTML = `
  <section class="detail-grid">
    <div class="detail-photos">
      ${photos.length ? `<img src="${photos[0]}" alt="${property.title} — photo principale">` : `<div class="placeholder"><span>⌂</span><small>Photos à ajouter</small></div>`}
    </div>
    <aside class="detail-side">
      <div class="detail-price">${listings.length > 1 ? "Dès " : ""}${money.format(purchasePrice)}</div>
      <div class="facts">
        <span><b>${property.surface}</b> m²</span>
        <span><b>${property.rooms}</b> pièces</span>
        <span><b>${property.mainBedrooms ?? property.bedrooms}</b> ch. maison${property.outbuildingBedrooms ? ` + ${property.outbuildingBedrooms} dépendance` : ""}</span>
        <span><b>${property.land.toLocaleString("fr-FR")}</b> m² terrain</span>
        <span><b>${money.format(purchasePrice / property.surface)}</b>/m²</span>
        <span class="energy dpe energy-${String(property.dpe).toLowerCase()}">DPE ${property.dpe}</span>
        <span class="energy ges energy-${String(property.ges).toLowerCase()}">GES ${property.ges}</span>
      </div>
      <div class="detail-actions">
        <a class="primary" href="#annonces">Voir ${listings.length > 1 ? "les annonces" : "l’annonce"}</a>
        ${property.videoUrl ? `<a class="map-link" href="${property.videoUrl}" target="_blank" rel="noopener">Voir la visite vidéo ▶</a>` : ""}
        ${mapQuery ? `<a class="map-link" href="${property.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`}" target="_blank" rel="noopener">Ouvrir Maps ↗</a>` : ""}
      </div>
    </aside>
  </section>

  <section class="detail-section detail-listings" id="annonces">
    <h2>${listings.length > 1 ? `${listings.length} annonces trouvées pour cette maison` : "Annonce de cette maison"}</h2>
    <p>Le budget utilise automatiquement le prix le plus bas actuellement renseigné.</p>
    <div class="listing-links"><div>${listings.map(offer => `<a href="${offer.url}" target="_blank" rel="noopener" class="${offer.price === purchasePrice ? "best-offer" : ""}"><span>${offer.source}</span><b>${offer.price ? money.format(offer.price) : "Prix non indiqué"}</b>${offer.price === purchasePrice && listings.some(other => (other.price ?? Infinity) > purchasePrice) ? "<em>Meilleur prix</em>" : ""}</a>`).join("")}</div></div>
  </section>

  <section class="detail-section detail-budget">
    <div><p class="eyebrow">COÛT RÉEL</p><h2>Budget complet estimé</h2><p>Hypothèses enregistrées sur le radar : apport ${money.format(budgetSettings.down)}, ${budgetSettings.years} ans à ${budgetSettings.rate} %, frais ${budgetSettings.notary} %.</p></div>
    <div class="budget-lines">
      <span>Meilleur prix affiché <b>${money.format(purchasePrice)}</b></span>
      <span>Frais d’acquisition estimés <b>${money.format(fees)}</b></span>
      <span>Deuxième voiture <b>${extraCar ? money.format(extraCar) : "non ajoutée"}</b></span>
      <span>Montant du projet <b>${money.format(projectCost)}</b></span>
      <span>Crédit hors assurance <b>${money.format(mortgage)}/mois</b></span>
      <span>Énergie moyenne <b>${energy ? `${money.format(energy.monthly)}/mois` : "non communiquée"}</b></span>
      ${energy ? `<small>Fourchette annoncée : ${money.format(property.energyCost.min)}–${money.format(property.energyCost.max)}/an${property.energyCost.reference ? ` · ${property.energyCost.reference}` : ""}</small>` : `<small>L’énergie n’est pas ajoutée au total tant que l’annonce ne donne pas de fourchette.</small>`}
      <strong>Total mensuel connu : ${money.format(knownMonthly)}/mois</strong>
      <a href="index.html#budget-title">Modifier les hypothèses sur le radar</a>
    </div>
  </section>

  <section class="detail-section">
    <h2>Descriptif complet reformulé</h2>
    ${fullDescription.map(paragraph => `<p>${paragraph}</p>`).join("")}
  </section>

  <section class="detail-section fit-section">
    <div>
      <h2>Verdict famille</h2>
      <p class="fit-score">${fit.score}/5</p>
      <p>${fit.verdict}</p>
    </div>
    <div class="criteria-list">
      ${(fit.criteria || []).map(item => `<span>${item}</span>`).join("")}
    </div>
  </section>

  <section class="detail-section scoring-detail">
    <h2>Critères de notation</h2>
    <div class="detail-tags">
      <span>25% travail / écoles</span>
      <span>20% chambres & enfants</span>
      <span>20% stockage & collections</span>
      <span>15% extérieur & Shiba</span>
      <span>10% sport / dojo</span>
      <span>10% énergie & travaux</span>
    </div>
  </section>

  <section class="detail-section commute-detail">
    <h2>Praticité travail / écoles</h2>
    <strong class="commute ${commute.level}">${commute.label}</strong>
    <p>${commute.text}</p>
    ${commute.links?.length ? `<div class="detail-actions">${commute.links.map(link => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`).join("")}</div>` : ""}
    <ul>
      <li>Toi : collège-lycée Saint-Laurent à Lagny.</li>
      <li>Grande : collège à Saint-Laurent, Lagny.</li>
      <li>Petite : Saint-Joseph, Lagny.</li>
      <li>Mari : collège GGSB à Chelles.</li>
    </ul>
  </section>

  <section class="pros-cons">
    <article>
      <h2>Les + pour vous</h2>
      <ul>${(fit.pros || []).map(item => `<li>${item}</li>`).join("")}</ul>
    </article>
    <article>
      <h2>Les – / à vérifier</h2>
      <ul>${(fit.cons || []).map(item => `<li>${item}</li>`).join("")}</ul>
    </article>
  </section>

  <section class="detail-section">
    <h2>Critères importants</h2>
    <div class="detail-tags">
      <span>Ville : ${cityOf(property)}</span>
      <span>Sources : ${listings.map(item => item.source).join(" · ")}</span>
      <span>Année : ${property.year || "à compléter"}</span>
      ${(property.tags || []).map(tag => `<span>${tag}</span>`).join("")}
    </div>
  </section>

  ${(property.updates || []).length ? `
    <section class="detail-section updates">
      <h2>Historique</h2>
      <ul>${property.updates.map(update => `<li><time>${update.date}</time><span>${update.text}</span></li>`).join("")}</ul>
    </section>
  ` : ""}
`;
