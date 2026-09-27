import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { type Wardrobe, type Garment, blankGarment } from "../src/model";
import {
  pair,
  enumerate,
  recommend,
  analyzeWish,
  matchRecipe,
  assess,
  missingRoles,
  insights,
} from "../src/engine";
import { validate, prepareImport, safeImage } from "../src/storage";
const source = JSON.parse(
  fs.readFileSync("public/data/wardrobe.json", "utf8"),
) as Wardrobe;
function fixture() {
  const d = structuredClone(source);
  d.garments = [];
  d.outfits = [];
  d.wishlist = [];
  d.boards = [];
  d.inspirations = [];
  d.wearEvents = [];
  d.legacy = {};
  return d;
}
function garment(
  d: Wardrobe,
  id: string,
  role: Garment["role"],
  status: Garment["status"] = "owned",
) {
  const category = d.vocabularies.categories.find((c) => c.role === role)!;
  const g: Garment = {
    ...blankGarment(category, status),
    id,
    name: id,
    colors: ["cream"],
    styles: ["Preppy"],
    pattern: "Uni",
    formality: 1,
    seasons: ["Automne"],
    temperature: [10, 22] as [number, number],
    occasions: ["Travail"],
    material: "Coton",
    silhouette: "Droite",
  };
  d.garments.push(g);
  return g;
}
test("migration preserves original inventory, all look references and local images", () => {
  validate(source);
  assert.equal(source.garments.length, 54);
  assert.equal(source.outfits.length, 39);
  for (const g of source.garments)
    assert.ok(fs.existsSync("public/" + g.imagePath));
});
test("empty and incomplete closets never invent shoes", () => {
  const d = fixture();
  assert.deepEqual(recommend(d, {}), []);
  garment(d, "top", "top");
  garment(d, "bottom", "bottom");
  assert.equal(enumerate(d).outfits.length, 0);
  assert.deepEqual(missingRoles(d.garments), ["shoes"]);
});
test("dress + shoes is complete and suggestions never use wishlist/archive/sale", () => {
  const d = fixture();
  garment(d, "dress", "dress");
  garment(d, "shoe", "shoes");
  garment(d, "wish", "top", "wishlist");
  const old = garment(d, "old", "dress");
  old.archived = true;
  const sale = garment(d, "sale", "dress");
  sale.forSale = true;
  const out = enumerate(d).outfits;
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].itemIds, ["dress", "shoe"]);
  assert.equal(enumerate(d, { mandatory: "wish" }).outfits.length, 0);
});
test("three unique alternatives at most and mandatory garment honored", () => {
  const d = fixture();
  for (let i = 0; i < 4; i++) garment(d, "top" + i, "top");
  garment(d, "b", "bottom");
  garment(d, "s", "shoes");
  const out = recommend(d, { mandatory: "s" });
  assert.equal(out.length, 3);
  assert.equal(
    new Set(out.map((o) => o.itemIds.slice().sort().join())).size,
    3,
  );
  assert.ok(out.every((o) => o.itemIds.includes("s")));
});
test("wishlist only counts complete new looks using that candidate", () => {
  const d = fixture();
  garment(d, "b", "bottom");
  garment(d, "s", "shoes");
  const wish = garment(d, "collar", "top", "wishlist");
  const result = analyzeWish(wish, d);
  assert.equal(result.outfitCount, 1);
  assert.equal(result.cascade, false);
  assert.ok(result.outfits.every((o) => o.itemIds.includes("collar")));
  d.garments = d.garments.filter((g) => g.id !== "s");
  const missing = analyzeWish(wish, d);
  assert.equal(missing.outfitCount, 0);
  assert.equal(missing.cascade, true);
  assert.ok(missing.missing.includes("shoes"));
});
test("score explains information gaps and temperature mismatches", () => {
  const d = fixture();
  const a = garment(d, "top", "top"),
    b = garment(d, "bottom", "bottom");
  assert.ok(pair(a, b, d).reasons.length);
  const known = pair(a, b, d).confidence;
  a.colors = [];
  a.styles = [];
  a.pattern = "";
  a.temperature = null;
  assert.ok(pair(a, b, d).confidence < known);
  assert.ok(
    assess([a, b], d, { temperature: 40 }).warnings.some((w) =>
      w.includes("température"),
    ),
  );
});
test("inspiration cannot reuse one garment for two recipe slots", () => {
  const d = fixture();
  garment(d, "top", "top");
  const r = {
    id: "r",
    title: "Recipe",
    imagePath: "",
    description: "",
    notes: "",
    styles: [],
    palette: [],
    recipe: [
      {
        id: "1",
        label: "one",
        role: "top" as const,
        colors: [],
        styles: [],
        details: [],
      },
      {
        id: "2",
        label: "two",
        role: "top" as const,
        colors: [],
        styles: [],
        details: [],
      },
    ],
  };
  const result = matchRecipe(r, d);
  assert.equal(result.matches.filter((m) => m.best).length, 1);
  assert.equal(result.score, 50);
});
test("import rejects broken references, duplicate IDs and invalid values", () => {
  const duplicate = structuredClone(source);
  duplicate.garments.push(duplicate.garments[0]);
  assert.throws(() => validate(duplicate), /double/);
  const invalid = structuredClone(source);
  invalid.outfits[0].itemIds = ["does-not-exist"];
  assert.throws(() => validate(invalid), /Référence/);
  const corrupt = structuredClone(source);
  corrupt.garments[0].usageCount = -5;
  assert.throws(() => validate(corrupt));
  assert.throws(() => validate({ schemaVersion: 2 }));
});
test("image import rejects remote and executable image paths", () => {
  assert.equal(safeImage("javascript:alert(1)"), false);
  assert.equal(safeImage("https://tracker.example/image.png"), false);
  assert.equal(safeImage("images/../../secret"), false);
  assert.equal(safeImage("data:image/svg+xml;base64,PHN2Zz4="), false);
  assert.equal(safeImage("images/sézane_blouse.webp"), true);
});
test("raster image data can exceed normal text-field length", () => {
  const d = fixture();
  const g = garment(d, "photo", "top");
  g.imagePath = "data:image/png;base64," + "A".repeat(100000);
  assert.doesNotThrow(() => validate(d));
});
test("blouse supports knit layering without treating a base dress as complementary", () => {
  const d = fixture();
  const blouse = garment(d, "blouse", "top", "wishlist");
  const knit = garment(d, "knit", "top");
  knit.layeringRole = "mid";
  const dress = garment(d, "dress", "dress");
  assert.ok(analyzeWish(blouse, d).matches.some((m) => m.item.id === "knit"));
  assert.equal(pair(blouse, dress, d).score, 0);
});
test("JSON examples are importable into the reference vocabulary", () => {
  for (const path of [
    "examples/blouse-col-claudine.json",
    "examples/wardrobe-empty.json",
  ])
    assert.doesNotThrow(() =>
      prepareImport(JSON.parse(fs.readFileSync(path, "utf8")), source),
    );
});
test('optional layers are not falsely classified as outfit orphans',()=>{const d=fixture();garment(d,'t','top');garment(d,'b','bottom');garment(d,'s','shoes');garment(d,'coat','outerwear');const stats=insights(d);assert.equal(stats.versatility.find(x=>x.item.id==='coat')!.count,1);});
test("malformed imports leave source state unchanged; repeat imports rejected", () => {
  const before = JSON.stringify(source);
  assert.throws(() => prepareImport({ schemaVersion: 1 }, source));
  assert.equal(JSON.stringify(source), before);
  assert.throws(
    () =>
      prepareImport({ kind: "outfits", outfits: [source.outfits[0]] }, source),
    /déjà/,
  );
});
test("dashboard migration preserves beauty data without mixing demo inventory into source", () => {
  const d = fixture();
  const raw = {
    dressing: [
      { id: 2, brand: "Example", category: "sacs", uses: 4, price: 50 },
    ],
    makeup: [{ id: 11, type: "gloss" }],
  };
  const result = prepareImport(raw, d);
  assert.equal(result.data.garments[0].role, "bag");
  assert.equal(result.data.garments[0].usageCount, 4);
  assert.deepEqual(result.data.legacy.dashboard, raw);
  assert.equal(d.garments.length, 0);
});
