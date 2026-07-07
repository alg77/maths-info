class Plante:
    def __init__(self, debut, fin):
        self.croissance = fin - debut


def croissance_moyenne(plantes):
    pass


assert croissance_moyenne([]) is None
assert croissance_moyenne([Plante(4, 7), Plante(2, 5)]) == 3
