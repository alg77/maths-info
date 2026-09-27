# Migration des bases existantes

Sources inspectées, non modifiées :

- `C:/Users/dyama/Documents/GitHub/alg77/maths-info/test/capsule/index.html`
- `C:/Users/dyama/Documents/GitHub/alg77/maths-info/test/capsule/gemini_capsule_v62.html`
- `C:/Users/dyama/Documents/GitHub/alg77/maths-info/test/dressing_beauty_dashboard/dressing_beauty_dashboard/`

## Choix conservateurs

L’index Capsule fournit 54 vêtements (41 possédés, 13 en wishlist, 2 des pièces possédées à vendre) et 39 tenues. Les identifiants et les références sont conservés. Toutes les images référencées sont présentes. Les 131 fichiers du dossier images, y compris ses sous-dossiers, sont copiés.

La version v62 contient 95 entrées et des statuts parfois différents. Ces entrées, leurs notes, les looks et le planning sont conservés dans `legacy.capsuleV62`. Aucun statut n’est remplacé automatiquement, aucun historique de port n’est inventé. Pour reprendre une pièce de v62, utiliser l’archive visible dans Réglages et compléter la fiche correspondante ; un examen individuel est nécessaire pour les IDs ou photos proches. `migration/report.json` liste les conflits d’IDs. Les sources HTML/JS complètes restent disponibles dans `migration/`.

Les prix et compteurs absents de l’index initial restent respectivement `null` et `0`. Les couleurs, motifs et styles suggérés à partir du nom sont marqués `reviewNeeded: true`. Dans la fiche, les vérifier puis cocher la case prévue. Les palettes personnelles contradictoires des prototypes ne deviennent pas des règles universelles.

Les tenues contenant une pièce souhaitée sont identifiées comme projetées. Les looks sans chaussures restent sauvegardés comme compositions existantes, sans être comptés comme tenues générées complètes. Les pièces à vendre sont exclues de la génération mais leurs fiches restent disponibles.

## Récupérer les données du navigateur ancien

Les fichiers HTML ne contiennent pas les modifications sauvegardées dans le navigateur. Le stockage est lié à l’origine et au profil du navigateur : ouvrez l’ancienne application avec le même navigateur et la même adresse que d’habitude.

Dans sa console développeur, exécuter ce code pour **télécharger uniquement** les trois clés utilisées par les prototypes. Il n’efface et n’envoie rien :

```js
const archive = {};
for (const key of ['dbd-state', 'myClosetHistory', 'myClosetCounts']) {
  const value = localStorage.getItem(key);
  if (value !== null) archive[key] = JSON.parse(value);
}
const link = document.createElement('a');
const url = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], {type:'application/json'}));
link.href = url;
link.download = 'ancien-dressing.json';
link.click();
setTimeout(() => URL.revokeObjectURL(url), 1000);
```

Importer ensuite ce fichier dans Réglages. Si les clés dashboard et Capsule sont toutes présentes, importer le dashboard, puis un second JSON contenant uniquement `myClosetHistory` et `myClosetCounts` pour reprendre les deux sources. Le fichier original complet reste conservé par vos soins ; les données dashboard incluent beauté, budget et inspirations dans `legacy.dashboard`.

Le dashboard reçoit des IDs préfixés `dashboard-` et ne fusionne pas automatiquement des vêtements ressemblants. Les images distantes restent dans l’objet d’origine, mais doivent être ajoutées localement pour apparaître. Les dates anciennes en langage naturel sont conservées dans l’archive du look : elles ne sont pas transformées en dates fictives. Les compteurs reprennent seulement les IDs reconnus ; les inconnus restent dans l’archive.

## Sauvegarde / restauration

Chaque import est validé avant modification puis présenté dans une fenêtre d’aperçu. L’application sauvegarde l’état précédent dans une transaction IndexedDB avant le remplacement. Le bouton « Restaurer l’état précédent » le présente à son tour avant application. Un import invalide ne modifie pas le dressing.

Modifier le JSON initial sur disque ne remplace pas l’état déjà enregistré dans le navigateur : importer explicitement le fichier modifié. Garder le même port d’accès ou transférer une sauvegarde si l’adresse change.

Pour relancer l’extraction depuis les sources : `node scripts/migrate.mjs "CHEMIN/vers/maths-info/test"`. Cette commande régénère les fichiers de migration du projet ; elle n’écrit jamais dans les anciens dossiers.
