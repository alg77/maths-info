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


def calendrier_cycles(date_regles):
    cal_lignes = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:']
    date_courante = date_regles
    jours_ecoules = 0
    while jours_ecoules + 28 <= 100:
        jour, mois, annee = date_courante
        date = str(annee) + str(mois) + str(jour)
        cal_lignes += ['BEGIN:VEVENT', 'SUMMARY:Règles', 'DTSTART:' + date, 'END:VEVENT']
        date_courante = ajouter_jours(date_courante, 28)
        jours_ecoules += 28
    cal_lignes.append('END:VCALENDAR')
    return '\n'.join(cal_lignes)


# Corrige PRODID, le format de date et la condition de boucle.
