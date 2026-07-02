/* Référentiel officiel NSI Première — objectifs du programme de spécialité.
   Source : arrêté du 17-01-2019, BO spécial n°1 du 22 janvier 2019, licence ouverte etalab-2.0.
   ⚠ Codes, sous-thèmes et familles LSL attribués par Amara/Claude (non officiels), à valider/ajuster librement.
   Thèmes : H=Histoire & enjeux, D=Données, P=Programmation, L=Algorithmique, T=Données en tables, W=Web/IHM, S=Archi/systèmes.
   Familles (compétences LSL) : Ra=Raisonner, Ce=Communiquer à l'écrit, Co=Communiquer à l'oral, Cr=Concevoir/réaliser, De=Décrire/expliquer, En=Enjeux sociétaux. */
window.REFNSIP = {
 "niveau": "nsi-premiere",
 "genere": "Programme officiel NSI Première (arrêté 17-01-2019, BO spécial n°1 du 22-01-2019), licence etalab. Codes maison à valider ; familles heuristiques éditables.",
 "objectifs": [
  {
   "code": "HIS1",
   "texte": "Situer dans le temps les principaux événements de l'histoire de l'informatique et leurs protagonistes.",
   "theme": "H",
   "sousTheme": "Histoire de l'informatique",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "REP1",
   "texte": "Passer de la représentation d'un entier positif dans une base à une autre (bases 2, 10, 16 privilégiées).",
   "theme": "D",
   "sousTheme": "Représentation des données : types de base",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "REP2",
   "texte": "Évaluer le nombre de bits nécessaires à l'écriture en base 2 d'un entier, d'une somme ou d'un produit ; utiliser le complément à 2.",
   "theme": "D",
   "sousTheme": "Représentation des données : types de base",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "REP3",
   "texte": "Calculer sur quelques exemples la représentation de nombres réels (0.1, 0.25, 1/3) ; savoir que 0.2+0.1 ≠ 0.3 et éviter de tester l'égalité de deux flottants.",
   "theme": "D",
   "sousTheme": "Représentation des données : types de base",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "REP4",
   "texte": "Dresser la table d'une expression booléenne (and, or, not, xor).",
   "theme": "D",
   "sousTheme": "Représentation des données : types de base",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "REP5",
   "texte": "Identifier l'intérêt des différents systèmes d'encodage d'un texte (ASCII, ISO-8859-1, Unicode) et convertir un fichier texte entre formats.",
   "theme": "D",
   "sousTheme": "Représentation des données : types de base",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "TYP1",
   "texte": "Écrire une fonction renvoyant un p-uplet (ou p-uplet nommé) de valeurs.",
   "theme": "D",
   "sousTheme": "Représentation des données : types construits",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "TYP2",
   "texte": "Lire et modifier les éléments d'un tableau grâce à leurs index ; construire un tableau par compréhension ; utiliser des tableaux de tableaux (matrices) ; itérer sur les éléments.",
   "theme": "D",
   "sousTheme": "Représentation des données : types construits",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "TYP3",
   "texte": "Construire une entrée de dictionnaire, itérer sur ses éléments, utiliser keys(), values() et items().",
   "theme": "D",
   "sousTheme": "Représentation des données : types construits",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "TAB1",
   "texte": "Importer une table depuis un fichier texte tabulé ou un fichier CSV (tableau doublement indexé ou tableau de p-uplets).",
   "theme": "T",
   "sousTheme": "Traitement de données en tables",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "TAB2",
   "texte": "Rechercher les lignes d'une table vérifiant des critères exprimés en logique propositionnelle (doublons, tests de cohérence).",
   "theme": "T",
   "sousTheme": "Traitement de données en tables",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "TAB3",
   "texte": "Trier une table suivant une colonne.",
   "theme": "T",
   "sousTheme": "Traitement de données en tables",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "TAB4",
   "texte": "Construire une nouvelle table en combinant les données de deux tables (fusion, domaine de valeurs).",
   "theme": "T",
   "sousTheme": "Traitement de données en tables",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "WEB1",
   "texte": "Identifier les composants graphiques permettant d'interagir avec une application Web et les événements qu'ils peuvent traiter.",
   "theme": "W",
   "sousTheme": "Interactions homme-machine sur le Web",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "WEB2",
   "texte": "Analyser et modifier les méthodes exécutées lors d'un clic sur un bouton d'une page Web.",
   "theme": "W",
   "sousTheme": "Interactions homme-machine sur le Web",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "WEB3",
   "texte": "Distinguer ce qui est exécuté sur le client ou sur le serveur et dans quel ordre ; distinguer ce qui est mémorisé/retransmis ; reconnaître quand la transmission est chiffrée.",
   "theme": "W",
   "sousTheme": "Interactions homme-machine sur le Web",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "WEB4",
   "texte": "Analyser le fonctionnement d'un formulaire simple ; distinguer les transmissions de paramètres par requêtes POST ou GET.",
   "theme": "W",
   "sousTheme": "Interactions homme-machine sur le Web",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "ARC1",
   "texte": "Distinguer les rôles et caractéristiques des constituants d'une machine (von Neumann) ; dérouler l'exécution d'une séquence d'instructions simples.",
   "theme": "S",
   "sousTheme": "Architectures matérielles et systèmes d'exploitation",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "ARC2",
   "texte": "Mettre en évidence l'intérêt du découpage en paquets et de leur encapsulation ; dérouler un protocole de récupération de perte (bit alterné) ; simuler ou mettre en œuvre un réseau.",
   "theme": "S",
   "sousTheme": "Architectures matérielles et systèmes d'exploitation",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ARC3",
   "texte": "Identifier les fonctions d'un système d'exploitation ; utiliser les commandes de base en ligne de commande ; gérer les droits et permissions d'accès aux fichiers.",
   "theme": "S",
   "sousTheme": "Architectures matérielles et systèmes d'exploitation",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ARC4",
   "texte": "Identifier le rôle des capteurs et actionneurs ; réaliser par programmation une IHM répondant à un cahier des charges donné.",
   "theme": "S",
   "sousTheme": "Architectures matérielles et systèmes d'exploitation",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "LAN1",
   "texte": "Mettre en évidence un corpus de constructions élémentaires (séquences, affectation, conditionnelles, boucles bornées/non bornées, appels de fonction).",
   "theme": "P",
   "sousTheme": "Langages et programmation",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "LAN2",
   "texte": "Repérer, dans un nouveau langage de programmation, les traits communs et particuliers à ce langage.",
   "theme": "P",
   "sousTheme": "Langages et programmation",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "LAN3",
   "texte": "Prototyper une fonction ; décrire des préconditions sur les arguments et des postconditions sur les résultats.",
   "theme": "P",
   "sousTheme": "Langages et programmation",
   "type": "objectif",
   "famille": "Ce"
  },
  {
   "code": "LAN4",
   "texte": "Utiliser des jeux de tests pour mettre au point un programme (un jeu de tests réussi ne garantit pas la correction).",
   "theme": "P",
   "sousTheme": "Langages et programmation",
   "type": "objectif",
   "famille": "Ra"
  },
  {
   "code": "LAN5",
   "texte": "Utiliser la documentation d'une bibliothèque.",
   "theme": "P",
   "sousTheme": "Langages et programmation",
   "type": "objectif",
   "famille": "Ce"
  },
  {
   "code": "ALG1",
   "texte": "Écrire un algorithme de recherche d'une occurrence, d'un extremum, de calcul d'une moyenne (parcours séquentiel, coût linéaire).",
   "theme": "L",
   "sousTheme": "Algorithmique",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ALG2",
   "texte": "Écrire un algorithme de tri par insertion ou par sélection ; décrire un invariant de boucle prouvant sa correction ; justifier la terminaison (coût quadratique).",
   "theme": "L",
   "sousTheme": "Algorithmique",
   "type": "objectif",
   "famille": "Ra"
  },
  {
   "code": "ALG3",
   "texte": "Écrire un algorithme des k plus proches voisins prédisant la classe d'un élément.",
   "theme": "L",
   "sousTheme": "Algorithmique",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ALG4",
   "texte": "Montrer la terminaison de la recherche dichotomique dans un tableau trié à l'aide d'un variant de boucle.",
   "theme": "L",
   "sousTheme": "Algorithmique",
   "type": "objectif",
   "famille": "Ra"
  },
  {
   "code": "ALG5",
   "texte": "Résoudre un problème grâce à un algorithme glouton (sac à dos, rendu de monnaie).",
   "theme": "L",
   "sousTheme": "Algorithmique",
   "type": "objectif",
   "famille": "Cr"
  },

  /* ===================== AUTOMATISMES (rituel de début de séance) =====================
     Contrairement aux objectifs (compétences du BO), un automatisme porte son contenu
     concret : un mini-exercice prêt à poser tel quel en 5 minutes. Champ "drill" :
       - kind:"court" -> question, reponse (réponse courte à donner à l'oral/écrit)
       - kind:"qcm"   -> question, options[], reponse (index dans options)
       - kind:"code"  -> consigne ("Comprendre"|"Corriger"|"Compléter"|"Déboguer"), code, correction */
  {
   "code": "AUTO-BIN1",
   "texte": "Convertir un petit entier décimal en binaire, à la main",
   "theme": "D",
   "sousTheme": "Automatismes — représentation des données",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"court","question":"Écris 16 en binaire (base 2).","reponse":"10000"}
  },
  {
   "code": "AUTO-BIN2",
   "texte": "Convertir un octet binaire en décimal, à la main",
   "theme": "D",
   "sousTheme": "Automatismes — représentation des données",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"court","question":"Que vaut 1011 en base 10 ?","reponse":"11"}
  },
  {
   "code": "AUTO-HEX1",
   "texte": "Convertir un entier décimal en hexadécimal",
   "theme": "D",
   "sousTheme": "Automatismes — représentation des données",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"court","question":"Écris 255 en hexadécimal.","reponse":"FF"}
  },
  {
   "code": "AUTO-BOOL1",
   "texte": "Évaluer une expression booléenne courte",
   "theme": "D",
   "sousTheme": "Automatismes — logique booléenne",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"qcm","question":"True and False or True vaut :","options":["True","False"],"reponse":0}
  },
  {
   "code": "AUTO-BOOL2",
   "texte": "Évaluer une expression booléenne avec négation",
   "theme": "D",
   "sousTheme": "Automatismes — logique booléenne",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"qcm","question":"not (True or False) vaut :","options":["True","False"],"reponse":1}
  },
  {
   "code": "AUTO-TRACE1",
   "texte": "Prédire la sortie d'un court programme (affectations)",
   "theme": "P",
   "sousTheme": "Automatismes — lecture de code",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"code","consigne":"Comprendre","code":"x = 5\ny = x * 2\nprint(y - 1)","correction":"Affiche 9 (y = 10, puis 10 - 1 = 9)."}
  },
  {
   "code": "AUTO-TRACE2",
   "texte": "Prédire la sortie d'une boucle simple",
   "theme": "P",
   "sousTheme": "Automatismes — lecture de code",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"code","consigne":"Comprendre","code":"total = 0\nfor i in range(4):\n    total += i\nprint(total)","correction":"Affiche 6 (0+1+2+3)."}
  },
  {
   "code": "AUTO-COMPLETE1",
   "texte": "Compléter une boucle for sur un intervalle",
   "theme": "P",
   "sousTheme": "Automatismes — syntaxe réflexe",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"code","consigne":"Compléter","code":"# Afficher les nombres pairs de 0 à 8 inclus\nfor i in range(...):\n    if ...:\n        print(i)","correction":"for i in range(9):\n    if i % 2 == 0:\n        print(i)"}
  },
  {
   "code": "AUTO-CORRIGE1",
   "texte": "Corriger une confusion entre affectation et égalité",
   "theme": "P",
   "sousTheme": "Automatismes — syntaxe réflexe",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"code","consigne":"Corriger","code":"x = 3\nif x = 3:\n    print(\"ok\")","correction":"if x == 3:\n    print(\"ok\")   # == pour comparer, = pour affecter"}
  },
  {
   "code": "AUTO-DEBUG1",
   "texte": "Déboguer une erreur d'index (off-by-one)",
   "theme": "P",
   "sousTheme": "Automatismes — mise au point",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"code","consigne":"Déboguer","code":"lst = [10, 20, 30]\nfor i in range(len(lst) + 1):\n    print(lst[i])","correction":"for i in range(len(lst)):\n    print(lst[i])   # range(len(lst)+1) sort du tableau (IndexError)"}
  },
  {
   "code": "AUTO-DICO1",
   "texte": "Compléter un accès et une mise à jour de dictionnaire",
   "theme": "D",
   "sousTheme": "Automatismes — syntaxe réflexe",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"code","consigne":"Compléter","code":"stock = {\"pommes\": 4, \"poires\": 2}\n# Ajouter 3 pommes au stock\nstock[...] = stock[...] + ...","correction":"stock[\"pommes\"] = stock[\"pommes\"] + 3"}
  },
  {
   "code": "AUTO-COMPLEX1",
   "texte": "Identifier à vue la complexité d'un parcours simple",
   "theme": "L",
   "sousTheme": "Automatismes — complexité",
   "type": "automatisme",
   "famille": "De",
   "drill": {"kind":"qcm","question":"Un parcours simple (une boucle for) d'une liste de taille n a une complexité :","options":["O(1)","O(n)","O(n²)","O(log n)"],"reponse":1}
  }
 ]
};
