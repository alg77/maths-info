#!/usr/bin/env python3
"""
okane_vers_carnet.py — convertit un classeur Okane_AAAA.xlsx en carnet JSON
importable dans mon-carnet-enveloppes.html (bouton « Importer un carnet »).

    python3 okane_vers_carnet.py Okane_2025.xlsx carnet.json
    python3 okane_vers_carnet.py Okane_2025.xlsx carnet.json --regles regles.js

Ce que le script lit :
  - onglet « Config »  : revenus, charges fixes, postes variables (libellé,
                         obligatoire, prévu) ;
  - onglets « NN-Flux » : les opérations, dédoublonnées entre feuilles ;
  - onglet « CME CJ »   : les capitaux restant dus des prêts.

Ce qu'il produit :
  - un carnet JSON prêt à importer ;
  - en option, le tableau REGLES (mot-clé -> poste) appris sur l'historique,
    à recoller dans le HTML pour la catégorisation automatique des imports.

Dépendance unique : openpyxl.
"""

import argparse
import collections
import datetime
import json
import re
import sys

import openpyxl

# --- Disposition de l'onglet Config (colonnes, 1 = A) -----------------------
COL = {
    "revenu_lib": 2, "revenu_val": 3,
    "epargne_lib": 5, "epargne_val": 6,
    "fixe_lib": 8, "fixe_oblig": 9, "fixe_prevu": 10,
    "poste_lib": 12, "poste_oblig": 13, "poste_prevu": 14,
}
LIGNES_CONFIG = range(11, 36)
# Le bloc « Crédits » réutilise les colonnes B et C plus bas dans la feuille :
# on borne la lecture des revenus pour ne pas l'avaler.
LIGNES_REVENUS = range(12, 21)

# Mots trop génériques pour servir de règle de catégorisation.
STOP = {"MAISON", "PLUS", "MONO", "FINS", "POUR", "AVEC", "COMPTE", "VIREMENT",
        "INTERNE", "FRAIS", "AUTRE", "AUTRES", "PARIS", "FRANCE", "SARL",
        "STORE", "BANQUE", "BANK", "EURO", "EUROPE", "SEPA"}


def nb(v):
    """Convertit une cellule en float, 0 si vide ou illisible."""
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return 0.0


def lire_config(ws):
    """Renvoie (revenus_mensuels, charges_fixes, postes_variables)."""
    revenus = sum(nb(ws.cell(row=r, column=COL["revenu_val"]).value)
                  for r in LIGNES_REVENUS
                  if ws.cell(row=r, column=COL["revenu_lib"]).value)

    fixes, postes = [], []
    for r in LIGNES_CONFIG:
        lib = ws.cell(row=r, column=COL["fixe_lib"]).value
        if lib and str(lib).strip() != "Total":
            fixes.append({
                "id": "f%d" % (len(fixes) + 1),
                "libelle": str(lib).strip(),
                "montant": nb(ws.cell(row=r, column=COL["fixe_prevu"]).value),
                "obligatoire": bool(ws.cell(row=r, column=COL["fixe_oblig"]).value),
            })
        lib = ws.cell(row=r, column=COL["poste_lib"]).value
        if lib and str(lib).strip() != "Total":
            postes.append({
                "id": "p%d" % (len(postes) + 1),
                "nom": str(lib).strip(),
                "prevu": nb(ws.cell(row=r, column=COL["poste_prevu"]).value),
                "obligatoire": bool(ws.cell(row=r, column=COL["poste_oblig"]).value),
            })
    return revenus, fixes, postes


def lire_flux(wb):
    """Toutes les opérations des onglets NN-Flux, dédoublonnées.

    Les colonnes changent d'un mois à l'autre (la colonne « Qui » apparaît en
    cours d'année), donc on repère les champs par leur en-tête, jamais par
    leur position.
    """
    vues, ops = set(), []
    for nom in (s for s in wb.sheetnames if s.endswith("-Flux")):
        ws = wb[nom]
        entete = [str(c.value).strip() if c.value else "" for c in ws[1]]
        idx = {h: i for i, h in enumerate(entete)}
        if "Date" not in idx or "Montant" not in idx:
            print("  ! %s ignoré : en-tête non reconnu" % nom, file=sys.stderr)
            continue
        for ligne in ws.iter_rows(min_row=2, values_only=True):
            d = ligne[idx["Date"]]
            m = ligne[idx["Montant"]]
            if not isinstance(d, datetime.datetime) or not isinstance(m, (int, float)):
                continue
            lib = str(ligne[idx.get("Description", 2)] or "")[:60]
            cle = (d.date().isoformat(), lib, float(m))
            if cle in vues:
                continue
            vues.add(cle)
            ops.append({
                "date": d.date().isoformat(),
                "libelle": lib,
                "montant": float(m),
                "categorie": ligne[idx["Catégorie"]] if "Catégorie" in idx else None,
                "poste": ligne[idx["Sous-catégorie"]] if "Sous-catégorie" in idx else None,
            })
    return ops


def lire_credits(wb):
    """Capitaux restant dus lus dans le relevé Crédit Mutuel (soldes négatifs)."""
    credits = []
    if "CME CJ" not in wb.sheetnames:
        return credits
    for ligne in wb["CME CJ"].iter_rows(min_row=2, values_only=True):
        nom, solde = ligne[0], ligne[2]
        if not nom or not isinstance(solde, (int, float)) or solde >= 0:
            continue
        credits.append({
            "id": "k%d" % (len(credits) + 1),
            "nom": str(nom).strip().title(),
            "crd": round(abs(solde), 2),
            "taux": 0.0,          # à compléter : absent du relevé
            "mensualite": 0.0,    # à compléter : absente du relevé
            "assurance": 0.0,
            "surLeBien": "PRET" in str(nom).upper(),
        })
    return credits


def apprendre_regles(ops, postes, seuil=3, purete=0.85):
    """Associe chaque mot-clé récurrent au poste où il tombe le plus souvent.

    Un mot n'est retenu que s'il apparaît au moins `seuil` fois et pointe vers
    le même poste dans au moins `purete` des cas.
    """
    noms = {p["nom"] for p in postes}
    compte = collections.defaultdict(collections.Counter)
    for op in ops:
        if not op["poste"] or op["categorie"] in ("Mouvements internes", "Revenus"):
            continue
        texte = re.sub(r"[^A-Z ]", " ",
                       re.sub(r"\d{2}[/.]\d{2}[/.]\d{2,4}", " ",
                              re.sub(r"\b(CB|CARTE|PRLV|VIR|SEPA|INST|RETRAIT|DAB)\b", " ",
                                     op["libelle"].upper())))
        for mot in {w for w in texte.split() if len(w) >= 4 and w not in STOP}:
            compte[mot][str(op["poste"]).strip()] += 1

    regles = []
    for mot, c in compte.items():
        poste, n = c.most_common(1)[0]
        if n >= seuil and n / sum(c.values()) >= purete:
            regles.append((mot, poste, poste in noms))
    # Les mots-clés les plus longs d'abord : les plus spécifiques gagnent.
    regles.sort(key=lambda r: -len(r[0]))
    return [[m, p] for m, p, _ in regles]


def moyennes(ops, postes):
    """Réel moyen par poste, sur les mois effectivement présents."""
    mois = {op["date"][:7] for op in ops}
    total = collections.Counter()
    for op in ops:
        if op["montant"] < 0 and op["poste"]:
            total[str(op["poste"]).strip()] -= op["montant"]
    n = max(1, len(mois))
    return {p["nom"]: round(total.get(p["nom"], 0) / n, 2) for p in postes}, n


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("classeur")
    ap.add_argument("sortie")
    ap.add_argument("--regles", help="écrit aussi le tableau REGLES en JS")
    ap.add_argument("--reel", action="store_true",
                    help="cale les prévus sur la moyenne réellement dépensée")
    args = ap.parse_args()

    wb = openpyxl.load_workbook(args.classeur, data_only=True)
    revenus, fixes, postes = lire_config(wb["Config"])
    ops = lire_flux(wb)
    credits = lire_credits(wb)
    moy, nmois = moyennes(ops, postes)

    print("Revenus mensuels prévus : %.2f €" % revenus)
    print("%d charges fixes (%.2f €/mois)" % (fixes and len(fixes) or 0,
                                              sum(f["montant"] for f in fixes)))
    print("%d postes variables (%.2f €/mois prévus)"
          % (len(postes), sum(p["prevu"] for p in postes)))
    print("%d opérations sur %d mois, %d crédits" % (len(ops), nmois, len(credits)))
    print("\nÉcart prévu / réel, du plus dépassé au moins dépassé :")
    for p in sorted(postes, key=lambda p: moy.get(p["nom"], 0) - p["prevu"], reverse=True):
        ecart = moy.get(p["nom"], 0) - p["prevu"]
        print("  %-38s prévu %7.0f   réel %7.0f   %+7.0f"
              % (p["nom"][:38], p["prevu"], moy.get(p["nom"], 0), ecart))

    if args.reel:
        for p in postes:
            p["prevu"] = moy.get(p["nom"], p["prevu"])

    carnet = {
        "v": 2,
        "reglages": {"revenus": revenus, "jourPaie": 1, "valeurBien": 0,
                     "fraisAgence": 4, "revaloBien": 0, "ira": True,
                     "prixCible": 0, "fraisNotaire": 7.5},
        "comptes": [], "fixes": fixes, "postes": postes,
        "credits": credits, "enveloppes": [], "depenses": [],
        "rituel": {"dernier": None, "serie": 0},
    }
    with open(args.sortie, "w", encoding="utf-8") as f:
        json.dump(carnet, f, ensure_ascii=False, indent=1)
    print("\nCarnet écrit dans %s" % args.sortie)

    if args.regles:
        regles = apprendre_regles(ops, postes)
        with open(args.regles, "w", encoding="utf-8") as f:
            f.write("const REGLES = [\n")
            for mot, poste in regles:
                f.write("  [%s,%s],\n" % (json.dumps(mot, ensure_ascii=False),
                                          json.dumps(poste, ensure_ascii=False)))
            f.write("];\n")
        print("%d règles de catégorisation écrites dans %s" % (len(regles), args.regles))


if __name__ == "__main__":
    main()
