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

**État : terminé et testé — projet Firebase `sakuramaths-44708`, connexion Google,
orientation automatique élève/professeur, menus séparés, déconnexion/changement de
compte et garde des pages professeur.**

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

# ✅ Priorité 2 — Cockpit de production

Le générateur `builders/build_dashboard.py` analyse automatiquement :

- les progressions disponibles ;
- les sources Markdown ;
- les PDF élève et professeur ;
- les pages HTML, QCM, Kahoot, flashcards, évaluations et corrigés ;
- l'avancement global, par niveau et par période.

Chaque chapitre dispose d'une fiche dépliable et d'un statut de validation, lu depuis
un éventuel fichier `metadata.json` ou déduit des ressources présentes.

**État : première version complète générée dans `Studio/out/web/dashboard-production.html`,
accessible depuis l'espace professeur avec le générateur de livrets.**
---

# ✅ Priorité 3 — Pipeline des livrets

Objectif : produire depuis les Markdown un livret de période complet, avec couverture,
sommaire paginé, versions élève/professeur et pages HTML.

**État : opérationnel pour les niveaux collège présents.**

**Ajout juillet 2026 : la 4e et la 5e disposent maintenant d'une génération dédiée
QCM / automatismes. Les builders `builders/build_4e_practice.py` et
`builders/build_5e_practice.py` produisent les données normalisées, les pages QCM et
les pages flash dans `Studio/out/qcm/<niveau>/`, puis le cockpit les détecte
automatiquement.**

## À poursuivre

- relire les chapitres 4e ;
- enrichir les contenus 5e et 6e ;
- ajouter progressivement le niveau 3e sans valeur codée en dur ;
- vérifier les sorties PDF, HTML et QCM après chaque évolution du moteur.

---

# 🎯 Priorité 4 — SakuraNSI : progressions, ECE et Pyxel

Objectif : construire le pendant NSI du pipeline SakuraMaths sans diminuer la priorité
des annales, du Bac et des ECE en Terminale.

## Terminé

- progressions interactives Première et Terminale avec Gantt conservé ;
- séances mixtes théorie, papier, pratique et bilan ;
- trois banques d'objectifs : BO, Bac/ECE et Pyxel ;
- fil rouge Pyxel en Première et réinvestissements ciblés en Terminale ;
- banque locale des 48 sujets ECE 2024 et des 23 sujets 2026 ;
- quatre vues ECE clarifiées : dashboard, entraînement, professeur et élèves ;
- liens réciproques entre cockpit SakuraMaths et dashboard ECE.

## Todo NSI — ordre recommandé

1. ✅ **Manifeste ECE unique** : 71 sujets, fichiers, thèmes, statuts, ZIP et liens de sortie.
2. ✅ **Générateur du dashboard ECE** depuis le manifeste unique.
3. ✅ **ZIP officiels** : 48 archives 2024 et 23 archives 2026.
4. ✅ **Première intégration Basthon** : 20 scripts de départ ouverts dans Basthon-Console.
5. **Relire les 8 fiches interactives 2026** et vérifier les corrections. Les sujets 2, 3 et 4 sont désormais intégrés.
6. **Compléter l'indexation thématique**, surtout pour les sujets 2024 encore marqués « À indexer ».
7. **Traiter les sujets 2026 restants**, en priorité ceux liés à la progression Terminale.
8. **Générer les vues élève/prof depuis le manifeste**, sans duplication du contenu HTML.
9. **Brancher ECE ↔ progression** : afficher les sujets conseillés dans chaque séquence.
10. **Basthon avancé** : précharger automatiquement les fichiers annexes SQLite/CSV/JSON.
11. **Sources Markdown NSI** : cours, TP, exercices, annales et notebooks par chapitre.
12. **Nuit du Code / Pyxel** : six séances Première, défis progressifs et grille d'évaluation.
13. **QCM et QuestionBank NSI** reliés aux objectifs BO et Bac/ECE.
14. **Tests d'usage** : vue élève sans corrigés, garde professeur et responsive iPad.

Documentation : `docs/SakuraNSI-ECE.md`.

---

# 🧭 Priorité 5 — Documents sur Google Drive

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

**État : structure définie — en attente des dossiers et fichiers Drive partagés par l'administratrice.**

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

# 💻 Priorité 10 — Industrialisation SakuraNSI

Généraliser la même architecture une fois la priorité 4 stabilisée.

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

