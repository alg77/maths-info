# Atelier — votre dressing, autrement

Application personnelle de dressing en français, locale, sans compte et sans backend. React + TypeScript + Vite ; données JSON versionnées ; persistance IndexedDB ; photos locales ; service worker hors ligne.

## Démarrer

Sur cet ordinateur, `Lancer-Atelier.cmd` sert directement la version déjà construite. Garder la fenêtre ouverte puis consulter `http://127.0.0.1:4173`. Ce lanceur utilise Node.js, sans installation de dépendances pour la simple consultation.

Node.js 22.18+ ou 24 et pnpm sont recommandés.

```sh
pnpm install
pnpm dev
```

Le développement ouvre un serveur sur `http://127.0.0.1:5173`. Pour la version hors ligne :

```sh
pnpm test
pnpm build
pnpm preview --port 4173
```

Ouvrir `http://127.0.0.1:4173`, laisser le premier chargement finir puis recharger. Le service worker conserve le site et ses images initiales. Les photos ajoutées par fichier sont stockées dans le JSON local ; le bouton des réglages prépare les autres images locales pour le mode hors ligne. Le fonctionnement hors ligne nécessite HTTPS ou localhost, pas un double-clic `file://` sur le HTML.

Dans l’aperçu intégré Codex, garder le serveur local ouvert : le rechargement serveur arrêté n’a pas fonctionné pendant la vérification. Aucun accès Internet n’est requis pour l’utilisation locale. Voir les limites détaillées dans `docs/VERIFICATION.md`.

Sur cet ordinateur, si pnpm n’est pas dans PATH :

```powershell
& 'C:\Users\dyama\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' build
& 'C:\Users\dyama\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' preview --port 4173
```

`dist/` est la version statique prête à servir. Rien n’est publié automatiquement. Un serveur de fichiers local suffit, il n’y a pas de serveur applicatif.

## Ce qui est inclus

- Aujourd’hui : température et météo saisies, occasion, style, envie de confort ou d’allure soignée, pièce imposée, trois propositions distinctes maximum, explications, réserves et substitutions.
- Dressing : recherche, catégories, couleurs, styles, saisons, tri, favoris, vues sauvegardées, fiches détaillées, ajout, modification, duplication, archive réversible et suppression contrôlée.
- Tenues : composition visuelle, tags, notes, variantes, note personnelle, historique des ports et compteurs. Les compositions incomplètes peuvent être conservées comme idées, avec avertissement.
- Wishlist : compatibilité, pièces associées, tenues complètes nouvelles estimées, doublons proches, priorité, budget, achat autonome/cascade, passage en pièce possédée.
- Inspirations : photo de référence, recette modifiable, proximité et substitutions manuelles, enregistrement d’une interprétation.
- Analyses : couleurs, styles, silhouettes, formules, catégories, saisons, polyvalence, ports et manques structurels.
- Planches : tenues, wishlist et capsules de style ou de saison, export SVG autonome avec images incorporées.
- Réglages : profil, styles et autres vocabulaires configurables, export JSON ou sauvegarde complète avec images, import avec prévisualisation et sauvegarde précédente.

## Vos données

Au premier lancement, `public/data/wardrobe.json` initialise le dressing. Ensuite, IndexedDB contient votre version courante : modifier le fichier initial ne remplace pas une collection déjà enregistrée. Utiliser l’import pour appliquer un JSON modifié. L’adresse et le port définissent l’origine du stockage : ouvrir le même site sur un autre port ne retrouve pas automatiquement les mêmes données.

Le jeu initial est issu de Capsule : 54 pièces, dont 41 possédées et 13 souhaitées, et 39 looks. Les images sont copiées, les originaux restent intacts. La version v62 est conservée dans `legacy.capsuleV62`, sans remplacement silencieux de l’inventaire. Le dashboard d’origine et les deux HTML sont archivés dans `migration/`.

Pour un autre utilisateur, Réglages → Commencer un dressing vide, ou importer `examples/wardrobe-empty.json`. Les styles, couleurs, saisons et occasions sont configurables. Les rôles fonctionnels (haut, bas, robe, chaussures…) permettent de garder le moteur générique.

## Ajouter une pièce ou une image

Dans Dressing → Ajouter une pièce : nom, catégorie, couleurs et styles suffisent pour commencer. Déplier les détails pour préciser coupe, matière, col, silhouette, manches, saisons, chaleur, températures et occasions. Plus les données sont précises, plus les explications sont utiles.

Deux possibilités pour les photos :

1. Déposer un fichier dans `public/images/`, indiquer `images/nom-du-fichier.webp`, puis reconstruire pour la version de production.
2. Choisir une photo dans le formulaire : JPEG, PNG, WebP, AVIF ou GIF, 5 Mo maximum. Elle est incorporée dans les données locales.

Les images distantes sont volontairement refusées pour préserver le fonctionnement hors ligne. Les SVG importés sont refusés ; les planches SVG produites par l’application sont des exports.

Le schéma se trouve dans `docs/wardrobe.schema.json`. `examples/blouse-col-claudine.json` est un import de pièce prêt à essayer. Un import de pièces utilise `{ "kind": "garments", "garments": [...] }` ; les catégories référencées doivent exister et les IDs doivent être uniques. Les exports de tenues et préférences ont aussi un champ `kind`.

## Comprendre les recommandations

Voir [le moteur](docs/ENGINE.md). Les scores sont des heuristiques explicables, pas des garanties de goût ni des analyses de photo. Le confort et la formalité des alternatives restent à vérifier quand les informations sont absentes. Une confiance distincte reflète les attributs connus. Les attributs déduits des noms pendant la migration sont marqués à vérifier.

Une inspiration demande une recette renseignée manuellement. Aucune IA distante n’est utilisée. Une photographie ne déclenche pas de reconnaissance automatique.

## Architecture et évolution

- `src/model.ts` : types et fabriques de données.
- `src/engine.ts` : fonctions pures de compatibilité, génération, wishlist, matching et statistiques.
- `src/storage.ts` : validation, persistance, import et export portable.
- `src/App.tsx` : navigation, transactions et fenêtres de dialogue.
- `src/screens/` : parcours de chaque module ; `src/pages.tsx` réexporte les écrans.
- `src/ui.tsx`, `src/forms.tsx`, `src/styles.css` : composants, formulaires et identité visuelle.
- `scripts/migrate.mjs` : extraction reproductible des anciennes sources inspectées. Ne pas utiliser ce script avec des fichiers JavaScript non fiables.
- `scripts/service-worker.mjs` : cache versionné de la version construite.
- `tests/engine.test.ts` : invariants de migration, génération et validation.

Le moteur peut être remplacé par un autre fournisseur sans déplacer les données vers un serveur. Les planches sont des compositions déterministes ; un futur moteur de détourage peut fournir de nouvelles images au même composant.

## Sauvegardes et limites pratiques

Exporter régulièrement une **sauvegarde complète avec images**. Le JSON simple conserve les chemins de fichiers ; il ne les copie pas. Le navigateur peut effacer son stockage, notamment en navigation privée ou lors d’un nettoyage. L’import conserve un seul état précédent, pas un historique illimité. Les images contenues uniquement dans les archives `legacy` restent dans le dossier source, pas dans l’export portable des pièces actives.

Les calculs de combinaisons sont bornés à 15 000 bases examinées pour garder l’interface réactive ; le signe `+` signale un résultat tronqué. Aucun moteur automatique ne peut retrouver les ports historiques qui n’ont jamais été sauvegardés. Les données maquillage/skincare sont préservées lors d’une migration dashboard dans `legacy`, sans interface beauté dédiée dans cette application de dressing.

Voir [la migration](docs/MIGRATION.md) et [la vérification](docs/VERIFICATION.md).
