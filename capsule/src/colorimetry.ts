import type { ColorProfile, Garment, Wardrobe } from "./model";

export const emptyProfile: ColorProfile = {
  name: "",
  undertone: "",
  contrast: "",
  palette: [],
  avoid: [],
  notes: "",
  enabled: false,
};
export const historicalProfiles: ColorProfile[] = [
  {
    ...emptyProfile,
    name: "Automne profond — Capsule",
    palette: [
      ["Rouille", "#9E4624"],
      ["Sapin", "#254E38"],
      ["Chocolat", "#4B3621"],
      ["Ocre", "#D4A017"],
      ["Grenat", "#76232F"],
      ["Marine", "#1B263B"],
      ["Camel", "#B87333"],
      ["Écru", "#FDFBF7"],
    ].map(([label, hex]) => ({ label, hex })),
    notes:
      "Palette retrouvée dans Capsule index.html. À confirmer selon vos préférences.",
  },
  {
    ...emptyProfile,
    name: "Deep Winter doux — démo dashboard",
    undertone: "neutre-froid",
    contrast: "moyen à fort",
    palette: [
      "#6b4c7d",
      "#b98cbf",
      "#f3e8f1",
      "#2f5d63",
      "#c8d8e4",
      "#efe8dc",
    ].map((hex) => ({ label: hex, hex })),
    avoid: ["orange vif", "jaune moutarde", "beige trop chaud", "néon"],
    notes: "Profil de démonstration du dashboard, pas un diagnostic personnel.",
  },
];
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export function colorAdvice(g: Garment, data: Wardrobe) {
  const p = data.preferences.colorProfile;
  const nearFace = ["top", "dress", "outerwear"].includes(g.role);
  if (!p?.enabled || !p.palette.length)
    return {
      score: null,
      coverage: 0,
      nearFace,
      text: "Choisissez et activez votre palette dans Colorimétrie pour personnaliser les conseils.",
      matches: [] as string[],
    };
  const colors = [...new Set([...g.colors, ...g.secondaryColors])];
  const known = colors
    .map((id) =>
      data.vocabularies.colors.find(
        (c) => c.id === id || normalize(c.label) === normalize(id),
      ),
    )
    .filter((c) => !!c);
  if (!known.length)
    return {
      score: null,
      coverage: 0,
      nearFace,
      text: "Couleurs non renseignées ou absentes du nuancier : accord non évalué.",
      matches: [] as string[],
    };
  const results = known.map((c) => {
    const nearest = p.palette
      .map((s) => ({
        ...s,
        distance: Math.sqrt(
          rgb(c.hex).reduce((sum, v, i) => sum + (v - rgb(s.hex)[i]) ** 2, 0),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    const avoid = p.avoid.some((s) =>
      [c.id, c.label].some((v) => normalize(v) === normalize(s)),
    );
    return {
      score: avoid
        ? 0
        : Math.max(0, Math.round(100 - (nearest.distance / 441.673) * 100)),
      label: nearest.label,
    };
  });
  const score = Math.round(
    results.reduce((s, r) => s + r.score, 0) / results.length,
  );
  const coverage = Math.round((known.length / colors.length) * 100);
  return {
    score,
    coverage,
    nearFace,
    matches: [...new Set(results.map((r) => r.label))],
    text: `${score >= 80 ? "Couleurs proches de votre palette." : "Couleurs à essayer avec votre palette."} ${nearFace ? "Près du visage, comparez la teinte réelle en lumière naturelle." : "Cette pièce est généralement éloignée du visage : gardez surtout votre liberté d’association."}${coverage < 100 ? " Certaines couleurs restent non évaluées." : ""}${g.reviewNeeded ? " Les attributs importés de cette pièce restent à vérifier." : ""}`,
  };
}
