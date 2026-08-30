# Check rentrée - livrets de période 2026-2027

Dernier contrôle effectué : 27 août 2026.

## Principe validé

Le livret de période est généré depuis les fichiers Markdown, et non par fusion de PDF de chapitres déjà paginés.

Cela permet de conserver :

- une pagination globale continue ;
- un seul pied de page de livret ;
- aucun pied de page global sur la couverture ;
- un sommaire avec les vraies pages de début des chapitres ;
- les versions élève et professeur générées ensemble avec `--mode both`.

## Commande type

Depuis le dossier `SakuraMaths` :

```powershell
python builders/build_livret_periode.py --manifest livrets/manifests/4e-P1.json --mode both --out livrets/dist/4e/P1/livret-4e-P1-eleve-v8.pdf
```

Si `--mode both` est utilisé, le nom `-eleve-` sert de modèle et le PDF professeur est généré automatiquement avec `-prof-`.

## Livrets contrôlés

| Livret | Élève | Prof | Pages | État |
|---|---:|---:|---:|---|
| 4e P1 | v8 | v8 | 22 | OK |
| 4e P2 | v3 | v3 | 12 | OK |
| 5e P1 | v7 | v7 | 17 | OK |

## Corrections faites pendant le check

- `livrets/manifests/4e-P2.json` est passé en schéma v2, `mode: both`, couverture actuelle `Studio/assets/images/4e-cover.png`.
- `livrets/manifests/5e-P1.json` utilise maintenant `Studio/assets/images/5e-cover.png`.
- Le titre 5e N1 est aligné entre la progression, le manifeste et le Markdown : `Priorités opératoires et distributivité`.

## Points visuellement vérifiés

- couvertures 4e P1, 4e P2 et 5e P1 ;
- sommaires dans les cadres ;
- absence de pied de page global sur les couvertures ;
- pied de page global sur les pages intérieures ;
- numéro de page décoratif sans le mot `Page` ;
- QR codes visibles, notamment les 3 QR codes de la page 21 du livret 4e P1 professeur.

## À surveiller avant impression réelle

- Vérifier rapidement les dernières pages de chaque livret après toute modification de Markdown.
- Ne pas ouvrir le PDF cible pendant la génération, sinon Windows peut bloquer l'écriture.
- Pour un nouveau livret, préférer un nom versionné : `livret-4e-P1-eleve-v9.pdf`, etc.
