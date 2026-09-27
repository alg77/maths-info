import ts from "typescript";
import fs from "node:fs";
const path = "src/pages.tsx";
const source = fs.readFileSync(path, "utf8");
const ast = ts.createSourceFile(
  path,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const imports = ast.statements.filter(ts.isImportDeclaration);
const functions = new Map(
  ast.statements
    .filter(ts.isFunctionDeclaration)
    .map((f) => [f.name.text, f.getText(ast)]),
);
const groups = {
  Today: ["TodayPage"],
  Wardrobe: ["WardrobePage", "ItemDetail"],
  Outfits: ["OutfitsPage", "OutfitDetail"],
  Wishlist: ["WishlistPage"],
  Inspirations: ["InspirationsPage"],
  Insights: ["Bars", "InsightsPage"],
  Settings: ["SettingsPage"],
};
fs.mkdirSync("src/screens", { recursive: true });
const barrel = [];
for (const [name, names] of Object.entries(groups)) {
  const body = names.map((n) => functions.get(n)).join("\n\n");
  if (names.some((n) => !functions.has(n)))
    throw new Error("Écrans déjà séparés ou fonction manquante.");
  const headers = imports
    .map((i) => {
      const spec = i.importClause.namedBindings.elements
        .filter((e) => new RegExp(`\\b${e.name.text}\\b`).test(body))
        .map((e) => e.getText(ast));
      if (!spec.length) return "";
      const from = i.moduleSpecifier.text.replace("./", "../");
      return `import ${i.importClause.isTypeOnly ? "type " : ""}{${spec.join(",")}} from '${from}';`;
    })
    .filter(Boolean)
    .join("\n");
  fs.writeFileSync(`src/screens/${name}.tsx`, headers + "\n\n" + body + "\n");
  barrel.push(
    `export {${names.filter((n) => n !== "Bars").join(",")}} from './screens/${name}';`,
  );
}
fs.writeFileSync(path, barrel.join("\n") + "\n");
