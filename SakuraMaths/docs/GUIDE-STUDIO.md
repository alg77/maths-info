# Générateur de livrets — v9 (charte kawaii) · Mme Le Guern

Génère un chapitre **prof** + **élève** (PDF) à partir d'un seul fichier Markdown,
à ta charte (en-tête à badge, sections à pastille, encadrés label-pilule,
exemples en cartes *un calcul par ligne*, critères au crayon, pied à pastille).
Les blocs **« Objectifs visés »** et **« Je suis capable de… »** sont remplis
automatiquement depuis le `pont-livret`.

## 1. Installation (une fois)
```bash
pip install weasyprint qrcode pillow
```
> WeasyPrint a besoin des libs système Pango/Cairo (déjà présentes sur la plupart des Linux/Mac ;
> sous Windows, voir la doc WeasyPrint). `fonttools` est optionnel.

Le générateur se trouve dans `Studio/scripts/`. Ses polices, images et stickers sont
chargés automatiquement depuis `Studio/assets/`.

## 2. Lancer
```bash
python Studio/scripts/build_livret.py Studio/sources/5e/5N1.md

Le niveau est déduit du dossier `Studio/sources/<niveau>/`. Le build recherche ensuite automatiquement, par convention :

- `Progressions/progression-<niveau>.json` ;
- `Progressions/pont-livret-<niveau>.json` ;
- `assets/covers/cover-<niveau>.png` ;
- la palette calculée pour `<niveau>`.

Ajouter un niveau ne demande donc aucune modification du code : il suffit d'ajouter le dossier de sources et ces ressources portant le même suffixe.
```
→ produit les PDF professeur et élève dans `Studio/out/pdf/`.

### Options utiles
| Option | Valeurs | Défaut | Effet |
|---|---|---|---|
| `--mode` | `prof` `eleve` `both` | `both` | version(s) générée(s) |
| `--pont` | fichier JSON | — | objectifs visés + grille auto (clé = code chapitre) |
| `--exomap` | fichier JSON | — | colonne QR MathALÉA dans la grille (voir `Studio/config/exos-4e.exemple.json`) |
| `--police` | `opensans` `atkinson` `opendyslexic` | `atkinson` | police du **corps** (accessibilité) |
| `--taille` | nombre (pt) | `11` | taille du corps |
| `--interligne` | nombre | `1.45` | interligne |
| `--couleur` | `couleur` `nb` | `couleur` | `nb` = noir & blanc (économie d'encre) |
| `--html` | — | — | exporte aussi un aperçu HTML |
| `--chapitres` | codes séparés par des virgules | — | génère plusieurs chapitres en une commande |
| `--niveau` | un niveau quelconque | déduit de la source | remplacement manuel exceptionnel |
| `--builder` | — | — | crée le sélecteur HTML pour composer un livret |
| `--progression` | fichier JSON | progression du niveau | données servant à proposer les périodes et les chapitres |

Exemples :
```bash
# Élève seul, version dyslexie, plus grand
python Studio/scripts/build_livret.py Studio/sources/4e/4N1.md --pont Studio/config/pont-livret-4e.json --mode eleve --police opendyslexic --taille 12 --out Studio/out/pdf

# Avec la colonne QR d'entraînement
python Studio/scripts/build_livret.py Studio/sources/4e/4N1.md --pont Studio/config/pont-livret-4e.json --exomap Studio/config/exos-4e.exemple.json --out Studio/out/pdf

# Trois chapitres séparés, professeur et élève
python Studio/scripts/build_livret.py --chapitres 4N1,4G1,4N2 --niveau 4e --pont Studio/config/pont-livret-4e.json --mode both --out Studio/out/pdf

# Sélecteur de livret par période
python Studio/scripts/build_livret.py --chapitres 4N1,4G1,4N2 --niveau 4e --builder --pont Studio/config/pont-livret-4e.json --progression Studio/config/progression-4e.json --out Studio/out/web
```

Dans le sélecteur HTML, on choisit simplement la période (`Période 1`,
`Période 2`…), la version professeur ou élève, puis les chapitres et leur ordre.
Il faut ensuite sélectionner **un PDF déjà généré par chapitre** dans la zone
prévue. Le sélecteur crée la couverture et son sommaire, puis concatène les PDF
dans l'ordre choisi. Il peut aussi produire la couverture PDF seule.

## 3. Écrire un chapitre (gabarit = `4N1.md`)
**En-tête** (obligatoire, 1re ligne) :
```
# CODE | Titre | niveau | comps
```
- `CODE` : ex. `N1`, `G2`… La 1re lettre donne le **domaine/couleur** (N, G, D, M, A, C).
  Ce code doit **correspondre** au code de séquence du `pont-livret` pour l'auto-remplissage.
- `comps` : codes compétences séparés par des virgules (ex. `Ca3, Co1`).

**Sections** : `## I. Titre` (la pastille romaine est gérée toute seule).

**Encadrés** : `:::type | Titre` … `:::`
| type | rendu |
|---|---|
| `prop` / `def` / `meth` / `rem` | Propriété / Définition / Méthode / Remarque |
| `rappel` | « Je me souviens » (révisions) |
| `reussite` | Critères de réussite (crayon) |
| `retenu` | « J'ai retenu » (à compléter de mémoire) |
| `exemple` | cartes d'exemples (voir ci-dessous) |
| `ressources` | « Pour aller plus loin » + QR |

**Trous** (version élève) : `[[réponse]]` → la réponse apparaît en **rose** chez le prof,
en **pointillés** chez l'élève. *Ne pas faire chevaucher du gras `**…**` sur un trou*
(mettre le mot-clé soit en gras, soit dans le trou, pas les deux à cheval).

**Exemples = modèle de rédaction** : dans un bloc `:::exemple`, **un calcul par ligne**,
**pas de flèche**. Une ligne vide sépare deux calculs. L'identifiant (A, B…) passe en italique,
le résultat de la dernière ligne en rose.
```
:::exemple | Exemples
A = (+ 7,2) + (+ 8,3)
A = [[+ (7,2 + 8,3)]]
A = [[+ 15,5]]

B = (− 8) + (− 5)
B = [[− (8 + 5)]]
B = [[− 13]]
:::
```

**Maths** : `$ … $` (ex. `$a − (− b) = a + b$`). Vrai signe moins « − » (U+2212).
**QR inline** : `[qr:https://…]`.

## 4. Domaines & couleurs (1re lettre du code)
N = bleu · G = corail · D = vert d'eau · M = jaune · A = violet · C = pêche.

---
Besoin d'un autre format de sortie plus tard (QCM, flashcards, page calcul mental de période) :
c'est prévu dans la feuille de route — le `pont-livret` sert déjà de source unique.

## 5. QCM et automatismes collège

Les ressources d'entraînement sont générées niveau par niveau, puis détectées automatiquement
par le dashboard.

```bash
python builders/build_4e_practice.py
python builders/build_5e_practice.py
python builders/build_dashboard.py
```

Pour chaque niveau, la commande synchronise la progression et le pont livret vers
`Studio/config/`, puis produit :

- `Studio/out/qcm/4e/qcm-4e.html` et `Studio/out/qcm/5e/qcm-5e.html` ;
- `Studio/out/qcm/4e/automatismes-flash-4e.html` et `Studio/out/qcm/5e/automatismes-flash-5e.html` ;
- `Studio/out/qcm/<niveau>/practice-<niveau>-data.js` ;
- `Studio/out/qcm/<niveau>/automatismes-<niveau>-generators.js`.

Le dashboard détecte ensuite automatiquement les chapitres couverts par les générateurs
d'automatismes et rend les cellules QCM / Flash cliquables.
