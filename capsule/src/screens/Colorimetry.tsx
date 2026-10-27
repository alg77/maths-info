import { useState } from "react";
import type { Actions } from "../App";
import { colorAdvice, emptyProfile, historicalProfiles } from "../colorimetry";
import { PageHead, Photo } from "../ui";

export function ColorAdvice({
  item,
  data,
}: {
  item: Actions["data"]["garments"][number];
  data: Actions["data"];
}) {
  const r = colorAdvice(item, data);
  return (
    <aside className="color-advice">
      <strong>
        Votre palette{r.score !== null ? ` · proximité ${r.score}/100` : ""}
      </strong>
      <p>{r.text}</p>
      {r.score !== null && (
        <small>
          Repères : {r.matches.join(", ")} · couleurs évaluées : {r.coverage} %.
          Estimation sur le nuancier, sans analyse de photo.
        </small>
      )}
    </aside>
  );
}
export function ColorimetryPage(a: Actions) {
  const [profile, setProfile] = useState(
    structuredClone(a.data.preferences.colorProfile || emptyProfile),
  );
  return (
    <>
      <PageHead
        eyebrow="VOS COULEURS, VOS REPÈRES"
        title="Une palette qui vous ressemble"
        description="Retrouvez vos anciens repères et choisissez ceux qui vous conviennent aujourd’hui."
      />
      <div className="settings-grid">
        <section className="panel">
          <h2>Votre profil</h2>
          <p>
            Les anciennes versions indiquaient deux profils différents. Aucun
            n’est activé automatiquement.
          </p>
          <div className="button-stack">
            {historicalProfiles.map((p) => (
              <button
                type="button"
                className="secondary"
                key={p.name}
                onClick={() => setProfile(structuredClone(p))}
              >
                Reprendre {p.name}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              a.commit((d) => {
                d.preferences.colorProfile = profile;
              }, "Profil colorimétrique enregistré.");
            }}
          >
            <label>
              Nom du profil
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Sous-ton
                <input
                  value={profile.undertone}
                  onChange={(e) =>
                    setProfile({ ...profile, undertone: e.target.value })
                  }
                />
              </label>
              <label>
                Contraste
                <input
                  value={profile.contrast}
                  onChange={(e) =>
                    setProfile({ ...profile, contrast: e.target.value })
                  }
                />
              </label>
            </div>
            <h3>Votre nuancier</h3>
            <div className="personal-palette">
              {profile.palette.map((s, i) => (
                <div className="palette-edit" key={i}>
                  <input
                    aria-label={`Teinte ${i + 1}`}
                    type="color"
                    value={s.hex}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        palette: profile.palette.map((v, j) =>
                          j === i ? { ...v, hex: e.target.value } : v,
                        ),
                      })
                    }
                  />
                  <input
                    aria-label={`Nom de la teinte ${i + 1}`}
                    value={s.label}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        palette: profile.palette.map((v, j) =>
                          j === i ? { ...v, label: e.target.value } : v,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Retirer la teinte ${i + 1}`}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        palette: profile.palette.filter((_, j) => j !== i),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="secondary"
              disabled={profile.palette.length >= 32}
              onClick={() =>
                setProfile({
                  ...profile,
                  palette: [
                    ...profile.palette,
                    { label: "Nouvelle couleur", hex: "#c8b59c" },
                  ],
                })
              }
            >
              Ajouter une couleur
            </button>
            <label>
              Couleurs à limiter (noms exacts du nuancier, séparés par des
              virgules)
              <input
                value={profile.avoid.join(", ")}
                onChange={(e) =>
                  setProfile({ ...profile, avoid: e.target.value.split(",") })
                }
              />
            </label>
            <label>
              Vos notes
              <textarea
                value={profile.notes}
                onChange={(e) =>
                  setProfile({ ...profile, notes: e.target.value })
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={profile.enabled}
                onChange={(e) =>
                  setProfile({ ...profile, enabled: e.target.checked })
                }
              />{" "}
              Utiliser cette palette pour mes conseils et mes tenues
            </label>
            <button
              className="primary"
              disabled={profile.enabled && !profile.palette.length}
            >
              Enregistrer mon profil
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>Comment lire ces conseils</h2>
          <p>
            La proximité compare les couleurs renseignées à votre nuancier. Elle
            ne mesure pas ce qui vous va et ne remplace pas un essayage. Le
            sous-ton et le contraste sont des repères personnels, pas des
            critères calculés.
          </p>
          <p>
            Les hauts, robes et vestes reçoivent une attention particulière près
            du visage. Les chaussures et les bas restent libres : aucune pièce
            n’est exclue.
          </p>
          <p>
            Votre dressing et votre wishlist restent inchangés. Les profils sont
            inclus dans vos sauvegardes JSON.
          </p>
          <h3>Vos pièces, votre palette enregistrée</h3>
          {a.data.garments
            .filter((g) => !g.archived)
            .map((g) => (
              <article className="palette-item" key={g.id}>
                <button className="wish-row" onClick={() => a.openItem(g.id)}>
                  <Photo item={g} />
                  <span>
                    {g.name}
                    <small>
                      {g.status === "wishlist" ? "Wishlist" : "Dressing"}
                    </small>
                  </span>
                </button>
                <ColorAdvice item={g} data={a.data} />
              </article>
            ))}
        </section>
      </div>
    </>
  );
}
