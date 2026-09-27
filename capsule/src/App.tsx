import { useEffect, useRef, useState } from "react";
import {
  Sun,
  Shirt,
  Layers,
  Heart,
  Image as ImageIcon,
  ChartNoAxesCombined,
  Settings,
  Plus,
  Check,
  CloudOff,
  ArrowUpRight,
  X,
  Menu,
} from "lucide-react";
import {
  type Wardrobe,
  type Garment,
  type Outfit,
  type Inspiration,
  blankGarment,
  makeOutfit,
  uid,
  day,
} from "./model";
import { load, write, validate, download } from "./storage";
import { Modal, Empty } from "./ui";
import { GarmentForm, OutfitForm, InspirationForm } from "./forms";
import {
  TodayPage,
  WardrobePage,
  ItemDetail,
  OutfitsPage,
  OutfitDetail,
  WishlistPage,
  InspirationsPage,
  InsightsPage,
  SettingsPage,
} from "./pages";
export type Actions = {
  data: Wardrobe;
  commit: (fn: (d: Wardrobe) => void, message?: string) => void;
  notify: (s: string) => void;
  openItem: (id: string) => void;
  editItem: (g: Garment) => void;
  addItem: (status?: Garment["status"]) => void;
  openOutfit: (o: Outfit) => void;
  editOutfit: (o: Outfit) => void;
  saveSuggestion: (ids: string[], name?: string) => void;
  wear: (ids: string[], outfitId?: string) => void;
  editInspiration: (i: Inspiration) => void;
  go: (page: string) => void;
  replace: (d: Wardrobe) => Promise<void>;
};
const nav = [
  { id: "today", label: "Aujourd’hui", icon: Sun },
  { id: "wardrobe", label: "Dressing", icon: Shirt },
  { id: "outfits", label: "Tenues & planches", icon: Layers },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "inspiration", label: "Inspirations", icon: ImageIcon },
  { id: "insights", label: "Analyses", icon: ChartNoAxesCombined },
];
export default function App() {
  const [data, setData] = useState<Wardrobe | null>(null),
    [fatal, setFatal] = useState(""),
    [page, setPage] = useState("today"),
    [toast, setToast] = useState(""),
    [saved, setSaved] = useState(true),
    [saveError, setSaveError] = useState(""),
    [online, setOnline] = useState(navigator.onLine),
    [mobile, setMobile] = useState(false);
  const [item, setItem] = useState<string | null>(null),
    [edit, setEdit] = useState<Garment | null>(null),
    [outfit, setOutfit] = useState<Outfit | null>(null),
    [outfitEdit, setOutfitEdit] = useState<Outfit | null>(null),
    [inspirationEdit, setInspirationEdit] = useState<Inspiration | null>(null);
  const ref = useRef<Wardrobe | null>(null),
    queue = useRef(Promise.resolve());
  useEffect(() => {
    load()
      .then((d) => {
        ref.current = d;
        setData(d);
      })
      .catch((e) => setFatal(e.message));
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const prevent = (e: BeforeUnloadEvent) => {
      if (!saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [saved]);
  const commit = (fn: (d: Wardrobe) => void, message?: string) => {
    try {
      const next = structuredClone(ref.current!);
      fn(next);
      validate(next);
      ref.current = next;
      setData(next);
      setSaved(false);
      setSaveError("");
      const promise = queue.current.catch(() => {}).then(() => write(next));
      queue.current = promise;
      promise
        .then(() => {
          if (ref.current === next) setSaved(true);
        })
        .catch((e) => {
          setSaveError(
            "Sauvegarde locale impossible. Exportez vos données avant de fermer. " +
              e.message,
          );
          setSaved(false);
        });
      if (message) setToast(message);
    } catch (e) {
      setToast((e as Error).message);
    }
  };
  const go = (p: string) => {
    setPage(p);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const replace = async (d: Wardrobe) => {
    validate(d);
    await queue.current.catch(() => {});
    await write(d, true);
    ref.current = d;
    setData(d);
    setSaved(true);
    setSaveError("");
    setToast("Import terminé. La sauvegarde précédente est disponible.");
  };
  if (fatal)
    return (
      <div className="startup">
        <h1>Votre dressing reste précieux.</h1>
        <p>Le chargement a rencontré une erreur : {fatal}</p>
        <p>
          Aucune donnée n’a été effacée. Vérifiez que le navigateur autorise le
          stockage local, puis réessayez.
        </p>
        <button className="primary" onClick={() => location.reload()}>
          Réessayer
        </button>
      </div>
    );
  if (!data)
    return (
      <div className="startup">
        <div className="brand-name">
          Atelier<span>.</span>
        </div>
        <p>Votre dressing prend place…</p>
      </div>
    );
  const actions: Actions = {
    data,
    commit,
    notify: setToast,
    openItem: setItem,
    editItem: (g) => {
      setItem(null);
      setEdit(g);
    },
    addItem: (status = "owned") =>
      setEdit(blankGarment(data.vocabularies.categories[0], status)),
    openOutfit: setOutfit,
    editOutfit: (o) => {
      setOutfit(null);
      setOutfitEdit(o);
    },
    saveSuggestion: (ids, name = "Nouvelle inspiration") =>
      setOutfitEdit({ ...makeOutfit(ids, name), source: "generated" }),
    wear: (ids, outfitId) => {
      if (
        ids.some((id) => {
          const g = data.garments.find((g) => g.id === id);
          return !g || g.status !== "owned" || g.archived;
        })
      ) {
        setToast(
          "Seules les pièces possédées et actives peuvent être marquées portées.",
        );
        return;
      }
      commit((d) => {
        if (
          d.wearEvents.some(
            (e) =>
              e.date === day() &&
              e.itemIds.slice().sort().join() === ids.slice().sort().join(),
          )
        )
          throw new Error("Ce look est déjà enregistré pour aujourd’hui.");
        d.wearEvents.unshift({
          id: uid(),
          date: day(),
          itemIds: ids,
          outfitId,
        });
        ids.forEach((id) => {
          const g = d.garments.find((g) => g.id === id)!;
          g.usageCount++;
          g.lastWorn = day();
        });
      }, "Port enregistré dans votre historique.");
    },
    editInspiration: setInspirationEdit,
    go,
    replace,
  };
  const currentItem = data.garments.find((g) => g.id === item);
  return (
    <div className="app">
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("today");
          }}
        >
          <div className="brand-name">
            Atelier<span>.</span>
          </div>
          <small>LE STYLE COMMENCE CHEZ VOUS</small>
        </a>
        <div className="nav-label">VOTRE ESPACE</div>
        <nav aria-label="Navigation principale">
          {nav.map((n) => (
            <button
              key={n.id}
              className={"nav-link " + (page === n.id ? "active" : "")}
              onClick={() => go(n.id)}
              aria-current={page === n.id ? "page" : undefined}
            >
              <n.icon size={19} strokeWidth={1.6} />
              {n.label}
              {n.id === "wishlist" && (
                <span className="nav-count">
                  {
                    data.garments.filter(
                      (g) => g.status === "wishlist" && !g.archived,
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="little-note">
            <span>
              Moins acheter.
              <br />
              Mieux assembler.
            </span>
            <span className="asterisk">✳</span>
            <p>
              Redécouvrez les possibilités
              <br />
              de ce que vous possédez déjà.
            </p>
          </div>
          <button
            className={"nav-link " + (page === "settings" ? "active" : "")}
            onClick={() => go("settings")}
          >
            <Settings size={19} /> Réglages & données
          </button>
          <div className="local-status">
            <span className={saved ? "status-dot" : "status-dot amber"} />
            {saved ? "Enregistré sur cet appareil" : "Enregistrement en cours"}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Afficher le menu"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
          <span className="breadcrumb">
            Votre espace personnel <span>/</span>{" "}
            {nav.find((n) => n.id === page)?.label || "Réglages"}
          </span>
          <div className="row">
            <span className="privacy">
              <CloudOff size={14} />
              {online ? "Privé & local" : "Hors ligne"}
            </span>
            <span
              className="avatar"
              title={data.preferences.name || "Votre profil"}
            >
              {data.preferences.name?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
        </header>
        {saveError && (
          <div className="error-banner" role="alert">
            {saveError}
            <button
              onClick={() =>
                download("atelier-secours.json", JSON.stringify(data, null, 2))
              }
            >
              Exporter maintenant
            </button>
          </div>
        )}
        <main>
          {page === "today" ? (
            <TodayPage {...actions} />
          ) : page === "wardrobe" ? (
            <WardrobePage {...actions} />
          ) : page === "outfits" ? (
            <OutfitsPage {...actions} />
          ) : page === "wishlist" ? (
            <WishlistPage {...actions} />
          ) : page === "inspiration" ? (
            <InspirationsPage {...actions} />
          ) : page === "insights" ? (
            <InsightsPage {...actions} />
          ) : (
            <SettingsPage {...actions} />
          )}
        </main>
        <footer className="app-footer">
          <span>Atelier · Faites de la place à votre style.</span>
          <span>Vos données restent avec vous.</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Fermer la notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {currentItem && (
        <ItemDetail
          {...actions}
          item={currentItem}
          onClose={() => setItem(null)}
        />
      )}{" "}
      {edit && (
        <GarmentForm
          initial={edit}
          data={data}
          onClose={() => setEdit(null)}
          onError={setToast}
          onSave={(g) => {
            try {
              const copy = structuredClone(data);
              const idx = copy.garments.findIndex((x) => x.id === g.id);
              if (idx < 0) copy.garments.push(g);
              else copy.garments[idx] = g;
              if (
                g.status === "wishlist" &&
                !copy.wishlist.some((w) => w.garmentId === g.id)
              )
                copy.wishlist.push({
                  id: uid(),
                  garmentId: g.id,
                  priority: "medium",
                  notes: "",
                  budget: null,
                });
              if (g.status === "owned")
                copy.wishlist = copy.wishlist.filter(
                  (w) => w.garmentId !== g.id,
                );
              validate(copy);
              commit((d) => Object.assign(d, copy), "Pièce enregistrée.");
              setEdit(null);
            } catch (e) {
              setToast((e as Error).message);
            }
          }}
        />
      )}{" "}
      {outfit && (
        <OutfitDetail
          {...actions}
          outfit={data.outfits.find((o) => o.id === outfit.id) || outfit}
          onClose={() => setOutfit(null)}
        />
      )}{" "}
      {outfitEdit && (
        <OutfitForm
          initial={outfitEdit}
          data={data}
          onClose={() => setOutfitEdit(null)}
          onError={setToast}
          onSave={(o) => {
            commit((d) => {
              const n = d.outfits.findIndex((x) => x.id === o.id);
              if (n < 0) d.outfits.push(o);
              else d.outfits[n] = o;
            }, "Tenue enregistrée dans votre lookbook.");
            setOutfitEdit(null);
          }}
        />
      )}
      {inspirationEdit && (
        <InspirationForm
          initial={inspirationEdit}
          data={data}
          onClose={() => setInspirationEdit(null)}
          onError={setToast}
          onSave={(i) => {
            try {
              const next = structuredClone(data);
              const n = next.inspirations.findIndex((x) => x.id === i.id);
              if (n < 0) next.inspirations.push(i);
              else next.inspirations[n] = i;
              validate(next);
              commit((d) => Object.assign(d, next), "Inspiration enregistrée.");
              setInspirationEdit(null);
            } catch (e) {
              setToast((e as Error).message);
            }
          }}
        />
      )}
    </div>
  );
}
