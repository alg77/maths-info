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
- Fiches interactives actuelles : **5 sujets 2026**.
- Le dashboard ECE est accessible depuis le volet NSI du cockpit SakuraMaths.
- Le dashboard et la page professeur utilisent la garde Firebase professeur.
- La direction artistique est partagée dans `ece-sakura.css` : fond SakuraMaths, palette pastel, cartes et navigation cohérente.

## Suite recommandée

1. Créer un manifeste unique décrivant les 71 sujets : millésime, numéro, thèmes, fichiers fournis, compétences et statut.
2. Générer automatiquement `dashboard.html` depuis ce manifeste.
3. Transformer progressivement les sujets en fiches interactives sans recopier leur contenu dans plusieurs pages.
4. Générer les vues professeur et élève depuis une source unique.
5. Brancher les sujets aux objectifs Bac/ECE des progressions Terminale.
6. Ajouter un éditeur Python/Basthon réellement disponible avant d’activer les liens « Éditeur ».

## Convention de statut

- `reference` : PDF et fichiers officiels présents ;
- `indexed` : métadonnées et thèmes renseignés ;
- `interactive` : fiche élève fonctionnelle ;
- `corrected` : correction professeur relue ;
- `verified` : test final effectué.
