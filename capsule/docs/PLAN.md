# Atelier — plan de réalisation

Les sources Capsule et Dressing & Beauty restent intactes. React/TypeScript sépare les écrans, le domaine, le moteur explicable et la persistance IndexedDB. Vite produit un site statique sans serveur applicatif. JSON versionné est le format d'échange et de sauvegarde ; les images restent des fichiers locaux.

Migration : index Capsule comme inventaire principal, conservation intégrale des données v62 et du dashboard dans une archive JSON ; les différences v62 ne remplacent pas automatiquement les statuts. Les attributs déduits sont signalés à vérifier. Les historiques navigateur nécessitent un export depuis leur origine. Les sauvegardes ne sont jamais récupérables par simple lecture des HTML.

Modèle : garments, outfits, wishlist, inspirations, boards, wearEvents, vocabularies, preferences et legacy. IDs stables ; références vérifiées ; archive réversible ; suppressions empêchées si référencées. Les taxonomies sont configurables, les rôles structurels restent stables.

Moteur : structure de tenue avant score, comparaison d'attributs connus, confiance distincte du score, aucune chaussure fictive. Tenues complètes uniques, recommandation de trois variantes maximum, wishlist évaluée contre les seules pièces possédées. Une image d'inspiration n'est pas analysée automatiquement : recette manuelle éditable, matching explicable.

Écrans : Aujourd'hui, Dressing, Tenues, Wishlist, Inspirations, Analyses et Réglages. Planches intégrées aux tenues et aux analyses. Ivoire, forêt, typographie éditoriale, cartes photo, navigation mobile et bureau.

Validation : migration et références, critères structurels du moteur, absence de cascade artificielle, validation/import hostile, build TypeScript, parcours réels navigateur, persistance après rechargement, cache hors ligne et responsive.
