import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const source =
  process.argv[2] || "C:/Users/dyama/Documents/GitHub/alg77/maths-info/test";
const capsule = path.join(source, "capsule");
const html = fs.readFileSync(path.join(capsule, "index.html"), "utf8");
// Only evaluated at migration time against these known, locally inspected source files.
function extract(text, name) {
  const start = text.indexOf(`const ${name} =`);
  if (start < 0) return [];
  const end = text.indexOf("\n    ];", start);
  return vm.runInNewContext(
    text.slice(start, end + 7) + `; JSON.parse(JSON.stringify(${name}))`,
    {},
    { timeout: 1000 },
  );
}
const wardrobe = extract(html, "wardrobe");
const v62 = fs.readFileSync(
  path.join(capsule, "gemini_capsule_v62.html"),
  "utf8",
);
const modern = extract(v62, "wardrobe");
const styles = [
  "Preppy",
  "Romantique",
  "French chic",
  "Décontracté",
  "Smart casual",
  "Minimaliste",
  "Cottagecore",
  "Workwear",
  "Professor chic",
];
const colors = [
  { id: "cream", label: "Écru", hex: "#eee6d2", neutral: true },
  { id: "white", label: "Blanc", hex: "#ffffff", neutral: true },
  { id: "navy", label: "Marine", hex: "#28344e", neutral: true },
  { id: "black", label: "Noir", hex: "#282725", neutral: true },
  { id: "camel", label: "Camel", hex: "#ba8957", neutral: true },
  { id: "brown", label: "Chocolat", hex: "#624237", neutral: true },
  { id: "taupe", label: "Taupe", hex: "#998b7c", neutral: true },
  { id: "burgundy", label: "Bordeaux", hex: "#773c4c", neutral: false },
  { id: "green", label: "Vert", hex: "#536952", neutral: false },
  { id: "pink", label: "Rose", hex: "#d5a9ac", neutral: false },
  { id: "blue", label: "Bleu", hex: "#6e8ca5", neutral: false },
  { id: "ochre", label: "Ocre", hex: "#b79346", neutral: false },
  { id: "rust", label: "Terracotta", hex: "#ac6048", neutral: false },
  { id: "purple", label: "Prune", hex: "#745569", neutral: false },
];
function infer(it) {
  const n = it.name.toLowerCase();
  const cs = [
    [/écru|beige/, "cream"],
    [/blanc/, "white"],
    [/marine/, "navy"],
    [/noir/, "black"],
    [/camel|caramel/, "camel"],
    [/choco|moka|marron/, "brown"],
    [/taupe/, "taupe"],
    [/bordeaux|grenat|rouge/, "burgundy"],
    [/vert|kaki|pistache/, "green"],
    [/rose|blush|boug/, "pink"],
    [/bleu/, "blue"],
    [/ocre|miel/, "ochre"],
    [/terracotta|épice|écureuil/, "rust"],
    [/raisin|prune|violet/, "purple"],
  ]
    .filter(([r]) => r.test(n))
    .map(([, c]) => c);
  const tags = /dentelle|guipure|fleurs|crochet/.test(n)
    ? ["Romantique", "French chic"]
    : /pliss|carreaux|chemise/.test(n)
      ? ["Preppy", "Smart casual"]
      : /jean/.test(n)
        ? ["Décontracté", "Minimaliste"]
        : ["Smart casual"];
  return {
    colors: cs,
    styles: tags,
    pattern: /fleurs/.test(n)
      ? "Fleuri"
      : /ray/.test(n)
        ? "Rayures"
        : /carreaux/.test(n)
          ? "Carreaux"
          : "",
    details: /dentelle|guipure/.test(n) ? ["Dentelle"] : [],
    reviewNeeded: true,
  };
}
const roles = {
  Veste: "outerwear",
  Maille: "top",
  Haut: "top",
  Bas: "bottom",
  Robe: "dress",
  Chaussures: "shoes",
  Accessoire: "accessory",
};
const categories = Object.entries(roles).map(([label, role]) => ({
  id: label,
  label,
  role,
}));
const garments = wardrobe.map((it) => ({
  id: it.id,
  name: it.name,
  brand: "",
  category: it.category,
  subcategory: "",
  role: roles[it.category],
  secondaryColors: [],
  material: "",
  fit: "",
  silhouette: "",
  length: "",
  sleeve: "",
  neckline: "",
  warmth: null,
  seasons: [],
  temperature: null,
  formality: null,
  occasions: [],
  layeringRole:
    it.category === "Maille"
      ? "mid"
      : it.category === "Veste"
        ? "outer"
        : "base",
  imagePath: `images/${it.img}`,
  notes: it.reason || "",
  favorite: false,
  status: it.wishlist ? "wishlist" : "owned",
  archived: false,
  forSale: !!it.sell,
  usageCount: 0,
  lastWorn: null,
  price: null,
  ...infer(it),
  legacy: { source: "capsule/index.html", original: it },
}));
const outfits = [
  "looksReal",
  "looksWork",
  "looksLayering",
  "looksWeekend",
  "looksEvening",
].flatMap((group, gi) =>
  extract(html, group).map((look, i) => ({
    id: `capsule-${gi}-${i}`,
    name: look.title,
    itemIds: look.items,
    styles: [],
    occasions:
      gi === 1
        ? ["Travail"]
        : gi === 3
          ? ["Quotidien"]
          : gi === 4
            ? ["Soirée"]
            : [],
    seasons: [],
    temperature: null,
    rating: null,
    notes: look.comment,
    imagePath: "",
    source: "manual",
    createdAt: "",
    legacy: { group },
  })),
);
const data = {
  schemaVersion: 1,
  garments,
  outfits,
  wishlist: garments
    .filter((g) => g.status === "wishlist")
    .map((g) => ({
      id: `wish-${g.id}`,
      garmentId: g.id,
      priority: "medium",
      notes: "",
      budget: null,
    })),
  inspirations: [],
  boards: [],
  wearEvents: [],
  vocabularies: {
    categories,
    styles,
    colors,
    occasions: [
      "Quotidien",
      "Travail",
      "Week-end",
      "Soirée",
      "Cérémonie",
      "Voyage",
    ],
    seasons: ["Printemps", "Été", "Automne", "Hiver"],
    formalityLevels: ["Décontracté", "Soigné", "Habillé", "Formel"],
  },
  preferences: {
    name: "",
    temperature: 18,
    occasion: "Quotidien",
    style: "",
    currency: "EUR",
  },
  legacy: {
    migration: { source: "capsule/index.html", count: garments.length },
    capsuleV62: {
      garments: modern,
      outfits: extract(v62, "allLooks"),
      weeklyPlan: extract(v62, "weeklyPlan"),
    },
  },
};
fs.mkdirSync("public/data", { recursive: true });
fs.mkdirSync("migration", { recursive: true });
fs.cpSync(path.join(capsule, "images"), "public/images", { recursive: true });
fs.writeFileSync("public/data/wardrobe.json", JSON.stringify(data, null, 2));
const dashboard = fs.readFileSync(
  path.join(
    source,
    "dressing_beauty_dashboard/dressing_beauty_dashboard/app.js",
  ),
  "utf8",
);
fs.writeFileSync("migration/dashboard-original.js", dashboard);
fs.writeFileSync("migration/capsule-original.html", html);
fs.writeFileSync("migration/capsule-v62-original.html", v62);
const missing = garments
  .filter((g) => !fs.existsSync("public/" + g.imagePath))
  .map((g) => g.id);
fs.writeFileSync(
  "migration/report.json",
  JSON.stringify(
    {
      items: garments.length,
      outfits: outfits.length,
      missingImages: missing,
      v62Items: modern.length,
      conflictingIds: modern
        .filter((g) =>
          wardrobe.some(
            (o) => o.id === g.id && JSON.stringify(o) !== JSON.stringify(g),
          ),
        )
        .map((g) => g.id),
      note: "v62 conservée dans legacy, non fusionnée. Stockage navigateur non récupéré.",
    },
    null,
    2,
  ),
);
console.log(
  `Migration : ${garments.length} pièces, ${outfits.length} looks, ${modern.length} pièces v62 préservées, ${missing.length} images manquantes.`,
);
