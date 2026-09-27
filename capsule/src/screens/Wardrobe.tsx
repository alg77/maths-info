import { useState } from "react";
import {
  Plus,
  Search,
  Heart,
  Copy,
  Pencil,
  Archive,
  Download,
  Upload,
  Bookmark,
} from "lucide-react";
import type { Actions } from "../App";
import { type Garment, uid, roleLabels } from "../model";
import { pair, enumerate } from "../engine";
import {
  PageHead,
  Empty,
  Chip,
  ItemCard,
  OutfitCard,
  Modal,
  Photo,
} from "../ui";
import { download } from "../storage";

export function WardrobePage(a: Actions) {
  const { data } = a;
  const [q, setQ] = useState(""),
    [category, setCategory] = useState(""),
    [favorites, setFavorites] = useState(false),
    [sort, setSort] = useState("name"),
    [archived, setArchived] = useState(false),
    [style, setStyle] = useState(""),
    [season, setSeason] = useState(""),
    [color, setColor] = useState("");
  const [viewName, setViewName] = useState("");
  const list = data.garments
    .filter(
      (g) =>
        g.status === "owned" &&
        g.archived === archived &&
        (!category || g.category === category) &&
        (!favorites || g.favorite) &&
        (!style || g.styles.includes(style)) &&
        (!season || g.seasons.includes(season)) &&
        (!color || g.colors.includes(color)) &&
        [g.name, g.brand, g.material, ...g.styles]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "uses"
        ? b.usageCount - a.usageCount
        : sort === "underused"
          ? a.usageCount - b.usageCount
          : a.name.localeCompare(b.name, "fr"),
    );
  return (
    <>
      <PageHead
        eyebrow="VOTRE COLLECTION"
        title="Le dressing"
        description="Vos pièces, leurs détails, toutes leurs possibilités."
        action={
          <button className="primary" onClick={() => a.addItem()}>
            <Plus size={17} /> Ajouter une pièce
          </button>
        }
      />
      <div className="wardrobe-summary">
        <span>
          <strong>
            {
              data.garments.filter((g) => g.status === "owned" && !g.archived)
                .length
            }
          </strong>{" "}
          pièces dans votre dressing
        </span>
        <span>
          <Heart size={15} />
          {
            data.garments.filter((g) => g.favorite && g.status === "owned")
              .length
          }{" "}
          favorites
        </span>
        <button className="text-button" onClick={() => a.go("settings")}>
          <Upload size={15} /> Importer / exporter
        </button>
      </div>
      <div className="wardrobe-toolbar">
        <div className="search">
          <Search size={17} />
          <input
            placeholder="Une pièce, une marque, une matière…"
            aria-label="Rechercher dans le dressing"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          className={"secondary " + (favorites ? "chosen" : "")}
          onClick={() => setFavorites(!favorites)}
        >
          <Heart size={16} /> Favoris
        </button>
        <select
          aria-label="Trier les pièces"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Nom · A à Z</option>
          <option value="uses">Les plus portées</option>
          <option value="underused">À redécouvrir</option>
        </select>
      </div>
      <div className="saved-views">
        <select
          aria-label="Mes vues enregistrées"
          defaultValue=""
          onChange={(e) => {
            const v = data.preferences.savedViews?.find(
              (v) => v.id === e.target.value,
            );
            if (v) {
              setQ(v.q);
              setCategory(v.category);
              setFavorites(v.favorites);
              setSort(v.sort);
              setArchived(v.archived);
              setStyle(v.style);
              setSeason(v.season);
              setColor(v.color);
            }
          }}
        >
          <option value="">Mes vues enregistrées</option>
          {data.preferences.savedViews?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Nom de la vue"
          placeholder="Nommer cette sélection…"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
        />
        <button
          className="text-button"
          disabled={!viewName.trim()}
          onClick={() => {
            a.commit((d) => {
              d.preferences.savedViews = [
                ...(d.preferences.savedViews || []),
                {
                  id: uid(),
                  name: viewName.trim(),
                  q,
                  category,
                  favorites,
                  sort,
                  archived,
                  style,
                  season,
                  color,
                },
              ];
            }, "Vue enregistrée.");
            setViewName("");
          }}
        >
          <Bookmark size={15} /> Conserver la vue
        </button>
      </div>
      <div className="chips category-tabs">
        <Chip active={!category} onClick={() => setCategory("")}>
          Toutes les pièces
        </Chip>
        {data.vocabularies.categories.map((c) => (
          <Chip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </Chip>
        ))}
      </div>
      <div className="filter-line">
        <select
          aria-label="Filtrer par style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="">Tous les styles</option>
          {data.vocabularies.styles.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Filtrer par saison"
          value={season}
          onChange={(e) => setSeason(e.target.value)}
        >
          <option value="">Toutes les saisons</option>
          {data.vocabularies.seasons.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Filtrer par couleur"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          <option value="">Toutes les couleurs</option>
          {data.vocabularies.colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />{" "}
          Archives
        </label>
        <span>
          {list.length} pièce{list.length > 1 ? "s" : ""}
        </span>
      </div>
      {list.length ? (
        <div className="wardrobe-grid">
          {list.map((g) => (
            <ItemCard
              item={g}
              data={data}
              key={g.id}
              onOpen={() => a.openItem(g.id)}
              onFavorite={() =>
                a.commit((d) => {
                  d.garments.find((x) => x.id === g.id)!.favorite = !g.favorite;
                })
              }
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Un peu de place pour de nouvelles possibilités"
          action={
            <button
              className="secondary"
              onClick={() => {
                setQ("");
                setCategory("");
                setStyle("");
                setColor("");
                setSeason("");
                setFavorites(false);
              }}
            >
              Réinitialiser les filtres
            </button>
          }
        >
          Aucune pièce ne correspond à ces filtres.
        </Empty>
      )}
    </>
  );
}

export function ItemDetail(
  a: Actions & { item: Garment; onClose: () => void },
) {
  const { item: g, data } = a;
  const matching = data.garments
    .filter(
      (x) => x.id !== g.id && x.status === "owned" && !x.archived && !x.forSale,
    )
    .map((x) => ({ g: x, ...pair(g, x, data) }))
    .filter((x) => x.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  const outfits = enumerate(
    data,
    { mandatory: g.id },
    g.status === "wishlist" ? g : undefined,
  ).outfits;
  const [confirm, setConfirm] = useState(false);
  return (
    <Modal title={g.name} onClose={a.onClose} wide>
      <div className="item-detail">
        <Photo item={g} />
        <div>
          <div className="eyebrow">{g.brand || g.category}</div>
          <h2>{g.name}</h2>
          <div className="chips">
            {g.styles.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <p>
            {g.notes || "Une pièce à découvrir dans de nouvelles associations."}
          </p>
          <div className="metrics small">
            <div>
              <strong>{g.usageCount}</strong>
              <span>ports enregistrés</span>
            </div>
            <div>
              <strong>{outfits.length}</strong>
              <span>tenues possibles*</span>
            </div>
            <div>
              <strong>
                {g.price !== null && g.usageCount
                  ? new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: data.preferences.currency,
                    }).format(g.price / g.usageCount)
                  : "—"}
              </strong>
              <span>coût par port</span>
            </div>
          </div>
          <dl>
            {[
              ["Matière", g.material],
              ["Motif", g.pattern],
              ["Coupe", g.fit],
              ["Silhouette", g.silhouette],
              ["Col", g.neckline],
              ["Détails", g.details.join(", ")],
              ["Saisons", g.seasons.join(", ")],
              ["Occasions", g.occasions.join(", ")],
              ["Dernier port", g.lastWorn],
              ["Rôle", roleLabels[g.role]],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "À renseigner"}</dd>
              </div>
            ))}
          </dl>
          {g.reviewNeeded && (
            <p className="review hint">
              Les couleurs et styles ont été suggérés à partir du nom.
              Vérifiez-les pour affiner les recommandations.
            </p>
          )}
          <div className="row wrap">
            <button className="primary" onClick={() => a.editItem(g)}>
              <Pencil size={16} /> Modifier
            </button>
            <button
              className="secondary"
              onClick={() =>
                a.editItem({
                  ...g,
                  id: uid(),
                  name: g.name + " — copie",
                  usageCount: 0,
                  lastWorn: null,
                })
              }
            >
              <Copy size={16} /> Dupliquer
            </button>
            <button
              className="secondary"
              onClick={() =>
                a.commit(
                  (d) => {
                    d.garments.find((x) => x.id === g.id)!.archived =
                      !g.archived;
                  },
                  g.archived ? "Pièce restaurée." : "Pièce archivée.",
                )
              }
            >
              <Archive size={16} />
              {g.archived ? "Restaurer" : "Archiver"}
            </button>
            <button
              className="text-button"
              onClick={() =>
                download(
                  "piece.json",
                  JSON.stringify({ kind: "garments", garments: [g] }, null, 2),
                )
              }
            >
              <Download size={16} /> JSON
            </button>
          </div>
          <button
            className="text-button danger"
            onClick={() => setConfirm(true)}
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
      <div className="section-heading">
        <h3>Les pièces qui lui répondent</h3>
        <span className="hint">Accords estimés</span>
      </div>
      <div className="related-grid">
        {matching.map((x) => (
          <div key={x.g.id}>
            <ItemCard
              item={x.g}
              data={data}
              onOpen={() => a.openItem(x.g.id)}
            />
            <small>
              {x.reasons[0] || "Association à essayer"} · {x.score}/100
            </small>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <h3>Comment la porter</h3>
        <span className="hint">
          *Tenues complètes énumérées, sans variantes d’accessoires.
        </span>
      </div>
      <div className="outfit-grid">
        {outfits.slice(0, 3).map((o, i) => (
          <OutfitCard
            key={i}
            outfit={{ ...o, label: `Association ${i + 1}` }}
            data={data}
            onOpen={() => {
              a.onClose();
              a.saveSuggestion(o.itemIds, `Autour de ${g.name}`);
            }}
            onSave={() => {
              a.onClose();
              a.saveSuggestion(o.itemIds, `Autour de ${g.name}`);
            }}
          />
        ))}
      </div>
      {confirm && (
        <div className="confirm-box">
          <p>
            Supprimer cette pièce ? Les pièces utilisées par une tenue, une
            planche ou un historique doivent être archivées.
          </p>
          <div className="row">
            <button className="secondary" onClick={() => setConfirm(false)}>
              Annuler
            </button>
            <button
              className="primary"
              onClick={() => {
                if (
                  [...data.outfits, ...data.boards, ...data.wearEvents].some(
                    (o) => o.itemIds.includes(g.id),
                  )
                ) {
                  a.notify(
                    "Cette pièce est référencée. Utilisez Archiver pour préserver vos compositions.",
                  );
                  return;
                }
                a.commit((d) => {
                  d.garments = d.garments.filter((x) => x.id !== g.id);
                  d.wishlist = d.wishlist.filter((w) => w.garmentId !== g.id);
                }, "Pièce supprimée.");
                a.onClose();
              }}
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
