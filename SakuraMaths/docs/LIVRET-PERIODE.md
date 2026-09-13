# Livret de période

Le sélecteur HTML prépare le livret ; il ne fusionne plus les anciens PDF.

1. Ouvrir `Studio/out/web/annee__selecteur.html`.
2. Choisir le niveau et la période. La progression 4e est chargée automatiquement depuis
   `Progressions/progression-4e.json` ; le bouton permet toujours d'en choisir une autre.
3. Vérifier les chapitres cochés et leur ordre.
4. Télécharger le manifeste JSON et le placer dans `livrets/manifests/`.
5. Copier la commande affichée par le sélecteur et l'exécuter.

Le constructeur relit les fichiers Markdown et produit un PDF unique. La pagination et
le pied de page sont donc continus, sans conserver les pieds de page des chapitres.
La couverture n'a pas de pied de page. Les pages suivantes affichent seulement leur
numéro dans un petit encadrement décoratif. Les QR codes sont générés localement.

Exemple depuis le dossier `SakuraMaths` :

```powershell
python builders/build_livret_periode.py --manifest livrets/manifests/4e-P1.json --mode both --profil standard --out livrets/dist/4e/P1/livret-4e-P1-eleve-v9.pdf
```

Le même script accepte aussi `--police`, `--taille`, `--interligne`, `--couleur` et `--profil`.

Profils recommandés :

| Profil | Usage |
|---|---|
| `standard` | Open Sans 11, interligne 1.5 : version courante, équilibre lisibilité/papier |
| `dys` | A4 police 14 : impression dédiée élèves DYS/PAP |
| `prof` | version professeur compacte |
| `compact` | économie papier, à tester visuellement avant impression |

Le mode enregistré dans le manifeste est utilisé automatiquement. Avec `both`, les
versions élève et professeur sont générées ensemble. Le sommaire
est construit en deux passes afin d'afficher les pages réelles de début des chapitres.
Le manifeste est ensuite enrichi avec ces pages et les chemins des sorties. Les pages
HTML de chaque chapitre et le dashboard de production sont également actualisés.

Dépendances Python utiles : `qrcode`, `Pillow` et `pypdf`.

## Points à vérifier après génération

- La couverture ne doit pas afficher de pied de page ni de numéro de page.
- Le sommaire doit rester dans le cadre, en une seule ligne par chapitre.
- Les QR codes doivent être entièrement visibles et scannables.
- Les formules doivent être en style mathématique, surtout dans les réponses `[[...]]`.
- Le titre du PDF doit correspondre au nom du fichier, par exemple `livret-4e-P1-eleve-v9`.

## Où écrire les liens ?

- Liens vidéo et MathALÉA d'un chapitre : dans le fichier MD du chapitre.
- Objectifs, progression, périodes et ordre des chapitres : dans les JSON de progression/manifeste.
- Liens Drive publics des PDF/HTML publiés : dans le fichier de liens Drive ou le dashboard, selon l'usage.
