# Générateur de livrets de cours

Ce projet génère plusieurs supports à partir d'un même contenu pédagogique :

- une version professeur avec les réponses ;
- une version élève à trous ;
- une version HTML ;
- un PDF A4 avec WeasyPrint ;
- un cahier piqué imposé sur des feuilles A3.

Le moteur actuel est conservé afin de ne pas interrompre la production des
livrets. Sa réorganisation en modules sera réalisée progressivement, sous la
protection des tests présents dans `tests/`.

## Prérequis

- Python 3.9 ou plus récent ;
- les bibliothèques système requises par WeasyPrint ;
- les polices du dossier `fonts/`.

## Installation

Depuis le dossier du projet :

```console
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -e ".[dev]"
```

Sous Linux ou macOS, la commande d'activation de l'environnement devient
`source .venv/bin/activate`.

## Générer un livret

```console
python build_livret.py sources/P2-4e.txt --mode both --html
```

Les fichiers sont écrits par défaut dans `dist/`. Ce dossier est ignoré par
Git, car son contenu peut être recréé.

Options principales :

- `--mode prof`, `--mode eleve` ou `--mode both` ;
- `--police atkinson` ou `--police opendyslexic` ;
- `--taille 12` et `--interligne 1.5` ;
- `--couleur couleur` ou `--couleur nb` ;
- `--builder` pour créer le sélecteur interactif ;
- `--validate` pour vérifier les chapitres sans produire de document ;
- `--out chemin` pour choisir un autre dossier de sortie.

Avant une génération complète, il est possible de contrôler rapidement une
période ou toute l'année :

```console
python build_livret.py sources/annee-4e.txt --validate
```

Les erreurs signalent le fichier et la ligne concernés, notamment pour un
composant inconnu, un bloc non fermé, une inclusion manquante ou une boucle
d'inclusions.

## Syntaxe actuelle des chapitres

```markdown
# N1 | Addition et soustraction de nombres relatifs | 4e | Ca3, Co1

## I. Addition

:::prop | Propriété
La somme vaut [[15]].
:::
```

- `[[réponse]]` affiche la réponse dans la version professeur et un blanc dans
  la version élève ;
- `@include N1.txt` compose plusieurs chapitres sans copier leur contenu ;
- les composants existants sont `def`, `regle`, `prop`, `methode`, `rappel`,
  `retenu`, `reussite` et `ressources` ;
- `[qr:https://exemple.fr]` génère un QR code ;
- les expressions entre `$...$` utilisent le convertisseur mathématique.

Les fichiers de `sources/` constituent actuellement le format compris par le
moteur. Les exports historiques placés dans `md/` seront migrés ensuite vers
une source Markdown unique et validée.

## Assembler et imposer en A3

```console
python assemble.py livret.pdf activite.pdf -o dist/complet.pdf
python assemble.py dist/complet.pdf --cahier -o dist/complet_cahier_A3.pdf
```

Le cahier A3 doit être imprimé en recto-verso, retournement sur le bord court,
puis plié et agrafé au centre.

## Tests

Les tests rapides ne nécessitent pas de produire un PDF :

```console
python -m unittest discover -s tests -v
```

Après installation des dépendances de développement :

```console
pytest
```

Ils vérifient notamment les blancs professeur/élève, les composants, les
inclusions et l'ordre d'imposition A3.

## Organisation actuelle

- `livret/` : cœur indépendant du PDF, syntaxe et validation ;
- `build_livret.py` : lecture des sources et rendus professeur/élève ;
- `assemble.py` : fusion et imposition A3 ;
- `build_apps.py` : génération du QCM et du tableau de bord ;
- `sources/` : chapitres déjà convertis ;
- `md/` : exports Markdown historiques à migrer ;
- `assets/` et `fonts/` : ressources graphiques ;
- `tests/` : filet de sécurité avant refonte ;
- `dist/` : livrables générés, non versionnés.

Le détail fonctionnel historique reste disponible dans `GUIDE.md`.
Les choix de découpage et la trajectoire de refonte sont décrits dans
`docs/ARCHITECTURE.md`.
