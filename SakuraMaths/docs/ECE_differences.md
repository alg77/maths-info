# Différences entre les 3 pages ECE (`ece_prof.html`, `ece.html`, `ece_eleves.html`)

Les trois fichiers partagent **exactement le même contenu pédagogique** (les 5 fiches de sujets BNS 2026) et la même structure HTML/CSS. Ils sont générés depuis la même source de données (`subjects_data.py` + `generate.py`), pour éviter tout risque de désynchronisation entre versions. Seuls l'habillage et les fonctionnalités d'aide changent, selon le contexte d'usage visé.

## Tableau comparatif

| | `ece_prof.html` | `ece.html` (Entraînement) | `ece_eleves.html` |
|---|---|---|---|
| **Titre de l'onglet** | Sujets EP NSI — Version professeur | Sujets EP NSI — Entraînement | Sujets EP NSI — Version élèves |
| **Bandeau en haut de page** | 🔑 jaune : « Version professeur — corrigés disponibles » | *(aucun)* | 📋 vert : « Version élèves — les corrections ne sont pas disponibles » |
| **Bouton ▶ Éditeur** (lien vers `editeur.html?exo=…`) | ✅ | ✅ | ❌ |
| **Bouton ✓ Correction** (déplie l'explication + le code corrigé) | ✅ | ✅ | ❌ |
| **Boutons « Tout ouvrir / Tout fermer »** | ✅ | ❌ | ❌ |
| **Public visé** | Toi, en préparation de cours | Élèves en autonomie, hors surveillance | Élèves en évaluation surveillée |
| **Pourquoi cette version** | Accès total et rapide (ouverture en masse) pour construire tes séances | Les élèves peuvent s'auto-corriger en travaillant seuls, sans figer une salle en mode « examen » | Aucune tentation de triche pendant un vrai créneau noté : la correction est physiquement absente du HTML, pas juste cachée en CSS |

## Point technique important

Dans `ece_eleves.html`, les corrections et les liens vers l'éditeur ne sont **pas seulement masqués visuellement** : ils sont absents du code source généré. Un·e élève qui ouvrirait l'inspecteur du navigateur ne trouverait donc rien à révéler — contrairement à un simple `display:none` qui laisserait la réponse consultable dans le DOM.

## Où se trouve la différence dans le code

Le script `generate.py` construit une page différente selon le paramètre `mode` (`"prof"`, `"entrainement"`, `"eleves"`) :
- le bandeau et les boutons de masse sont injectés uniquement pour `mode == "prof"` ;
- le bloc `edit_and_corr` (bouton Éditeur + bouton Correction + bloc caché) n'est généré **que si `mode != "eleves"`** — d'où son absence totale du HTML élève, pas juste son masquage.

## Mise à jour future

Comme les 3 pages sont générées depuis la même source, toute correction de contenu (ajout d'un sujet, correction d'un bug dans une explication, etc.) se fait **une seule fois** dans `subjects_data.py`, puis `python3 generate.py` régénère les 3 fichiers cohérents entre eux. Pas besoin de répercuter un changement à la main dans 3 fichiers séparés.
