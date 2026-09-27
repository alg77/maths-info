import {
  type Wardrobe,
  type Garment,
  type Outfit,
  blankGarment,
  makeOutfit,
  roleLabels,
} from "./model";
const DB = "atelier-wardrobe-v1";
const open = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("documents");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
async function read(key: string) {
  const db = await open();
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const r = db.transaction("documents").objectStore("documents").get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
export async function write(data: Wardrobe, backup = false) {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("documents", "readwrite"),
        store = tx.objectStore("documents");
      if (backup) {
        const old = store.get("current");
        old.onsuccess = () => {
          if (old.result) store.put(old.result, "previous");
          store.put(data, "current");
        };
      } else store.put(data, "current");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Sauvegarde annulée."));
    });
  } finally {
    db.close();
  }
}
export async function load() {
  const saved = await read("current");
  if (saved) {
    validate(saved);
    return saved;
  }
  const r = await fetch("./data/wardrobe.json");
  if (!r.ok) throw new Error("Impossible de lire le dressing initial.");
  const data = await r.json();
  validate(data);
  await write(data);
  return data;
}
export async function previous() {
  const data = await read("previous");
  if (!data) throw new Error("Aucune sauvegarde avant import disponible.");
  validate(data);
  return data;
}
const error = (message: string): never => {
  throw new Error(message);
};
const object = (o: unknown): o is Record<string, any> =>
  !!o && typeof o === "object" && !Array.isArray(o);
const strings = (v: unknown) =>
  Array.isArray(v) &&
  v.length <= 10000 &&
  v.every((x) => typeof x === "string" && x.length <= 50000);
const num = (v: unknown, min = 0, max = 1e9) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
export function safeImage(path: string) {
  return (
    path === "" ||
    (/^images\/[\p{L}\p{N}\s._/()'-]+$/u.test(path) &&
      !path.split("/").includes("..")) ||
    /^data:image\/(png|jpeg|webp|avif|gif);base64,[A-Za-z0-9+/=]+$/.test(path)
  );
}
export function validate(value: unknown): asserts value is Wardrobe {
  if (!object(value) || value.schemaVersion !== 1)
    error("Format non reconnu : schemaVersion doit être 1.");
  const d = value as Record<string, any>;
  if (
    d.preferences?.savedViews !== undefined &&
    (!Array.isArray(d.preferences.savedViews) ||
      d.preferences.savedViews.length > 500 ||
      d.preferences.savedViews.some(
        (v: any) =>
          !object(v) ||
          ![
            "id",
            "name",
            "q",
            "category",
            "sort",
            "style",
            "season",
            "color",
          ].every((k) => typeof v[k] === "string") ||
          typeof v.favorites !== "boolean" ||
          typeof v.archived !== "boolean",
      ))
  )
    error("Vues enregistrées invalides.");
  for (const k of [
    "garments",
    "outfits",
    "wishlist",
    "inspirations",
    "boards",
    "wearEvents",
  ])
    if (!Array.isArray(d[k]) || d[k].length > 10000)
      error(`Collection invalide : ${k}.`);
  if (!object(d.vocabularies) || !object(d.preferences) || !object(d.legacy))
    error("Préférences ou vocabulaires manquants.");
  for (const k of ["styles", "occasions", "seasons", "formalityLevels"])
    if (!strings(d.vocabularies[k]) || !d.vocabularies[k].length)
      error(`Vocabulaire invalide : ${k}.`);
  if (
    !Array.isArray(d.vocabularies.categories) ||
    !d.vocabularies.categories.length ||
    d.vocabularies.categories.some(
      (c: any) =>
        !object(c) ||
        typeof c.id !== "string" ||
        typeof c.label !== "string" ||
        !Object.keys(roleLabels).includes(c.role),
    )
  )
    error("Catégories invalides.");
  if (
    !Array.isArray(d.vocabularies.colors) ||
    d.vocabularies.colors.some(
      (c: any) =>
        !object(c) ||
        typeof c.id !== "string" ||
        typeof c.label !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(c.hex) ||
        typeof c.neutral !== "boolean",
    )
  )
    error("Couleurs invalides.");
  for (const k of ["categories", "colors"])
    if (
      new Set(d.vocabularies[k].map((x: any) => x.id)).size !==
      d.vocabularies[k].length
    )
      error(`Identifiants en double : ${k}.`);
  if (
    !["name", "occasion", "style", "currency"].every(
      (k) => typeof d.preferences[k] === "string",
    ) ||
    !num(d.preferences.temperature, -60, 65) ||
    !["EUR", "USD", "GBP", "CHF", "CAD", "JPY"].includes(d.preferences.currency)
  )
    error("Préférences invalides.");
  const ids = new Set<string>();
  const identity = (o: any) => {
    if (!object(o) || typeof o.id !== "string" || !o.id || o.id.length > 200)
      error("Identifiant manquant ou invalide.");
  };
  const textFields = (o: any, fields: string[]) => {
    for (const f of fields)
      if (
        typeof o[f] !== "string" ||
        o[f].length > (f === "imagePath" ? 7 * 1024 * 1024 : 50000)
      )
        error(`Texte invalide : ${f}.`);
  };
  const lists = (o: any, fields: string[]) => {
    for (const f of fields) if (!strings(o[f])) error(`Liste invalide : ${f}.`);
  };
  const temp = (t: any) =>
    t === null ||
    (Array.isArray(t) &&
      t.length === 2 &&
      num(t[0], -60, 65) &&
      num(t[1], -60, 65) &&
      t[0] <= t[1]);
  for (const g of d.garments) {
    identity(g);
    if (ids.has(g.id)) error(`Pièce en double : ${g.id}.`);
    ids.add(g.id);
    textFields(g, [
      "name",
      "brand",
      "category",
      "subcategory",
      "pattern",
      "material",
      "fit",
      "silhouette",
      "length",
      "sleeve",
      "neckline",
      "layeringRole",
      "imagePath",
      "notes",
    ]);
    lists(g, [
      "colors",
      "secondaryColors",
      "details",
      "seasons",
      "styles",
      "occasions",
    ]);
    if (
      !g.name.trim() ||
      !Object.keys(roleLabels).includes(g.role) ||
      !["owned", "wishlist"].includes(g.status) ||
      !num(g.usageCount) ||
      !Number.isInteger(g.usageCount) ||
      !temp(g.temperature)
    )
      error(`Pièce invalide : ${g.name || g.id}.`);
    for (const f of ["favorite", "archived", "forSale", "reviewNeeded"])
      if (typeof g[f] !== "boolean") error(`Valeur invalide : ${f}.`);
    if (
      (g.price !== null && !num(g.price)) ||
      (g.warmth !== null && !num(g.warmth, 1, 5)) ||
      (g.formality !== null &&
        !num(g.formality, 0, d.vocabularies.formalityLevels.length - 1)) ||
      (g.lastWorn !== null &&
        (typeof g.lastWorn !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(g.lastWorn)))
    )
      error("Valeur numérique ou date invalide.");
    if (!safeImage(g.imagePath))
      error("Image non autorisée : utiliser images/ ou une image importée.");
    if (!d.vocabularies.categories.some((c: any) => c.id === g.category))
      error(`Catégorie inconnue : ${g.category}.`);
  }
  const refs = (o: any) => {
    if (
      !strings(o.itemIds) ||
      new Set(o.itemIds).size !== o.itemIds.length ||
      o.itemIds.some((id: string) => !ids.has(id))
    )
      error("Référence de vêtement manquante ou répétée.");
  };
  for (const collection of [
    "outfits",
    "wishlist",
    "inspirations",
    "boards",
    "wearEvents",
  ]) {
    const seen = new Set();
    for (const o of d[collection]) {
      identity(o);
      if (seen.has(o.id)) error(`Identifiant en double dans ${collection}.`);
      seen.add(o.id);
    }
  }
  for (const o of d.outfits) {
    textFields(o, ["name", "notes", "imagePath", "createdAt"]);
    lists(o, ["styles", "occasions", "seasons"]);
    refs(o);
    if (
      !temp(o.temperature) ||
      !safeImage(o.imagePath) ||
      !["manual", "generated", "inspiration"].includes(o.source) ||
      (o.rating !== null && !num(o.rating, 0, 5))
    )
      error("Tenue invalide.");
  }
  for (const w of d.wishlist) {
    if (
      !ids.has(w.garmentId) ||
      !["low", "medium", "high"].includes(w.priority) ||
      typeof w.notes !== "string" ||
      (w.budget !== null && !num(w.budget))
    )
      error("Envie invalide.");
  }
  for (const i of d.inspirations) {
    textFields(i, ["title", "imagePath", "description", "notes"]);
    lists(i, ["styles", "palette"]);
    if (
      !safeImage(i.imagePath) ||
      !Array.isArray(i.recipe) ||
      i.recipe.length > 40
    )
      error("Inspiration invalide.");
    for (const r of i.recipe) {
      identity(r);
      textFields(r, ["label"]);
      lists(r, ["colors", "styles", "details"]);
      if (!Object.keys(roleLabels).includes(r.role))
        error("Rôle de recette invalide.");
    }
  }
  for (const b of d.boards) {
    textFields(b, ["title", "notes", "kind"]);
    lists(b, ["styles"]);
    refs(b);
  }
  for (const e of d.wearEvents) {
    refs(e);
    if (
      typeof e.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
      (e.outfitId !== undefined &&
        !d.outfits.some((o: any) => o.id === e.outfitId))
    )
      error("Historique invalide.");
  }
}
export function download(
  filename: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.append(a);
  a.click();
  setTimeout(() => {a.remove();URL.revokeObjectURL(url);}, 60000);
}
export async function readImage(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choisir une image de moins de 5 Mo.");
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ].includes(file.type)
  )
    throw new Error("Formats acceptés : JPEG, PNG, WebP, AVIF ou GIF.");
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
export async function portable(data: Wardrobe) {
  const copy = structuredClone(data);
  const paths = new Map<string, string>();
  for (const o of [...copy.garments, ...copy.inspirations, ...copy.outfits]) {
    if (!o.imagePath || o.imagePath.startsWith("data:")) continue;
    if (!paths.has(o.imagePath)) {
      const r = await fetch("./" + o.imagePath);
      if (!r.ok) throw new Error(`Image introuvable : ${o.imagePath}`);
      const blob = await r.blob();
      const encoded = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      paths.set(o.imagePath, encoded);
    }
    o.imagePath = paths.get(o.imagePath)!;
  }
  return copy;
}
export function prepareImport(
  raw: any,
  current: Wardrobe,
): { data: Wardrobe; summary: string } {
  if (raw?.schemaVersion === 1) {
    validate(raw);
    return {
      data: raw,
      summary: `Remplacement : ${raw.garments.length} pièces, ${raw.outfits.length} tenues. Une sauvegarde de l’état actuel sera conservée.`,
    };
  }
  const data = structuredClone(current);
  if (raw?.kind === "outfits" && Array.isArray(raw.outfits)) {
    for (const o of raw.outfits) {
      if (data.outfits.some((x) => x.id === o.id))
        throw new Error(`Tenue déjà présente : ${o.name}.`);
      data.outfits.push(o);
    }
    validate(data);
    return { data, summary: `Ajout de ${raw.outfits.length} tenues.` };
  }
  if (raw?.kind === "preferences") {
    data.preferences = raw.preferences;
    data.vocabularies = raw.vocabularies;
    validate(data);
    return { data, summary: "Remplacement des préférences et vocabulaires." };
  }
  if (raw?.kind === "garments" && Array.isArray(raw.garments)) {
    for (const g of raw.garments) {
      if (data.garments.some((x) => x.id === g.id))
        throw new Error(`Pièce déjà présente : ${g.name}.`);
      data.garments.push(g);
      if (g.status === "wishlist")
        data.wishlist.push({
          id: "wish-" + g.id,
          garmentId: g.id,
          priority: "medium",
          notes: "",
          budget: null,
        });
    }
    validate(data);
    return { data, summary: `Ajout de ${raw.garments.length} pièces.` };
  }
  if (raw?.["dbd-state"] || raw?.dressing) {
    const legacy = raw["dbd-state"] || raw;
    if (!Array.isArray(legacy.dressing))
      throw new Error("Ancien dashboard invalide.");
    data.legacy.dashboard = legacy;
    const map: Record<string, Garment["role"]> = {
      robes: "dress",
      jupes: "bottom",
      pantalons: "bottom",
      shorts: "bottom",
      chaussures: "shoes",
      vestes: "outerwear",
      manteaux: "outerwear",
      sacs: "bag",
      bijoux: "accessory",
    };
    for (const item of legacy.dressing) {
      const role = map[item.category] || "top";
      let cat = data.vocabularies.categories.find((c) => c.role === role);
      if (!cat) {
        cat = { id: role, label: roleLabels[role], role };
        data.vocabularies.categories.push(cat);
      }
      const g = blankGarment(cat);
      g.id = "dashboard-" + item.id;
      g.name = item.name || `${item.category || "Pièce"} ${item.brand || ""}`;
      g.brand = item.brand || "";
      g.material = item.material || "";
      g.price = Number(item.price) || null;
      g.usageCount = Math.max(0, Math.floor(Number(item.uses) || 0));
      g.favorite = !!item.fav;
      g.imagePath = safeImage(item.photo || "") ? item.photo || "" : "";
      g.legacy = item;
      g.reviewNeeded = true;
      if (data.garments.some((x) => x.id === g.id))
        throw new Error("Ce dashboard a déjà été importé.");
      data.garments.push(g);
    }
    validate(data);
    return {
      data,
      summary: `Ajout de ${legacy.dressing.length} pièces du dashboard. Les données beauté et autres champs sont conservés dans legacy.`,
    };
  }
  if (raw?.myClosetCounts || raw?.myClosetHistory) {
    data.legacy.browserCapsule = raw;
    if (raw.myClosetCounts)
      for (const [id, count] of Object.entries(raw.myClosetCounts)) {
        const g = data.garments.find((x) => x.id === id);
        if (g && typeof count === "number")
          g.usageCount = Math.max(0, Math.floor(count));
      }
    for (const look of raw.myClosetHistory || []) {
      const id = "history-" + look.id;
      if (data.outfits.some((o) => o.id === id)) continue;
      const ids = (look.items || []).filter((id: string) =>
        data.garments.some((g) => g.id === id),
      );
      const o = makeOutfit(ids, look.title || "Tenue historique");
      o.id = id;
      o.notes = look.comment || "";
      o.legacy = look;
      data.outfits.push(o);
    }
    validate(data);
    return {
      data,
      summary:
        "Historique Capsule conservé et compteurs connus repris. Les dates anciennes restent dans les données originales.",
    };
  }
  throw new Error(
    "Format JSON non reconnu. Importer un export Atelier ou une sauvegarde des anciennes applications.",
  );
}
