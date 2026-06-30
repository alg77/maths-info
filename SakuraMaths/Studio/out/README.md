# Sorties générées

Ce dossier contient les documents produits par `Studio/scripts/build_livret.py`.

- `pdf/` : livrets imprimables ;
- `web/` : versions HTML des chapitres ;
- `qcm/` : page QCM, banque JavaScript et exports Kahoot.

## Convention de nommage

- La sortie courante porte un nom sans suffixe automatique, par exemple
  `pdf/4N1__eleve_atkinson_11pt_couleur.pdf`.
- Une version conservée volontairement utilise `_v01`, `_v02`, etc.
- Les suffixes ajoutés par le navigateur, comme ` (1)`, ` (2)` ou ` (3)`, ne
  constituent pas des versions et doivent être évités.
- Pour un même document, employer des tirets ou des underscores de manière
  constante. Le QCM canonique se nomme `qcm-4eme.html`.

## Règle de nettoyage

Avant de conserver plusieurs sorties, comparer leur contenu. Une seule copie est
gardée lorsque les fichiers sont strictement identiques. Les variantes différentes
ne doivent pas être supprimées sans validation de leur contenu.

Certaines sorties sont copiées dans `Progressions/` pour être publiées. Ces copies
de déploiement sont intentionnelles et ne sont pas considérées comme des doublons
supprimables tant que les pages publiques les utilisent.
