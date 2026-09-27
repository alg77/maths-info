# Moteur explicable

Les fonctions de `src/engine.ts` ne connaissent ni React ni IndexedDB. Elles reçoivent des objets JSON typés et retournent scores, confiance, raisons et réserves.

## Compatibilité

Les rôles incompatibles sont traités avant le score. Deux pièces du même rôle sont incompatibles, sauf une base et une maille de rôle intermédiaire. Une robe ne se combine pas avec un bas ou un haut de base dans ce modèle ; une maille intermédiaire peut l’accompagner.

Les critères connus sont pondérés : couleurs (3), styles (3), motifs (1), saisons (2), températures (2), formalité (2), occasions (1), silhouettes (1), matières (1). Des attributs absents ne sont pas inventés. Le score est ramené vers 50 quand les informations sont rares pour éviter des 100/100 fondés sur un seul indice. La confiance mesure la part des critères renseignés et est réduite pour les attributs de migration non vérifiés.

Les règles sont intentionnellement simples : couleurs communes ou présence d’un neutre ; styles qui se recoupent ; uni avec motif ; saisons et plages de températures compatibles ; écart de formalité ; volumes amples ; contraste lin/laine ou velours. Elles n’impliquent aucune connaissance de la photo ou de la coupe réelle.

## Tenues du jour

Bases explorées : haut + bas + chaussures, ou robe/combinaison + chaussures. Pièces possédées, non archivées et non proposées à la vente uniquement. Une pièce imposée doit être présente. Sous 14 °C, le meilleur manteau disponible est ajouté ; s’il manque, un avertissement l’indique. Collants et imperméabilité donnent des conseils, jamais des achats inventés.

Le classement utilise les accords, style, occasion et températures. Les variantes confortable et habillée s’appuient sur la coupe et la formalité renseignées. Si ces données manquent, le résultat le dit explicitement. Les variantes sont dédupliquées ; la diversité des pièces est favorisée dans un écart de 10 points.

Le moteur limite l’exploration à 15 000 bases ; les compteurs sont alors des bornes inférieures affichées avec `+`. Cette limite garantit un temps borné mais ne représente pas toutes les combinaisons théoriques d’un très grand dressing.

## Wishlist

La pièce candidate est ajoutée temporairement aux seules pièces possédées. Seules les tenues complètes qui contiennent cette candidate sont comptées. Les accessoires facultatifs ne multiplient pas le compteur. Les associations entre pièces ne sont pas confondues avec des tenues.

- Achat autonome : au moins une tenue complète trouvée.
- Cascade possible : aucune tenue complète trouvée ; les rôles manquants sont listés. Si les rôles existent déjà, l’interface recommande de vérifier les données plutôt que d’acheter.
- Ajout stratégique : au moins 6 tenues, au moins 4 pièces compatibles et moins de 3 pièces très similaires (rôle + couleur + style).

Ce sont des repères configurables dans le moteur, pas une prescription d’achat. Le score moyen des associations retenues et la confiance sont affichés séparément.

## Inspirations et style

Chaque recette contient des rôles, couleurs, styles et détails éditables. Le rapprochement donne 35 points au rôle, jusqu’à 30 aux couleurs, 15 aux styles et 20 aux détails décrits. Les critères non demandés ne pénalisent pas le score. Une pièce ne remplit pas deux emplacements du matching initial. Les substitutions choisies ensuite restent libres ; le score affiché reste explicitement celui du rapprochement initial.

L’analyse de style compte les tags du dressing et les rôles des tenues sauvegardées. Elle distingue formules sauvegardées et ports réellement enregistrés. Les pièces sans informations ne sont pas présentées comme stylistiquement certaines.

La polyvalence des manteaux, sacs et accessoires compte les tenues de base qu’ils peuvent compléter ; leur absence d’une base haut/bas/chaussures ne les rend pas artificiellement orphelins. Ces ajouts ne multiplient pas le compteur global de tenues de base.

## Planches

Une planche référence les IDs des pièces et conserve titre, type, styles et notes. L’affichage est une grille éditoriale CSS. L’export SVG inclut les images raster en base64, une palette et les noms ; il reste autonome et partageable. Aucun détourage ni rendu sur mannequin n’est simulé.
