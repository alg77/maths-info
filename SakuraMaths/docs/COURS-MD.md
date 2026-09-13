# Écrire un cours SakuraMaths en Markdown

Ce mémo décrit les codes à connaître pour écrire un chapitre dans `Studio/sources/<niveau>/`.

## 1. Nom du fichier et en-tête

Convention de fichier :

```text
Studio/sources/4e/4N1.md
Studio/sources/5e/5G2.md
```

Première ligne obligatoire :

```md
# N1 | Nombres relatifs : addition et soustraction | 4ᵉ | Ch1, Ca1, Co2
```

- `N1`, `G2`, `D1`, etc. : code du chapitre sans le préfixe du niveau.
- Le niveau peut s'écrire `4e` ou `4ᵉ`.
- Les compétences sont séparées par des virgules.

Domaines utilisés :

| Code | Domaine |
|---|---|
| `N` | Nombres et calculs |
| `G` | Géométrie et espace |
| `D` | Données et proportionnalité |
| `M` | Grandeurs et mesures |
| `A` | Algorithmique |
| `C` | Calcul mental / automatismes |

## 2. Sections

Utiliser simplement des titres de niveau 2 :

```md
## Additionner deux nombres relatifs
## Démontrer avec la droite des milieux
```

Le générateur ajoute automatiquement les pastilles numérotées.

## 3. Formules mathématiques

Toujours encadrer les expressions mathématiques avec `$...$`.

```md
Le produit de $a$ par $b$ se note $a \times b$.
```

Pour une formule seule et centrée :

```md
$V = A_{\text{base}} \times h$
```

Commandes LaTeX utiles :

| Code MD | Rendu attendu |
|---|---|
| `\times` | multiplication |
| `\div` | division |
| `\dfrac{a}{b}` | fraction |
| `x^2` | exposant |
| `A_{\text{base}}` | indice avec texte |
| `\pi` | pi |
| `\parallel` | parallèle |
| `\perp` | perpendiculaire |
| `\approx` | environ |

## 4. Trous à compléter

Version professeur : la réponse apparaît en rose.

Version élève : la réponse devient une ligne pointillée.

```md
$(-7) + 12 =$ [[$5$]]
```

Important pour les réponses mathématiques : mettre la réponse elle-même en LaTeX.

```md
$A = 5x + 3x =$ [[$8x$]]
```

L'ancien format suivant est maintenant aussi récupéré par le générateur, mais il vaut mieux l'éviter dans les nouveaux fichiers :

```md
$A = 5x + 3x = [[8x]]$
```

## 5. Encadrés SakuraMaths

Syntaxe générale :

```md
:::type | Titre facultatif
Contenu
:::
```

Types disponibles :

| Type | Usage |
|---|---|
| `def` | définition |
| `prop` ou `propriete` | propriété |
| `methode` | méthode |
| `formule` | formule importante |
| `rem` | remarque |
| `rappel` | “Je me souviens” |
| `retenu` | “J'ai retenu” |
| `reussite` | critères de réussite |
| `exemple` | exemples ou calculs guidés |
| `video` | un ou plusieurs liens vidéo en QR code |
| `videos` | grille compacte de vidéos avec titres |
| `mathalea` | liens MathALÉA |
| `colonnes` ou `cols` | liste sur deux colonnes |
| `raw` | HTML/SVG conservé tel quel |

Utiliser `:::` et non `::::`.

## 6. Exemples et calculs

Pour des calculs guidés, garder une ligne par étape :

```md
:::exemple | Exemples
A = 25 + 6 - 7 - 12
A = [[12]]

B = 10 \times 6 \div 3 \times 5 \div 4
B = [[25]]
:::
```

Deux groupes séparés par une ligne vide apparaissent en blocs distincts.

## 7. Deux colonnes

Pour économiser de la place sur des listes d'expressions :

```md
:::colonnes | Simplifier
- $5x = 5 \times x$
- $7a + 3a = 10a$
- $4x - 2x = 2x$
- $3 \times a = 3a$
:::
```

## 8. Critères de réussite

Ne pas mettre de tiret : le générateur ajoute les cases à cocher.

```md
:::reussite | Critères de réussite
J'identifie les données utiles.
Je choisis la bonne propriété.
Je rédige une conclusion avec les unités.
:::
```

## 9. QR codes, vidéos et MathALÉA

Vidéo simple :

```md
:::video | Additionner deux nombres relatifs
https://youtu.be/...
:::
```

Plusieurs vidéos sans commentaire : le générateur crée une grille compacte.

```md
:::video
https://youtu.be/...
https://youtu.be/...
https://youtu.be/...
:::
```

Plusieurs vidéos avec titres précis :

```md
:::videos | Playlist de rappel
- Niveau 1 | Points symétriques | https://...
- Niveau 2 | Figure sur quadrillage | https://...
:::
```

Liens MathALÉA :

```md
:::mathalea | Je m'entraîne
- Additionner des relatifs | https://coopmaths.fr/alea/?uuid=...
- Calculer avec des fractions | https://coopmaths.fr/alea/?uuid=...
:::
```

Les liens MathALÉA peuvent rester dans le MD du chapitre. Le JSON sert plutôt à relier progression, objectifs, livrets et suivi global.

## 10. Figures géométriques

Trois solutions possibles :

1. SVG directement dans le MD, idéal pour une figure simple et nette.
2. Image exportée en PNG/SVG puis insérée avec `![description](chemin/image.png)`.
3. Figure reconstruite par le générateur si elle fait partie des figures prévues.

Pour garder fidèlement un tracé Google Docs ou GeoGebra, le plus sûr est d'exporter la figure en image, puis de l'insérer dans le MD.

## 11. Générer un chapitre seul

Depuis le dossier `SakuraMaths` :

```powershell
python Studio/scripts/build_livret.py Studio/sources/4e/4N2.md --mode both --profil standard --out Studio/out/pdf/4e
```

Profils utiles :

| Profil | Usage |
|---|---|
| `standard` | Open Sans 11, interligne 1.5 |
| `prof` | version professeur compacte |
| `dys` | A4 police 14 |
| `compact` | économie de papier |

