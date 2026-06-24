# Architecture du générateur

## Principe

Le contenu pédagogique doit rester indépendant de sa présentation et du
support produit :

```text
source Markdown
    -> chargement des inclusions
    -> validation
    -> blocs structurés
    -> transformation professeur ou élève
    -> HTML
    -> HTML web ou PDF A4
    -> imposition A3 éventuelle
```

Une réponse n'est donc jamais copiée dans deux fichiers. La syntaxe
`[[réponse]]` est interprétée au moment du rendu.

## Modules actuels

### `livret.inline`

Ce module transforme le contenu situé à l'intérieur d'un paragraphe :

- réponses et blancs ;
- emphase simple ;
- formules mathématiques ;
- QR codes.

Il ne connaît ni les pages PDF ni les couvertures.

### `livret.source`

Ce module :

- développe les directives `@include` ;
- empêche les inclusions circulaires ;
- valide les en-têtes et composants ;
- transforme le texte en blocs simples.

Les erreurs contiennent le nom du fichier et, lorsque c'est possible, le
numéro de ligne concerné.

### `build_livret.py`

Ce fichier reste temporairement le point d'entrée compatible avec les
commandes historiques. Il contient encore :

- le rendu des composants ;
- les couvertures ;
- les feuilles de style ;
- le sélecteur interactif ;
- la commande de génération.

Ces responsabilités seront extraites progressivement, sans changement brutal
du format des chapitres.

### `assemble.py`

Fusionne des PDF A4 et produit les faces A3 dans l'ordre d'un cahier piqué.

## Règles de dépendance

- le cœur `livret/` ne doit pas importer WeasyPrint ;
- la validation doit pouvoir fonctionner sans générer de PDF ;
- les chemins doivent être calculés à partir du projet ou fournis en option ;
- les fichiers générés vont dans `dist/` ;
- chaque extraction de module doit conserver les tests et les commandes
  historiques.

## Étapes suivantes

1. Extraire le registre et le rendu des composants.
2. Sortir le CSS et les modèles HTML des chaînes Python.
3. Centraliser la charte graphique dans des variables CSS.
4. Migrer progressivement `sources/*.txt` vers des chapitres `.md`.
5. Ajouter des tests visuels de référence pour les PDF.

