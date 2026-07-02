# Liens Google Drive à fournir à SakuraMaths

Ce document sert de modèle pour transmettre les ressources stockées sur Google Drive.

Le squelette complet prêt à remplir se trouve dans :

```text
curriculum/ressources/drive-prof.json
```

Chaque ressource possède un champ `fichier` déjà renseigné et un champ `drive` vide.
Il suffit de coller le lien Google Drive complet dans `drive`.

Le squelette peut être régénéré après une modification des progressions avec :

```text
python builders/build_drive_links_template.py
```

## Organisation recommandée

```text
SakuraMaths/
└── Maths/
    ├── 6e/
    │   ├── P1/
    │   ├── P2/
    │   ├── P3/
    │   ├── P4/
    │   └── P5/
    ├── 5e/
    ├── 4e/
    └── 3e/
```

Dans chaque période, les fichiers peuvent être rangés par chapitre.

## Ressources attendues

- livret élève PDF, si celui-ci doit être hébergé sur Drive ;
- livret professeur PDF ;
- évaluation A ;
- évaluation B ;
- version DYS/PAP ;
- corrigé ;
- barème ;
- document interne éventuel.

Il n'est pas nécessaire que toutes les ressources existent dès maintenant. Les liens peuvent être ajoutés progressivement.

## Format à envoyer à Codex

Copier-coller une ligne par document :

```text
NIVEAU | PÉRIODE | CHAPITRE | TYPE | LIEN_GOOGLE_DRIVE
```

Exemples :

```text
4e | P1 | LIVRET | livret_eleve_pdf | https://drive.google.com/file/d/ID/view
4e | P1 | LIVRET | livret_prof_pdf | https://drive.google.com/file/d/ID/view
4e | P1 | N1 | evaluation_A | https://drive.google.com/file/d/ID/view
4e | P1 | N1 | evaluation_B | https://drive.google.com/file/d/ID/view
4e | P1 | N1 | evaluation_DYS_PAP | https://drive.google.com/file/d/ID/view
4e | P1 | N1 | corrige | https://drive.google.com/file/d/ID/view
4e | P1 | N1 | bareme | https://drive.google.com/file/d/ID/view
```

Un lien de dossier peut également être fourni pour faciliter l'inventaire :

```text
4e | P1 | DOSSIER | https://drive.google.com/drive/folders/ID
```

Les liens individuels restent nécessaires pour créer des boutons ouvrant directement chaque document.

## Droits de partage

### Documents élèves

Utiliser si possible :

```text
Toute personne disposant du lien — Lecteur
```

### Documents professeur

Utiliser :

```text
Accès restreint
```

Ajouter explicitement les adresses Google des professeurs autorisés. Le compte connecté à SakuraMaths devra être l'un de ces comptes.

Ne pas donner le droit **Éditeur** si la consultation suffit.

## Ce que SakuraMaths enregistrera

Le projet ne conservera que l'identifiant Drive extrait du lien, par exemple :

```json
{
  "4e": {
    "P1": {
      "livret_prof_pdf": "IDENTIFIANT_DRIVE",
      "chapitres": {
        "N1": {
          "evaluation_A": "IDENTIFIANT_DRIVE",
          "corrige": "IDENTIFIANT_DRIVE"
        }
      }
    }
  }
}
```

Le lien de consultation sera reconstruit automatiquement par SakuraMaths.

## Première livraison conseillée

Pour commencer, transmettre uniquement les documents déjà disponibles pour la 4e, période 1 :

```text
4e | P1 | LIVRET | livret_eleve_pdf | À_COMPLÉTER
4e | P1 | LIVRET | livret_prof_pdf | À_COMPLÉTER
4e | P1 | N1 | evaluation_A | À_COMPLÉTER
4e | P1 | N1 | evaluation_B | À_COMPLÉTER
4e | P1 | N1 | evaluation_DYS_PAP | À_COMPLÉTER
4e | P1 | N1 | corrige | À_COMPLÉTER
4e | P1 | N1 | bareme | À_COMPLÉTER
```
