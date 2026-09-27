import { useMemo, useState } from "react";
import { Plus, ArrowUpRight, Pencil, Check, Layers, Leaf } from "lucide-react";
import type { Actions } from "../App";
import { uid, roleLabels, blankGarment } from "../model";
import { analyzeWish } from "../engine";
import {
  PageHead,
  Empty,
  Chip,
  ItemCard,
  OutfitCard,
  Modal,
  Photo,
  BoardPreview,
} from "../ui";

export function WishlistPage(a: Actions) {
  const { data } = a;
  const wishes = data.garments.filter(
    (g) => g.status === "wishlist" && !g.archived,
  );
  const [selected, select] = useState(wishes[0]?.id || "");
  const g = wishes.find((g) => g.id === selected) || wishes[0];
  const result = useMemo(() => (g ? analyzeWish(g, data) : null), [data, g]);
  const [board, setBoard] = useState(false);
  const record = data.wishlist.find((w) => w.garmentId === g?.id);
  const sample = () => {
    const cat =
      data.vocabularies.categories.find(
        (c) => c.role === "top" && /haut|blouse|chemise/i.test(c.label),
      ) ||
      data.vocabularies.categories.find((c) => c.role === "top") ||
      data.vocabularies.categories[0];
    a.editItem({
      ...blankGarment(cat, "wishlist"),
      name: "Blouse crème à col Claudine",
      colors: data.vocabularies.colors.some((c) => c.id === "cream")
        ? ["cream"]
        : [],
      neckline: "Col Claudine",
      details: ["Col Claudine"],
      styles: data.vocabularies.styles.filter((s) =>
        ["Preppy", "Romantique", "French chic", "Workwear"].includes(s),
      ),
      pattern: "Uni",
      notes: "À essayer avec les jupes, jeans et mailles du dressing.",
    });
  };
  return (
    <>
      <PageHead
        eyebrow="ACHETER AVEC INTENTION"
        title="Une envie. Une vraie place ?"
        description="Avant d’ajouter une pièce, découvrez ce qu’elle apporte à votre dressing."
        action={
          <button className="primary" onClick={() => a.addItem("wishlist")}>
            <Plus size={17} /> Ajouter une envie
          </button>
        }
      />
      <div className="wishlist-intro">
        <Leaf size={25} />
        <p>Une pièce qui vous plaît mérite des tenues qui existent déjà.</p>
        <button className="text-button" onClick={sample}>
          Essayer la blouse à col Claudine <ArrowUpRight size={16} />
        </button>
      </div>
      {!g || !result ? (
        <Empty
          title="Des envies bien choisies"
          action={
            <button className="primary" onClick={() => a.addItem("wishlist")}>
              Analyser une envie
            </button>
          }
        >
          Ajoutez une pièce avec ses couleurs et son style pour explorer sa
          place dans votre dressing.
        </Empty>
      ) : (
        <div className="wish-layout">
          <div className="wish-list">
            {wishes.map((w) => (
              <button
                className={"wish-row " + (g.id === w.id ? "active" : "")}
                key={w.id}
                onClick={() => select(w.id)}
              >
                <Photo item={w} />
                <span>
                  <strong>{w.name}</strong>
                  <small>{w.category}</small>
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
          <section className="wish-analysis">
            <div className="wish-heading">
              <Photo item={g} />
              <div>
                <div className="eyebrow">VOTRE PROCHAINE PIÈCE ?</div>
                <h2>{g.name}</h2>
                <div className="chips">
                  <Chip active>
                    {result.cascade
                      ? "Achats complémentaires possibles"
                      : "Achat autonome"}
                  </Chip>
                  {result.strategic && <Chip>Ajout stratégique</Chip>}
                </div>
                <p>
                  {result.cascade
                    ? "Aucune tenue complète n’a été trouvée avec cette pièce et votre dressing actif."
                    : `Cette pièce peut rejoindre ${result.outfitCount}${result.truncated ? " ou plus" : ""} tenues complètes avec ce que vous possédez.`}
                </p>
                <button className="text-button" onClick={() => a.editItem(g)}>
                  <Pencil size={15} /> Affiner ses attributs
                </button>
              </div>
            </div>
            <div className="metrics">
              <div>
                <strong>
                  {result.score}
                  <small>/100</small>
                </strong>
                <span>accord avec les pièces compatibles</span>
              </div>
              <div>
                <strong>{result.matches.length}</strong>
                <span>pièces qui lui répondent</span>
              </div>
              <div>
                <strong>
                  {result.outfitCount}
                  {result.truncated ? "+" : ""}
                </strong>
                <span>nouvelles tenues estimées</span>
              </div>
            </div>
            <p className="hint">
              Confiance {result.confidence}% · calcul sur les attributs
              renseignés. Les variantes d’accessoires ne gonflent pas le compte.
            </p>
            <div className="detail-columns">
              <div>
                <h3>Ce qu’elle apporte</h3>
                <div className="chips">
                  {result.styles.length ? (
                    result.styles.map((s) => <Chip key={s}>{s}</Chip>)
                  ) : (
                    <span className="hint">
                      Renseignez les styles pour affiner l’analyse.
                    </span>
                  )}
                </div>
                <p>
                  {result.similar.length
                    ? `${result.similar.length} pièce(s) de rôle, couleur et style proches : vérifiez que cet achat apporte une différence utile.`
                    : "Aucune pièce très proche détectée sur les attributs renseignés."}
                </p>
                <p>
                  {result.missing.length
                    ? `Rôles complémentaires manquants : ${result.missing.map((r) => roleLabels[r]).join(", ")}.`
                    : result.cascade
                      ? "Les rôles nécessaires sont présents, mais les accords sont insuffisants. Essayez de préciser les attributs avant d’acheter davantage."
                      : "Aucun achat complémentaire nécessaire pour les tenues proposées."}
                </p>
              </div>
              <div>
                <h3>Votre décision, à votre rythme</h3>
                <label>
                  Priorité
                  <select
                    value={record?.priority || "medium"}
                    onChange={(e) =>
                      a.commit((d) => {
                        const w = d.wishlist.find((x) => x.garmentId === g.id);
                        if (w) w.priority = e.target.value;
                      })
                    }
                  >
                    <option value="high">Haute</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Basse</option>
                  </select>
                </label>
                <label>
                  Budget prévu
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={record?.budget ?? ""}
                    onChange={(e) =>
                      a.commit((d) => {
                        const w = d.wishlist.find((x) => x.garmentId === g.id);
                        if (w)
                          w.budget =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                      })
                    }
                  />
                </label>
                <button
                  className="secondary"
                  onClick={() =>
                    a.commit((d) => {
                      d.garments.find((x) => x.id === g.id)!.status = "owned";
                      d.wishlist = d.wishlist.filter(
                        (w) => w.garmentId !== g.id,
                      );
                    }, "Cette pièce rejoint votre dressing.")
                  }
                >
                  <Check size={16} /> Je l’ai achetée
                </button>
              </div>
            </div>
            <h3>Déjà dans votre dressing</h3>
            <div className="related-grid">
              {result.matches.slice(0, 6).map((x) => (
                <ItemCard
                  key={x.item.id}
                  item={x.item}
                  data={data}
                  onOpen={() => a.openItem(x.item.id)}
                />
              ))}
            </div>
            <div className="section-heading">
              <h3>Ce qu’elle permet de composer</h3>
              <button
                className="text-button"
                disabled={!result.outfits.length}
                onClick={() => setBoard(true)}
              >
                Voir la planche <Layers size={16} />
              </button>
            </div>
            <div className="outfit-grid">
              {result.outfits.map((o, i) => (
                <OutfitCard
                  key={i}
                  outfit={{ ...o, label: `Nouvel accord ${i + 1}` }}
                  data={data}
                  onOpen={() => a.saveSuggestion(o.itemIds, `Avec ${g.name}`)}
                  onSave={() => a.saveSuggestion(o.itemIds, `Avec ${g.name}`)}
                />
              ))}
            </div>
          </section>
        </div>
      )}
      {board && g && result && (
        <Modal
          title="Une envie dans votre dressing"
          onClose={() => setBoard(false)}
          wide
        >
          <BoardPreview
            title={g.name}
            items={[g, ...result.matches.slice(0, 5).map((m) => m.item)]}
            notes="Une envie, des possibilités déjà présentes."
            data={data}
            onError={a.notify}
          />
          <button
            className="primary"
            onClick={() => {
              a.commit((d) => {
                d.boards.push({
                  id: uid(),
                  title: g.name,
                  itemIds: [
                    g.id,
                    ...result.matches.slice(0, 5).map((m) => m.item.id),
                  ],
                  notes: "Une envie, des possibilités déjà présentes.",
                  styles: g.styles,
                  kind: "Wishlist",
                });
              }, "Planche sauvegardée.");
              setBoard(false);
            }}
          >
            Conserver cette planche
          </button>
        </Modal>
      )}
    </>
  );
}
