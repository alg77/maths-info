# Générateur de livrets — guide (v3.1)

Source unique → **prof / élève**, en **PDF + HTML web + sélecteur interactif**, plus un
**assembleur** (fusion + cahier piqué). Polices incluses dans `fonts/`.

## Installation
```
pip install weasyprint qrcode pillow pypdf opencv-python-headless
```
Garder `fonts/` à côté de `build_livret.py`.

## Sélecteur année — `SELECTEUR_annee.html`  ⭐
Ouvre-le dans Chrome : coche/réordonne les chapitres de **toute l'année**, mets le n° de
période, bascule Élève↔Prof, choisis police/taille, puis **Imprimer/PDF**, **Télécharger HTML**,
ou **Manifeste .txt**. Pour le régénérer après ajout de chapitres :
`python3 build_livret.py annee-4e.txt --builder`.

## Écrire un chapitre (Google Docs → export Markdown)
En-tête : `# CODE | Titre | 4e | codes,compétences` (Ca3, Mo1… → libellés auto).
- Blancs : `[[réponse]]`
- Encadrés : `:::type | Titre … :::` — types : `def regle prop methode rappel retenu reussite ressources`
- **Tableaux** : syntaxe Markdown `| a | b |` (séparateur `| --- | --- |`). Les cellules acceptent `[qr:URL]`.
- **Ressources** (liens + QR) : bloc `:::ressources` avec lignes `- Libellé | https://…`
- Figure : un `<svg class="fig">…</svg>` dans un encadré
- Mise en forme : `**gras**`, `*x*`, `a^2`, `[qr:https://…]`, puces `- `

## Page calcul mental
C'est un chapitre normal (code `C`, bandeau or) avec un **tableau** : une ligne par automatisme,
une colonne « Éval. semaine » à compléter, une colonne `[qr:URL]` vers l'entraînement.
Voir `sources/C1.txt`. (QR récupérés depuis tes originaux.)

## Générer
```
python3 build_livret.py P2-4e.txt --mode both --police atkinson --taille 12 --html
python3 build_livret.py annee-4e.txt --builder
```
Paramètres : `--mode prof|eleve|both` · `--police atkinson|opendyslexic` · `--taille` ·
`--interligne` · `--couleur couleur|nb` · `--html` · `--builder`.

## Assembleur — `assemble.py`
```
# fusionner livret + activités (flocon, arbre de Pythagore…)
python3 assemble.py LIVRET-P2.pdf flocon.pdf arbre.pdf -o COMPLET.pdf

# imposition cahier piqué A3 (2 pages A4 / face), prêt à plier + agrafer cheval
python3 assemble.py COMPLET.pdf --cahier -o COMPLET_cahier_A3.pdf
```
Imprimer le cahier recto-verso « bord court », plier au centre, agrafer à cheval.

## Impression
G�nère **en couleur** ; l'intérieur s'imprime très bien en **N&B** (réglage imprimante).
Couverture/dos en couleur. Économise ton crédit photocopie sans fichier séparé.

## État de la conversion P1 / P2
- **Faits** : N1, N2 (relatifs), C1 (calcul mental), N3, G2, N4, R1 (ressources).
- **À faire** (figures à soigner) : G1 (triangles égaux/semblables), D1 (proportionnalité,
  graphiques, %). Le texte/blancs/tableaux sont simples ; ce sont surtout les figures
  géométriques qui demandent un passage SVG dédié.

## Maths en LaTeX  (v4)
Écris les maths entre `$ … $` : `$3x + 5x = 8x$`, `$\frac{3}{4} \times \frac{8}{9}$`,
`$BC^2 = AB^2 + AC^2$`, `$\sqrt{28} \approx 5,3$`, `$\frac{t}{100}$`, `$10^{-2}$`.
Les variables sont en italique (*x*), distinctes de l'opérateur ×, et les fractions sont empilées.
Commandes gérées : `\frac \sqrt ^ _ \times \div \cdot \le \ge \neq \approx \pi \pm \ldots`.

## Couverture « cahier de vacances »
Dans le bloc `:::couverture`, ajoute `style: vacances` et `illustration: panda` (ou `renard`).
→ bandeau dégradé pastel, titre bubbly (Baloo 2), pétales de cerisier, ton illustration (dossier `assets/`),
encart pointillé « ce cahier appartient à » (élève uniquement). Pour ta propre illustration :
dépose un PNG dans `assets/` et mets son nom dans `illustration:`.

## QCM Maths (QCM.html)
App autonome : 36 questions sur 9 thèmes (relatifs, fractions, puissances, calcul littéral,
équations, Pythagore, proportions/%, quadrilatères, statistiques), feedback immédiat + score.
Pour modifier/ajouter des questions : éditer la liste `QUESTIONS` dans `build_apps.py`
(maths entre `$…$`, chaînes en `r"..."`), puis `python3 build_apps.py`.

## Dashboard pédagogique (dashboard.html)
Page hub : sections Mes cours / Livrets / Outils. Bouton **Ajouter** (titre, lien, catégorie)
enregistré en localStorage ; mode **Éditer** pour retirer une tuile. Le sélecteur et le QCM
sont pré-branchés. Remplace les liens « à compléter » par tes vrais fichiers/URLs (livrets P1-P3, ton site).
