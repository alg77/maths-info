# URL publiques à préserver

Base de publication supposée :

`https://alg77.github.io/maths-info/SakuraMaths/`

Ce registre sert de contrat avant toute réorganisation. Si un fichier change de
place, son ancienne URL doit rester disponible ou rediriger vers sa nouvelle URL.

## Entrées principales

- `index.html`
- `accueil.html`
- `eleves.html`
- `Productions/productions.html`
- `Productions/projets.html`

## Progressions et ressources pédagogiques

- `Progressions/progressions.html`
- `Progressions/ressources.html`
- `Progressions/entrainement.html`
- `Progressions/vacances.html`
- `Progressions/progression-gantt-6e.html`
- `Progressions/progression-gantt-5e.html`
- `Progressions/progression-gantt-4e.html`
- `Progressions/progression-gantt-nsi-premiere.html`
- `Progressions/progression-gantt-nsi-terminale.html`
- `Progressions/bo-2025-6e.html`
- `Progressions/bo-2026-5e.html`
- `Progressions/bo-2027-4e.html`
- `Progressions/bo-nsi-premiere.html`
- `Progressions/bo-nsi-terminale.html`
- `Progressions/n1_mathalea.html`
- `Progressions/qcm-4eme.html`
- `Progressions/referentiel-5e.html`

## Documents téléchargeables

- `Cahiers vacances/2026-Cahier_vacances_6e-5e.pdf`
- `Cahiers vacances/2026-Cahier_vacances_5e-4e.pdf`
- `Cahiers vacances/2026-Cahier_vacances_4e-3e.pdf`
- `Progressions/memo-deploiement.pdf`

## Anciennes URL conservées par redirection

- `Progressions/progressions-avatar.html` → `Progressions/progressions.html`
- `Progressions/progressions-old.html` → `Progressions/progressions.html`
- `Progressions/vacances_v1.html` → `Progressions/vacances.html`

Les contenus historiques complets sont conservés dans `Progressions/archives/`.

## Outils et documentation conservés

- `Progressions/dashboard_cahiers_vacances.html` : tableau de bord des cahiers ;
- `Progressions/couverture-5e.html` : couverture et référentiel 5e ;
- `Progressions/memo-deploiement.html` : mémo de publication.

## Contrôle avant réorganisation

Depuis la racine du dépôt :

```powershell
python SakuraMaths/scripts/check_links.py
```

Le contrôle doit être vert avant et après chaque lot de déplacements.
