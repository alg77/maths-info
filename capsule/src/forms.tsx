import { useState } from "react";
import { Plus, Trash2, Upload, Check } from "lucide-react";
import {
  type Garment,
  type Wardrobe,
  type Outfit,
  type Inspiration,
  type Recipe,
  type Role,
  roleLabels,
  uid,
} from "./model";
import { Modal, Tags, Photo, ItemCard, OutfitVisual, Empty, Chip } from "./ui";
import { readImage, safeImage } from "./storage";
import { assess } from "./engine";
type Base<T> = {
  initial: T;
  data: Wardrobe;
  onClose: () => void;
  onSave: (x: T) => void;
  onError: (s: string) => void;
};

function TextList({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}
export function GarmentForm({
  initial,
  data,
  onClose,
  onSave,
  onError,
}: Base<Garment>) {
  const [g, set] = useState(structuredClone(initial));
  const [details, showDetails] = useState(false);
  const patch = (v: Partial<Garment>) => set({ ...g, ...v });
  const field = (key: keyof Garment, label: string) => (
    <label>
      {label}
      <input
        value={String(g[key] ?? "")}
        onChange={(e) => patch({ [key]: e.target.value })}
      />
    </label>
  );
  return (
    <Modal
      title={initial.name ? "Modifier la pièce" : "Une nouvelle pièce"}
      onClose={onClose}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!safeImage(g.imagePath)) {
            onError("Utiliser un chemin images/… ou importer une image.");
            return;
          }
          onSave(g);
        }}
      >
        <div className="garment-form">
          <div className="image-editor">
            <Photo item={g} />
            <label className="secondary upload">
              <Upload size={16} /> Choisir une photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    readImage(file)
                      .then((imagePath) => patch({ imagePath }))
                      .catch((e) => onError(e.message));
                }}
              />
            </label>
            <label>
              Ou un chemin local
              <input
                placeholder="images/ma-blouse.webp"
                value={g.imagePath.startsWith("data:") ? "" : g.imagePath}
                onChange={(e) => patch({ imagePath: e.target.value })}
              />
            </label>
            <small>JPEG, PNG, WebP ou AVIF · 5 Mo maximum</small>
          </div>
          <div className="form-fields">
            <label>
              Nom de la pièce
              <input
                required
                maxLength={200}
                autoFocus
                value={g.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="Blouse crème à col Claudine"
              />
            </label>
            <div className="form-grid">
              {field("brand", "Marque")}
              <label>
                Catégorie
                <select
                  value={g.category}
                  onChange={(e) => {
                    const c = data.vocabularies.categories.find(
                      (c) => c.id === e.target.value,
                    )!;
                    patch({ category: c.id, role: c.role });
                  }}
                >
                  {data.vocabularies.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Statut
                <select
                  value={g.status}
                  onChange={(e) =>
                    patch({ status: e.target.value as Garment["status"] })
                  }
                >
                  <option value="owned">Dans mon dressing</option>
                  <option value="wishlist">Sur ma wishlist</option>
                </select>
              </label>
              <label>
                Prix d’achat
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={g.price ?? ""}
                  onChange={(e) =>
                    patch({
                      price:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>
            <fieldset className="tags-field">
              <legend>Couleurs principales</legend>
              <div className="color-options">
                {data.vocabularies.colors.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={g.colors.includes(c.id)}
                    className={g.colors.includes(c.id) ? "chosen" : ""}
                    style={{ background: c.hex }}
                    onClick={() =>
                      patch({
                        colors: g.colors.includes(c.id)
                          ? g.colors.filter((x) => x !== c.id)
                          : [...g.colors, c.id],
                      })
                    }
                  >
                    {g.colors.includes(c.id) && <Check size={15} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <Tags
              label="Styles"
              options={data.vocabularies.styles}
              value={g.styles}
              onChange={(styles) => patch({ styles })}
            />
            <label>
              Notes
              <textarea
                rows={3}
                value={g.notes}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={g.forSale}
                onChange={(e) => patch({ forSale: e.target.checked })}
              />{" "}
              Pièce à vendre (exclue des recommandations)
            </label>
            {g.reviewNeeded && (
              <label className="checkbox review">
                <input
                  type="checkbox"
                  checked={!g.reviewNeeded}
                  onChange={() => patch({ reviewNeeded: false })}
                />{" "}
                J’ai vérifié les attributs suggérés lors de la migration
              </label>
            )}
          </div>
        </div>
        <button
          className="text-button more-fields"
          type="button"
          onClick={() => showDetails(!details)}
        >
          {details ? "− Masquer" : "+ Affiner"} les détails de style, saison et
          usage
        </button>
        {details && (
          <div className="advanced">
            <div className="form-grid">
              {field("subcategory", "Sous-catégorie")}
              {field("material", "Matière")}
              {field("pattern", "Motif")}
              {field("fit", "Coupe")}
              {field("silhouette", "Silhouette")}
              {field("length", "Longueur")}
              {field("sleeve", "Manches")}
              {field("neckline", "Col / encolure")}
              <label>
                Détails (séparés par une virgule)
                <TextList
                  value={g.details}
                  onChange={(details) => patch({ details })}
                />
              </label>
              <label>
                Rôle de superposition
                <select
                  value={g.layeringRole}
                  onChange={(e) => patch({ layeringRole: e.target.value })}
                >
                  <option value="base">Base</option>
                  <option value="mid">Couche intermédiaire</option>
                  <option value="outer">Couche extérieure</option>
                </select>
              </label>
              <label>
                Chaleur
                <select
                  value={g.warmth ?? ""}
                  onChange={(e) =>
                    patch({
                      warmth: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <option value="">Non renseignée</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Formalité
                <select
                  value={g.formality ?? ""}
                  onChange={(e) =>
                    patch({
                      formality:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                >
                  <option value="">Non renseignée</option>
                  {data.vocabularies.formalityLevels.map((s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Température minimum (°C)
                <input
                  type="number"
                  min="-60"
                  max="65"
                  value={g.temperature?.[0] ?? ""}
                  onChange={(e) =>
                    patch({
                      temperature:
                        e.target.value === ""
                          ? null
                          : [Number(e.target.value), g.temperature?.[1] ?? 30],
                    })
                  }
                />
              </label>
              <label>
                Température maximum (°C)
                <input
                  type="number"
                  min={g.temperature?.[0] ?? -60}
                  max="65"
                  value={g.temperature?.[1] ?? ""}
                  onChange={(e) =>
                    patch({
                      temperature:
                        e.target.value === ""
                          ? null
                          : [g.temperature?.[0] ?? 0, Number(e.target.value)],
                    })
                  }
                />
              </label>
              <label>
                Nombre de ports
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={g.usageCount}
                  onChange={(e) =>
                    patch({ usageCount: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Dernier port
                <input
                  type="date"
                  value={g.lastWorn || ""}
                  onChange={(e) => patch({ lastWorn: e.target.value || null })}
                />
              </label>
            </div>
            <Tags
              label="Saisons"
              options={data.vocabularies.seasons}
              value={g.seasons}
              onChange={(seasons) => patch({ seasons })}
            />
            <Tags
              label="Occasions"
              options={data.vocabularies.occasions}
              value={g.occasions}
              onChange={(occasions) => patch({ occasions })}
            />
            <Tags
              label="Couleurs secondaires"
              options={data.vocabularies.colors.map((c) => c.id)}
              value={g.secondaryColors}
              onChange={(secondaryColors) => patch({ secondaryColors })}
            />
          </div>
        )}
        <div className="modal-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" type="submit">
            Enregistrer la pièce
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function OutfitForm({
  initial,
  data,
  onClose,
  onSave,
  onError,
}: Base<Outfit>) {
  const [o, set] = useState(structuredClone(initial));
  const [q, search] = useState("");
  const [role, filter] = useState("");
  const items = o.itemIds
    .map((id) => data.garments.find((g) => g.id === id)!)
    .filter(Boolean);
  const a = assess(items, data);
  return (
    <Modal title="Composer une tenue" onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!o.itemIds.length) {
            onError("Choisir au moins une pièce.");
            return;
          }
          onSave(o);
        }}
      >
        <div className="builder-layout">
          <div>
            <label>
              Nom de la tenue
              <input
                required
                value={o.name}
                onChange={(e) => set({ ...o, name: e.target.value })}
              />
            </label>
            <OutfitVisual items={items} />
            <div className="chips">
              {items.map((g) => (
                <Chip
                  key={g.id}
                  onClick={() =>
                    set({
                      ...o,
                      itemIds: o.itemIds.filter((id) => id !== g.id),
                    })
                  }
                >
                  {g.name} ×
                </Chip>
              ))}
            </div>
            {a.warnings.map((w) => (
              <p key={w} className="hint">
                {w}
              </p>
            ))}
            <Tags
              label="Styles"
              options={data.vocabularies.styles}
              value={o.styles}
              onChange={(styles) => set({ ...o, styles })}
            />
            <Tags
              label="Occasions"
              options={data.vocabularies.occasions}
              value={o.occasions}
              onChange={(occasions) => set({ ...o, occasions })}
            />
            <Tags
              label="Saisons"
              options={data.vocabularies.seasons}
              value={o.seasons}
              onChange={(seasons) => set({ ...o, seasons })}
            />
            <label>
              Note personnelle /5
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={o.rating ?? ""}
                onChange={(e) =>
                  set({
                    ...o,
                    rating:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Notes
              <textarea
                value={o.notes}
                onChange={(e) => set({ ...o, notes: e.target.value })}
              />
            </label>
          </div>
          <div>
            <div className="filters">
              <input
                aria-label="Rechercher une pièce"
                placeholder="Rechercher une pièce…"
                value={q}
                onChange={(e) => search(e.target.value)}
              />
              <select
                aria-label="Rôle"
                value={role}
                onChange={(e) => filter(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                {Object.entries(roleLabels).map(([r, l]) => (
                  <option key={r} value={r}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="builder-items">
              {data.garments
                .filter(
                  (g) =>
                    !g.archived &&
                    (!role || g.role === role) &&
                    g.name.toLowerCase().includes(q.toLowerCase()),
                )
                .map((g) => (
                  <ItemCard
                    key={g.id}
                    item={g}
                    data={data}
                    selected={o.itemIds.includes(g.id)}
                    onSelect={() =>
                      set({
                        ...o,
                        itemIds: o.itemIds.includes(g.id)
                          ? o.itemIds.filter((id) => id !== g.id)
                          : [...o.itemIds, g.id],
                      })
                    }
                  />
                ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary" type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" type="submit">
            Enregistrer la tenue
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function InspirationForm({
  initial,
  data,
  onClose,
  onSave,
  onError,
}: Base<Inspiration>) {
  const [i, set] = useState(structuredClone(initial));
  const update = (index: number, v: Partial<Recipe>) =>
    set({
      ...i,
      recipe: i.recipe.map((r, n) => (n === index ? { ...r, ...v } : r)),
    });
  return (
    <Modal title="Une inspiration, votre interprétation" onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(i);
        }}
      >
        <div className="form-grid">
          <div>
            <Photo item={i} />
            <label className="secondary upload">
              <Upload size={16} /> Ajouter une image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    readImage(f)
                      .then((imagePath) => set({ ...i, imagePath }))
                      .catch((e) => onError(e.message));
                }}
              />
            </label>
            <label>
              Chemin d’image local
              <input
                value={i.imagePath.startsWith("data:") ? "" : i.imagePath}
                onChange={(e) => set({ ...i, imagePath: e.target.value })}
                placeholder="images/inspiration/look.jpg"
              />
            </label>
          </div>
          <div>
            <label>
              Titre
              <input
                required
                value={i.title}
                onChange={(e) => set({ ...i, title: e.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                value={i.description}
                onChange={(e) => set({ ...i, description: e.target.value })}
              />
            </label>
            <Tags
              label="Direction stylistique"
              options={data.vocabularies.styles}
              value={i.styles}
              onChange={(styles) => set({ ...i, styles })}
            />
            <label>
              Notes
              <textarea
                value={i.notes}
                onChange={(e) => set({ ...i, notes: e.target.value })}
              />
            </label>
          </div>
        </div>
        <div className="section-heading">
          <h3>La recette du look</h3>
          <button
            type="button"
            className="secondary"
            onClick={() =>
              set({
                ...i,
                recipe: [
                  ...i.recipe,
                  {
                    id: uid(),
                    label: "",
                    role: "top",
                    colors: [],
                    styles: [],
                    details: [],
                  },
                ],
              })
            }
          >
            <Plus size={16} /> Ajouter une pièce
          </button>
        </div>
        <p className="hint">
          Décrivez les pièces visibles. Le rapprochement est local ; l’image
          n’est pas analysée automatiquement.
        </p>
        {!i.recipe.length && (
          <Empty title="Décomposez ce qui vous plaît">
            Un haut, une jupe, une maille, des chaussures…
          </Empty>
        )}
        {i.recipe.map((r, index) => (
          <div className="recipe-editor" key={r.id}>
            <div className="form-grid">
              <label>
                Pièce recherchée
                <input
                  required
                  placeholder="Blouse blanche à col Claudine"
                  value={r.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                />
              </label>
              <label>
                Rôle
                <select
                  value={r.role}
                  onChange={(e) =>
                    update(index, { role: e.target.value as Role })
                  }
                >
                  {Object.entries(roleLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Détails recherchés, séparés par virgules
                <TextList
                  value={r.details}
                  onChange={(details) => update(index, { details })}
                />
              </label>
              <label>
                Couleur principale
                <select
                  value={r.colors[0] || ""}
                  onChange={(e) =>
                    update(index, {
                      colors: e.target.value ? [e.target.value] : [],
                    })
                  }
                >
                  <option value="">Libre</option>
                  {data.vocabularies.colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Tags
              label="Styles de cette pièce"
              options={data.vocabularies.styles}
              value={r.styles}
              onChange={(styles) => update(index, { styles })}
            />
            <button
              type="button"
              className="text-button danger"
              onClick={() =>
                set({ ...i, recipe: i.recipe.filter((x) => x.id !== r.id) })
              }
            >
              <Trash2 size={15} /> Retirer
            </button>
          </div>
        ))}
        <div className="modal-footer">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary">Enregistrer l’inspiration</button>
        </div>
      </form>
    </Modal>
  );
}
