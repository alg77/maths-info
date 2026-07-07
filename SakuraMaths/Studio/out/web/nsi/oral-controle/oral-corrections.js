window.ORAL_CORRECTIONS = {
  "arbres-1": { answers: [
    "La taille est le nombre total de nœuds visibles. Compter chaque sommet une seule fois.",
    "Pour décider si c’est un ABR, vérifier en chaque nœud que toutes les valeurs du sous-arbre gauche sont inférieures et celles du sous-arbre droit supérieures.",
    "Parcours préfixe : racine, puis sous-arbre gauche, puis sous-arbre droit.",
    "taille_arbre est une fonction récursive.",
    "Code attendu : <code>if arbre == []: return 0</code>, sinon <code>return 1 + taille_arbre(arbre[1]) + taille_arbre(arbre[2])</code>."
  ], relance: "Faire distinguer arbre binaire et arbre binaire de recherche." },
  "arbres-2": { answers: [
    "La hauteur se lit sur le plus long chemin racine-feuille, avec hauteur de l’arbre vide égale à 0.",
    "Pour insérer 18 : comparer successivement avec les nœuds rencontrés, aller à gauche si 18 est plus petit et à droite sinon, jusqu’à une place vide.",
    "Parcours postfixe : sous-arbre gauche, sous-arbre droit, racine.",
    "Racine de <code>arb1</code> : <code>arb1[0]</code>. Sous-arbre gauche : <code>arb1[1]</code>.",
    "Cas vide : créer <code>[val, [], []]</code>. Sinon appeler récursivement sur l’indice 1 ou 2 selon la comparaison."
  ], relance: "Pourquoi un parcours infixe d’un ABR donne-t-il les valeurs triées ?" },
  "arbres-3": { answers: [
    "Q1 : <code>mon_arbre.gauche.valeur</code> renvoie <strong>\"A\"</strong>.",
    "Q2 : <code>mon_arbre.droite.gauche.valeur</code> renvoie <strong>\"D\"</strong>.",
    "Q3 : parcours suffixe/postfixe : <strong>A, D, E, C, B</strong>.",
    "Q4 : racine 4 ; fils gauche 8 avec enfants 6 et 3 ; fils droit 10, sans fils gauche, avec 19 comme fils droit."
  ], relance: "Faire expliquer la différence entre attribut et méthode." },
  "arbres-4": { answers: [
    "L’arbre contient 5 nœuds : <strong>N = 5</strong>, <strong>Nsag = 1</strong>, <strong>Nsad = 3</strong>.",
    "Relation : <code>N = 1 + Nsag + Nsad</code> pour un arbre non vide.",
    "<code>def taille(a):<br>&nbsp;&nbsp;if a is None: return 0<br>&nbsp;&nbsp;return 1 + taille(a[1]) + taille(a[2])</code>."
  ], relance: "Identifier le cas de base et expliquer pourquoi la récursion termine." },

  "bdd-1": { answers: [
    "Une clé primaire identifie chaque ligne de façon unique et ne peut être ni répétée ni nulle.",
    "Une clé étrangère référence la clé primaire d’une autre relation et assure la cohérence des liens.",
    "Pour les requêtes du sujet : lire d’abord les relations et repérer les attributs projetés après <code>SELECT</code>, la relation après <code>FROM</code> et le filtre après <code>WHERE</code>.",
    "Une jointure relie deux tables avec l’égalité entre clé étrangère et clé primaire."
  ], relance: "Demander la différence entre schéma d’une relation et contenu d’une table." },
  "bdd-2": { answers: [
    "Q1 : la requête renvoie tous les noms contenus dans la relation <code>Artiste</code>.",
    "Q2 : elle renvoie les titres des albums dont le stock est strictement supérieur à 5.",
    "Q3 : <code>SELECT titre, prix FROM Album WHERE prix &lt; 12;</code>",
    "Q4 : <code>idArtiste</code> peut apparaître pour plusieurs albums d’un même artiste ; il n’est donc pas unique dans <code>Album</code>."
  ], relance: "Quel attribut est la clé primaire d’Album ?" },
  "bdd-3": { answers: [
    "Q1 : tous les titres de la relation <code>Album</code>.",
    "Q2 : les titres des albums dont l’artiste a pour nom Nirvana.",
    "Q3 : <code>SELECT nom FROM Artiste JOIN Album ON Artiste.idArtiste = Album.idArtiste WHERE annee = 1981;</code>",
    "Q4 : plusieurs pistes appartiennent au même album ; <code>idAlbum</code> n’est donc pas unique dans <code>Piste</code>."
  ], relance: "Faire nommer clé primaire et clé étrangère dans la jointure." },
  "bdd-4": { answers: [
    "Repérer les clés primaires en gras et les clés étrangères matérialisées par les liaisons du schéma.",
    "Une projection ne conserve que les colonnes citées dans <code>SELECT</code> ; une sélection ne conserve que les lignes satisfaisant <code>WHERE</code>.",
    "Pour une jointure Album–Artiste : <code>... JOIN Artiste ON Album.idArtiste = Artiste.idArtiste</code>.",
    "Toute réponse SQL équivalente, même avec un ordre de jointure différent, est recevable."
  ], relance: "Faire verbaliser précisément le rôle de ON et de WHERE." },
  "bdd-5": { answers: [
    "Q1 : citer tous les noms de colonnes figurant dans l’en-tête de la relation <code>Clients</code>.",
    "Q2 : relever les valeurs qui ne respectent pas le domaine ou le format de leur colonne dans <code>Emplacements</code>.",
    "Q3 : plusieurs clients peuvent porter le même nom ; <code>Nom</code> n’assure pas l’unicité.",
    "Q4 : clé primaire de <code>Contrat</code> : <code>Code</code>. Clés étrangères : <code>NumeroClient</code> et <code>NumeroEmplacement</code>."
  ], relance: "Pourquoi une clé étrangère peut-elle apparaître plusieurs fois ?" },
  "bdd-6": { answers: [
    "Q1 : la liste de tous les titres présents dans <code>Livres</code>.",
    "Q2 : <code>SELECT titre, auteur FROM Livres;</code>",
    "Q3 : <code>SELECT titre, auteur FROM Livres WHERE annPubli &gt; 1960;</code>",
    "Q4 : <code>SELECT titre FROM Livres WHERE annPubli &gt; 1951 AND auteur = 'Bradbury';</code>"
  ], relance: "Faire distinguer AND et OR à l’aide d’un contre-exemple." },
  "bdd-7": { answers: [
    "Q1 : toutes les valeurs de la colonne <code>population</code>.",
    "Q2 : <code>SELECT nom, population FROM Communes;</code>",
    "Q3 : <code>SELECT nom FROM Communes WHERE inscrits &gt; 5000;</code> (adapter le nom exact de l’attribut au tableau).",
    "Q4 : <code>UPDATE Communes SET suffragesExprimes = 759 WHERE nom = 'Ambérieux-en-Bombes';</code> (adapter le nom exact de la colonne)."
  ], relance: "Pourquoi la clause WHERE est-elle indispensable dans un UPDATE ?" },

  "graphes-1": { answers: [
    "Le graphe est non orienté si chaque arête se parcourt dans les deux sens ; il est non pondéré si aucun coût n’est inscrit.",
    "La liste d’adjacence doit être symétrique pour un graphe non orienté : si B figure chez G, G doit figurer chez B.",
    "L’ordre C, A, D, E, G, B, F correspond au parcours indiqué par les voisins du schéma ; justifier avec la structure utilisée.",
    "Pour partir de F, appliquer exactement la même règle de choix des voisins et ne jamais revisiter un sommet."
  ], relance: "Faire comparer pile/profondeur et file/largeur." },
  "graphes-2": { answers: [
    "Q1 : orienté si les liens portent des flèches ; pondéré si des valeurs sont associées aux arêtes.",
    "Q2–Q3 : vérifier l’ordre proposé en suivant les voisins du dessin et en marquant chaque sommet dès sa découverte.",
    "Q4 : la matrice contient 1 en ligne X, colonne Y exactement lorsqu’une arête relie X à Y ; elle est symétrique si le graphe est non orienté et sa diagonale vaut 0 en l’absence de boucle."
  ], relance: "Quelle est la taille de la matrice pour 7 sommets ?" },
  "graphes-3": { answers: [
    "Q1 : qualifier le graphe à partir des flèches et des éventuels poids du schéma.",
    "Q2 : l’autre parcours classique est le <strong>parcours en profondeur</strong>.",
    "Q3 : FIFO signifie « premier entré, premier sorti » ; exemple : une file d’attente.",
    "Q4 : partir avec file [A], défiler A, enfiler ses voisins non visités, puis répéter. Accepter tout ordre cohérent avec l’ordre de lecture choisi pour les voisins."
  ], relance: "Pourquoi utilise-t-on une file pour un parcours en largeur ?" },

  "poo-1": { answers: [
    "<code>class Eleve:<br>&nbsp;&nbsp;def __init__(self, nom, prenom, note1, note2, note3):<br>&nbsp;&nbsp;&nbsp;&nbsp;self.nom, self.prenom = nom, prenom<br>&nbsp;&nbsp;&nbsp;&nbsp;self.notes = [note1, note2, note3]<br>&nbsp;&nbsp;def moyenne(self):<br>&nbsp;&nbsp;&nbsp;&nbsp;return sum(self.notes) / 3</code>",
    "<code>eleve1 = Eleve('Lovelace', 'Ada', 18, 19, 20)</code>",
    "<code>print(eleve1.moyenne())</code> affiche <strong>19.0</strong>."
  ], relance: "Faire distinguer classe, instance, attribut et méthode." },
  "poo-2": { answers: [
    "Q1 : <code>__init__</code> est le constructeur ; il initialise les attributs de l’instance.",
    "Q2 : <code>p = Piece(5, 4, 2.30, 'Chambre')</code>.",
    "Q3 : <code>p.type</code> renvoie <code>'Chambre'</code>.",
    "Q4 : <code>def renvoie_surface(self): return self.longueur * self.largeur</code>.",
    "Q5 : <code>p.longueur = 5.30</code>."
  ], relance: "Pourquoi la hauteur n’intervient-elle pas dans la surface au sol ?" },
  "poo-3": { answers: [
    "Q1 : <code>__init__</code> initialise les attributs d’une nouvelle instance.",
    "Q2 : <code>h = Habitat('Le Clos Tranquille', 230000, 'Maison', 130, 6)</code>.",
    "Q3 : <code>h.type</code>.",
    "Q4 : <code>def renvoie_prix_au_m2(self): return self.prix / self.surface</code>, soit environ 1769,23 €/m².",
    "Q5 : <code>h.surface = 140</code>."
  ], relance: "Que faudrait-il vérifier avant la division par la surface ?" },

  "routage-1": { answers: [
    "Q1 : débit maximal = 10 Gbit/s = 10 000 Mbit/s. Pour 1 Mbit/s, coût OSPF = <strong>10 000</strong>.",
    "Q2 : PC1–A et F–PC2 valent chacun 10 000. Route A–B–D–F : 10 000 + 1 + 500 + 500 + 10 000 = <strong>21 001</strong>. Route A–C–E–F : 10 000 + 1 + 20 + 500 + 10 000 = <strong>20 521</strong>.",
    "Q3 : vers PC2, choisir A–C–E–F, de métrique plus faible. Vers B, prendre directement A–B."
  ], relance: "Faire expliquer pourquoi le chemin avec le moins de sauts n’est pas toujours choisi." },
  "routage-2": { answers: [
    "RIP choisit une route selon le nombre de sauts ; une destination directement voisine a une métrique de 1.",
    "Lire chaque table ainsi : destination → passerelle suivante. Pour aller de A à F, A envoie à B, puis B à D, puis D à F.",
    "Les boucles sont évitées si les tables convergent vers des routes cohérentes ; le nombre maximal de sauts de RIP est 15.",
    "Relance : OSPF utilise un coût lié au débit et une vision de la topologie, alors que RIP utilise principalement le nombre de sauts."
  ], relance: "Comparer la route RIP et la route OSPF sur le même réseau." },

  "structures-1": { answers: [
    "Q1 : les deux autres structures sont la <strong>file</strong> et la <strong>liste</strong>.",
    "Q2 : serveur d’impression → file ; appels de fonctions/récursivité → pile ; tableau de valeurs → liste.",
    "Q3 : exécuter les opérations une à une en dessinant le sommet de chaque pile ; <code>depiler</code> retire le dernier élément empilé.",
    "Q4 : avec une liste Python : pile vide <code>[]</code>, empiler <code>p.append(e)</code>, dépiler <code>p.pop()</code>, tester <code>p == []</code>."
  ], relance: "LIFO signifie « dernier entré, premier sorti »." },
  "structures-2": { answers: [
    "Q1 : pile et liste.",
    "Q2 : annuler une frappe → pile ; parcours en largeur → file ; tableau de valeurs → liste.",
    "Q3 : suivre le code ligne par ligne ; une file retire en tête et ajoute en queue.",
    "Q4 : file avec liste : créer <code>[]</code>, enfiler <code>f.append(e)</code>, défiler <code>f.pop(0)</code>, tester <code>f == []</code>."
  ], relance: "Faire expliciter FIFO et son coût avec une liste Python." },
  "structures-3": { answers: [
    "Q1 : <code>f = creer_file()</code> puis enfiler successivement 3, -5, 7 et -2.",
    "Q2 : la fonction conserve uniquement les valeurs positives ; <code>file2</code> devient successivement [3], puis [3, 7].",
    "Q3 : pour obtenir les valeurs absolues [3, 5, 7, 2], enfiler <code>abs(s)</code> sans condition, ou traiter séparément les valeurs négatives."
  ], relance: "La fonction vide la file d’origine : est-ce souhaité ?" },
  "structures-4": { answers: [
    "Q1 : créer une pile vide puis empiler, de la base vers le sommet, <strong>-4, 3, 7, 2</strong>.",
    "Q2 : en dépilant du sommet, les valeurs positives sont empilées dans <code>pile2</code> dans l’ordre 2, 7, 3 ; -4 est ignoré.",
    "Q3 : pour obtenir les valeurs absolues, remplacer le test par <code>empiler(pile2, abs(s))</code>. Pour conserver l’ordre initial, utiliser ensuite une seconde inversion."
  ], relance: "Faire dessiner clairement sommet et base à chaque étape." },

  "programmation-1": { answers: [
    "Q1 : <code>mystere([3, 1, 2])</code> renvoie <strong>1</strong>.",
    "Q2 : « Renvoie la plus petite valeur du tableau non vide <code>tab</code>. »",
    "Q3 : précondition indispensable : <code>tab</code> est un tableau non vide de valeurs comparables. On peut écrire <code>assert len(tab) &gt; 0</code>."
  ], relance: "Complexité : une seule lecture du tableau, donc O(n)." },
  "programmation-2": { answers: [
    "Q1 : sans cas de base, les appels récursifs ne s’arrêtent pas et provoquent une erreur de profondeur de récursion.",
    "Q2 : le cas <code>n == 0</code> (ou <code>n == 1</code> selon la définition) est le <strong>cas de base</strong> ; l’appel utilise un argument plus petit.",
    "Q3 : <code>def fact(n):<br>&nbsp;&nbsp;assert n &gt;= 0<br>&nbsp;&nbsp;if n == 0: return 1<br>&nbsp;&nbsp;return n * fact(n - 1)</code>."
  ], relance: "Faire tracer fact(4) puis la remontée des résultats." }
};
