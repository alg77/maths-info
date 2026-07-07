def salaire_moyen_condition(employes, champ, valeur):
    salaires = [e['salaire'] for e in employes if e[champ] == valeur]
    return None if not salaires else sum(salaires) / len(salaires)


def calcul_ecart_sexe(employes):
    """Renvoie l'écart de salaire des femmes par rapport aux hommes, en %."""
    moy_h = salaire_moyen_condition(employes, 'sexe', 'M')
    moy_f = salaire_moyen_condition('employes', 'sexe', 'F')
    return moy_h - moy_f
