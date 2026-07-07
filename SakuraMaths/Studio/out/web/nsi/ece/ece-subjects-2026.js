(function () {
  const raw = 'https://raw.githubusercontent.com/alg77/maths-info/main/SakuraMaths/Studio/out/web/nsi/ece/starters/';
  const basthon = file => `https://console.basthon.fr/?from=${encodeURIComponent(raw + file)}`;
  const subjects = [
    {
      n: 2,
      title: "Analyse d’écarts de salaires en entreprise",
      theme: "Dictionnaires · Listes · kNN · Tests/débogage",
      intro: "Une entreprise analyse les salaires de ses employés et utilise les trois plus proches voisins pour proposer un premier salaire. Le programme doit calculer des moyennes, mesurer l’écart femmes-hommes et repérer un biais dans la distance utilisée.",
      code: `def salaire_moyen_condition(employes, champ, valeur):\n    pass\n\ndef effectif_par_sexe(employes):\n    pass\n\ndef calcul_ecart_sexe(employes):\n    moy_h = salaire_moyen_condition(employes, 'sexe', 'M')\n    moy_f = salaire_moyen_condition('employes', 'sexe', 'F')\n    return moy_h - moy_f`,
      tags: ['Dictionnaires', 'Listes', 'kNN', 'Tests/débogage'],
      qs: [
        ["F1.py", "Écrire", "Programmer salaire_moyen_condition : renvoyer la moyenne des salaires correspondant à un champ et une valeur, ou None si aucun employé ne convient.", "Filtrer les dictionnaires avant de calculer la moyenne.", `def salaire_moyen_condition(employes, champ, valeur):\n    salaires = [e['salaire'] for e in employes if e[champ] == valeur]\n    return None if len(salaires) == 0 else sum(salaires) / len(salaires)`],
        ["F2.py", "Écrire", "Programmer effectif_par_sexe afin d’obtenir un dictionnaire de la forme {'F': ..., 'M': ...}.", "Initialiser les deux clés, même si un effectif est nul.", `def effectif_par_sexe(employes):\n    effectifs = {'F': 0, 'M': 0}\n    for employe in employes:\n        effectifs[employe['sexe']] += 1\n    return effectifs`],
        ["F3.py", "Corriger", "Corriger calcul_ecart_sexe pour renvoyer l’écart de salaire des femmes par rapport aux hommes, en pourcentage. Gérer l’absence d’un des deux groupes.", "Attention à l’argument passé à la fonction et au calcul du pourcentage.", `def calcul_ecart_sexe(employes):\n    moy_h = salaire_moyen_condition(employes, 'sexe', 'M')\n    moy_f = salaire_moyen_condition(employes, 'sexe', 'F')\n    if moy_h is None or moy_f is None or moy_h == 0:\n        return None\n    return 100 * (moy_h - moy_f) / moy_h`],
        ["F4.py", "Expliquer", "Comparer les propositions faites à deux personnes de même expérience et de mêmes études, mais de sexes différents. Identifier la source du biais et proposer une correction.", "Le sexe ne doit pas intervenir dans la distance entre candidats.", `def distance(e1, e2):\n    return sqrt((e1['experience'] - e2['experience'])**2\n                + (e1['etudes'] - e2['etudes'])**2)\n\n# Le sexe est retiré de la distance : deux profils identiques\n# reçoivent alors la même proposition.`]
      ]
    },
    {
      n: 3,
      title: "Cycle et dates — calendrier iCalendar",
      theme: "Dates · Conditions · Tests · Chaînes de caractères",
      intro: "Le programme manipule des dates sans utiliser datetime : année bissextile, phase d’un cycle de 28 jours, ajout de jours et export des prochaines dates au format iCalendar.",
      code: `def jours_dans_mois(annee, mois):\n    if mois == 2:\n        return 29 if calendar.isleap(annee) else 28\n    elif mois in [1, 3, 5, 7, 8, 10, 12]:\n        return 31\n    return 30\n\ndef ajouter_jours(date, nb_jours):\n    ...`,
      tags: ['Dates', 'Conditions', 'Tests', 'Chaînes de caractères'],
      qs: [
        ["G1.py", "Écrire", "Programmer est_bissextile selon la règle du calendrier grégorien.", "Une année divisible par 100 n’est bissextile que si elle est divisible par 400.", `def est_bissextile(annee):\n    return annee % 400 == 0 or (annee % 4 == 0 and annee % 100 != 0)`],
        ["G2.py", "Écrire", "Programmer determiner_phase(jour) pour un jour compris entre 1 et 28 : phases 1 (1–5), 2 (6–13), 3 (14), 4 (15–28).", "Utiliser une assertion pour contrôler le domaine.", `def determiner_phase(jour):\n    assert 1 <= jour <= 28\n    if jour <= 5:\n        return 1\n    if jour <= 13:\n        return 2\n    if jour == 14:\n        return 3\n    return 4`],
        ["G3.py", "Tester", "Ajouter au moins trois tests pertinents à ajouter_jours et justifier les cas choisis.", "Tester un changement de mois, d’année et le 29 février.", `assert ajouter_jours((30, 4, 2026), 1) == (1, 5, 2026)\nassert ajouter_jours((31, 12, 2025), 1) == (1, 1, 2026)\nassert ajouter_jours((28, 2, 2024), 1) == (29, 2, 2024)\nassert ajouter_jours((28, 2, 2025), 1) == (1, 3, 2025)`],
        ["G4.py", "Corriger", "Corriger calendrier_cycles pour produire un calendrier iCalendar valide contenant toutes les dates jusqu’à 100 jours après la date initiale, date incluse.", "Compléter PRODID, formater AAAAMMJJ sur 8 chiffres et ne pas oublier le jour 84.", `cal_lignes = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SakuraNSI//ECE//FR']\njours_ecoules = 0\nwhile jours_ecoules <= 100:\n    jour, mois, annee = date_courante\n    date = f'{annee:04d}{mois:02d}{jour:02d}'\n    cal_lignes += ['BEGIN:VEVENT', 'SUMMARY:Règles',\n                   'DTSTART:' + date, 'END:VEVENT']\n    date_courante = ajouter_jours(date_courante, 28)\n    jours_ecoules += 28`]
      ]
    },
    {
      n: 4,
      title: "Croissance de plantes — mesures et dictionnaires",
      theme: "POO · Dictionnaires · Listes · Tests/débogage",
      intro: "Des objets Plante et une liste de mesures servent à étudier une culture. Il faut calculer une croissance moyenne, regrouper les mesures par plante puis corriger une suppression défaillante dans une liste.",
      code: `def croissance_moyenne(plantes):\n    pass\n\ndef dictionnaire_mesure(plantes, mesures):\n    pass\n\ndef purger_mesures_extremes(liste_mesures):\n    for mesure in liste_mesures:\n        if mesure['temperature'] < 20 or mesure['temperature'] > 25:\n            liste_mesures.remove(mesure)`,
      tags: ['POO', 'Dictionnaires', 'Listes', 'Tests/débogage'],
      qs: [
        ["H1.py", "Écrire", "Programmer croissance_moyenne(plantes). Renvoyer None si la liste est vide.", "Chaque objet Plante possède un attribut croissance, exprimé en jours.", `def croissance_moyenne(plantes):\n    if len(plantes) == 0:\n        return None\n    return sum(plante.croissance for plante in plantes) / len(plantes)`],
        ["H2.py", "Écrire", "Construire un dictionnaire associant le nom de chaque plante à sa liste de mesures, même si cette liste est vide.", "Créer d’abord toutes les clés à partir de plantes.", `def dictionnaire_mesure(plantes, mesures):\n    resultat = {plante.nom: [] for plante in plantes}\n    for mesure in mesures:\n        if mesure['plante'] in resultat:\n            resultat[mesure['plante']].append(mesure)\n    return resultat`],
        ["H3.py", "Expliquer", "Exécuter le test fourni et expliquer pourquoi certaines températures extrêmes restent dans la liste.", "La suppression décale les éléments pendant que la boucle les parcourt.", `# Après la suppression de 18, l'élément 19 se décale\n# à l'indice déjà dépassé par l'itérateur. Même phénomène\n# pour deux valeurs trop grandes consécutives.`],
        ["H4.py", "Corriger", "Corriger purger_mesures_extremes en modifiant bien la liste reçue en argument.", "Une affectation par tranche conserve l’objet liste initial.", `def purger_mesures_extremes(liste_mesures):\n    liste_mesures[:] = [mesure for mesure in liste_mesures\n                        if 20 <= mesure['temperature'] <= 25]`]
      ]
    }
  ];

  const escapeHtml = value => value.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const question = (q, i, prof) => `<div class="qblock"><div class="qh"><span class="qn c${i}">Q${i + 1}</span><span class="qt">${q[1]} : ${q[2]}</span></div><div class="qhint">💡 ${q[3]}</div>${prof ? `<a class="edit-btn" href="${basthon(q[0])}">🐍 Ouvrir l’éditeur Python</a><button class="cb" onclick="toggleCorr(this)">✓ Voir le corrigé</button><div class="cbox"><div class="cexpl"><strong>Correction proposée</strong></div><pre class="cc">${escapeHtml(q[4])}</pre></div>` : ''}</div>`;
  const card = (s, prof) => `<div class="ece-card"><div class="ece-card-header"><div class="ece-num">N°${s.n}</div><div><div class="ece-card-title">${s.title}</div><div class="ece-card-theme">${s.theme}</div><div class="ece-inspired">📌 Sujet officiel <strong>n°${s.n}</strong> de la <strong>BNS 2026</strong> — <a href="../../../../references/nsi/ece/2026/26_BCG_NSI_${s.n}/sujet.pdf" target="_blank" rel="noopener">énoncé PDF original ↗</a></div></div></div><div class="ece-card-body"><p>${s.intro}</p><div class="ece-tags">${s.tags.map(t => `<span class="tag-theme">${t}</span>`).join('')}</div><div class="ece-tags">${s.qs.map((q,i) => `<span class="tag-type tag-${['ecrire','ecrire','tester','corriger'][i]}">Q${i+1}</span>`).join('')}</div></div><div class="ece-card-footer"><button class="ece-toggle" onclick="toggleSujet(this)">📄 Voir le sujet complet <span class="arrow">▼</span></button></div><div class="ece-sujet"><div class="sujet-intro">${s.intro}</div><div class="sujet-section"><h4>📄 Code / éléments fournis</h4><div class="code-label">fichier Python fourni</div><pre class="sc">${escapeHtml(s.code)}</pre></div><div class="sujet-section"><h4>🧪 Travail demandé</h4>${s.qs.map((q,i) => question(q,i,prof)).join('')}</div></div></div>`;

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.ece-grid');
    if (!grid) return;
    const prof = !/eleves\.html$/i.test(location.pathname);
    grid.insertAdjacentHTML('afterbegin', subjects.map(s => card(s, prof)).join(''));
  });
})();
