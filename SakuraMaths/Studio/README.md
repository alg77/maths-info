# Studio de génération

`Studio/` contient les sources et outils internes. Il ne fait pas partie des URL
publiques à préserver.

```text
Studio/
├── scripts/     générateur courant
├── config/      ponts et correspondances JSON
├── sources/     source Markdown unique par chapitre
├── assets/      polices, images et stickers du générateur
├── out/         sorties classées en pdf, web et qcm
└── archive/     anciennes versions et exports historiques
```

Commande courante, lancée depuis la racine `SakuraMaths/` :

```powershell
python Studio/scripts/build_livret.py Studio/sources/4e/4N1.md `
  --pont Studio/config/pont-livret-4e.json `
  --mode both --out Studio/out/pdf
```

Le guide détaillé se trouve dans [`../docs/GUIDE-STUDIO.md`](../docs/GUIDE-STUDIO.md).
Les fichiers d'`archive/` ne doivent pas être utilisés pour produire de nouveaux
documents.
