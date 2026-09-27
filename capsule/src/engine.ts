import type { Garment, Wardrobe, Role, Recipe, Inspiration } from "./model";
export type Context = {
  temperature?: number;
  occasion?: string;
  style?: string;
  mandatory?: string;
  vibe?: string;
  weather?: string;
};
export type Assessment = {
  score: number;
  confidence: number;
  reasons: string[];
  warnings: string[];
};
export type Suggestion = Assessment & { itemIds: string[]; label: string };
const overlap = (a: string[], b: string[]) => a.some((x) => b.includes(x));
const uniq = (a: string[]) => [...new Set(a)];
const avg = (a: number[]) =>
  a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0;
const core = (g: Garment) =>
  ["top", "bottom", "dress", "shoes"].includes(g.role);
export function pair(a: Garment, b: Garment, data: Wardrobe): Assessment {
  const points: { weight: number; value: number }[] = [];
  const reasons: string[] = [];
  const warnings: string[] = [];
  const add = (weight: number, value: number, yes: string, no: string) => {
    points.push({ weight, value });
    if (value >= 0.75) reasons.push(yes);
    else if (value < 0.45) warnings.push(no);
  };
  if (a.id === b.id)
    return {
      score: 0,
      confidence: 100,
      reasons: [],
      warnings: ["Une pièce ne peut pas être utilisée deux fois."],
    };
  if (
    a.role === b.role &&
    !(a.role === "top" && a.layeringRole !== b.layeringRole)
  )
    return {
      score: 0,
      confidence: 100,
      reasons: [],
      warnings: ["Ces pièces occupent le même rôle."],
    };
  if (
    (a.role === "dress" &&
      (b.role === "bottom" ||
        (b.role === "top" && b.layeringRole === "base"))) ||
    (b.role === "dress" &&
      (a.role === "bottom" || (a.role === "top" && a.layeringRole === "base")))
  )
    return {
      score: 0,
      confidence: 100,
      reasons: [],
      warnings: [
        "Ces pièces de base se concurrencent ; précisez une superposition pour les associer.",
      ],
    };
  if (a.role === "top" && b.role === "top")
    reasons.push("Une base et une couche intermédiaire peuvent se superposer.");
  if (a.colors.length && b.colors.length) {
    const colors = data.vocabularies.colors;
    const neutral = [...a.colors, ...b.colors].some(
      (id) => colors.find((c) => c.id === id)?.neutral,
    );
    add(
      3,
      overlap(a.colors, b.colors) ? 1 : neutral ? 0.88 : 0.58,
      overlap(a.colors, b.colors)
        ? "Une couleur commune relie les pièces."
        : "Une couleur neutre facilite l’association.",
      "Couleurs à essayer ensemble.",
    );
  }
  if (a.styles.length && b.styles.length)
    add(
      3,
      overlap(a.styles, b.styles) ? 1 : 0.5,
      "Une direction stylistique commune.",
      "",
    );
  if (a.pattern && b.pattern)
    add(
      1,
      /uni/i.test(a.pattern) || /uni/i.test(b.pattern)
        ? 0.95
        : a.pattern === b.pattern
          ? 0.7
          : 0.35,
      "Un motif équilibré par une pièce unie.",
      "Deux motifs distincts : vérifier leur échelle.",
    );
  if (a.seasons.length && b.seasons.length)
    add(
      2,
      overlap(a.seasons, b.seasons) ? 1 : 0.25,
      "Des saisons compatibles.",
      "Saisons peu compatibles.",
    );
  if (a.temperature && b.temperature)
    add(
      2,
      Math.max(a.temperature[0], b.temperature[0]) <=
        Math.min(a.temperature[1], b.temperature[1])
        ? 1
        : 0.2,
      "Plages de température compatibles.",
      "Plages de température disjointes.",
    );
  if (a.formality !== null && b.formality !== null)
    add(
      2,
      Math.max(0, 1 - Math.abs(a.formality - b.formality) / 3),
      "Un niveau de formalité cohérent.",
      "Écart de formalité marqué.",
    );
  if (a.occasions.length && b.occasions.length)
    add(
      1,
      overlap(a.occasions, b.occasions) ? 1 : 0.5,
      "Une occasion commune.",
      "",
    );
  if (a.silhouette && b.silhouette)
    add(
      1,
      a.silhouette === b.silhouette && /ample/i.test(a.silhouette) ? 0.4 : 0.9,
      "Des volumes qui se répondent.",
      "Deux volumes amples : ajuster les proportions.",
    );
  if (a.material && b.material)
    add(
      1,
      (/laine|velours/i.test(a.material) && /lin/i.test(b.material)) ||
        (/laine|velours/i.test(b.material) && /lin/i.test(a.material))
        ? 0.4
        : 0.8,
      "Des textures compatibles.",
      "Textures de saisons différentes.",
    );
  const weight = points.reduce((s, p) => s + p.weight, 0);
  const raw = weight
    ? (points.reduce((s, p) => s + p.value * p.weight, 0) / weight) * 100
    : 50;
  return {
    score: Math.round(50 + (raw - 50) * (0.35 + (0.65 * weight) / 16)),
    confidence: Math.round((weight / 16) * 100),
    reasons: uniq(reasons),
    warnings: uniq(warnings),
  };
}
export function missingRoles(items: Garment[]): Role[] {
  const roles = items.map((g) => g.role);
  return [
    ...(!roles.includes("dress")
      ? ([
          ...(!roles.includes("top") ? ["top"] : []),
          ...(!roles.includes("bottom") ? ["bottom"] : []),
        ] as Role[])
      : []),
    ...(!roles.includes("shoes") ? ["shoes" as Role] : []),
  ];
}
export function assess(
  items: Garment[],
  data: Wardrobe,
  ctx: Context = {},
): Assessment {
  const pairs: Assessment[] = [];
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      pairs.push(pair(items[i], items[j], data));
  let score = pairs.length ? avg(pairs.map((p) => p.score)) : 50;
  const reasons = uniq(pairs.flatMap((p) => p.reasons));
  const warnings = uniq(pairs.flatMap((p) => p.warnings));
  const missing = missingRoles(items);
  if (missing.length)
    warnings.push("Tenue à compléter : " + missing.join(", "));
  if (items.some((g) => g.status === "wishlist"))
    warnings.push("Cette tenue contient une pièce à acheter.");
  if (items.some((g) => g.archived))
    warnings.push("Cette tenue contient une pièce archivée.");
  if (items.some((g) => g.reviewNeeded))
    warnings.push("Certains attributs sont suggérés et restent à vérifier.");
  if (ctx.style) {
    const hit = items.filter((g) => g.styles.includes(ctx.style!)).length;
    score += (hit / items.length) * 12 - 4;
    if (hit) reasons.push(`${hit} pièce(s) dans la direction ${ctx.style}.`);
  }
  if (ctx.occasion) {
    const known = items.filter((g) => g.occasions.length);
    if (known.length) {
      const hits = known.filter((g) =>
        g.occasions.includes(ctx.occasion!),
      ).length;
      score += (hits / known.length - 0.5) * 10;
      if (hits)
        reasons.push(`Des pièces adaptées à l’occasion ${ctx.occasion}.`);
    }
  }
  if (ctx.temperature !== undefined) {
    const outside = items.filter(
      (g) =>
        core(g) &&
        g.temperature &&
        (ctx.temperature! < g.temperature[0] ||
          ctx.temperature! > g.temperature[1]),
    );
    score -= outside.length * 10;
    if (outside.length)
      warnings.push("Certaines pièces sortent de leur plage de température.");
    if (ctx.temperature < 14 && !items.some((g) => g.role === "outerwear"))
      warnings.push("Prévoir une veste ou un manteau.");
    if (
      ctx.temperature < 16 &&
      items.some((g) => g.role === "dress" || /jupe/i.test(g.name)) &&
      !items.some((g) => g.role === "hosiery")
    )
      warnings.push("Des collants peuvent apporter du confort.");
    if (ctx.temperature > 24 && items.some((g) => (g.warmth ?? 0) >= 4))
      warnings.push("Cette superposition peut être trop chaude.");
  }
  if (ctx.weather === "rain")
    warnings.push(
      "Pluie : vérifier l’imperméabilité des chaussures et de la veste.",
    );
  if (ctx.vibe === "comfortable") {
    const easy = items.filter((g) =>
      /ample|souple|décontract|confort/i.test([g.fit, ...g.styles].join(" ")),
    ).length;
    score += easy * 3;
  }
  if (ctx.vibe === "polished")
    score +=
      avg(items.filter((g) => g.formality !== null).map((g) => g.formality!)) *
      2;
  return {
    score: Math.round(Math.max(0, Math.min(100, score - missing.length * 18))),
    confidence: Math.round(
      avg(pairs.map((p) => p.confidence)) *
        (items.some((g) => g.reviewNeeded) ? 0.7 : 1),
    ),
    reasons: reasons.slice(0, 4),
    warnings: uniq(warnings),
  };
}
export function enumerate(
  data: Wardrobe,
  ctx: Context = {},
  candidate?: Garment,
): { outfits: Suggestion[]; truncated: boolean } {
  const items = data.garments.filter(
    (g) =>
      g.status === "owned" &&
      !g.archived &&
      !g.forSale &&
      g.id !== candidate?.id,
  );
  if (candidate) items.push(candidate);
  const required = candidate?.id || ctx.mandatory;
  if (required && !items.some((g) => g.id === required))
    return { outfits: [], truncated: false };
  const by = (role: Role) => items.filter((g) => g.role === role);
  const tops = by("top"),
    bottoms = by("bottom"),
    dresses = by("dress"),
    shoes = by("shoes");
  const results: Suggestion[] = [];
  let examined = 0;
  let truncated = false;
  if (!shoes.length) return { outfits: [], truncated: false };
  const must = items.find((g) => g.id === required);
  function* bases(): Generator<Garment[]> {
    if (!must || !["top", "bottom"].includes(must.role))
      for (const dress of dresses)
        if (!must || must.role !== "dress" || dress.id === must.id)
          yield [dress];
    if (must?.role !== "dress")
      for (const top of tops)
        if (!must || must.role !== "top" || top.id === must.id)
          for (const bottom of bottoms)
            if (!must || must.role !== "bottom" || bottom.id === must.id)
              yield [top, bottom];
  }
  outer: for (const base of bases())
    for (const shoe of shoes.filter(
      (g) => !must || must.role !== "shoes" || g.id === must.id,
    )) {
      if (++examined > 15000) {
        truncated = true;
        break outer;
      }
      let chosen = [...base, shoe];
      if (must && !chosen.includes(must)) {
        if (core(must)) continue;
        chosen.push(must);
      }
      if (
        ctx.temperature !== undefined &&
        ctx.temperature < 14 &&
        !chosen.some((g) => g.role === "outerwear")
      ) {
        const coat = by("outerwear").sort(
          (a, b) =>
            avg(chosen.map((g) => pair(b, g, data).score)) -
            avg(chosen.map((g) => pair(a, g, data).score)),
        )[0];
        if (coat) chosen.push(coat);
      }
      const assessment = assess(chosen, data, ctx);
      if (assessment.score < 50) continue;
      results.push({
        ...assessment,
        itemIds: chosen.map((g) => g.id),
        label: "",
      });
    }
  const distinct = [
    ...new Map(
      results.map((o) => [o.itemIds.slice().sort().join("|"), o]),
    ).values(),
  ];
  return {
    outfits: distinct.sort(
      (a, b) =>
        b.score - a.score || a.itemIds.join().localeCompare(b.itemIds.join()),
    ),
    truncated,
  };
}
export function recommend(data: Wardrobe, ctx: Context): Suggestion[] {
  const chosen: Suggestion[] = [];
  for (const [label, vibe] of [
    ["Le meilleur accord", ctx.vibe],
    ["L’alternative confortable", "comfortable"],
    ["Une allure plus habillée", "polished"],
  ]) {
    const options = enumerate(data, { ...ctx, vibe }).outfits;
    const alternatives = options.filter(
      (o) =>
        !chosen.some(
          (c) =>
            c.itemIds.slice().sort().join() === o.itemIds.slice().sort().join(),
        ),
    );
    const next = chosen.length
      ? alternatives.find(
          (o) =>
            o.score >= alternatives[0].score - 10 &&
            o.itemIds.filter((id) => !chosen[0].itemIds.includes(id)).length >=
              2,
        ) || alternatives[0]
      : alternatives[0];
    if (next) {
      const itemData = next.itemIds.map((id) =>
        data.garments.find((g) => g.id === id)!,
      );
      const warnings = [...next.warnings];
      if (vibe === "comfortable" && !itemData.some((g) => g.fit))
        warnings.push(
          "Confort à vérifier : les coupes ne sont pas encore renseignées.",
        );
      if (vibe === "polished" && !itemData.some((g) => g.formality !== null))
        warnings.push(
          "Formalité à vérifier : cette variante propose surtout un autre accord.",
        );
      chosen.push({ ...next, warnings, label: label! });
    }
  }
  return chosen;
}
export function analyzeWish(g: Garment, data: Wardrobe) {
  const owned = data.garments.filter(
    (x) => x.status === "owned" && !x.archived && !x.forSale,
  );
  const matches = owned
    .map((x) => ({ item: x, ...pair(g, x, data) }))
    .filter((x) => x.score >= 65)
    .sort((a, b) => b.score - a.score);
  const generated = enumerate(data, {}, g);
  const missing = missingRoles([...owned, g]);
  const outfitCount = generated.outfits.length;
  const similar = owned.filter(
    (x) =>
      x.role === g.role &&
      overlap(x.colors, g.colors) &&
      overlap(x.styles, g.styles),
  );
  return {
    score: Math.round(avg(matches.map((m) => m.score))),
    matches,
    outfits: generated.outfits.slice(0, 3),
    outfitCount,
    truncated: generated.truncated,
    missing,
    styles: uniq(
      g.styles.filter((s) => owned.some((x) => x.styles.includes(s))),
    ),
    cascade: outfitCount === 0,
    strategic: outfitCount >= 6 && matches.length >= 4 && similar.length < 3,
    similar,
    confidence: Math.round(
      avg(matches.map((m) => m.confidence)) * (g.reviewNeeded ? 0.7 : 1),
    ),
  };
}
export function matchRecipe(inspiration: Inspiration, data: Wardrobe) {
  const used = new Set<string>();
  const matches = inspiration.recipe.map((r: Recipe) => {
    const options = data.garments
      .filter(
        (g) =>
          g.status === "owned" &&
          !g.archived &&
          !g.forSale &&
          g.role === r.role &&
          !used.has(g.id),
      )
      .map((g) => {
        let sum = 35,
          den = 35;
        if (r.colors.length) {
          den += 30;
          if (overlap(g.colors, r.colors)) sum += 30;
        }
        if (r.styles.length) {
          den += 15;
          if (overlap(g.styles, r.styles)) sum += 15;
        }
        if (r.details.length) {
          den += 20;
          sum +=
            (20 *
              r.details.filter((d) =>
                [...g.details, g.neckline, g.pattern, g.material, g.name]
                  .join(" ")
                  .toLowerCase()
                  .includes(d.toLowerCase()),
              ).length) /
            r.details.length;
        }
        return { item: g, score: Math.round((sum / den) * 100) };
      })
      .sort((a, b) => b.score - a.score);
    const best = options[0];
    if (best) used.add(best.item.id);
    return { recipe: r, best, alternatives: options.slice(1, 3) };
  });
  return {
    matches,
    score: Math.round(avg(matches.map((m) => m.best?.score || 0))),
    missing: matches
      .filter((m) => !m.best || m.best.score < 60)
      .map((m) => m.recipe.label),
  };
}
export function insights(data: Wardrobe) {
  const owned = data.garments.filter(
    (g) => g.status === "owned" && !g.archived,
  );
  const all = enumerate(data);
  const garmentMap=new Map(data.garments.map(g=>[g.id,g]));
  const baseItems=all.outfits.map(o=>o.itemIds.map(id=>garmentMap.get(id)!));
  const versatility = owned
    .map((g) => ({
      item: g,
      count: !g.forSale&&!core(g)
        ? baseItems.filter(items=>assess([...items,g],data).score>=50).length
        : all.outfits.filter((o) => o.itemIds.includes(g.id)).length,
      matches: owned.filter(
        (x) => x.id !== g.id && pair(g, x, data).score >= 65,
      ).length,
    }))
    .sort((a, b) => b.count - a.count || b.matches - a.matches);
  const tally = (values: string[]) =>
    Object.entries(
      values.reduce<Record<string, number>>(
        (a, v) => ((a[v] = (a[v] || 0) + 1), a),
        {},
      ),
    ).sort((a, b) => b[1] - a[1]);
  return {
    owned,
    versatility,
    truncated: all.truncated,
    outfitCount: all.outfits.length,
    colors: tally(owned.flatMap((g) => g.colors)),
    styles: tally(owned.flatMap((g) => g.styles)),
    categories: tally(owned.map((g) => g.category)),
    seasons: tally(
      owned.flatMap((g) => (g.seasons.length ? g.seasons : ["Non renseignée"])),
    ),
    silhouettes: tally(owned.map((g) => g.silhouette || "Non renseignée")),
    formulas: tally(
      data.outfits.map((o) =>
        o.itemIds
          .map((id) => data.garments.find((g) => g.id === id)?.role || "?")
          .sort()
          .join(" + "),
      ),
    ),
    gaps: missingRoles(owned),
  };
}
