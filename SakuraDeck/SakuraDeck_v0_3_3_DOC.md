# SakuraDeck v0.3.3 — notes de mise à jour

## Ce qui a été corrigé / ajouté

### 1. Problème Scryfall et sessions
Le problème `Failed to fetch` ne vient pas du poids du CSV ManaBox. Il vient plutôt du contexte d'exécution : fichier local `file://`, bloqueur de pub, antivirus, pare-feu, réseau filtré ou aperçu intégré.

À court terme, le chargement d'une session JSON reste un contournement. À moyen terme, il faut éviter cette dépendance en publiant SakuraDeck sur un vrai domaine : Firebase Hosting ou GitHub Pages.

Recommandation :
- héberger le HTML sur Firebase Hosting ;
- stocker le cache Scryfall en IndexedDB ;
- garder la session utilisateur séparée du cache cartes ;
- utiliser Google/Firebase Auth seulement si on veut synchroniser entre téléphone et PC.

Il n'est pas nécessaire de faire des exports ManaBox plus petits. Le bon modèle est : importer le CSV complet, hydrater seulement les nouvelles cartes, garder le cache local.

## Nouveautés v0.3.3

### Commandant plus lisible
Quand on ouvre un deck, le commandant est affiché sous forme de carte plus grande dans la bannière du deck.

### Zoom de carte
Un clic sur une image de carte ouvre un agrandissement dans une modale. Fonctionne sur :
- commandant ;
- cartes du deck ;
- suggestions ;
- achats ;
- plans d'optimisation.

### Candidates à la sortie améliorées
L'algorithme propose maintenant mieux les cartes à retirer :
- si le deck a trop de terrains, il propose d'abord des terrains de base en trop ;
- puis des terrains engagés lents ;
- puis des terrains utilitaires moins prioritaires ;
- ensuite seulement les sorts chers, hors thème, peu joués, sans rôle clair.

Exemple : si un deck a 40 terrains pour un objectif de 36, SakuraDeck proposera de retirer un terrain plutôt que d'afficher « aucune candidate évidente ».

## Roadmap restante, par priorité

### Priorité 1 — Fiabilisation technique
- Passer le cache Scryfall en IndexedDB.
- Séparer `session utilisateur` et `cache cartes`.
- Publier sur Firebase Hosting ou GitHub Pages pour éviter les problèmes `file://`.
- Ajouter un bouton « Réinitialiser le cache cartes ».

### Priorité 2 — Connexion / synchronisation
- Ajouter Firebase Auth Google.
- Sauvegarder dans Firestore uniquement les données personnelles : decks importés, plans, historique de parties, préférences.
- Ne pas stocker toutes les données Scryfall dans Firestore sauf besoin réel, pour éviter coût et lenteur.

### Priorité 3 — Optimisation Magic plus intelligente
- Associer chaque ajout à un retrait par rôle : pioche contre pioche faible, ramp contre ramp faible, terrain contre terrain si surplus.
- Ajouter une notion de « carte de cœur » ou « ne jamais couper ».
- Ajouter un mode agressif / casual / budget / troll à deux têtes.

### Priorité 4 — UX deckbuilding
- Comparateur de plans : gratuit, 10 €, 20 €, illimité.
- Bouton « appliquer ce plan » pour générer une decklist finale.
- Export Cardmarket + export ManaBox / Moxfield.

### Priorité 5 — Long terme
- Mode nouveau deck depuis collection.
- Fiches PDF imprimables.
- Statistiques de collection.
- Alertes prix / wishlist.
