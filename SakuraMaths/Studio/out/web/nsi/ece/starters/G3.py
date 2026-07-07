import calendar


def jours_dans_mois(annee, mois):
    return calendar.monthrange(annee, mois)[1]


def ajouter_jours(date, nb_jours):
    jour, mois, annee = date
    jour += nb_jours
    while jour > jours_dans_mois(annee, mois):
        jour -= jours_dans_mois(annee, mois)
        mois += 1
        if mois > 12:
            mois, annee = 1, annee + 1
    return jour, mois, annee


# Ajoute au moins trois tests couvrant des changements de mois ou d'année.
