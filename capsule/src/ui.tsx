import { useEffect, useRef, useState, useId, type ReactNode } from "react";
import {
  X,
  Image as ImageIcon,
  Heart,
  ArrowUpRight,
  Plus,
  Check,
  Download,
} from "lucide-react";
import { type Garment, type Wardrobe, type Outfit, roleLabels } from "./model";
import { type Suggestion, assess } from "./engine";
import { download } from "./storage";
export function IconButton({
  label,
  onClick,
  children,
  ...rest
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="icon-button"
      {...rest}
    >
      {children}
    </button>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current!;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={wide ? "modal wide" : "modal"}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <IconButton label="Fermer" onClick={onClose}>
          <X size={22} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
export function Photo({
  item,
  className = "",
  ...rest
}: {
  item: { imagePath: string; name?: string; title?: string };
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.imagePath]);
  return (
    <div className={`photo ${className}`} {...rest}>
      {item.imagePath && !failed ? (
        <img
          src={
            item.imagePath.startsWith("data:")
              ? item.imagePath
              : "./" + item.imagePath
          }
          alt={item.name || item.title || "Inspiration"}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="photo-placeholder">
          <ImageIcon strokeWidth={1} size={34} />
          <span>{failed ? "Image indisponible" : "Une image à ajouter"}</span>
        </div>
      )}
    </div>
  );
}
export function Chip({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return onClick ? (
    <button
      type="button"
      aria-pressed={active}
      className={"chip " + (active ? "active" : "")}
      onClick={onClick}
    >
      {children}
    </button>
  ) : (
    <span className={"chip " + (active ? "active" : "")}>{children}</span>
  );
}
export function Tags({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <fieldset className="tags-field">
      <legend>{label}</legend>
      <div className="chips">
        {options.map((o) => (
          <Chip
            key={o}
            active={value.includes(o)}
            onClick={() =>
              onChange(
                value.includes(o)
                  ? value.filter((x) => x !== o)
                  : [...value, o],
              )
            }
          >
            {o}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-flower">✳</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function ItemCard({
  item,
  data,
  onOpen,
  onFavorite,
  selected,
  onSelect,
}: {
  item: Garment;
  data: Wardrobe;
  onOpen?: () => void;
  onFavorite?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <article className={"item-card " + (selected ? "selected" : "")}>
      <div className="item-image">
        <button
          className="image-button"
          onClick={onSelect || onOpen}
          aria-label={(onSelect ? "Sélectionner " : "Voir ") + item.name}
        >
          <Photo item={item} />
        </button>
        {onFavorite && (
          <button
            className={"favorite " + (item.favorite ? "is-favorite" : "")}
            aria-label={
              item.favorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
            onClick={onFavorite}
          >
            <Heart size={17} fill={item.favorite ? "currentColor" : "none"} />
          </button>
        )}
        {selected && (
          <span className="selected-mark">
            <Check size={16} />
          </span>
        )}
        {item.forSale && <span className="item-badge">À vendre</span>}
      </div>
      <div className="item-caption">
        <small>
          {item.brand ||
            data.vocabularies.categories.find((c) => c.id === item.category)
              ?.label ||
            item.category}
        </small>
        <button className="text-button item-title" onClick={onSelect || onOpen}>
          {item.name}
        </button>
        <div className="item-foot">
          <div className="dots">
            {item.colors.slice(0, 4).map((id) => (
              <span
                key={id}
                style={{
                  background:
                    data.vocabularies.colors.find((c) => c.id === id)?.hex ||
                    "#ddd",
                }}
                title={
                  data.vocabularies.colors.find((c) => c.id === id)?.label || id
                }
              />
            ))}
          </div>
          <span>
            {item.status === "wishlist"
              ? "À envisager"
              : `${item.usageCount} porté${item.usageCount > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>
    </article>
  );
}
export function OutfitVisual({
  items,
  large = false,
}: {
  items: Garment[];
  large?: boolean;
}) {
  return (
    <div
      className={
        "outfit-visual " +
        (large ? "large" : "") +
        " count-" +
        Math.min(4, items.length)
      }
    >
      {items.slice(0, 5).map((g, i) => (
        <div className={"outfit-piece piece-" + i} key={g.id}>
          <Photo item={g} />
          <span>{roleLabels[g.role]}</span>
        </div>
      ))}
    </div>
  );
}
export function OutfitCard({
  outfit,
  data,
  onSave,
  onOpen,
  onWear,
}: {
  outfit: Outfit | Suggestion;
  data: Wardrobe;
  onSave?: () => void;
  onOpen?: () => void;
  onWear?: () => void;
}) {
  const items = outfit.itemIds
    .map((id) => data.garments.find((g) => g.id === id))
    .filter(Boolean) as Garment[];
  const generated = "score" in outfit;
  const a = generated ? outfit : assess(items, data);
  return (
    <article className="outfit-card">
      <button
        className="outfit-open"
        onClick={onOpen}
        aria-label={"Voir " + (generated ? outfit.label : outfit.name)}
      >
        <OutfitVisual items={items} />
      </button>
      <div className="outfit-caption">
        <div className="row between">
          <small>
            {generated
              ? "SUGGESTION DE L’ATELIER"
              : items.some((g) => g.status === "wishlist")
                ? "TENUE PROJETÉE"
                : "VOTRE LOOKBOOK"}
          </small>
          <span className="score">
            {a.score}
            <span>/100</span>
          </span>
        </div>
        <h3>{generated ? outfit.label : outfit.name}</h3>
        <p>{a.reasons[0] || "Une composition à explorer à votre rythme."}</p>
        <div className="row between">
          <small>Confiance {a.confidence}%</small>
          {onSave ? (
            <button className="text-button" onClick={onSave}>
              <Plus size={15} /> Enregistrer
            </button>
          ) : (
            <button className="text-button" onClick={onOpen}>
              Explorer <ArrowUpRight size={16} />
            </button>
          )}
          {onWear && (
            <button className="text-button" onClick={onWear}>
              Portée
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export async function exportBoard(
  title: string,
  items: Garment[],
  notes: string,
  data: Wardrobe,
) {
  const parts = await Promise.all(
    items.map(async (g, i) => {
      let src = g.imagePath;
      if (src && !src.startsWith("data:")) {
        const response = await fetch("./" + src);
        if (!response.ok) throw new Error(`Image manquante : ${g.name}`);
        const blob = await response.blob();
        src = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(r.error);
          r.readAsDataURL(blob);
        });
      }
      const x = 65 + (i % 3) * 355,
        y = 210 + Math.floor(i / 3) * 410;
      return `<rect x="${x}" y="${y}" width="325" height="330" rx="8" fill="#fff"/>${src ? `<image href="${esc(src)}" x="${x + 10}" y="${y + 10}" width="305" height="310" preserveAspectRatio="xMidYMid meet"/>` : ""}<text x="${x}" y="${y + 358}" font-size="16" fill="#283e33">${esc(g.name.slice(0, 34))}</text>`;
    }),
  );
  const height = 300 + Math.ceil(items.length / 3) * 410;
  download(
    title.replace(/[^\p{L}\p{N} -]/gu, "") + ".svg",
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}"><rect width="1200" height="${height}" fill="#f5f2e9"/><text x="65" y="70" fill="#647766" font-family="sans-serif" font-size="17" letter-spacing="4">ATELIER · CARNET DE STYLE</text><text x="65" y="137" font-family="Georgia,serif" font-size="45" fill="#283e33">${esc(title.slice(0, 43))}</text><text x="65" y="174" font-family="sans-serif" font-size="16" fill="#6a7064">${esc(notes.slice(0, 110))}</text><g font-family="sans-serif">${parts.join("")}</g><g>${[
      ...new Set(items.flatMap((g) => g.colors)),
    ]
      .slice(0, 10)
      .map(
        (id, i) =>
          `<circle cx="${80 + i * 28}" cy="${height - 42}" r="9" fill="${data.vocabularies.colors.find((c) => c.id === id)?.hex || "#ddd"}"/>`,
      )
      .join(
        "",
      )}</g><text x="1000" y="${height - 35}" font-family="Georgia" font-size="22" fill="#283e33">Atelier.</text></svg>`,
    "image/svg+xml",
  );
}
export function BoardPreview({
  title,
  items,
  notes,
  data,
  onError,
}: {
  title: string;
  items: Garment[];
  notes: string;
  data: Wardrobe;
  onError: (s: string) => void;
}) {
  return (
    <>
      <div className="editorial-board">
        <div className="eyebrow">Atelier · carnet de style</div>
        <h2>{title}</h2>
        <div className="board-pieces">
          {items.map((g) => (
            <div key={g.id}>
              <Photo item={g} />
              <p>{g.name}</p>
            </div>
          ))}
        </div>
        <div className="row between">
          <div className="dots">
            {[...new Set(items.flatMap((g) => g.colors))].map((id) => (
              <span
                key={id}
                style={{
                  background:
                    data.vocabularies.colors.find((c) => c.id === id)?.hex ||
                    "#ddd",
                }}
              />
            ))}
          </div>
          <em>{notes}</em>
        </div>
      </div>
      <button
        className="secondary"
        onClick={() =>
          exportBoard(title, items, notes, data).catch((e) =>
            onError(e.message),
          )
        }
      >
        <Download size={17} /> Exporter la planche SVG
      </button>
    </>
  );
}
