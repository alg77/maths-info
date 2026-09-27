import { useState } from "react";
import { Plus, ArrowUpRight, Copy, Pencil, Check, Layers } from "lucide-react";
import type { Actions } from "../App";
import {
  type Outfit,
  type Board,
  makeOutfit,
  uid,
  roleLabels,
  day,
} from "../model";
import { assess } from "../engine";
import {
  PageHead,
  Empty,
  Chip,
  OutfitCard,
  OutfitVisual,
  Modal,
  Photo,
  BoardPreview,
} from "../ui";

export function OutfitsPage(a: Actions) {
  const [tab, setTab] = useState("looks"),
    [q, setQ] = useState(""),
    [board, setBoard] = useState<Board | null>(null);
  const { data } = a;
  return (
    <>
      <PageHead
        eyebrow="VOTRE CARNET DE STYLE"
        title="L’art d’assembler"
        description="Des tenues à retrouver. Des idées à faire grandir."
        action={
          <button
            className="primary"
            onClick={() => a.editOutfit(makeOutfit([]))}
          >
            <Plus size={17} /> Composer une tenue
          </button>
        }
      />
      <div className="section-heading">
        <div className="chips">
          {[
            ["looks", "Le lookbook"],
            ["boards", "Les planches"],
            ["history", "L’historique"],
          ].map(([v, l]) => (
            <Chip key={v} active={tab === v} onClick={() => setTab(v)}>
              {l}
            </Chip>
          ))}
        </div>
        <input
          className="compact-search"
          placeholder="Rechercher une tenue…"
          aria-label="Rechercher une tenue"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {tab === "looks" &&
        (data.outfits.length ? (
          <div className="outfit-grid">
            {data.outfits
              .filter((o) => o.name.toLowerCase().includes(q.toLowerCase()))
              .map((o) => (
                <OutfitCard
                  key={o.id}
                  outfit={o}
                  data={data}
                  onOpen={() => a.openOutfit(o)}
                />
              ))}
          </div>
        ) : (
          <Empty
            title="Votre premier look vous attend"
            action={
              <button
                className="primary"
                onClick={() => a.editOutfit(makeOutfit([]))}
              >
                Composer une tenue
              </button>
            }
          >
            Choisissez vos pièces, donnez un nom à l’association et gardez-la à
            portée de main.
          </Empty>
        ))}
      {tab === "boards" &&
        (data.boards.length ? (
          <div className="outfit-grid">
            {data.boards.map((b) => (
              <article className="outfit-card" key={b.id}>
                <button className="outfit-open" onClick={() => setBoard(b)}>
                  <OutfitVisual
                    items={b.itemIds.map((id) =>
                      data.garments.find((g) => g.id === id)!,
                    )}
                  />
                </button>
                <div className="outfit-caption">
                  <small>{b.kind}</small>
                  <h3>{b.title}</h3>
                  <p>{b.notes}</p>
                  <button className="text-button" onClick={() => setBoard(b)}>
                    Ouvrir la planche <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty title="Des compositions à garder et à partager">
            Ouvrez une tenue puis choisissez « Créer une planche », ou créez une
            capsule depuis les analyses.
          </Empty>
        ))}
      {tab === "history" &&
        (data.wearEvents.length ? (
          <div className="history-list">
            {data.wearEvents
              .slice()
              .reverse()
              .map((e) => (
                <article key={e.id}>
                  <div className="eyebrow">
                    {new Date(e.date + "T12:00:00").toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </div>
                  <div className="history-thumbs">
                    {e.itemIds.map((id) => (
                      <Photo
                        key={id}
                        item={data.garments.find((g) => g.id === id)!}
                      />
                    ))}
                  </div>
                  <p>
                    {e.itemIds
                      .map((id) => data.garments.find((g) => g.id === id)?.name)
                      .join(" · ")}
                  </p>
                  <button
                    className="text-button"
                    onClick={() =>
                      a.commit((d) => {
                        d.wearEvents = d.wearEvents.filter(
                          (x) => x.id !== e.id,
                        );
                        e.itemIds.forEach((id) => {
                          const g = d.garments.find((g) => g.id === id)!;
                          g.usageCount = Math.max(0, g.usageCount - 1);
                          g.lastWorn =
                            d.wearEvents
                              .filter((x) => x.itemIds.includes(id))
                              .map((x) => x.date)
                              .sort()
                              .at(-1) || null;
                        });
                      }, "Port annulé et compteurs ajustés.")
                    }
                  >
                    Annuler ce port
                  </button>
                </article>
              ))}
          </div>
        ) : (
          <Empty title="Une histoire qui commence aujourd’hui">
            Marquez une tenue comme portée pour suivre vos habitudes et
            redécouvrir les pièces oubliées.
          </Empty>
        ))}
      {board && (
        <Modal title={board.title} onClose={() => setBoard(null)} wide>
          <BoardPreview
            title={board.title}
            notes={board.notes}
            items={board.itemIds.map((id) =>
              data.garments.find((g) => g.id === id)!,
            )}
            data={data}
            onError={a.notify}
          />
          <button
            className="text-button danger"
            onClick={() => {
              a.commit((d) => {
                d.boards = d.boards.filter((b) => b.id !== board.id);
              }, "Planche retirée.");
              setBoard(null);
            }}
          >
            Retirer cette planche
          </button>
        </Modal>
      )}
    </>
  );
}

export function OutfitDetail(
  a: Actions & { outfit: Outfit; onClose: () => void },
) {
  const { outfit: o, data } = a;
  const items = o.itemIds.map((id) => data.garments.find((g) => g.id === id)!);
  const result = assess(items, data);
  const [board, setBoard] = useState(false),
    [confirm, setConfirm] = useState(false);
  return (
    <Modal title={o.name} onClose={a.onClose} wide>
      {board ? (
        <BoardPreview
          title={o.name}
          items={items}
          notes={o.notes}
          data={data}
          onError={a.notify}
        />
      ) : (
        <OutfitVisual items={items} large />
      )}
      <div className="detail-columns">
        <div>
          <h3>L’intention</h3>
          <p>{o.notes || "À vous de raconter cette association."}</p>
          <div className="chips">
            {[...new Set([...o.styles, ...items.flatMap((g) => g.styles)])].map(
              (s) => (
                <Chip key={s}>{s}</Chip>
              ),
            )}
          </div>
          <p className="formula">
            {items.map((g) => roleLabels[g.role]).join(" + ")}
          </p>
          <p>
            {items.flatMap((g) => g.details).length
              ? `Les détails donnent le ton : ${[...new Set(items.flatMap((g) => g.details))].join(", ")}.`
              : "Ajoutez les détails de vos pièces pour affiner la lecture du look."}
          </p>
        </div>
        <div>
          <h3>Les accords du look · {result.score}/100</h3>
          {result.reasons.map((r) => (
            <p className="reason" key={r}>
              <Check size={16} />
              {r}
            </p>
          ))}
          {result.warnings.map((w) => (
            <p className="hint" key={w}>
              {w}
            </p>
          ))}
          <small>
            Confiance {result.confidence}% · estimation fondée sur les attributs
            renseignés
          </small>
        </div>
      </div>
      <div className="related-grid">
        {items.map((g) => (
          <button
            className="mini-piece"
            key={g.id}
            onClick={() => {
              a.onClose();
              a.openItem(g.id);
            }}
          >
            <Photo item={g} />
            <span>{g.name}</span>
          </button>
        ))}
      </div>
      <div className="modal-footer wrap">
        <button className="secondary" onClick={() => a.editOutfit(o)}>
          <Pencil size={16} /> Modifier
        </button>
        <button
          className="secondary"
          onClick={() =>
            a.editOutfit({ ...o, id: uid(), name: o.name + " — variante" })
          }
        >
          <Copy size={16} /> Dupliquer
        </button>
        <button
          className="secondary"
          onClick={() => {
            setBoard(true);
            if (
              !data.boards.some(
                (b) =>
                  b.title === o.name && b.itemIds.join() === o.itemIds.join(),
              )
            )
              a.commit((d) => {
                d.boards.push({
                  id: uid(),
                  title: o.name,
                  itemIds: o.itemIds,
                  notes: o.notes,
                  styles: o.styles,
                  kind: "Tenue",
                });
              }, "Planche ajoutée à votre carnet.");
          }}
        >
          <Layers size={16} /> Créer une planche
        </button>
        <button
          className="primary"
          disabled={items.some((g) => g.status !== "owned" || g.archived)}
          onClick={() =>
            a.wear(
              o.itemIds,
              data.outfits.some((x) => x.id === o.id) ? o.id : undefined,
            )
          }
        >
          Porter aujourd’hui
        </button>
      </div>
      <button className="text-button danger" onClick={() => setConfirm(true)}>
        Supprimer cette tenue
      </button>
      {confirm && (
        <div className="confirm-box">
          <p>Supprimer la tenue ? Les événements de port seront conservés.</p>
          <div className="row">
            <button className="secondary" onClick={() => setConfirm(false)}>
              Annuler
            </button>
            <button
              className="primary"
              onClick={() => {
                a.commit((d) => {
                  d.outfits = d.outfits.filter((x) => x.id !== o.id);
                  d.wearEvents.forEach((e) => {
                    if (e.outfitId === o.id) delete e.outfitId;
                  });
                }, "Tenue supprimée.");
                a.onClose();
              }}
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
