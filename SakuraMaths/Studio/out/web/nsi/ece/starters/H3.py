def purger_mesures_extremes(liste_mesures):
    for mesure in liste_mesures:
        if mesure['temperature'] < 20 or mesure['temperature'] > 25:
            liste_mesures.remove(mesure)


mesures = [{'temperature': 18}, {'temperature': 19}, {'temperature': 22}, {'temperature': 28}, {'temperature': 29}]
purger_mesures_extremes(mesures)
print(mesures)
# Explique pourquoi 19 et 29 restent dans la liste.
