# 🌸 SakuraMaths — Refonte du Dashboard Production

## Objectif

Le dashboard actuel est trop succinct.

Je souhaite qu'il devienne le **centre de pilotage de SakuraMaths**, me permettant de suivre en un coup d'œil l'avancement de toute la production pédagogique.

L'objectif n'est plus simplement de savoir quels PDF existent, mais de visualiser :

- les chapitres rédigés ;
- les ressources générées ;
- les éléments restant à produire ;
- la progression globale du projet.

Le dashboard devra fonctionner automatiquement à partir de l'arborescence du projet.

---

# Principes

Le dashboard ne doit **rien contenir en dur**.

Toutes les informations doivent être déduites des fichiers présents dans SakuraMaths.

Le script `build_dashboard.py` devra analyser automatiquement les dossiers et produire la page HTML.

---

# Structure générale

Le dashboard comportera :

- un résumé global
- une carte par niveau
- la liste détaillée des chapitres
- les ressources générées pour chaque chapitre

---

# Résumé global

En haut de la page :

```
🌸 SakuraMaths

Production des ressources

Maths
4e              7 / 18 chapitres
5e              1 / 16 chapitres

NSI Première    0 / 12 chapitres
NSI Terminale   0 / 14 chapitres

Total

54 chapitres
8 terminés
15 %
```

Ajouter une barre de progression globale.

---

# Une carte par niveau

Exemple :

```
🦊 4e

Progression

██████░░░░ 38 %

P1 ✔
P2 ✔
P3 ○
P4 ○
P5 ○
```

Même principe pour :

- 6e
- 5e
- 4e
- 3e
- NSI Première
- NSI Terminale

---

# Liste des chapitres

Sous chaque niveau, afficher tous les chapitres.

Exemple :

| Chapitre | Titre |
|----------|-------|
| N1 | Nombres relatifs : addition et soustraction |
| G1 | Triangles : droite des milieux |
| D1 | Proportionnalité |
| N2 | Multiplication et division |

Cette liste est récupérée automatiquement depuis :

```
progression-4e.json
progression-5e.json
...
```

ou depuis les futurs référentiels.

---

# Ressources par chapitre

Pour chaque chapitre, afficher un tableau.

Exemple :

| Chapitre | MD | PDF Élève | PDF Prof | HTML | QCM | Kahoot | Flashcards | Évaluation | Corrigé |
|----------|:--:|:---------:|:--------:|:----:|:---:|:-------:|:----------:|:-----------:|:--------:|
| N1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ⏳ | ❌ |
| G1 | ✅ | ✅ | ✅ | ✅ | ⏳ | ❌ | ❌ | ❌ | ❌ |

L'état est déduit automatiquement de l'existence des fichiers.

Ne rien coder en dur.

---

# Statut de validation

Chaque chapitre possède également un statut.

Exemple :

🟢 Vérifié

🟡 À relire

🔴 Brouillon

Ce statut pourra être stocké dans un petit fichier metadata.json propre au chapitre.

Exemple :

```
metadata.json

{
    "status": "verified"
}
```

---

# Progression par période

Afficher également :

```
P1

██████████ 100 %

P2

█████░░░░░ 50 %

...
```

---

# Vue NSI

Ajouter exactement le même système.

## Première NSI

Par exemple :

- Python
- Types
- Booléens
- Fonctions
- Boucles
- Listes
- Dictionnaires
- POO
- Graphes
- SQL
- ...

## Terminale NSI

Par exemple :

- Récursivité
- Piles
- Files
- Arbres
- ABR
- Graphes
- SQL
- POO
- Calculabilité
- Sécurisation
- ...

Même tableau que pour les maths.

---

# Tableau détaillé NSI

Ajouter une colonne spécifique.

| Chapitre | MD | PDF | HTML | Notebook | Basthon | QCM | Kahoot | Sujet Bac |
|----------|:--:|:---:|:----:|:---------:|:--------:|:---:|:-------:|:----------:|

---

# Cliquer sur un chapitre

Au clic sur un chapitre, développer une fiche.

Exemple :

```
N1

✔ Markdown

✔ PDF élève

✔ PDF professeur

✔ HTML

✔ QR codes

✔ MathALÉA

✔ QCM

✔ Kahoot

✔ Flashcards

○ Évaluation

○ Corrigé

○ Notebook
```

---

# Interface

Respecter la direction artistique actuelle :

- couleurs pastel
- coins arrondis
- cartes
- style SakuraMaths
- icônes discrètes
- responsive

Conserver l'esprit actuel mais aller beaucoup plus loin.

---

# Génération automatique

Le dashboard doit être entièrement généré automatiquement.

Le script analyse l'arborescence :

```
curriculum/

4e/

N1/

G1/

D1/

...

5e/

...

nsi-premiere/

...

nsi-terminale/

...
```

Il détecte les fichiers présents.

Aucun chapitre ne doit être codé en dur.

---

# Objectif final

Le dashboard doit devenir le véritable cockpit de SakuraMaths.

En ouvrant une seule page, je dois immédiatement savoir :

- où j'en suis dans chaque niveau ;
- quels chapitres sont terminés ;
- quelles ressources existent ;
- ce qu'il reste à produire.

Il doit permettre de piloter la production des ressources sur plusieurs années sans avoir à parcourir manuellement les dossiers du projet.