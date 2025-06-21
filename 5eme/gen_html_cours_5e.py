import os
import sys

# Ajoute le répertoire parent au chemin pour permettre l'import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generate_courses import generate_for_grade

if __name__ == "__main__":
    generate_for_grade("5e")
