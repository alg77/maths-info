import argparse
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

GRADE_CONFIG = {
    "5e": {
        "dir": "5eme",
        "header": "Mes Cours de Maths - 5<sup>\u00e8me</sup>",
        "return_page": "cours_5e.html",
        "resources": [
            '<li><a href="https://calculatice.ac-lille.fr/exercices/" target="_blank">Calcul@tice - entrainement au calcul mental</a></li>',
            '<li><a href="https://fr.khanacademy.org/math/cycle-4-v2" target="_blank">Khan Academy - Math\u00e9matiques</a></li>',
            '<li><a href="https://www.mathsisfun.com/" target="_blank">Math is Fun</a></li>',
        ],
    },
    "4e": {
        "dir": "4eme",
        "header": "Mes Cours de Maths - 4<sup>\u00e8me</sup>",
        "return_page": "cours_4e.html",
        "resources": [
            '<li><a href="https://fr.khanacademy.org/math/cycle-4-v2" target="_blank">Khan Academy - Math\u00e9matiques</a></li>',
            '<li><a href="https://www.mathsisfun.com/" target="_blank">Math is Fun</a></li>',
        ],
    },
}

DESCRIPTIONS_COMPETENCES = {
    "Ch1": "Extraire d'un document les informations utiles, les reformuler, les organiser, les confronter \u00e0 ses connaissances.",
    "Ch2": "S’engager dans une d\u00e9marche scientifique, observer, questionner, manipuler, exp\u00e9rimenter (sur une feuille de papier, avec des objets, \u00e0 l’aide de logiciels), \u00e9mettre des hypoth\u00e8ses, chercher des exemples ou des contre- exemples, simplifier ou particulariser une situation, \u00e9mettre une conjecture.",
    "Ch3": "Tester, essayer plusieurs pistes de r\u00e9solution.",
    "Ch4": "D\u00e9composer un probl\u00e8me en sous-probl\u00e8mes.",
    "Mo1": "Reconna\u00eetre un mod\u00e8le math\u00e9matique (proportionnalit\u00e9, \u00e9quiprobabilit\u00e9) et raisonner dans le cadre de ce mod\u00e8le pour r\u00e9soudre un probl\u00e8me.",
    "Mo2": "Traduire en langage math\u00e9matique une situation r\u00e9elle (par exemple \u00e0 l'aide d'\u00e9quations, de fonctions, de configurations g\u00e9om\u00e9triques, d'outils statistiques).",
    "Mo3": "Comprendre et utiliser une simulation num\u00e9rique ou g\u00e9om\u00e9trique.",
    "Mo4": "Valider ou invalider un mod\u00e8le, comparer une situation \u00e0 un mod\u00e8le connu (par exemple un mod\u00e8le al\u00e9atoire).",
    "Re1": "Choisir et mettre en relation des cadres (num\u00e9rique, alg\u00e9brique, g\u00e9om\u00e9trique) adapt\u00e9s pour traiter un probl\u00e8me ou pour \u00e9tudier un objet math\u00e9matique.",
    "Re2": "Produire et utiliser plusieurs repr\u00e9sentations des nombres.",
    "Re3": "Repr\u00e9senter des donn\u00e9es sous forme d’une s\u00e9rie statistique.",
    "Re4": "Utiliser, produire et mettre en relation des repr\u00e9sentations de solides et de situations spatiales.",
    "Ra1": "R\u00e9soudre des probl\u00e8mes impliquant des grandeurs vari\u00e9es : mobiliser les connaissances n\u00e9cessaires, analyser et exploiter ses erreurs, mettre \u00e0 l’essai plusieurs solutions.",
    "Ra2": "Mener collectivement une investigation en sachant prendre en compte le point de vue d’autrui.",
    "Ra3": "D\u00e9montrer : utiliser un raisonnement logique et des r\u00e8gles \u00e9tablies pour parvenir \u00e0 une conclusion.",
    "Ra4": "Fonder et d\u00e9fendre ses jugements en s’appuyant sur des r\u00e9sultats \u00e9tablis et sur sa ma\u00eetrise de l’argumentation.",
    "Ca1": "Calculer avec des nombres rationnels, de mani\u00e8re exacte ou approch\u00e9e, en combinant de fa\u00e7on appropri\u00e9e le calcul mental, le calcul pos\u00e9 et le calcul instrument\u00e9.",
    "Ca2": "Contr\u00f4ler la vraisemblance de ses r\u00e9sultats, notamment en estimant des ordres de grandeur ou en utilisant des encadrements.",
    "Ca3": "Calculer en utilisant le langage alg\u00e9brique (lettres, symboles, etc.).",
    "Co1": "Faire le lien entre le langage naturel et le langage alg\u00e9brique. Distinguer des sp\u00e9cificit\u00e9s du langage math\u00e9matique par rapport \u00e0 la langue fran\u00e7aise.",
    "Co2": "Expliquer \u00e0 l’oral ou \u00e0 l’\u00e9crit sa d\u00e9marche, son raisonnement ou un calcul, comprendre les explications d’un autre et argumenter dans l’\u00e9change.",
    "Co3": "V\u00e9rifier la validit\u00e9 d’une information et distinguer ce qui est objectif et subjectif ; lire, interpr\u00e9ter, commenter, produire des tableaux, des graphiques, des diagrammes.",
}

ICONES_COMPETENCES = {
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
    "Co3": "fa-comment",
}

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang=\"fr\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>{titre}</title>
    <link rel=\"stylesheet\" href=\"styles.css\">
    <link href=\"https://fonts.googleapis.com/css2?family=Lobster&family=Roboto:wght@400;700&display=swap\" rel=\"stylesheet\">
    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css\">
</head>
<body>
    <header>
        <div class=\"logo-container\">
            <img src=\"../Images/Maths-logo2.webp\" alt=\"Logo Maths\" class=\"logo\">
        </div>
        <h1>{header}</h1>
        <nav>
            <ul>
                <li><a href=\"../index.html\"><i class=\"fas fa-home\"></i> Accueil</a></li>
                <li><a href=\"../{return_page}\"><i class=\"fas fa-arrow-left\"></i> Retour aux Cours de {grade_label}</a></li>
                <li class=\"dropdown\">
                    <a href=\"#maths\" class=\"dropbtn\">Mathématiques</a>
                    <div class=\"dropdown-content\">
                        <a href=\"cours_6e.html\">6<sup>ème</sup></a>
                        <a href=\"cours_5e.html\">5<sup>ème</sup></a>
                        <a href=\"cours_4e.html\">4<sup>ème</sup></a>
                        <a href=\"cours_3e.html\">3<sup>ème</sup></a>
                    </div>
                </li>
                <li class=\"dropdown\">
                    <a href=\"#informatique\" class=\"dropbtn\">Informatique</a>
                    <div class=\"dropdown-content\">
                        <a href=\"cours_1ere.html\">1<sup>ère</sup></a>
                        <a href=\"cours_terminale.html\">Terminale</a>
                    </div>
                </li>
                <li><a href=\"#exercices\">Exercices</a></li>
                <li><a href=\"#liens-utiles\">Liens Utiles</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id=\"cours\">
            <h2>{titre}</h2>
            <article class=\"course-card\">
                <div class=\"course-card-content\">
                    <h3>Capacités attendues</h3>
                    <ul class=\"competences\">
                        {capacites}
                    </ul>
                </div>
            </article>

            <article class=\"course-card\">
                <div class=\"course-card-content\">
                    <h3>Compétences travaillées</h3>
                    <ul class=\"competences\">
                        {competences}
                    </ul>
                </div>
            </article>

            <article class=\"course-card\">
                <div class=\"course-card-content\">
                    <h3>PDF du cours</h3>
                    <div>
                        <p>Vous pouvez télécharger le PDF du cours en cliquant sur le bouton ci-dessous :</p>
                        <a href=\"PDF/{pdf_file}\" class=\"pdf-link btn\">Télécharger le cours en PDF</a>
                    </div>
                    <img src=\"Images/{pdf_preview}\" alt=\"Aperçu du PDF\" class=\"pdf-preview\">
                </div>
            </article>

            <article class=\"course-card\">
                <div class=\"course-card-content\">
                    <h3>Vidéos explicatives</h3>
                    <div class=\"video-container\">
                        <iframe width=\"560\" height=\"315\" src=\"{video_url}\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>
                    </div>
                </div>
            </article>

            <article class=\"course-card\">
                <div class=\"course-card-content\">
                    <h3>Ressources supplémentaires</h3>
                    <ul>
                        {resources}
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


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def create_competences_html(lst):
    return ''.join(
        f'<li><i class="fa-solid {ICONES_COMPETENCES[c]}"></i>{c} : {DESCRIPTIONS_COMPETENCES[c]}</li>'
        for c in lst
    )


def create_capacites_html(lst):
    return ''.join(f'<li><i class="fa-solid fa-star"></i>{c}</li>' for c in lst)


def generate_for_grade(grade: str):
    cfg = GRADE_CONFIG[grade]
    grade_dir = os.path.join(BASE_DIR, cfg["dir"])
    sommaire = load_json(os.path.join(grade_dir, f"sommaire_{grade}.json"))
    competences = load_json(os.path.join(grade_dir, f"competences_{grade}.json"))
    capacites = load_json(os.path.join(grade_dir, f"capacites_{grade}.json"))

    for chapters in sommaire.values():
        for chapitre in chapters:
            titre = chapitre["chapitre"]
            fichier = chapitre["fichier"]
            pdf_file = fichier.replace(".html", ".pdf")
            pdf_preview = fichier.replace(".html", "_preview.png")
            video_url = "https://www.youtube.com/embed/u-bqCheDpHc"

            comp_list = competences.get(fichier, competences.get("default", []))
            cap_list = capacites.get(fichier, capacites.get("default", []))

            html_content = HTML_TEMPLATE.format(
                titre=titre,
                header=cfg["header"],
                return_page=cfg["return_page"],
                grade_label=grade,
                capacites=create_capacites_html(cap_list),
                competences=create_competences_html(comp_list),
                pdf_file=pdf_file,
                pdf_preview=pdf_preview,
                video_url=video_url,
                resources='\n                        '.join(cfg["resources"]),
            )

            output_path = os.path.join(grade_dir, fichier)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html_content)
    print(f"Fichiers HTML g\u00e9n\u00e9r\u00e9s pour le niveau {grade}.")


def main():
    parser = argparse.ArgumentParser(description="G\u00e9n\u00e8re les pages HTML de cours pour diff\u00e9rents niveaux.")
    parser.add_argument(
        "--grade",
        nargs="*",
        choices=list(GRADE_CONFIG.keys()),
        default=list(GRADE_CONFIG.keys()),
        help="Niveaux \u00e0 traiter (par d\u00e9faut tous)"
    )
    args = parser.parse_args()

    for g in args.grade:
        generate_for_grade(g)


if __name__ == "__main__":
    main()
