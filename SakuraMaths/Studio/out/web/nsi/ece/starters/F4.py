from math import sqrt


def sexe_vers_entier(e):
    return 1 if e['sexe'] == 'F' else -1


def distance(e1, e2):
    s = (sexe_vers_entier(e1) - sexe_vers_entier(e2)) ** 2
    s += (e1['experience'] - e2['experience']) ** 2
    s += (e1['etudes'] - e2['etudes']) ** 2
    return sqrt(s)


# Modifie distance pour qu'un critère discriminant n'influence plus le salaire.
