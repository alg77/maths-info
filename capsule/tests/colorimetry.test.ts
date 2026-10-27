import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { colorAdvice, historicalProfiles } from "../src/colorimetry";
import { validate, prepareImport } from "../src/storage";
import { assess } from "../src/engine";
import type { Wardrobe } from "../src/model";
const seed = JSON.parse(
  fs.readFileSync("public/data/wardrobe.json", "utf8"),
) as Wardrobe;
test("old backups remain valid and do not silently select a profile", () => {
  validate(seed);
  assert.equal(colorAdvice(seed.garments[0], seed).score, null);
});
test("palette exact match, unknown colors and explicit exclusions", () => {
  const d = structuredClone(seed);
  d.preferences.colorProfile = {
    ...structuredClone(historicalProfiles[0]),
    enabled: true,
  };
  d.vocabularies.colors.push({
    id: "test-rust",
    label: "Rouille test",
    hex: "#9E4624",
    neutral: false,
  });
  const g = { ...d.garments[0], colors: ["test-rust"], secondaryColors: [] };
  assert.equal(colorAdvice(g, d).score, 100);
  g.colors = ["unknown"];
  assert.equal(colorAdvice(g, d).score, null);
  g.colors = ["test-rust", "unknown"];
  assert.equal(colorAdvice(g, d).coverage, 50);
  d.preferences.colorProfile.avoid = ["Rouille test"];
  assert.equal(colorAdvice(g, d).score, 0);
});
test("profile survives JSON import without modifying collections", () => {
  const d = structuredClone(seed);
  d.preferences.colorProfile = structuredClone(historicalProfiles[0]);
  const r = prepareImport(JSON.parse(JSON.stringify(d)), seed);
  assert.deepEqual(r.data.preferences.colorProfile, d.preferences.colorProfile);
  assert.deepEqual(r.data.garments, seed.garments);
  assert.deepEqual(r.data.wishlist, seed.wishlist);
  assert.deepEqual(r.data.outfits, seed.outfits);
});
test("invalid profile is rejected before import", () => {
  for (const cp of [
    { enabled: true, palette: [] },
    { ...historicalProfiles[0], palette: [{ label: "bad", hex: "red" }] },
  ]) {
    const d = structuredClone(seed);
    (d.preferences as any).colorProfile = cp;
    assert.throws(() => validate(d), /colorimétrique/);
  }
});
test("palette only adjusts outfits near the face and is optional", () => {
  const d = structuredClone(seed);
  const g = {
    ...d.garments[0],
    role: "top" as const,
    colors: [d.vocabularies.colors[0].id],
    secondaryColors: [],
  };
  const before = assess([g], d);
  d.preferences.colorProfile = {
    ...structuredClone(historicalProfiles[0]),
    enabled: true,
    palette: [{ label: "Exact", hex: d.vocabularies.colors[0].hex }],
  };
  const after = assess([g], d);
  assert.ok(after.reasons.some((r) => r.includes("palette")));
  assert.ok(after.score >= before.score);
  d.preferences.colorProfile.enabled = false;
  assert.deepEqual(assess([g], d), before);
});
test('dashboard imports clothing wishes without mixing beauty or changing existing data',()=>{const raw={dressing:[],wishlist:[{id:7,name:'Blouse',category:'vêtements',priority:'haute',price:40,note:'Col',status:'envie'},{id:8,name:'Gloss',category:'maquillage',status:'envie'}],profile:{season:'Personal'}};const {data}=prepareImport(raw,seed);assert.equal(data.garments.length,seed.garments.length+1);assert.equal(data.wishlist.length,seed.wishlist.length+1);assert.equal(data.garments.at(-1)?.status,'wishlist');assert.equal(data.wishlist.at(-1)?.budget,40);assert.deepEqual(data.legacy.dashboard,raw);assert.deepEqual(seed.preferences.colorProfile,undefined);});
