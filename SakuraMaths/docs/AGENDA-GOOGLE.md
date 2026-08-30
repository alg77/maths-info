# Planner Google Agenda

Cette page ajoute une vue planner professeur dans SakuraMaths :

- page : `planner.html` ;
- accès depuis `accueil.html` ;
- droit demandé : lecture seule de Google Agenda ;
- aucune création ni modification d'événement pour l'instant.

## Configuration Google à vérifier

Dans Google Cloud / Firebase, il faut :

1. activer l'API **Google Calendar API** ;
2. vérifier que le client OAuth Web accepte l'origine JavaScript :
   - `https://alg77.github.io`
   - éventuellement `http://localhost:8000` pour les tests locaux.

La page utilise le client OAuth public renseigné dans :

`auth/google-calendar-config.js`

## Utilisation

1. Ouvrir l'espace prof.
2. Cliquer sur **Planner / Agenda**.
3. Cliquer sur **Autoriser l'agenda**.
4. Choisir le compte Google.
5. Garder `primary` pour l'agenda principal, ou coller l'identifiant d'un autre agenda.

## Choix de conception

Pour la première version, le planner est volontairement en lecture seule :

- plus sûr ;
- plus simple à tester ;
- suffisant pour préparer la semaine ;
- compatible avec GitHub Pages.

Une prochaine étape possible sera de relier les événements aux périodes, aux livrets et aux automatismes.
