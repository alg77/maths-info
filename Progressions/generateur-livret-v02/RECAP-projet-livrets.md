# RECAP — Générateur de livrets de cours « Mme Le Guern »

> À coller (ou re-uploader) en tête d'une nouvelle conversation pour reprendre le projet.

## Le projet
Générateur **Python + WeasyPrint** : à partir d'**un seul fichier Markdown** par chapitre,
il produit les versions **prof** et **élève** en PDF, à ma **charte kawaii/pastel** (soft academia).
Philosophie : source unique → multi-sorties, gagner du temps, pas d'usine à gaz.

## État actuel — `build_livret.py` v02 (fonctionne)
Rendu fidèle à la charte (réf. `Exemple_chapitre_N1.pdf`) :
- **En-tête** à badge de code + eyebrow (domaine) + titre rond (Baloo2) + niveau.
- **Compétences** en pilules (fond plein).
- **Objectifs visés** (début) + **« Je suis maintenant capable de… »** (grille 3 frimousses + cases)
  — remplis **automatiquement** depuis `pont-livret-4e.json` (clé = code chapitre).
- **Sections** numérotées en chiffres (1, 2, 3), à pastille colorée.
- **Encadrés** à bordure-gauche + label-pilule : `prop` (vert) / `def` (rose) / `meth` (bleu) /
  `rem` (lavande) / `rappel` « Je me souviens » / `retenu` « J'ai retenu » (crème) /
  **`reussite` « Critères de réussite » (orange, cases à cocher)** / `ressources` « Pour aller plus loin » + QR.
- **Exemples** en cartes : **un calcul par ligne, pas de flèche** (modèle de rédaction),
  identifiant en italique, résultat final en rose.
- **Trous `[[…]]`** : prof = réponse en rose, élève = pointillés. (Propriétés à trous côté élève.)
- **Badges de niveau (5ᵉ…)** sur les objectifs : affichés côté **prof** seulement.
- **Police par défaut = Atkinson** ; options `--police opensans|opendyslexic`.
- **Polices embarquées en base64** + converties en **statiques** (Baloo2-s, Oswald-s, OpenSans-s/b/it)
  car WeasyPrint Windows ne gère pas les polices variables.
- **Suffixe (1)/(2)** ajouté si le PDF existe déjà (pas d'écrasement).

## Commande
```
python build_livret.py 4N1.md --pont pont-livret-4e.json --mode both --out .\out
```
Options : `--mode prof|eleve|both`, `--police atkinson|opensans|opendyslexic`, `--taille`,
`--interligne`, `--couleur couleur|nb`, `--html`, `--exomap exos-4e.json`.

## Environnement Windows (réglé)
- `pip install weasyprint qrcode pillow`
- WeasyPrint a besoin de Pango : installé via **MSYS2** (`pacman -S mingw-w64-x86_64-pango`)
  + variable `WEASYPRINT_DLL_DIRECTORIES` vers `…\msys2\mingw64\bin`.

## Dernier point en cours
Vérifier que le **titre s'affiche enfin en Baloo2 (arrondi)** après le passage en polices statiques.

## Étape suivante = LES 5 DOCS à rédiger
`SPECIFICATION.md`, `ARCHITECTURE.md`, `FORMAT_CHAPITRE.md`, `STYLEGUIDE.md`, `ROADMAP.md`.

## Ensuite (feuille de route)
- Page **« calcul mental »** de période, auto depuis les `automatismes` du pont-livret (+ QR mathmentales).
- Remplir la **colonne QR MathALÉA** (`--exomap`, objectifs-clés d'abord).
- Sorties dérivées : **QCM** (banque JS + Kahoot/Plickers), **flashcards**, **jeux de cartes**.
- Variante **allégé/standard** (pas encore dans le générateur).

## Fichiers à rattacher
`generateur-livret-v02.zip` (ou `maj-charte-v02.zip`), `4N1.md`, `pont-livret-4e.json`,
`progression-4e.json`, `Charte_graphique_Mme_Le_Guern.md`, `Prompt_livrets_de_cours.md`.
