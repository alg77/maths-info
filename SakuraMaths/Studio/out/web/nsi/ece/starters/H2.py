class Plante:
    def __init__(self, nom):
        self.nom = nom


def dictionnaire_mesure(plantes, mesures):
    pass


plantes = [Plante('Basilic'), Plante('Menthe')]
mesures = [{'plante': 'Basilic', 'temperature': 22}]
assert dictionnaire_mesure(plantes, mesures) == {'Basilic': mesures, 'Menthe': []}
