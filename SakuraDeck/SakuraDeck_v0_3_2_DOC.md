# SakuraDeck 🌸🐾 — documentation v0.3.2

## Philosophie

SakuraDeck reste un assistant personnel de décision Magic: The Gathering : il ne remplace pas ManaBox, Archidekt ou Moxfield, mais aide à répondre à la question : **comment améliorer mes decks avec ce que je possède déjà, puis avec les achats les plus rentables ?**

## Nouveautés v0.3.2

### 1. Tri des decks
La barre latérale permet maintenant de trier les decks :

- A→Z ;
- score croissant ;
- score décroissant ;
- valeur décroissante ;
- nombre de cartes décroissant.

Le tri est sauvegardé dans la session.

### 2. Visuels des cartes
Les listes de recommandations affichent des cartes plus visuelles : miniature, nom, type, prix ou statut, rôle, score d’impact, et zoom au survol quand l’image Scryfall est disponible.

### 3. Plan conseillé
Nouvel onglet **🧭 Plan conseillé** dans chaque deck.

Il propose des couples d’optimisation :

- carte à ajouter ;
- carte candidate à retirer ;
- coût éventuel ;
- gain estimé ;
- justification.

Les retraits restent des suggestions statistiques : une carte coup de cœur peut rester dans le deck.

### 4. Session allégée
La session sauvegardée ne duplique plus `NAME_DB`. Elle conserve :

- cartes hydratées ;
- plans ;
- parties ;
- EDHREC ;
- précos importées ;
- tri choisi.

Les anciennes sessions restent compatibles : si `names` est absent, SakuraDeck reconstruit l’index des noms à partir des cartes hydratées.

### 5. Scryfall plus robuste
Les requêtes Scryfall passent par lots de 50 au lieu de 75. Si Scryfall renvoie une erreur de type “maximum exceeded”, le lot est automatiquement coupé en deux et relancé.

## Comment utiliser

1. Ouvrir `sakuradeck_v3_2.html` dans Chrome ou Firefox.
2. Laisser Scryfall hydrater les cartes.
3. Importer les précos souhaitées depuis la barre latérale.
4. Ouvrir un deck.
5. Regarder d’abord :
   - 🌸 Aperçu ;
   - 🧭 Plan conseillé ;
   - ⚖️ Avant / Après.
6. Sauvegarder la session après usage.

## Roadmap restante

### Priorité 1 — Fiabilisation technique
- Passer le cache Scryfall en **IndexedDB** au lieu de tout mettre dans un JSON.
- Séparer clairement :
  - session utilisateur : plans, parties, tri, decks importés ;
  - cache cartes : données Scryfall volumineuses.
- Ajouter un bouton “vider le cache cartes”.
- Ajouter un diagnostic clair : nombre de cartes hydratées, cartes manquantes, cartes en erreur.

### Priorité 2 — Optimisation Magic plus fine
- Améliorer les retraits proposés : distinguer cartes faibles, cartes redondantes, cartes trop lentes, cartes hors-plan.
- Ajouter des rôles séparés : wipe, protection, tuteur, token, sacrifice, counters, tribal, mana fixing.
- Ajouter un score de mana base plus précis : terrains engagés, sources colorées, fixing, lands utilitaires.
- Proposer des plans d’optimisation par budget : 0 €, 5 €, 10 €, 20 €, 50 €.

### Priorité 3 — UX et confort mobile
- Vue compacte mobile pour les recommandations.
- Bouton “appliquer tout le plan conseillé”.
- Bouton “ignorer cette carte / ne plus proposer”.
- Badges “déjà dans un autre deck”, “à acheter”, “dans le classeur”.
- Recherche rapide dans les decks et la collection.

### Priorité 4 — Suivi des parties
- Export/import de l’historique des parties.
- Statistiques par deck : raisons de défaite, nombre moyen de mulligans, score ressenti.
- Suggestions reliées aux défaites observées.

### Priorité 5 — Mode construction
- Mode “nouveau deck” depuis un commandant.
- Construction depuis la collection.
- Complément par achats budgetés.
- Détection des cartes utilisables dans plusieurs decks.

### Priorité 6 — Écosystème
- Export wishlist Cardmarket propre.
- Fiches deck PDF imprimables.
- Publication GitHub Pages.
- Thème sombre.
- Mode 100 % hors-ligne via MTGJSON ou cache complet.

## Prochaine étape recommandée

La priorité absolue est **IndexedDB + séparation session/cache**. Cela évitera les problèmes de taille de session, rendra l’usage mobile beaucoup plus stable, et permettra de garder des milliers de cartes hydratées sans alourdir les sauvegardes.
