import { useState } from "react";
import { Archive, Download, RefreshCw, Upload, CloudOff } from "lucide-react";
import type { Actions } from "../App";
import { type Wardrobe } from "../model";
import { PageHead, Chip, Modal } from "../ui";
import {
  download,
  prepareImport,
  portable,
  previous,
  validate,
} from "../storage";

export function SettingsPage(a: Actions) {
  const { data } = a;
  const [prefs, setPrefs] = useState({ ...data.preferences }),
    [vocab, setVocab] = useState(JSON.stringify(data.vocabularies, null, 2)),
    [pending, setPending] = useState<{
      data: Wardrobe;
      summary: string;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [newStyle, setNewStyle] = useState(""),
    [cache, setCache] = useState(""),
    [migration, setMigration] = useState(false);
  const importFile = async (file: File) => {
    try {
      if (file.size > 80 * 1024 * 1024)
        throw new Error("Le fichier dépasse 80 Mo.");
      setPending(prepareImport(JSON.parse(await file.text()), data));
    } catch (e) {
      a.notify((e as Error).message);
    }
  };
  const exportAll = async (images: boolean) => {
    setBusy(true);
    try {
      const d = images ? await portable(data) : data;
      download(
        images ? "atelier-sauvegarde-complete.json" : "atelier-dressing.json",
        JSON.stringify(d, null, 2),
      );
      a.notify(
        images ? "Sauvegarde avec images préparée." : "Export JSON préparé.",
      );
    } catch (e) {
      a.notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const cacheOffline = async () => {
    if (!("serviceWorker" in navigator)) {
      setCache("Ce navigateur ne prend pas en charge le cache hors ligne.");
      return;
    }
    if (!navigator.serviceWorker.controller) {
      setCache(
        "Le cache est disponible dans la version construite. Rechargez-la après le premier lancement.",
      );
      return;
    }
    setBusy(true);
    setCache("Mise en cache des images…");
    try {
      const c = await caches.open("atelier-images-v1");
      const paths = [
        ...new Set(
          [...data.garments, ...data.inspirations, ...data.outfits]
            .map((g) => g.imagePath)
            .filter((p) => p && !p.startsWith("data:")),
        ),
      ];
      for (const p of paths) {
        const u = new URL("./" + p, location.href);
        const r = await fetch(u);
        if (!r.ok) throw new Error(p);
        await c.put(u, r);
      }
      setCache(
        `${paths.length} images disponibles hors ligne sur cet appareil.`,
      );
    } catch (e) {
      setCache("Cache incomplet : " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHead
        eyebrow="À VOTRE MESURE"
        title="Votre atelier, vos règles"
        description="Personnalisez vos repères et gardez la maîtrise de vos données."
      />
      <div className="settings-grid">
        <section className="panel">
          <h2>Vos préférences</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              a.commit((d) => {
                d.preferences = prefs;
              }, "Préférences enregistrées.");
            }}
          >
            <label>
              Votre prénom (facultatif)
              <input
                value={prefs.name}
                onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
              />
            </label>
            <div className="form-grid">
              <label>
                Température habituelle (°C)
                <input
                  type="number"
                  min="-40"
                  max="55"
                  value={prefs.temperature}
                  onChange={(e) =>
                    setPrefs({ ...prefs, temperature: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Devise
                <select
                  value={prefs.currency}
                  onChange={(e) =>
                    setPrefs({ ...prefs, currency: e.target.value })
                  }
                >
                  {["EUR", "USD", "GBP", "CHF", "CAD", "JPY"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Occasion par défaut
                <select
                  value={prefs.occasion}
                  onChange={(e) =>
                    setPrefs({ ...prefs, occasion: e.target.value })
                  }
                >
                  {data.vocabularies.occasions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Style par défaut
                <select
                  value={prefs.style}
                  onChange={(e) =>
                    setPrefs({ ...prefs, style: e.target.value })
                  }
                >
                  <option value="">Libre</option>
                  {data.vocabularies.styles.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="primary">Enregistrer</button>
          </form>
        </section>
        <section className="panel">
          <h2>Un dressing qui vous ressemble</h2>
          <p>Les styles sont vos mots. Ajoutez ceux qui vous parlent.</p>
          <div className="chips">
            {data.vocabularies.styles.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <form
            className="row add-style"
            onSubmit={(e) => {
              e.preventDefault();
              const s = newStyle.trim();
              if (!s) return;
              a.commit((d) => {
                if (!d.vocabularies.styles.includes(s))
                  d.vocabularies.styles.push(s);
              }, "Style ajouté.");
              setNewStyle("");
              setVocab(
                JSON.stringify(
                  {
                    ...data.vocabularies,
                    styles: [...new Set([...data.vocabularies.styles, s])],
                  },
                  null,
                  2,
                ),
              );
            }}
          >
            <input
              aria-label="Nouveau style"
              placeholder="Votre nouveau style"
              value={newStyle}
              onChange={(e) => setNewStyle(e.target.value)}
            />
            <button className="secondary">Ajouter</button>
          </form>
          <details>
            <summary>Catégories, couleurs, occasions et saisons</summary>
            <p className="hint">
              Édition avancée des vocabulaires JSON. Conservez les identifiants
              de catégories déjà utilisés. Les rôles structurels restent
              stables.
            </p>
            <textarea
              className="code-editor"
              aria-label="Vocabulaires JSON"
              rows={15}
              value={vocab}
              onChange={(e) => setVocab(e.target.value)}
            />
            <button
              className="secondary"
              onClick={() => {
                try {
                  const v = JSON.parse(vocab),
                    next = { ...data, vocabularies: v };
                  validate(next);
                  a.commit((d) => {
                    d.vocabularies = v;
                  }, "Vocabulaires enregistrés.");
                } catch (e) {
                  a.notify((e as Error).message);
                }
              }}
            >
              Appliquer les vocabulaires
            </button>
          </details>
        </section>
        <section className="panel">
          <div className="eyebrow">VOS DONNÉES VOUS APPARTIENNENT</div>
          <h2>Sauvegarder & emporter</h2>
          <p>
            Le JSON contient vos pièces et vos compositions. La sauvegarde
            complète embarque également leurs images pour changer d’appareil.
          </p>
          <div className="button-stack">
            <button
              className="primary"
              disabled={busy}
              onClick={() => exportAll(true)}
            >
              <Download size={17} />
              {busy ? "Préparation…" : "Sauvegarde complète avec images"}
            </button>
            <button className="secondary" onClick={() => exportAll(false)}>
              <Download size={17} /> Exporter le dressing JSON
            </button>
            <button
              className="secondary"
              onClick={() =>
                download(
                  "atelier-tenues.json",
                  JSON.stringify(
                    { kind: "outfits", outfits: data.outfits },
                    null,
                    2,
                  ),
                )
              }
            >
              Exporter les tenues
            </button>
            <button
              className="secondary"
              onClick={() =>
                download(
                  "atelier-preferences.json",
                  JSON.stringify(
                    {
                      kind: "preferences",
                      preferences: data.preferences,
                      vocabularies: data.vocabularies,
                    },
                    null,
                    2,
                  ),
                )
              }
            >
              Exporter les préférences
            </button>
          </div>
        </section>
        <section className="panel">
          <h2>Importer & restaurer</h2>
          <p>
            Chaque import affiche un aperçu avant application. L’état précédent
            reste disponible pour revenir en arrière.
          </p>
          <label className="primary upload">
            <Upload size={17} /> Choisir un fichier JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <div className="button-stack">
            <button
              className="secondary"
              onClick={() =>
                previous()
                  .then((d) =>
                    setPending({
                      data: d,
                      summary:
                        "Restaurer la sauvegarde conservée avant le dernier import.",
                    }),
                  )
                  .catch((e) => a.notify(e.message))
              }
            >
              <RefreshCw size={16} /> Restaurer l’état précédent
            </button>
            <button
              className="text-button"
              onClick={() => {
                const next = structuredClone(data);
                next.garments = [];
                next.outfits = [];
                next.wishlist = [];
                next.inspirations = [];
                next.boards = [];
                next.wearEvents = [];
                next.legacy = {};
                setPending({
                  data: next,
                  summary:
                    "Créer un dressing vide en gardant vos préférences. Votre état actuel sera sauvegardé avant remplacement.",
                });
              }}
            >
              Commencer un dressing vide
            </button>
          </div>
          <p className="hint">
            Formats acceptés : exports Atelier, sauvegarde dbd-state du
            dashboard, compteurs et historique Capsule.
          </p>
        </section>
        <section className="panel">
          <CloudOff size={25} />
          <h2>Votre dressing, même hors ligne</h2>
          <p>
            Pas de compte, pas de serveur, pas de télémétrie. Les modifications
            restent dans le stockage de ce navigateur. Une suppression des
            données du navigateur efface ce stockage : gardez une sauvegarde.
          </p>
          <button className="secondary" disabled={busy} onClick={cacheOffline}>
            Préparer toutes mes images hors ligne
          </button>
          <p role="status" className="hint">
            {cache}
          </p>
        </section>
        <section className="panel">
          <h2>Les bases préservées</h2>
          <p>
            L’inventaire Capsule a été repris avec ses photos et ses looks. Les
            95 entrées de la version v62 sont conservées dans les données
            anciennes, sans écraser les statuts d’achat.
          </p>
          <button className="secondary" onClick={() => setMigration(true)}>
            Voir les données anciennes
          </button>
          <p className="hint">
            Le stockage des anciens sites n’est pas accessible depuis cette
            application. La procédure d’export est décrite dans la documentation
            de migration.
          </p>
        </section>
      </div>
      {pending && (
        <Modal
          title="Vérifier avant d’importer"
          onClose={() => setPending(null)}
        >
          <p>{pending.summary}</p>
          <div className="metrics small">
            <div>
              <strong>{pending.data.garments.length}</strong>
              <span>pièces après import</span>
            </div>
            <div>
              <strong>{pending.data.outfits.length}</strong>
              <span>tenues après import</span>
            </div>
          </div>
          <p>
            Les originaux ne sont pas modifiés. Vous pourrez restaurer l’état
            précédent depuis cette page.
          </p>
          <div className="modal-footer">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setPending(null)}
            >
              Annuler
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await a.replace(pending.data);
                  setPending(null);
                } catch (e) {
                  a.notify((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Appliquer l’import
            </button>
          </div>
        </Modal>
      )}
      {migration && (
        <Modal
          title="Archive de migration"
          onClose={() => setMigration(false)}
          wide
        >
          <p>
            Ces données sont conservées telles qu’extraites des sources. Les
            différences de statut doivent être vérifiées avant une fusion.
          </p>
          <pre className="legacy-preview">
            {JSON.stringify(data.legacy, null, 2)}
          </pre>
          <button
            className="secondary"
            onClick={() =>
              download(
                "atelier-archive-migration.json",
                JSON.stringify(data.legacy, null, 2),
              )
            }
          >
            Exporter l’archive
          </button>
        </Modal>
      )}
    </>
  );
}
