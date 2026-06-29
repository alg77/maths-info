# Générateur de livrets — v02 (charte kawaii) · Mme Le Guern

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

Garde le dossier tel quel : `build_livret.py` doit rester **à côté** des dossiers `fonts/` et `assets/`.

## 2. Lancer
```bash
python3 build_livret.py 4N1.md --pont pont-livret-4e.json --mode both --out ./out
```
→ produit `out/4N1__prof_….pdf` et `out/4N1__eleve_….pdf`.

### Options utiles
| Option | Valeurs | Défaut | Effet |
|---|---|---|---|
| `--mode` | `prof` `eleve` `both` | `both` | version(s) générée(s) |
| `--pont` | fichier JSON | — | objectifs visés + grille auto (clé = code chapitre) |
| `--exomap` | fichier JSON | — | colonne QR MathALÉA dans la grille (voir `exos-4e.exemple.json`) |
| `--police` | `opensans` `atkinson` `opendyslexic` | `opensans` | police du **corps** (accessibilité) |
| `--taille` | nombre (pt) | `11` | taille du corps |
| `--interligne` | nombre | `1.45` | interligne |
| `--couleur` | `couleur` `nb` | `couleur` | `nb` = noir & blanc (économie d'encre) |
| `--html` | — | — | exporte aussi un aperçu HTML |

Exemples :
```bash
# Élève seul, version dyslexie, plus grand
python3 build_livret.py 4N1.md --pont pont-livret-4e.json --mode eleve --police opendyslexic --taille 12 --out ./out

# Avec la colonne QR d'entraînement
python3 build_livret.py 4N1.md --pont pont-livret-4e.json --exomap exos-4e.json --out ./out
```

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
