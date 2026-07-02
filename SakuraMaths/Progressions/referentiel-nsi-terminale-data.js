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
  }
 ]
};
