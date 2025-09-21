import os

# Chemin vers le dossier contenant les fichiers à renommer
folder_path = "./"

# Liste des fichiers dans le dossier
files = os.listdir(folder_path)
print(folder_path)
print(files)

# Filtre les fichiers qui correspondent à "Page de garde_page-000X.jpg"
files_to_rename = [f for f in files if f.endswith(".jpg")]
print(files_to_rename)

# Renommer chaque fichier
for idx, filename in enumerate(sorted(files_to_rename), start=1):
    # Créer le nouveau nom, en ajoutant le numéro formaté (ex : "01-Page de garde.jpg")
    new_name = f"{str(idx).zfill(2)}-Page de garde.jpg"
    
    # Chemin complet des anciens et nouveaux fichiers
    old_file = os.path.join(folder_path, filename)
    new_file = os.path.join(folder_path, new_name)
    
    # Renommer le fichier
    os.rename(old_file, new_file)
    print(f"Renommé : {filename} -> {new_name}")

print("Renommage terminé.")
