def purger_mesures_extremes(liste_mesures):
    """Modifie la liste en place et ne conserve que les températures 20 à 25 °C."""
    pass


mesures = [{'temperature': 18}, {'temperature': 19}, {'temperature': 22}, {'temperature': 28}, {'temperature': 29}]
purger_mesures_extremes(mesures)
assert mesures == [{'temperature': 22}]
