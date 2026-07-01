# Audit des cours de 4e

Audit repris dans l'ordre de `Progressions/progression-4e.json` en juillet 2026.

## État des sources

Les 19 séquences de la progression possèdent désormais une source canonique :

`N1, G1, D1, N2, N3, G2, N4, D2, N5, G3, N6, G4, N7, G5, N8, G6, G7, D3, A1`.

Les anciens exports Google Docs portant un titre long sont conservés comme archives et matière première. Le build utilise les fichiers courts `4CODE.md`.

## Corrections effectuées

- réponses calculées normalisées en `[[$…$]]` ;
- blocs `:::` équilibrés dans les 19 sources ;
- création des sources canoniques manquantes ;
- séparation de la translation (G5) et de la rotation (G6) ;
- déplacement de « pyramide et cône » vers G7 ;
- figures SVG ajoutées pour G2, G3, G5, G6 et G7 ;
- objectif G2 corrigé : Pythagore au lieu des représentations de solides ;
- N6 complété avec double distributivité, suppression des parenthèses et tour de calcul ;
- G3 complété avec des programmes de construction ;
- A1 complété avec Scratch et tableur.

## Points à valider

1. Les chapitres `N3`, `N5`, `G3`, `N6`, `G5`, `G6` et `A1` n'ont aucun objectif BO associé dans le pont-livret. Les compétences générales s'affichent, mais pas de tableau détaillé d'objectifs.
2. N1 utilise des objectifs portant le niveau `5e`. Cela se comprend comme une consolidation nécessaire en 4e, mais ce choix doit rester explicite.
3. Les anciens cours contenaient beaucoup d'images intégrées et parfois des exercices. Les nouvelles sources canoniques reprennent le cours structuré ; les exercices à conserver devront être sélectionnés, car une reprise automatique des images dégradées serait peu fiable.
4. A1 est annoncé comme un fil rouge de six séances. Un seul chapitre de synthèse existe actuellement : des fiches de séance séparées seraient plus adaptées au fonctionnement en demi-groupes.
5. Les chapitres de géométrie possèdent des figures de cours, mais pas encore une construction ou un fichier GeoGebra dédié dans chaque chapitre.

## Contrôles techniques

- progression et pont JSON valides ;
- 19 sources présentes ;
- aucune ancienne réponse mathématique détectée dans les sources canoniques ;
- PDF élève et professeur générés pour les 19 chapitres ;
- pages HTML élève et professeur générées.
