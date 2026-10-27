# Retrouver la colorimétrie — 16 octobre 2026

## Évaluation des anciennes bases
- Capsule `test/capsule/index.html` : palette Automne profond (8 teintes), dressing, wishlist, pièces à vendre, tenues commentées. Les données initiales Atelier conservent 54 pièces et 39 tenues.
- Dressing & Beauty : profil Deep Winter doux dans l’objet `sample`, avec données de démonstration. Son calcul de compatibilité utilisait une liste fixe de noms de couleurs froides et ne dépendait pas du profil. Données modifiées conservées dans `localStorage` sous `dbd-state`, distinctes du code source.
- Atelier : gestion et moteur modulaires déjà présents, mais aucun profil colorimétrique actif avant cette évolution.

## Migration et architecture
Conserver React, TypeScript, IndexedDB, JSON et les images locales. Ajouter `preferences.colorProfile` facultatif sans changer schemaVersion ni remplacer les collections. Les sauvegardes sans profil restent valides et les conseils sont désactivés. Les deux palettes historiques sont proposées explicitement et modifiables. Aucune n’est considérée comme un diagnostic.

Le moteur `src/colorimetry.ts` est séparé du moteur d’accord entre vêtements. L’écran Colorimétrie permet de choisir, modifier, activer et sauvegarder le profil. Les fiches et la wishlist affichent le conseil. Le classement des tenues reçoit un ajustement de -5 à +5 points pour les hauts, robes et vestes renseignés.

## Modèle JSON
```json
{"name":"Ma palette","undertone":"neutre-chaud","contrast":"doux","palette":[{"label":"Sapin","hex":"#254E38"}],"avoid":["orange"],"notes":"Mes repères après essayage","enabled":true}
```
Placer cet objet dans `preferences.colorProfile`. Maximum 32 teintes, notation hexadécimale #RRGGBB. Export/import complet ou des préférences inclut ce profil.

## Conseils et limites
La proximité est une distance RGB normalisée vers la teinte la plus proche, moyennée à poids égal entre couleurs principales et secondaires connues. Ce n’est ni une probabilité, ni une analyse perceptuelle de peau ou de photo. Les exclusions utilisent le nom ou l’identifiant exact du nuancier, sans distinction d’accents ou de casse. Les couleurs inconnues ne sont pas évaluées et la couverture est affichée. Sous-ton et contraste sont des notes personnelles ; ils ne génèrent pas de règles automatiques. Aucun vêtement n’est interdit.

## Données anciennes
Aucun inventaire de démonstration n’est ajouté automatiquement. L’import d’un export `dbd-state` ajoute le dressing et les envies vestimentaires actives ; les catégories générales restent à vérifier. Beauté, wishlist beauté, profils anciens et autres champs restent dans `legacy.dashboard`, inclus dans les sauvegardes. Les couleurs non reconnues sont conservées en notes. Les historiques navigateur nécessitent un export de l’ancienne application. Les fichiers HTML ne contiennent pas les changements du navigateur.

Les sources historiques et leurs images restent intactes. La copie publiée n’écrit jamais dans IndexedDB au chargement si un dressing existe déjà. Exporter une sauvegarde complète avant transfert entre localhost et GitHub Pages : leurs stockages sont séparés.

Validation de cette évolution : compilation TypeScript/Vite réussie ; 23 tests existants et colorimétrie réussis, plus un test dédié à l’import de wishlist vestimentaire réussi (24 au total). Contrôle visuel non terminé : l’ouverture de l’aperçu par le navigateur intégré a expiré. Aucune validation visuelle mobile/bureau de ce nouvel écran n’est revendiquée.
