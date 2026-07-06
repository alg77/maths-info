# SakuraDeck v0.3.4 — notes rapides

## Ajouts

- Export wishlist / plan achats en deux fichiers :
  - `sakuradeck-cardmarket-wants.txt` : liste simple `1 Nom de carte`, à copier dans l'import de liste d'envies Cardmarket.
  - `sakuradeck-wishlist-detail.csv` : détail par deck avec prix estimé, utile pour budget et suivi.
- Zoom carte plus propre : overlay plein écran, fond flouté, grande carte lisible, fermeture par clic extérieur ou Échap.
- Les images de commandant, cartes conseillées, cartes du plan et cartes de deck sont cliquables.
- Commandant rendu plus visible dans la bannière.
- Version à privilégier pour un futur hébergement GitHub Pages / Firebase Hosting.

## À savoir

Le bouton **Nouveau CSV ManaBox** remplace la collection courante par le CSV importé. Il ne fusionne pas encore proprement les imports successifs.

## Priorités roadmap

1. Héberger la page sur GitHub Pages ou Firebase Hosting pour éviter les limites du mode fichier local.
2. Passer le cache Scryfall en IndexedDB.
3. Ajouter un mode import CSV : remplacer / fusionner / ajouter seulement.
4. Ajouter une vraie sync Firebase + connexion Google.
5. Affiner les retraits par rôle : remplacer une carte de pioche par une meilleure pioche, un removal lent par un removal efficace, etc.
6. Export Cardmarket plus avancé : wantlist par deck, budget maximal, alternative moins chère.
