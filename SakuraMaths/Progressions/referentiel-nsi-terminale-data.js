/* Référentiel officiel NSI Terminale — objectifs du programme de spécialité.
   Source : arrêté du 17-07-2019, BO spécial n°8 du 25 juillet 2019, licence ouverte etalab-2.0.
   ⚠ Codes, sous-thèmes et familles LSL attribués par Amara/Claude (non officiels), à valider/ajuster librement.
   Thèmes : D=Structures de données, B=Bases de données, O=Programmation objet, P=Langages & programmation,
            R=Réseaux & sécurité, S=Architectures & systèmes, L=Algorithmique.
   (L'Histoire de l'informatique est transversale dans le BO Terminale : pas de thème dédié ici, cohérent avec ta légende.)
   Familles (compétences LSL) : Ra=Raisonner, Ce=Communiquer à l'écrit, Co=Communiquer à l'oral, Cr=Concevoir/réaliser, De=Décrire/expliquer, En=Enjeux sociétaux. */
window.REFNSIT = {
 "niveau": "nsi-terminale",
 "genere": "Programme officiel NSI Terminale (arrêté 17-07-2019, BO spécial n°8 du 25-07-2019), licence etalab. Codes maison à valider ; familles heuristiques éditables.",
 "objectifs": [
  {
   "code": "STR1",
   "texte": "Spécifier une structure de données par son interface ; distinguer interface et implémentation ; écrire plusieurs implémentations d'une même structure (ex. file avec tableau ou deux piles).",
   "theme": "D",
   "sousTheme": "Structures de données, interface et implémentation",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "POO1",
   "texte": "Écrire la définition d'une classe ; accéder aux attributs et méthodes d'une classe (hors polymorphisme et héritage).",
   "theme": "O",
   "sousTheme": "Vocabulaire de la programmation objet",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "STR2",
   "texte": "Distinguer des structures linéaires (listes, piles LIFO, files FIFO, dictionnaires) par le jeu de leurs méthodes ; choisir une structure adaptée à la situation ; distinguer recherche dans une liste et dans un dictionnaire.",
   "theme": "D",
   "sousTheme": "Listes, piles, files, dictionnaires",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "STR3",
   "texte": "Identifier des situations nécessitant une structure arborescente ; évaluer des mesures d'un arbre binaire (taille, encadrement de la hauteur).",
   "theme": "D",
   "sousTheme": "Arbres : structures hiérarchiques",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "STR4",
   "texte": "Modéliser des situations sous forme de graphes ; écrire les implémentations (matrice d'adjacence, liste de successeurs/prédécesseurs) et passer d'une représentation à l'autre.",
   "theme": "D",
   "sousTheme": "Graphes : structures relationnelles",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "BDD1",
   "texte": "Identifier les concepts définissant le modèle relationnel (relation, attribut, domaine, clef primaire, clef étrangère, schéma relationnel).",
   "theme": "B",
   "sousTheme": "Modèle relationnel",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "BDD2",
   "texte": "Distinguer la structure d'une base de données de son contenu ; repérer des anomalies dans un schéma (redondances, anomalies d'insertion/suppression/mise à jour).",
   "theme": "B",
   "sousTheme": "Base de données relationnelle",
   "type": "objectif",
   "famille": "Ra"
  },
  {
   "code": "BDD3",
   "texte": "Identifier les services rendus par un SGBD relationnel : persistance, gestion des accès concurrents, efficacité des requêtes, sécurisation des accès.",
   "theme": "B",
   "sousTheme": "Système de gestion de bases de données",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "BDD4",
   "texte": "Identifier les composants d'une requête ; construire des requêtes d'interrogation (SELECT, FROM, WHERE, JOIN) et de mise à jour (UPDATE, INSERT, DELETE) en SQL.",
   "theme": "B",
   "sousTheme": "Langage SQL",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ARC1",
   "texte": "Identifier les principaux composants d'un système sur puce (SoC) sur un schéma de circuit et les avantages de leur intégration.",
   "theme": "S",
   "sousTheme": "Composants intégrés d'un système sur puce",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "ARC2",
   "texte": "Décrire la création d'un processus et l'ordonnancement par le système ; mettre en évidence le risque d'interblocage (deadlock).",
   "theme": "S",
   "sousTheme": "Gestion des processus et des ressources",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "RES1",
   "texte": "Identifier, suivant le protocole de routage utilisé (RIP : nombre de sauts, OSPF : coût des routes), la route empruntée par un paquet.",
   "theme": "R",
   "sousTheme": "Protocoles de routage",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "RES2",
   "texte": "Décrire les principes de chiffrement symétrique et asymétrique ; décrire l'échange d'une clef symétrique via un protocole asymétrique pour sécuriser une communication HTTPS.",
   "theme": "R",
   "sousTheme": "Sécurisation des communications",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "LAN1",
   "texte": "Comprendre que tout programme est aussi une donnée et que la calculabilité ne dépend pas du langage ; montrer sans formalisme que le problème de l'arrêt est indécidable.",
   "theme": "P",
   "sousTheme": "Programme en tant que donnée, calculabilité, décidabilité",
   "type": "objectif",
   "famille": "Ra"
  },
  {
   "code": "LAN2",
   "texte": "Écrire un programme récursif ; analyser le fonctionnement d'un programme récursif.",
   "theme": "P",
   "sousTheme": "Récursivité",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "LAN3",
   "texte": "Utiliser des API ou des bibliothèques en exploitant leur documentation ; créer des modules simples et les documenter.",
   "theme": "P",
   "sousTheme": "Modularité",
   "type": "objectif",
   "famille": "Ce"
  },
  {
   "code": "LAN4",
   "texte": "Distinguer sur des exemples les paradigmes impératif, fonctionnel et objet ; choisir le paradigme selon le champ d'application.",
   "theme": "P",
   "sousTheme": "Paradigmes de programmation",
   "type": "objectif",
   "famille": "De"
  },
  {
   "code": "LAN5",
   "texte": "Répondre aux causes typiques de bugs (typage, effets de bord, débordements de tableaux, conditionnelles non exhaustives, comparaisons de flottants, mauvais nommage).",
   "theme": "P",
   "sousTheme": "Mise au point des programmes, gestion des bugs",
   "type": "objectif",
   "famille": "Ra"
  },
  {
   "code": "ALG1",
   "texte": "Calculer la taille et la hauteur d'un arbre ; le parcourir (infixe, préfixe, suffixe, largeur d'abord) ; rechercher/insérer une clé dans un arbre de recherche.",
   "theme": "L",
   "sousTheme": "Algorithmes sur les arbres",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ALG2",
   "texte": "Parcourir un graphe en profondeur ou en largeur d'abord ; repérer un cycle ; chercher un chemin dans un graphe.",
   "theme": "L",
   "sousTheme": "Algorithmes sur les graphes",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ALG3",
   "texte": "Écrire un algorithme utilisant la méthode « diviser pour régner » (ex. rotation d'image, tri fusion en n·log₂n).",
   "theme": "L",
   "sousTheme": "Méthode diviser pour régner",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ALG4",
   "texte": "Utiliser la programmation dynamique pour écrire un algorithme (alignement de séquences, rendu de monnaie).",
   "theme": "L",
   "sousTheme": "Programmation dynamique",
   "type": "objectif",
   "famille": "Cr"
  },
  {
   "code": "ALG5",
   "texte": "Étudier l'algorithme de Boyer-Moore pour la recherche d'un motif dans un texte ; expliquer l'intérêt du prétraitement du motif.",
   "theme": "L",
   "sousTheme": "Recherche textuelle",
   "type": "objectif",
   "famille": "De"
  },

  /* ===================== AUTOMATISMES (rituel de début de séance) =====================
     Voir referentiel-nsi-premiere-data.js pour le détail du format du champ "drill". */
  {
   "code": "AUTO-SQL1",
   "texte": "Compléter le squelette d'une requête SQL de sélection filtrée",
   "theme": "B",
   "sousTheme": "Automatismes — SQL",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"code","consigne":"Compléter","code":"-- Sélectionner les noms des élèves ayant plus de 10 en NSI\n... nom ... eleves ... note > 10","correction":"SELECT nom FROM eleves WHERE note > 10;"}
  },
  {
   "code": "AUTO-SQL2",
   "texte": "Connaître la clause SQL de tri",
   "theme": "B",
   "sousTheme": "Automatismes — SQL",
   "type": "automatisme",
   "famille": "De",
   "drill": {"kind":"court","question":"Quelle clause SQL sert à trier les résultats d'une requête ?","reponse":"ORDER BY"}
  },
  {
   "code": "AUTO-POO1",
   "texte": "Compléter une définition de classe (self, constructeur)",
   "theme": "O",
   "sousTheme": "Automatismes — POO",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"code","consigne":"Compléter","code":"class Point:\n    def __init__(..., x, y):\n        self.x = ...\n        self.y = ...","correction":"class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y"}
  },
  {
   "code": "AUTO-POO2",
   "texte": "Corriger un oubli de self. sur un attribut",
   "theme": "O",
   "sousTheme": "Automatismes — POO",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"code","consigne":"Corriger","code":"class Compteur:\n    def __init__(self):\n        valeur = 0\n    def incrementer(self):\n        self.valeur += 1","correction":"class Compteur:\n    def __init__(self):\n        self.valeur = 0   # sans self., ce n'est pas un attribut\n    def incrementer(self):\n        self.valeur += 1"}
  },
  {
   "code": "AUTO-REC1",
   "texte": "Tracer l'exécution d'une fonction récursive simple",
   "theme": "P",
   "sousTheme": "Automatismes — récursivité",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"court","question":"def fact(n):\n    if n <= 1: return 1\n    return n * fact(n-1)\n\nQue renvoie fact(4) ?","reponse":"24"}
  },
  {
   "code": "AUTO-ARBRE1",
   "texte": "Connaître la hauteur d'un arbre réduit à un nœud",
   "theme": "D",
   "sousTheme": "Automatismes — arbres",
   "type": "automatisme",
   "famille": "De",
   "drill": {"kind":"qcm","question":"La hauteur d'un arbre binaire réduit à un seul nœud (la racine) est :","options":["-1","0","1"],"reponse":1}
  },
  {
   "code": "AUTO-GRAPHE1",
   "texte": "Compter les arêtes d'un graphe complet",
   "theme": "D",
   "sousTheme": "Automatismes — graphes",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"court","question":"Dans un graphe complet à 5 sommets (chaque sommet relié à tous les autres), combien d'arêtes ?","reponse":"10"}
  },
  {
   "code": "AUTO-COMPLEX2",
   "texte": "Identifier à vue la complexité d'une recherche dichotomique",
   "theme": "L",
   "sousTheme": "Automatismes — complexité",
   "type": "automatisme",
   "famille": "De",
   "drill": {"kind":"qcm","question":"La recherche dichotomique dans un tableau trié de taille n a une complexité :","options":["O(n)","O(log n)","O(n log n)","O(n²)"],"reponse":1}
  },
  {
   "code": "AUTO-DEBUG2",
   "texte": "Déboguer une division par zéro non gérée",
   "theme": "P",
   "sousTheme": "Automatismes — mise au point",
   "type": "automatisme",
   "famille": "Ra",
   "drill": {"kind":"code","consigne":"Déboguer","code":"def moyenne(notes):\n    return sum(notes) / len(notes)\n\nmoyenne([])  # plante","correction":"def moyenne(notes):\n    if len(notes) == 0:\n        return None\n    return sum(notes) / len(notes)"}
  },
  {
   "code": "AUTO-BIN3",
   "texte": "Connaître le principe du complément à 2",
   "theme": "S",
   "sousTheme": "Automatismes — représentation binaire",
   "type": "automatisme",
   "famille": "De",
   "drill": {"kind":"court","question":"Sur 8 bits, quel est le complément à 2 de 00000001 (représentation de -1) ?","reponse":"11111111"}
  },
  {
   "code": "AUTO-RESEAU1",
   "texte": "Connaître la taille d'une adresse IPv4",
   "theme": "R",
   "sousTheme": "Automatismes — réseaux",
   "type": "automatisme",
   "famille": "De",
   "drill": {"kind":"court","question":"Combien de bits compte une adresse IPv4 ?","reponse":"32"}
  },
  {
   "code": "AUTO-DICT1",
   "texte": "Compléter un accès sécurisé à un dictionnaire avec .get()",
   "theme": "D",
   "sousTheme": "Automatismes — structures de données",
   "type": "automatisme",
   "famille": "Cr",
   "drill": {"kind":"code","consigne":"Compléter","code":"stock = {\"pommes\": 4}\n# Lire le nombre de poires, 0 si absent, sans erreur\nn = stock....(\"poires\", ...)","correction":"n = stock.get(\"poires\", 0)"}
  }
 ]
};
