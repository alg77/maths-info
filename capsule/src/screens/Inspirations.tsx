import { useState } from "react";
import { Plus, ArrowUpRight, ArrowRight, Pencil } from "lucide-react";
import type { Actions } from "../App";
import { type Inspiration, makeOutfit, uid } from "../model";
import { matchRecipe } from "../engine";
import { PageHead, Empty, Modal, Photo } from "../ui";

export function InspirationsPage(a: Actions) {
  const { data } = a;
  const [selected, setSelected] = useState<string | null>(null),
    [overrides, setOverrides] = useState<Record<string, string>>({});
  const i = data.inspirations.find((x) => x.id === selected);
  const result = i ? matchRecipe(i, data) : null;
  const create = () =>
    a.editInspiration({
      id: uid(),
      title: "",
      imagePath: "",
      description: "",
      styles: [],
      palette: [],
      recipe: [],
      notes: "",
    });
  return (
    <>
      <PageHead
        eyebrow="DE L’IDÉE À VOTRE DRESSING"
        title="Ce qui vous inspire"
        description="Retenez l’esprit d’un look. Retrouvez-le dans vos propres pièces."
        action={
          <button className="primary" onClick={create}>
            <Plus size={17} /> Ajouter une inspiration
          </button>
        }
      />
      <div className="inspiration-steps">
        <div>
          <span>01</span>
          <strong>Une image, une envie</strong>
          <p>Ajoutez votre référence.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Décomposez le look</strong>
          <p>Pièces, couleurs et petits détails.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Réinterprétez-le</strong>
          <p>Avec les pièces de votre dressing.</p>
        </div>
      </div>
      {data.inspirations.length ? (
        <div className="wardrobe-grid">
          {data.inspirations.map((i) => (
            <article className="inspiration-card" key={i.id}>
              <button
                className="image-button"
                onClick={() => {
                  setSelected(i.id);
                  setOverrides({});
                }}
              >
                <Photo item={i} />
              </button>
              <div className="outfit-caption">
                <small>{i.recipe.length} ÉLÉMENTS DANS LA RECETTE</small>
                <h3>{i.title}</h3>
                <p>{i.description}</p>
                <button
                  className="text-button"
                  onClick={() => {
                    setSelected(i.id);
                    setOverrides({});
                  }}
                >
                  Retrouver ce look <ArrowUpRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Votre regard est le point de départ"
          action={
            <button className="primary" onClick={create}>
              Créer ma première inspiration
            </button>
          }
        >
          Une photo, une silhouette aperçue, une association de couleurs.
          Transformez l’envie en une recette que votre dressing peut
          interpréter.
        </Empty>
      )}
      {i && result && (
        <Modal title={i.title} onClose={() => setSelected(null)} wide>
          <div className="detail-columns">
            <Photo item={i} />
            <div>
              <div className="eyebrow">PROXIMITÉ AVEC LA RECETTE</div>
              <h2>{result.score}%</h2>
              <p>{i.description}</p>
              <p className="hint">
                Score du rapprochement initial, fondé sur les rôles, couleurs,
                styles et détails décrits. Les substitutions manuelles ne
                modifient pas ce repère.
              </p>
              {result.missing.length > 0 && (
                <p className="review">
                  À adapter : {result.missing.join(", ")}
                </p>
              )}
              <button
                className="secondary"
                onClick={() => {
                  setSelected(null);
                  a.editInspiration(i);
                }}
              >
                <Pencil size={16} /> Affiner la recette
              </button>
            </div>
          </div>
          <div className="recipe-matches">
            {result.matches.map((m) => (
              <div className="recipe-match" key={m.recipe.id}>
                <div>
                  <small>VOUS RECHERCHEZ</small>
                  <h3>{m.recipe.label}</h3>
                  <span className="hint">
                    {m.best
                      ? `${m.best.score}% de proximité`
                      : "Pièce manquante"}
                  </span>
                </div>
                <ArrowRight size={20} />
                <div>
                  {m.best ? (
                    <>
                      <Photo
                        item={data.garments.find(
                          (g) =>
                            g.id ===
                            (overrides[m.recipe.id] || m.best!.item.id),
                        )!}
                      />
                      <select
                        aria-label={"Substitut pour " + m.recipe.label}
                        value={overrides[m.recipe.id] || m.best.item.id}
                        onChange={(e) =>
                          setOverrides({
                            ...overrides,
                            [m.recipe.id]: e.target.value,
                          })
                        }
                      >
                        {data.garments
                          .filter(
                            (g) =>
                              g.role === m.recipe.role &&
                              g.status === "owned" &&
                              !g.archived,
                          )
                          .map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                      </select>
                    </>
                  ) : (
                    <p>Essayez une autre recette ou explorez votre wishlist.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button
              className="text-button danger"
              onClick={() => {
                a.commit((d) => {
                  d.inspirations = d.inspirations.filter((x) => x.id !== i.id);
                }, "Inspiration retirée.");
                setSelected(null);
              }}
            >
              Retirer cette inspiration
            </button>
            <button
              className="primary"
              disabled={!result.matches.some((m) => m.best)}
              onClick={() => {
                const ids = [
                  ...new Set(
                    result.matches.flatMap((m) =>
                      m.best ? [overrides[m.recipe.id] || m.best.item.id] : [],
                    ),
                  ),
                ];
                setSelected(null);
                a.editOutfit({
                  ...makeOutfit(ids, i.title + " — mon interprétation"),
                  source: "inspiration",
                  styles: i.styles,
                  notes: i.description,
                });
              }}
            >
              Composer mon interprétation
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
