import { useMemo, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Actions } from "../App";
import { type Board, uid, roleLabels } from "../model";
import { insights } from "../engine";
import { PageHead, Modal, Photo, BoardPreview } from "../ui";

function Bars({
  values,
  label,
}: {
  values: [string, number][];
  label?: (s: string) => string;
}) {
  const max = Math.max(1, ...values.map((x) => x[1]));
  return (
    <div className="bars">
      {values.slice(0, 10).map(([key, n]) => (
        <div key={key}>
          <div className="row between">
            <span>{label ? label(key) : key}</span>
            <strong>{n}</strong>
          </div>
          <div className="bar">
            <i style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InsightsPage(a: Actions) {
  const { data } = a;
  const info = useMemo(() => insights(data), [data]);
  const [board, setBoard] = useState<Board | null>(null),
    [style, setStyle] = useState(data.vocabularies.styles[0]),
    [season, setSeason] = useState("");
  const makeBoard = () => {
    const pieces = info.owned
      .filter(
        (g) =>
          (!style || g.styles.includes(style)) &&
          (!season || g.seasons.includes(season)),
      )
      .slice(0, 9);
    if (!pieces.length) {
      a.notify(
        "Aucune pièce dans cette sélection. Renseignez leurs styles et saisons.",
      );
      return;
    }
    setBoard({
      id: uid(),
      title: season
        ? `Capsule ${season} · ${style || "Tous styles"}`
        : `L’esprit ${style || "de mon dressing"}`,
      itemIds: pieces.map((g) => g.id),
      notes: "Une sélection de pièces, de couleurs et de textures.",
      styles: style ? [style] : [],
      kind: "Capsule",
    });
  };
  return (
    <>
      <PageHead
        eyebrow="UN AUTRE REGARD"
        title="Votre style se dessine"
        description="Comprendre vos habitudes, repérer les possibles, acheter avec plus de recul."
      />
      <div className="metrics analytics-metrics">
        <div>
          <strong>{info.owned.length}</strong>
          <span>pièces possédées actives</span>
        </div>
        <div>
          <strong>{data.wearEvents.length}</strong>
          <span>ports de tenues enregistrés</span>
        </div>
        <div>
          <strong>
            {info.outfitCount}
            {info.truncated ? "+" : ""}
          </strong>
          <span>tenues complètes estimées</span>
        </div>
        <div>
          <strong>{info.owned.filter((g) => g.usageCount === 0).length}</strong>
          <span>sans port enregistré</span>
        </div>
      </div>
      <div className="analytics-grid">
        <section className="panel">
          <div className="eyebrow">VOTRE SIGNATURE</div>
          <h2>Les couleurs qui reviennent</h2>
          <div className="palette-strip">
            {info.colors.slice(0, 6).map(([id, n]) => (
              <div key={id}>
                <div
                  style={{
                    background:
                      data.vocabularies.colors.find((c) => c.id === id)?.hex ||
                      "#eee",
                  }}
                />
                <span>
                  {data.vocabularies.colors.find((c) => c.id === id)?.label ||
                    id}
                </span>
                <small>{n} pièces</small>
              </div>
            ))}
          </div>
          <p className="hint">
            Comptage des couleurs renseignées ; une pièce peut en avoir
            plusieurs.
          </p>
        </section>
        <section className="panel">
          <div className="eyebrow">LES DIRECTIONS DE STYLE</div>
          <h2>Vos affinités</h2>
          <Bars values={info.styles} />
          <p className="hint">
            Ces tendances reflètent les étiquettes de vos pièces, pas une
            analyse automatique des photos.
          </p>
        </section>
        <section className="panel">
          <div className="eyebrow">LES PILIERS DU DRESSING</div>
          <h2>Vos pièces les plus polyvalentes</h2>
          <div className="rank-list">
            {info.versatility.slice(0, 4).map((v, i) => (
              <button key={v.item.id} onClick={() => a.openItem(v.item.id)}>
                <span className="rank">0{i + 1}</span>
                <Photo item={v.item} />
                <span>
                  <strong>{v.item.name}</strong>
                  <small>
                    {v.count} tenues · {v.matches} associations
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="eyebrow">UNE SECONDE CHANCE</div>
          <h2>À redécouvrir</h2>
          <div className="rank-list">
            {info.owned
              .slice()
              .sort((a, b) => a.usageCount - b.usageCount)
              .slice(0, 4)
              .map((g) => (
                <button key={g.id} onClick={() => a.openItem(g.id)}>
                  <Photo item={g} />
                  <span>
                    <strong>{g.name}</strong>
                    <small>{g.usageCount} port(s) enregistré(s)</small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
          </div>
        </section>
        <section className="panel">
          <h2>L’équilibre de votre collection</h2>
          <Bars
            values={info.categories}
            label={(id) =>
              data.vocabularies.categories.find((c) => c.id === id)?.label || id
            }
          />
        </section>
        <section className="panel">
          <h2>Au fil des saisons</h2>
          <Bars values={info.seasons} />
        </section>
        <section className="panel">
          <h2>Les plus portées</h2>
          <Bars
            values={info.owned
              .filter((g) => g.usageCount > 0)
              .sort((a, b) => b.usageCount - a.usageCount)
              .slice(0, 6)
              .map((g) => [g.name, g.usageCount])}
          />
          {!info.owned.some((g) => g.usageCount) && (
            <p>
              Enregistrez vos ports pour faire apparaître vos habitudes réelles.
            </p>
          )}
          <h3>Vos silhouettes</h3>
          <Bars values={info.silhouettes} />
        </section>
        <section className="panel">
          <h2>Les formules de vos tenues</h2>
          <Bars
            values={info.formulas.slice(0, 5)}
            label={(s) =>
              s
                .split(" + ")
                .map((r) => roleLabels[r as keyof typeof roleLabels] || r)
                .join(" + ")
            }
          />
          <p className="hint">
            Fréquence dans les tenues sauvegardées, pas dans les ports.
          </p>
        </section>
      </div>
      <div className="insight-banner">
        <Sparkles size={26} />
        <div>
          <h3>Les pistes utiles</h3>
          {info.gaps.length ? (
            <p>
              Pour compléter votre dressing :{" "}
              {info.gaps.map((r) => roleLabels[r]).join(", ")}. Analysez une
              pièce candidate dans la wishlist avant d’acheter.
            </p>
          ) : (
            <p>
              Votre dressing couvre les rôles essentiels. Privilégiez les
              associations nouvelles et vérifiez les doublons avant un achat.
            </p>
          )}
          <p>
            {info.versatility.filter((v) => v.count === 0).length} pièce(s) ne
            participent à aucune tenue complète retenue. Cela peut venir
            d’attributs manquants ou d’un statut « à vendre ».
          </p>
          {info.owned.filter((g) => g.role === "bottom").length >
            info.owned.filter((g) => g.role === "top").length * 2 && (
            <p>
              Les bas sont plus de deux fois plus nombreux que les hauts : un
              haut compatible peut ouvrir davantage de possibilités.
            </p>
          )}
          <button className="text-button" onClick={() => a.go("wishlist")}>
            Étudier un futur achat <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      <section className="panel capsule-maker">
        <div>
          <div className="eyebrow">VOTRE MINI-COLLECTION</div>
          <h2>Une capsule, un esprit.</h2>
          <p>
            Rassemblez jusqu’à neuf pièces dans une planche à conserver ou
            partager.
          </p>
        </div>
        <div className="row wrap">
          <select
            aria-label="Style de la capsule"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="">Tous les styles</option>
            {data.vocabularies.styles.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Saison de la capsule"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value="">Toutes les saisons</option>
            {data.vocabularies.seasons.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="primary" onClick={makeBoard}>
            Composer la planche
          </button>
        </div>
      </section>
      {board && (
        <Modal title={board.title} onClose={() => setBoard(null)} wide>
          <BoardPreview
            title={board.title}
            items={board.itemIds.map((id) =>
              data.garments.find((g) => g.id === id)!,
            )}
            notes={board.notes}
            data={data}
            onError={a.notify}
          />
          <button
            className="primary"
            onClick={() => {
              a.commit(
                (d) => d.boards.push(board),
                "Planche sauvegardée dans votre carnet.",
              );
              setBoard(null);
            }}
          >
            Conserver dans mon carnet
          </button>
        </Modal>
      )}
    </>
  );
}
