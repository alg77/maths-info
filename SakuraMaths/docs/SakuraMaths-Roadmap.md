# 🌸 SakuraMaths — Roadmap

> Dernière mise à jour : juillet 2026

Ce document décrit les prochaines évolutions du projet SakuraMaths et les priorités de développement.

---

# 🎯 Vision

À terme, SakuraMaths ne sera pas seulement un générateur de PDF.

Ce sera une plateforme pédagogique unique capable de produire à partir d'un même contenu Markdown :

- livrets élève
- livrets professeur
- pages HTML
- QCM interactifs
- évaluations
- flashcards
- Kahoot
- notebooks Basthon (NSI)
- sujets de bac
- annales indexées

Le Markdown devient la **source unique de vérité**.

---

# ✅ Priorité 1 — Authentification Google

Objectif : distinguer automatiquement les espaces Élève et Professeur.

## À faire

Intégrer Firebase Authentication (Google).

**État : implémenté et relié au projet Firebase `sakuramaths-44708`.**

Créer un fichier :

```
auth/profs.json
```

Exemple :

```json
[
    "prof1@ac-xxx.fr",
    "mme.leguern@gmail.com"
]
```

Fonctionnement :

- utilisateur non connecté → proposition de connexion Google
- utilisateur connecté
    - email présent dans la liste blanche → Dashboard Prof
    - sinon → Dashboard Élève

Ne pas supprimer l'ancien dossier `Progressions/`.

---

# ✅ Priorité 2 — Documents sur Google Drive

Les documents sensibles ne doivent plus être publiés sur GitHub Pages.

## À publier sur Drive

- Livret Prof
- Corrigés
- Barèmes
- Sujets A
- Sujets B
- Sujets DYS/PAP
- Documents internes

Le Dashboard ne stockera **jamais** les liens complets.

Créer :

```
curriculum/ressources/drive-prof.json
```

Exemple :

```json
{
    "4e": {
        "P1": {
            "livret_eleve_pdf": "...",
            "livret_prof_pdf": "...",
            "corrige": "...",
            "evaluation_A": "...",
            "evaluation_B": "..."
        }
    }
}
```

Chaque valeur contient uniquement l'ID Google Drive.

Le lien sera construit automatiquement :

```
https://drive.google.com/file/d/ID/view
```
---

# ✅ Priorité 6 — Nettoyage des PDF

Ajouter au `.gitignore` :

```
out/
dist/
**/*prof*.pdf
**/*corrige*.pdf
**/*bareme*.pdf
```

Ne laisser publics que les documents souhaités.

---

# 📚 Priorité 7 — Production des chapitres

Continuer la rédaction.

Priorité :

## 4e

- N1
- G1
- N2
- D1
- ...

Puis :

## 5e

Même modèle.

Objectif :

Tous les chapitres existent.

Les améliorations viendront ensuite.

---

# 🎯 Priorité 8 — QuestionBank

Créer une banque de questions unique.

Une question contient :

- niveau
- chapitre
- objectif BO
- difficulté
- type
- énoncé
- réponses
- correction
- tags

Elle servira à produire :

- QCM HTML
- Kahoot
- évaluations
- flashcards
- révisions

---

# 📝 Priorité 9 — Générateur d'évaluations

À partir de la QuestionBank :

Générer automatiquement :

- sujet A
- sujet B
- sujet DYS
- corrigé
- barème

Même fonctionnement pour les évaluations de calcul mental.

---

# 💻 Priorité 10 — SakuraNSI

Même architecture.

Sources Markdown.

Sorties :

- PDF
- HTML
- Notebook Basthon
- Annales indexées
- ECE
- QCM

---

# 👩‍🏫 Travail à faire par moi (mais Codex pourra m'aider aussi)

Pendant que Codex développe :

## Contenus

Continuer à rédiger les chapitres.

Priorité :

- 4e
- puis 5e

## Google Drive

Créer l'arborescence :

```
Drive/

SakuraMaths/
    Maths/
        4e/
            P1/
            P2/
        5e/
            P1/
```

Déposer progressivement :

- livrets
- corrigés
- évaluations

Puis récupérer uniquement les IDs.

## Couvertures

Finaliser les 4 couvertures :

- 6e
- 5e
- 4e
- 3e

Les enregistrer dans :

```
assets/covers/
```

## Vérification

Tester régulièrement :

- build_livret.py
- build_livret_periode.py
- sélecteur HTML

afin de détecter rapidement les régressions.

---

# 🌸 Philosophie du projet

Un seul contenu.

Une seule source Markdown.

Mille ressources générées automatiquement.

Le temps gagné chaque année doit être réinvesti dans la pédagogie, pas dans la mise en page.

---

# ✅ Pipeline des livrets de période — juillet 2026

Première version opérationnelle :

- progression 4e, 5e ou 6e chargée automatiquement dans le sélecteur ;
- anciens Markdown Google Docs reconnus grâce aux métadonnées de progression ;
- sommaire de manuel avec titres, pointillés et véritables numéros de page ;
- livrets élève et professeur générés ensemble avec `--mode both` ;
- manifeste enrichi avec sorties PDF, pages HTML, compétences et pagination ;
- page HTML élève et professeur générée pour chaque chapitre du livret ;
- mini-dashboard local produit dans `Studio/out/web/dashboard-production.html`.

À poursuivre : enrichir progressivement les Markdown 5e/6e au format SakuraMaths afin
d'obtenir la même qualité éditoriale que les chapitres pilotes de 4e.
