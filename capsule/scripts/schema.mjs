import fs from "node:fs";
const string = { type: "string", maxLength: 50000 };
const id = { type: "string", minLength: 1, maxLength: 200 };
const strings = { type: "array", items: string, maxItems: 10000 };
const boolean = { type: "boolean" };
const number = { type: "number", minimum: 0 };
const optionalNumber = { type: ["number", "null"], minimum: 0 };
const object = (properties, required = Object.keys(properties)) => ({
  type: "object",
  properties,
  required,
  additionalProperties: true,
});
const role = {
  enum: [
    "top",
    "bottom",
    "dress",
    "outerwear",
    "shoes",
    "bag",
    "accessory",
    "hosiery",
  ],
};
const temperature = {
  anyOf: [
    { type: "null" },
    {
      type: "array",
      prefixItems: [
        { type: "number", minimum: -60, maximum: 65 },
        { type: "number", minimum: -60, maximum: 65 },
      ],
      minItems: 2,
      maxItems: 2,
    },
  ],
};
const imagePath = {
  type: "string",
  maxLength: 7340032,
  description:
    "Chemin relatif images/… ou data URI raster. Les URL distantes, SVG et traversées de répertoires sont refusées par le validateur applicatif.",
};
const garment = object({
  id,
  name: { ...string, minLength: 1 },
  brand: string,
  category: id,
  subcategory: string,
  role,
  colors: strings,
  secondaryColors: strings,
  pattern: string,
  material: string,
  fit: string,
  silhouette: string,
  length: string,
  sleeve: string,
  neckline: string,
  details: strings,
  warmth: { type: ["number", "null"], minimum: 1, maximum: 5 },
  seasons: strings,
  temperature,
  styles: strings,
  formality: optionalNumber,
  occasions: strings,
  layeringRole: string,
  imagePath,
  notes: string,
  favorite: boolean,
  status: { enum: ["owned", "wishlist"] },
  archived: boolean,
  forSale: boolean,
  usageCount: { type: "integer", minimum: 0 },
  lastWorn: { type: ["string", "null"], format: "date" },
  price: optionalNumber,
  reviewNeeded: boolean,
});
const outfit = object({
  id,
  name: string,
  itemIds: strings,
  styles: strings,
  occasions: strings,
  seasons: strings,
  temperature,
  rating: { type: ["number", "null"], minimum: 0, maximum: 5 },
  notes: string,
  imagePath,
  source: { enum: ["manual", "generated", "inspiration"] },
  createdAt: string,
});
const recipe = object({
  id,
  label: string,
  role,
  colors: strings,
  styles: strings,
  details: strings,
});
const inspiration = object({
  id,
  title: string,
  imagePath,
  description: string,
  styles: strings,
  palette: strings,
  recipe: { type: "array", items: { $ref: "#/$defs/recipe" }, maxItems: 40 },
  notes: string,
});
const wishlist = object({
  id,
  garmentId: id,
  priority: { enum: ["low", "medium", "high"] },
  notes: string,
  budget: optionalNumber,
});
const board = object({
  id,
  title: string,
  itemIds: strings,
  notes: string,
  styles: strings,
  kind: string,
});
const wearEvent = object(
  {
    id,
    date: { type: "string", format: "date" },
    itemIds: strings,
    outfitId: id,
  },
  ["id", "date", "itemIds"],
);
const vocabularies = object({
  categories: {
    type: "array",
    minItems: 1,
    items: object({ id, label: string, role }),
  },
  styles: { ...strings, minItems: 1 },
  colors: {
    type: "array",
    items: object({
      id,
      label: string,
      hex: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
      neutral: boolean,
    }),
  },
  occasions: { ...strings, minItems: 1 },
  seasons: { ...strings, minItems: 1 },
  formalityLevels: { ...strings, minItems: 1 },
});
const preferences = object({
  name: string,
  temperature: { type: "number", minimum: -60, maximum: 65 },
  occasion: string,
  style: string,
  currency: { enum: ["EUR", "USD", "GBP", "CHF", "CAD", "JPY"] },
});
const collections = {
  garments: "garment",
  outfits: "outfit",
  wishlist: "wishlist",
  inspirations: "inspiration",
  boards: "board",
  wearEvents: "wearEvent",
};
const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Atelier Wardrobe v1",
  description:
    "Les références d’IDs, doublons, chemins d’images et plages de températures sont également contrôlés par src/storage.ts.",
  ...object({
    schemaVersion: { const: 1 },
    ...Object.fromEntries(
      Object.entries(collections).map(([key, value]) => [
        key,
        { type: "array", maxItems: 10000, items: { $ref: `#/$defs/${value}` } },
      ]),
    ),
    vocabularies: { $ref: "#/$defs/vocabularies" },
    preferences: { $ref: "#/$defs/preferences" },
    legacy: { type: "object" },
  }),
  $defs: {
    garment,
    outfit,
    recipe,
    inspiration,
    wishlist,
    board,
    wearEvent,
    vocabularies,
    preferences,
  },
};
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/wardrobe.schema.json", JSON.stringify(schema, null, 2));
const seed = JSON.parse(fs.readFileSync("public/data/wardrobe.json", "utf8"));
const blank = structuredClone(seed.garments.find((g) => g.category === "Haut"));
Object.assign(blank, {
  id: "example-collar-blouse",
  name: "Blouse crème à col Claudine",
  brand: "",
  colors: ["cream"],
  secondaryColors: [],
  pattern: "Uni",
  material: "Coton",
  fit: "Droite",
  silhouette: "Droite",
  length: "Hanches",
  sleeve: "Longues",
  neckline: "Col Claudine",
  details: ["Col Claudine"],
  warmth: 2,
  seasons: ["Printemps", "Automne"],
  temperature: [12, 23],
  styles: ["Preppy", "Romantique", "French chic"],
  formality: 1,
  occasions: ["Quotidien", "Travail"],
  imagePath: "",
  notes: "Exemple de pièce candidate : ajoutez votre propre photo.",
  status: "wishlist",
  reviewNeeded: false,
});
delete blank.legacy;
fs.mkdirSync("examples", { recursive: true });
fs.writeFileSync(
  "examples/blouse-col-claudine.json",
  JSON.stringify({ kind: "garments", garments: [blank] }, null, 2),
);
for (const key of Object.keys(collections)) seed[key] = [];
seed.legacy = {};
fs.writeFileSync("examples/wardrobe-empty.json", JSON.stringify(seed, null, 2));
console.log("Schéma et exemples JSON générés.");
