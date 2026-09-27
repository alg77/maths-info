export type Role =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "shoes"
  | "bag"
  | "accessory"
  | "hosiery";
export const roleLabels: Record<Role, string> = {
  top: "Haut",
  bottom: "Bas",
  dress: "Robe / combinaison",
  outerwear: "Veste / manteau",
  shoes: "Chaussures",
  bag: "Sac",
  accessory: "Accessoire",
  hosiery: "Collants / chaussettes",
};
export type Garment = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  role: Role;
  colors: string[];
  secondaryColors: string[];
  pattern: string;
  material: string;
  fit: string;
  silhouette: string;
  length: string;
  sleeve: string;
  neckline: string;
  details: string[];
  warmth: number | null;
  seasons: string[];
  temperature: [number, number] | null;
  styles: string[];
  formality: number | null;
  occasions: string[];
  layeringRole: string;
  imagePath: string;
  notes: string;
  favorite: boolean;
  status: "owned" | "wishlist";
  archived: boolean;
  forSale: boolean;
  usageCount: number;
  lastWorn: string | null;
  price: number | null;
  reviewNeeded: boolean;
  legacy?: unknown;
};
export type Outfit = {
  id: string;
  name: string;
  itemIds: string[];
  styles: string[];
  occasions: string[];
  seasons: string[];
  temperature: [number, number] | null;
  rating: number | null;
  notes: string;
  imagePath: string;
  source: "manual" | "generated" | "inspiration";
  createdAt: string;
  legacy?: unknown;
};
export type Recipe = {
  id: string;
  label: string;
  role: Role;
  colors: string[];
  styles: string[];
  details: string[];
};
export type Inspiration = {
  id: string;
  title: string;
  imagePath: string;
  description: string;
  styles: string[];
  palette: string[];
  recipe: Recipe[];
  notes: string;
};
export type Board = {
  id: string;
  title: string;
  itemIds: string[];
  notes: string;
  styles: string[];
  kind: string;
};
export type Wardrobe = {
  schemaVersion: 1;
  garments: Garment[];
  outfits: Outfit[];
  wishlist: {
    id: string;
    garmentId: string;
    priority: string;
    notes: string;
    budget: number | null;
  }[];
  inspirations: Inspiration[];
  boards: Board[];
  wearEvents: {
    id: string;
    date: string;
    itemIds: string[];
    outfitId?: string;
  }[];
  vocabularies: {
    categories: { id: string; label: string; role: Role }[];
    styles: string[];
    colors: { id: string; label: string; hex: string; neutral: boolean }[];
    occasions: string[];
    seasons: string[];
    formalityLevels: string[];
  };
  preferences: {
    name: string;
    temperature: number;
    occasion: string;
    style: string;
    currency: string;
    savedViews?: {
      id: string;
      name: string;
      q: string;
      category: string;
      favorites: boolean;
      sort: string;
      archived: boolean;
      style: string;
      season: string;
      color: string;
    }[];
  };
  legacy: Record<string, unknown>;
};
export const uid = () => crypto.randomUUID();
export const day = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const blankGarment = (
  category: Wardrobe["vocabularies"]["categories"][number],
  status: Garment["status"] = "owned",
): Garment => ({
  id: uid(),
  name: "",
  brand: "",
  category: category.id,
  subcategory: "",
  role: category.role,
  colors: [],
  secondaryColors: [],
  pattern: "",
  material: "",
  fit: "",
  silhouette: "",
  length: "",
  sleeve: "",
  neckline: "",
  details: [],
  warmth: null,
  seasons: [],
  temperature: null,
  styles: [],
  formality: null,
  occasions: [],
  layeringRole: "base",
  imagePath: "",
  notes: "",
  favorite: false,
  status,
  archived: false,
  forSale: false,
  usageCount: 0,
  lastWorn: null,
  price: null,
  reviewNeeded: false,
});
export const makeOutfit = (
  itemIds: string[],
  name = "Nouvelle tenue",
): Outfit => ({
  id: uid(),
  name,
  itemIds,
  styles: [],
  occasions: [],
  seasons: [],
  temperature: null,
  rating: null,
  notes: "",
  imagePath: "",
  source: "manual",
  createdAt: new Date().toISOString(),
});
