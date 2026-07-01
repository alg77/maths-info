# Authentification Google

SakuraMaths utilise Firebase Authentication pour orienter automatiquement chaque compte :

- adresse présente dans `auth/profs.json` → `accueil.html` (Dashboard Prof) ;
- autre adresse Google → `eleves.html` (Dashboard Élève) ;
- aucun compte → proposition de connexion sur `index.html`.

## Mise en service

1. Créer ou ouvrir un projet dans la [console Firebase](https://console.firebase.google.com/).
2. Ajouter une application **Web** au projet.
3. Dans **Authentication > Sign-in method**, activer le fournisseur **Google**.
4. Dans **Authentication > Settings > Authorized domains**, ajouter le domaine GitHub Pages du site et le domaine personnalisé éventuel. `localhost` peut être utilisé pour les tests locaux.
5. La configuration du projet `sakuramaths-44708` est renseignée dans `auth/firebase-config.js`.
6. Ajouter les adresses professeures autorisées dans `auth/profs.json`, en minuscules.
7. Tester depuis un serveur HTTP ou GitHub Pages ; l'authentification ne fonctionne pas correctement en ouvrant directement les fichiers avec `file://`.

La configuration Web Firebase contient des identifiants publics de l'application, pas un mot de passe. En revanche, la liste blanche côté navigateur sert à l'orientation de l'interface et **ne protège pas à elle seule un fichier public sur GitHub Pages**. Les corrigés et livrets professeur devront être placés derrière des règles Firebase ou sur Google Drive conformément à la priorité 2.

## Fichiers

- `auth/auth.js` : connexion, déconnexion, rôle et redirections ;
- `auth/profs.json` : liste blanche prof ;
- `auth/firebase-config.js` : configuration de l'application Firebase ;
- `index.html` : porte d'entrée et connexion ;
- `accueil.html` : Dashboard Prof protégé côté interface.
