# SakuraNSI — Banque ECE

## Organisation

```text
Studio/
├── references/nsi/ece/
│   ├── 2024/       # 48 sujets : PDF et fichiers Python
│   └── 2026/       # 23 sujets : PDF, données et programmes fournis
└── out/web/nsi/ece/
    ├── dashboard.html
    ├── index.html
    ├── prof.html
    ├── eleves.html
    └── ece-sakura.css
```

Les sujets 2025 ne sont pas dupliqués : ils reprennent la banque 2024 dans un ordre différent.

## Rôle des pages

| Page | Public | Rôle | Corrections | Éditeur |
|---|---|---|---:|---:|
| `dashboard.html` | Professeur | Suivre la conversion des 71 sujets 2024/2026 en fiches interactives | Non | Non |
| `index.html` | Entraînement accompagné | Consulter les cinq premières fiches 2026, ouvrir les sujets et afficher une correction à la demande | Oui, masquées | Liens prévus |
| `prof.html` | Professeur | Préparer/corriger une séance et ouvrir ou fermer toutes les corrections | Oui | Liens prévus |
| `eleves.html` | Élèves | Travailler sur les mêmes énoncés sans accès aux solutions | Non | Non |

`index.html` et `prof.html` sont volontairement très proches. La différence fonctionnelle est le bandeau professeur et la commande globale permettant d’ouvrir ou fermer toutes les corrections. `eleves.html` est une extraction sans corrigés ni boutons d’éditeur.

## État actuel

- Banque officielle disponible : **48 sujets 2024 + 23 sujets 2026 = 71 sujets**.
- Fiches interactives actuelles : **8 sujets 2026** (n° 1 à 7 et n° 15).
- Manifeste généré : `Studio/references/nsi/ece/manifest-ece.json`.
- Archives téléchargeables : **48 ZIP 2024 + 23 ZIP 2026**.
- Dashboard généré par `builders/build_ece_dashboard.py`.
- Scripts de départ Basthon générés par `builders/build_ece_starters.py`.
- Le dashboard ECE est accessible depuis le volet NSI du cockpit SakuraMaths.
- Le dashboard, la banque accompagnée `index.html` et la page professeur utilisent la garde Firebase professeur.
- Seule `eleves.html`, sans correction, doit être proposée aux élèves.
- La direction artistique est partagée dans `ece-sakura.css` : fond SakuraMaths, palette pastel, cartes et navigation cohérente.

## Suite recommandée

1. Relire les cinq fiches interactives existantes.
2. Compléter les thèmes des sujets encore marqués « À indexer ».
3. Transformer progressivement les sujets en fiches interactives sans recopier leur contenu dans plusieurs pages.
4. Générer les vues professeur et élève depuis le manifeste et une source unique.
5. Brancher les sujets aux objectifs Bac/ECE des progressions Terminale.
6. Étendre l'intégration Basthon aux fichiers annexes SQLite, CSV et JSON.

## Convention de statut

- `reference` : PDF et fichiers officiels présents ;
- `indexed` : métadonnées et thèmes renseignés ;
- `interactive` : fiche élève fonctionnelle ;
- `corrected` : correction professeur relue ;
- `verified` : test final effectué.
