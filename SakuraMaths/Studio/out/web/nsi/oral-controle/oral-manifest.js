window.ORAL_NSI = {
  source: "https://nsi-snt.ac-normandie.fr/exercices-pour-l-oral-de-controle-en-nsi",
  modalites: {
    preparation: 20,
    entretien: 20,
    consigne: "Choisir au moins deux questions portant sur des parties différentes du programme."
  },
  themes: [
    { id: "arbres", label: "Arbres binaires", count: 4 },
    { id: "bdd", label: "Bases de données", count: 7 },
    { id: "graphes", label: "Graphes", count: 3 },
    { id: "poo", label: "Programmation objet", count: 3 },
    { id: "routage", label: "Protocoles de routage", count: 2 },
    { id: "structures", label: "Structures linéaires", count: 4, file: "struct_lineaires" },
    { id: "programmation", label: "Programmation", count: 2 }
  ]
};

ORAL_NSI.exercices = ORAL_NSI.themes.flatMap(theme =>
  Array.from({ length: theme.count }, (_, index) => {
    const numero = index + 1;
    const stem = theme.file || theme.id;
    return {
      id: `${theme.id}-${numero}`,
      theme: theme.id,
      themeLabel: theme.label,
      numero,
      titre: `${theme.label} — exercice ${numero}`,
      pdf: `https://nsi-snt.ac-normandie.fr/IMG/pdf/${stem}_sujet${numero}.pdf`
    };
  })
);
