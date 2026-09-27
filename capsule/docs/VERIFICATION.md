# Vérification — 27 septembre 2026

## Contrôles automatisés

`pnpm build` : compilation TypeScript stricte et build Vite réussis. Service worker généré avec 138 ressources, dont le chemin racine et les images initiales.

`pnpm test` : tests du moteur, de migration et de validation ; tests du gestionnaire de service worker dans un contexte isolé simulant une absence de réseau. Les tests du worker nécessitent une construction préalable (`pnpm build`).

Scénarios couverts : références et fichiers images des 54 pièces / 39 looks, dressing vide ou sans chaussures, robe complète, pièces archivées/en vente/wishlist exclues, contrainte de pièce imposée, trois variantes uniques maximum, blouse et maille en superposition, blouse de base + robe rejetées, nouveaux outfits de wishlist, manque de chaussures, confiance et températures, matching sans réutilisation de pièce, images invalides ou volumineuses, import hostile/incomplet, doublons, import des exemples, conservation des données beauté anciennes.

Les empreintes SHA-256 de l’index Capsule original et de sa copie de migration sont identiques. Aucun fichier des anciens projets n’a été modifié.

## Parcours navigateur vérifiés

- Chargement de l’application et des vraies images.
- Rendu mobile et bureau (viewport bureau 1440 × 1000 ; aperçu mobile étroit).
- Recherche « Honey », ouverture d’une fiche, modification du nom puis Annuler : donnée inchangée.
- Ajout de la blouse de référence en wishlist, rechargement, pièce retrouvée avec son analyse.
- Sauvegarde d’une tenue depuis Aujourd’hui, recherche dans le lookbook.
- Enregistrement d’un port, présence dans l’historique et création de planche.
- Préparation hors ligne : 54 images confirmées par l’interface.
- Import du JSON initial : aperçu de 54 pièces et 39 tenues, application réussie. Le jeu courant ne contient plus les essais ; leur état précédent reste récupérable.
- Aucune erreur JavaScript dans les journaux du navigateur lors des parcours inspectés.

## Limites de vérification

L’aperçu intégré n’a pas rechargé l’application quand le serveur local a été arrêté, même avec le service worker actif. Le serveur est relancé pour la livraison. Il faut garder le serveur de fichiers ouvert dans cet aperçu ; le fonctionnement sans Internet ne dépend d’aucun service distant. Le rechargement serveur arrêté dans un navigateur standard reste à vérifier, ce navigateur n’étant pas accessible dans cette session. Le gestionnaire hors ligne est testé séparément avec un cache simulé.

L’export SVG a été déclenché sans erreur JavaScript, mais l’aperçu intégré n’a pas remonté d’événement de téléchargement vérifiable. La fonction utilise un lien Blob standard attaché au document ; vérifier la réception des téléchargements dans votre navigateur habituel. La prévisualisation des planches est fonctionnelle.

Les parcours inspiration complets et import d’image par sélecteur natif n’ont pas fait l’objet d’une vérification navigateur exhaustive. Leurs calculs et formats sont couverts par les tests du moteur et du validateur. Aucun test n’établit une qualité stylistique objective : les scores restent heuristiques.
