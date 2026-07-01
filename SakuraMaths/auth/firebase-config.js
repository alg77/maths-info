// Cette configuration identifie l'application Firebase ; elle n'est pas un mot de passe.
export const firebaseConfig = {
  apiKey: "AIzaSyAgfVtCXHvtk3C3YKnrZdCeAHcHI-c1_G4",
  authDomain: "sakuramaths-44708.firebaseapp.com",
  projectId: "sakuramaths-44708",
  storageBucket: "sakuramaths-44708.firebasestorage.app",
  messagingSenderId: "142017117980",
  appId: "1:142017117980:web:c7ea1799a4f324722044d9",
  measurementId: "G-DVCNLFPC79"
};

export const firebaseConfigured = !Object.values(firebaseConfig).some(value =>
  String(value).includes("A_CONFIGURER")
);
