import { useMemo, useState } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Check,
  Leaf,
} from "lucide-react";
import type { Actions } from "../App";
import { day } from "../model";
import { recommend, assess, type Context, type Suggestion } from "../engine";
import { PageHead, Empty, Chip, OutfitCard, OutfitVisual, Modal } from "../ui";

export function TodayPage(a: Actions) {
  const { data } = a;
  const [ctx, setCtx] = useState<Context>({
    temperature: data.preferences.temperature,
    occasion: data.preferences.occasion,
    style: data.preferences.style,
    weather: "dry",
    vibe: "",
  });
  const [request, generate] = useState(ctx);
  const suggestions = useMemo(() => recommend(data, request), [data, request]);
  const hero = suggestions[0];
  const owned = data.garments.filter(
    (g) => g.status === "owned" && !g.archived,
  );
  const [preview, setPreview] = useState<Suggestion | null>(null);
  return (
    <>
      <PageHead
        eyebrow={new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title={
          data.preferences.name
            ? `Bonjour ${data.preferences.name}.`
            : "Votre dressing. De nouvelles histoires."
        }
        description="Moins d’hésitation, plus d’inspiration. Composez avec ce que vous aimez déjà."
        action={
          <button className="secondary" onClick={() => a.addItem()}>
            <Plus size={17} /> Ajouter une pièce
          </button>
        }
      />
      <div className="today-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="small-line" /> L’INSPIRATION DU JOUR
          </div>
          <h2>
            Votre prochaine
            <br />
            belle association <br />
            <em>est déjà ici.</em>
          </h2>
          <p>
            Un nouveau regard sur vos pièces préférées.
            <br />
            Quelques accords choisis, à votre façon.
          </p>
          <button
            className="primary"
            onClick={() =>
              document
                .getElementById("today-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Trouver ma tenue <ArrowRight size={17} />
          </button>
          <div className="hero-stat">
            <span>{owned.length}</span> pièces à réinventer{" "}
            <span className="mini-star">✳</span>
          </div>
        </div>
        <div className="hero-board">
          {hero ? (
            <>
              <span className="board-kicker">UNE COMPOSITION À EXPLORER</span>
              <OutfitVisual
                large
                items={hero.itemIds.map((id) =>
                  data.garments.find((g) => g.id === id)!,
                )}
              />
              <button className="hero-label" onClick={() => setPreview(hero)}>
                <div>
                  <small>LES PIÈCES DIALOGUENT</small>
                  <strong>Un accord, mille possibilités</strong>
                </div>
                <ArrowUpRight size={21} />
              </button>
            </>
          ) : (
            <Empty title="Tout commence par vos pièces">
              Ajoutez un haut, un bas ou une robe, puis des chaussures pour
              composer une tenue.
            </Empty>
          )}
        </div>
      </div>
      <section className="today-config" id="today-form">
        <div className="section-heading">
          <div>
            <div className="eyebrow">VOTRE JOURNÉE, VOTRE ALLURE</div>
            <h2>De quoi avez-vous envie ?</h2>
          </div>
          <span className="subtle">La météo est renseignée par vous.</span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate({ ...ctx });
          }}
        >
          <div className="context-fields">
            <label>
              Température
              <div className="input-unit">
                <input
                  type="number"
                  aria-label="Température"
                  min="-40"
                  max="55"
                  value={ctx.temperature}
                  onChange={(e) =>
                    setCtx({ ...ctx, temperature: Number(e.target.value) })
                  }
                />
                <span>°C</span>
              </div>
            </label>
            <label>
              Occasion
              <select
                value={ctx.occasion}
                onChange={(e) => setCtx({ ...ctx, occasion: e.target.value })}
              >
                <option value="">Toutes les occasions</option>
                {data.vocabularies.occasions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Style du jour
              <select
                value={ctx.style}
                onChange={(e) => setCtx({ ...ctx, style: e.target.value })}
              >
                <option value="">Laissez-moi surprendre</option>
                {data.vocabularies.styles.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Une pièce à porter
              <select
                value={ctx.mandatory || ""}
                onChange={(e) => setCtx({ ...ctx, mandatory: e.target.value })}
              >
                <option value="">Aucune pièce imposée</option>
                {owned
                  .filter((g) => !g.forSale)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </label>
            <button className="primary" type="submit">
              <Sparkles size={17} /> M’inspirer
            </button>
          </div>
          <div className="row context-bottom">
            <span className="subtle">L’envie :</span>
            {[
              ["", "Libre"],
              ["comfortable", "Confortable"],
              ["polished", "Soignée"],
            ].map(([v, l]) => (
              <Chip
                key={v}
                active={ctx.vibe === v}
                onClick={() => setCtx({ ...ctx, vibe: v })}
              >
                {l}
              </Chip>
            ))}
            <label className="weather-toggle">
              <input
                type="checkbox"
                checked={ctx.weather === "rain"}
                onChange={(e) =>
                  setCtx({ ...ctx, weather: e.target.checked ? "rain" : "dry" })
                }
              />{" "}
              Pluie prévue
            </label>
          </div>
        </form>
      </section>
      <div className="section-heading">
        <div>
          <div className="eyebrow">SÉLECTION PERSONNELLE</div>
          <h2>Trois pistes, à vous de choisir.</h2>
        </div>
        <button className="text-button" onClick={() => a.go("outfits")}>
          Mon lookbook <ArrowUpRight size={17} />
        </button>
      </div>
      {suggestions.length ? (
        <div className="outfit-grid">
          {suggestions.map((s) => (
            <OutfitCard
              key={s.label}
              outfit={s}
              data={data}
              onOpen={() => setPreview(s)}
              onSave={() => a.saveSuggestion(s.itemIds, s.label)}
            />
          ))}
        </div>
      ) : (
        <Empty
          title="Pas encore de tenue complète pour cette demande"
          action={
            <button className="secondary" onClick={() => a.go("wardrobe")}>
              Explorer mon dressing
            </button>
          }
        >
          Vérifiez la pièce imposée et la disponibilité d’un haut + bas (ou
          d’une robe) et de chaussures.
        </Empty>
      )}
      <div className="gentle-note">
        <Leaf size={23} />
        <div>
          <strong>
            La plus belle nouveauté ? Une autre façon de porter vos pièces.
          </strong>
          <p>
            Les scores sont des repères, pas des règles. Votre confort et votre
            regard comptent avant tout.
          </p>
        </div>
      </div>
      {preview && (
        <Modal title={preview.label} onClose={() => setPreview(null)} wide>
          <OutfitVisual
            items={preview.itemIds.map((id) =>
              data.garments.find((g) => g.id === id)!,
            )}
            large
          />
          <div className="detail-columns">
            <div>
              <h3>Pourquoi cet accord</h3>
              {preview.reasons.map((r) => (
                <p key={r} className="reason">
                  <Check size={16} />
                  {r}
                </p>
              ))}
              <p className="hint">
                Accord {preview.score}/100 · confiance {preview.confidence}%
              </p>
              {preview.warnings.map((w) => (
                <p className="hint" key={w}>
                  {w}
                </p>
              ))}
            </div>
            <div>
              <h3>Une alternative dans votre dressing</h3>
              {preview.itemIds.map((id) => {
                const g = data.garments.find((g) => g.id === id)!;
                const substitute = data.garments
                  .filter(
                    (x) =>
                      x.id !== id &&
                      x.role === g.role &&
                      x.status === "owned" &&
                      !x.archived &&
                      !x.forSale,
                  )
                  .map((x) => ({
                    g: x,
                    score: assess(
                      preview.itemIds.map((i) =>
                        i === id ? x : data.garments.find((g) => g.id === i)!,
                      ),
                      data,
                      request,
                    ).score,
                  }))
                  .sort((x, y) => y.score - x.score)[0];
                return substitute ? (
                  <button
                    key={id}
                    className="substitution"
                    onClick={() => {
                      const ids = preview.itemIds.map((i) =>
                        i === id ? substitute.g.id : i,
                      );
                      setPreview({
                        ...assess(
                          ids.map((i) =>
                            data.garments.find((g) => g.id === i)!,
                          ),
                          data,
                          request,
                        ),
                        itemIds: ids,
                        label: preview.label,
                      });
                    }}
                  >
                    {g.name}
                    <ArrowRight size={14} />
                    {substitute.g.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="secondary"
              onClick={() => a.wear(preview.itemIds)}
            >
              Porter aujourd’hui
            </button>
            <button
              className="primary"
              onClick={() => {
                a.saveSuggestion(preview.itemIds, preview.label);
                setPreview(null);
              }}
            >
              Enregistrer cette tenue
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
