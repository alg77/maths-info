# FORMAT_MARKDOWN v1.0

## Objectif
Définir un format Markdown unique pour tous les chapitres.

## En-tête YAML

```yaml
---
niveau: 5e
chapitre: N1
titre: Calculer avec les nombres décimaux
theme: N
couleur: bleu

objectifs:
  - 5:✖1

automatismes:
  - 5:0✖🅰4

competences:
  - Ch1

ressources:
  iparcours: {}
  mathalea: {}
  flashmd: {}
  cartesmd: {}
---
```

## Blocs

- :::objectifs
- :::automatismes
- :::memo
- :::definition
- :::propriete
- :::methode
- :::exemple
- :::astuce
- :::attention
- :::criteres
- :::ressources
- :::synthese
- :::autoevaluation

## Principes

- Les exemples sont entièrement détaillés.
- Les QR codes sont générés automatiquement.
- Les versions élève/prof/DYS proviennent du même fichier.
- Les liens vers MathALÉA, FlashMD, CartesMD et iParcours sont injectés automatiquement.
