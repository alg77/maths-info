def salaire_moyen_condition(employes, champ, valeur):
    """Renvoie la moyenne demandée, ou None si aucun employé ne convient."""
    pass


employes = [{'sexe': 'F', 'salaire': 2200}, {'sexe': 'M', 'salaire': 2600}, {'sexe': 'F', 'salaire': 2400}]
assert salaire_moyen_condition([], 'sexe', 'F') is None
assert salaire_moyen_condition(employes, 'sexe', 'F') == 2300
