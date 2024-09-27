import json
import os


# Fonction pour charger les données JSON
def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


# Charger les données du sommaire et des compétences
sommaire = load_json('sommaire_5e.json')
competences = load_json('competences_5e.json')
capacites = load_json('capacites_5e.json')

# Dictionnaire des compétences avec descriptions
descriptions_competences = {
    "Ch1": "Extraire d'un document les informations utiles, les reformuler, les organiser, les confronter à ses connaissances.",
    "Ch2": "S’engager dans une démarche scientifique, observer, questionner, manipuler, expérimenter (sur une feuille de papier, avec des objets, à l’aide de logiciels), émettre des hypothèses, chercher des exemples ou des contre- exemples, simplifier ou particulariser une situation, émettre une conjecture.",
    "Ch3": "Tester, essayer plusieurs pistes de résolution.",
    "Ch4": "Décomposer un problème en sous-problèmes.",
    "Mo1": "Reconnaître un modèle mathématique (proportionnalité, équiprobabilité) et raisonner dans le cadre de ce modèle pour résoudre un problème.",
    "Mo2": "Traduire en langage mathématique une situation réelle (par exemple à l'aide d'équations, de fonctions, de configurations géométriques, d'outils statistiques).",
    "Mo3": "Comprendre et utiliser une simulation numérique ou géométrique.",
    "Mo4": "Valider ou invalider un modèle, comparer une situation à un modèle connu (par exemple un modèle aléatoire).",
    "Re1": "Choisir et mettre en relation des cadres (numérique, algébrique, géométrique) adaptés pour traiter un problème ou pour étudier un objet mathématique.",
    "Re2": "Produire et utiliser plusieurs représentations des nombres.",
    "Re3": "Représenter des données sous forme d’une série statistique.",
    "Re4": "Utiliser, produire et mettre en relation des représentations de solides (par exemple perspective ou vue de dessus/de dessous) et de situations spatiales (schémas, croquis, maquettes, patrons, figures géométriques, photographies, plans, cartes, courbes de niveau).",
    "Ra1": "Résoudre des problèmes impliquant des grandeurs variées (géométriques, physiques, économiques) : mobiliser les connaissances nécessaires, analyser et exploiter ses erreurs, mettre à l’essai plusieurs solutions.",
    "Ra2": "Mener collectivement une investigation en sachant prendre en compte le point de vue d’autrui.",
    "Ra3": "Démontrer : utiliser un raisonnement logique et des règles établies (propriétés, théorèmes, formules) pour parvenir à une conclusion.",
    "Ra4": "Fonder et défendre ses jugements en s’appuyant sur des résultats établis et sur sa maîtrise de l’argumentation.",
    "Ca1": "Calculer avec des nombres rationnels, de manière exacte ou approchée, en combinant de façon appropriée le calcul mental, le calcul posé et le calcul instrumenté (calculatrice ou logiciel).",
    "Ca2": "Contrôler la vraisemblance de ses résultats, notamment en estimant des ordres de grandeur ou en utilisant des encadrements.",
    "Ca3": "Calculer en utilisant le langage algébrique (lettres, symboles, etc.).",
    "Co1": "Faire le lien entre le langage naturel et le langage algébrique. Distinguer des spécificités du langage mathématique par rapport à la langue française.",
    "Co2": "Expliquer à l’oral ou à l’écrit (sa démarche, son raisonnement, un calcul, un protocole de construction géométrique, un algorithme), comprendre les explications d’un autre et argumenter dans l’échange.",
    "Co3": "Vérifier la validité d’une information et distinguer ce qui est objectif et ce qui est subjectif ; lire, interpréter, commenter, produire des tableaux, des graphiques, des diagrammes."
}

# Dictionnaire des icônes par type de compétence
icones_competences = {
    "Ch1": "fa-magnifying-glass",
    "Ch2": "fa-magnifying-glass",
    "Ch3": "fa-magnifying-glass",
    "Ch4": "fa-magnifying-glass",
    "Mo1": "fa-pen-to-square",
    "Mo2": "fa-pen-to-square",
    "Mo3": "fa-pen-to-square",
    "Mo4": "fa-pen-to-square",
    "Re1": "fa-chart-line",
    "Re2": "fa-chart-line",
    "Re3": "fa-chart-line",
    "Re4": "fa-chart-line",
    "Ra1": "fa-gears",
    "Ra2": "fa-gears",
    "Ra3": "fa-gears",
    "Ra4": "fa-gears",
    "Ca1": "fa-calculator",
    "Ca2": "fa-calculator",
    "Ca3": "fa-calculator",
    "Co1": "fa-comment",
    "Co2": "fa-comment",
    "Co3": "fa-comment"
}


# Modèle HTML pour chaque chapitre
html_template = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{titre}</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <header>
        <div class="logo-container">
            <img src="Images/Maths-logo2.webp" alt="Logo Maths" class="logo">
        </div>
        <h1>Mes Cours de Maths - 5<sup>ème</sup></h1>
        <nav>
            <ul>
                <li><a href="../index.html"><i class="fas fa-home"></i> Accueil</a></li>
                <li><a href="../cours_5e.html"><i class="fas fa-arrow-left"></i> Retour aux Cours de 5<sup>ème</sup></a></li>
                <li class="dropdown">
                    <a href="#maths" class="dropbtn">Mathématiques</a>
                    <div class="dropdown-content">
                        <a href="cours_6e.html">6<sup>ème</sup></a>
                        <a href="cours_5e.html">5<sup>ème</sup></a>
                        <a href="cours_4e.html">4<sup>ème</sup></a>
                        <a href="cours_3e.html">3<sup>ème</sup></a>
                    </div>
                </li>
                <li class="dropdown">
                    <a href="#informatique" class="dropbtn">Informatique</a>
                    <div class="dropdown-content">
                        <a href="cours_1ere.html">1<sup>ère</sup></a>
                        <a href="cours_terminale.html">Terminale</a>
                    </div>
                </li>
                <li><a href="#exercices">Exercices</a></li>
                <li><a href="#liens-utiles">Liens Utiles</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="cours">
            <h2>{titre}</h2>
            <article class="course-card">
                <div class="course-card-content">
                    <h3>Capacités attendues</h3>
                    <ul class="competences">
                        {capacites}
                    </ul>
                </div>
            </article>

            <article class="course-card">
                <div class="course-card-content">
                    <h3>Compétences travaillées</h3>
                    <ul class="competences">
                        {competences}
                    </ul>
                </div>
            </article>

            <article class="course-card">
                <div class="course-card-content">
                    <h3>PDF du cours</h3>
                    <div>
                        <p>Vous pouvez télécharger le PDF du cours en cliquant sur le bouton ci-dessous :</p>
                        <a href="PDF/{pdf_file}" class="pdf-link btn">Télécharger le cours en PDF</a>
                    </div>
                    <img src="Images/{pdf_preview}" alt="Aperçu du PDF" class="pdf-preview">
                </div>
            </article>

            <article class="course-card">
                <div class="course-card-content">
                    <h3>Vidéos explicatives</h3>
                    <div class="video-container">
                        <iframe width="560" height="315" src="{video_url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </article>

            <article class="course-card">
                <div class="course-card-content">
                    <h3>Ressources supplémentaires</h3>
                    <ul>
                        <li><a href="https://calculatice.ac-lille.fr/exercices/" target="_blank">Calcul@tice - entraînement au calcul mental</a></li>
                        <li><a href="https://fr.khanacademy.org/math/cycle-4-v2" target="_blank">Khan Academy - Mathématiques</a></li>
                        <li><a href="https://www.mathsisfun.com/" target="_blank">Math is Fun</a></li>
                    </ul>
                </div>
            </article>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Mes Cours de Maths et de NSI - Tous droits réservés</p>
    </footer>
</body>
</html>
"""


# Fonction pour créer la liste des compétences en HTML
def create_competences_html(competences_list):
    return ''.join(
        f'<li><i class="fa-solid {icones_competences[comp]}"></i>{comp} : {descriptions_competences[comp]}</li>' for comp in competences_list)

# Fonction pour créer la liste des compétences en HTML
def create_capacites_html(capacites_list):
    return ''.join(
        f'<li><i class="fa-solid fa-star"></i>{capacite}</li>' for capacite in capacites_list)

# Générer les fichiers HTML
for theme, chapitres in sommaire.items():
    for chapitre in chapitres:
        titre = chapitre["chapitre"]
        fichier = chapitre["fichier"]
        pdf_file = fichier.replace(".html", ".pdf")
        pdf_preview = fichier.replace(".html", "_preview.png")
        video_url = "https://www.youtube.com/embed/u-bqCheDpHc"  # URL de la vidéo, peut être modifié pour chaque chapitre
        competences_list = competences.get(fichier, [])
        capacites_list = capacites.get(fichier, [])
        competences_html = create_competences_html(competences_list)
        capacites_html = create_capacites_html(capacites_list)

        # Créer le contenu HTML final
        html_content = html_template.format(
            titre=titre,
            capacites=capacites_html,
            competences=competences_html,
            pdf_file=pdf_file,
            pdf_preview=pdf_preview,
            video_url=video_url
        )

        # Écrire le fichier HTML
        with open(fichier, 'w', encoding='utf-8') as file:
            file.write(html_content)

print("Les fichiers HTML ont été générés avec succès.")
