/* ============================================================
   Banque de questions — QCM 4ᵉ
   Chapitre N1 · Additionner et soustraire des nombres relatifs
   Format attendu par qcm-4eme.html :
     { chapitre, source, question, choix:[...], bonnesReponses:[index...], explication }
   bonnesReponses = indices (commençant à 0) des bonnes réponses.
   ============================================================ */
window.QUESTIONS_4EME = [

  /* ---------- N1 — Addition (+) ---------- */
  { chapitre: "N1 — Addition (+)", source: "facile",
    question: "(+ 7) + (+ 5) = ?",
    choix: ["+ 12", "− 12", "+ 2", "− 2"],
    bonnesReponses: [0],
    explication: "Mêmes signes : on garde le signe commun (+) et on ajoute les distances à zéro : 7 + 5 = 12." },

  { chapitre: "N1 — Addition (+)", source: "facile",
    question: "(− 8) + (− 6) = ?",
    choix: ["− 2", "− 14", "+ 14", "+ 2"],
    bonnesReponses: [1],
    explication: "Mêmes signes (−) : on garde le signe − et on ajoute les distances : 8 + 6 = 14, donc − 14." },

  { chapitre: "N1 — Addition (+)", source: "moyen",
    question: "(+ 9) + (− 4) = ?",
    choix: ["− 5", "+ 13", "+ 5", "− 13"],
    bonnesReponses: [2],
    explication: "Signes contraires : on soustrait les distances (9 − 4 = 5) et on garde le signe du plus éloigné de zéro (+ 9), donc + 5." },

  { chapitre: "N1 — Addition (+)", source: "moyen",
    question: "(− 7) + (+ 3) = ?",
    choix: ["+ 4", "− 4", "− 10", "+ 10"],
    bonnesReponses: [1],
    explication: "Signes contraires : 7 − 3 = 4. Le plus éloigné de zéro est − 7, donc le résultat est négatif : − 4." },

  { chapitre: "N1 — Addition (+)", source: "facile",
    question: "(− 2,5) + (+ 2,5) = ?",
    choix: ["+ 5", "− 5", "0", "+ 0,5"],
    bonnesReponses: [2],
    explication: "Deux nombres opposés : leur somme vaut toujours 0." },

  { chapitre: "N1 — Addition (+)", source: "difficile",
    question: "(− 3) + (+ 8) + (− 5) = ?",
    choix: ["+ 6", "0", "− 6", "+ 10"],
    bonnesReponses: [1],
    explication: "On regroupe : (− 3) + (− 5) = − 8, puis − 8 + 8 = 0." },

  /* ---------- N1 — Soustraction (−) ---------- */
  { chapitre: "N1 — Soustraction (−)", source: "facile",
    question: "(+ 6) − (+ 10) = ?",
    choix: ["+ 16", "− 4", "+ 4", "− 16"],
    bonnesReponses: [1],
    explication: "Soustraire, c'est ajouter l'opposé : 6 + (− 10). Signes contraires : 10 − 6 = 4, signe du plus grand (−), donc − 4." },

  { chapitre: "N1 — Soustraction (−)", source: "moyen",
    question: "(− 5) − (− 8) = ?",
    choix: ["+ 3", "− 3", "− 13", "+ 13"],
    bonnesReponses: [0],
    explication: "Soustraire − 8 revient à ajouter + 8 : − 5 + 8 = + 3." },

  { chapitre: "N1 — Soustraction (−)", source: "moyen",
    question: "(− 4) − (+ 7) = ?",
    choix: ["+ 3", "+ 11", "− 11", "− 3"],
    bonnesReponses: [2],
    explication: "− 4 − (+ 7) = − 4 + (− 7). Mêmes signes (−) : 4 + 7 = 11, donc − 11." },

  { chapitre: "N1 — Soustraction (−)", source: "facile",
    question: "3 − 9 = ?",
    choix: ["+ 6", "− 6", "− 12", "+ 12"],
    bonnesReponses: [1],
    explication: "3 + (− 9). Signes contraires : 9 − 3 = 6, signe du plus grand (−), donc − 6." },

  { chapitre: "N1 — Soustraction (−)", source: "difficile",
    question: "(− 12) − (− 2) = ?",
    choix: ["− 14", "+ 10", "− 10", "+ 14"],
    bonnesReponses: [2],
    explication: "Soustraire − 2 revient à ajouter + 2 : − 12 + 2 = − 10." },

  /* ---------- N1 — Enchaînements ---------- */
  { chapitre: "N1 — Enchaînements", source: "moyen",
    question: "(− 1) + 3 − (− 7) = ?",
    choix: ["+ 9", "− 9", "+ 5", "− 5"],
    bonnesReponses: [0],
    explication: "On transforme : − 1 + 3 + 7 = + 9." },

  { chapitre: "N1 — Enchaînements", source: "moyen",
    question: "2 − 5 + 8 − 4 = ?",
    choix: ["− 1", "+ 1", "+ 5", "− 5"],
    bonnesReponses: [1],
    explication: "Positifs : 2 + 8 = 10. Négatifs : 5 + 4 = 9. Puis 10 − 9 = + 1." },

  { chapitre: "N1 — Enchaînements", source: "difficile",
    question: "− 5 − (8 − 16) + (7 − 9) = ?",
    choix: ["− 1", "+ 3", "+ 1", "− 3"],
    bonnesReponses: [2],
    explication: "Les parenthèses d'abord : 8 − 16 = − 8 et 7 − 9 = − 2. Donc − 5 − (− 8) + (− 2) = − 5 + 8 − 2 = + 1." },

  /* ---------- N1 — Simplifier l'écriture ---------- */
  { chapitre: "N1 — Simplifier l'écriture", source: "facile",
    question: "a − (− b) est égal à :",
    choix: ["a − b", "a + b", "− a + b", "− a − b"],
    bonnesReponses: [1],
    explication: "Soustraire un nombre revient à ajouter son opposé : a − (− b) = a + b." },

  { chapitre: "N1 — Simplifier l'écriture", source: "facile",
    question: "a + (− b) est égal à :",
    choix: ["a + b", "b − a", "a − b", "− a − b"],
    bonnesReponses: [2],
    explication: "Ajouter un nombre négatif revient à soustraire : a + (− b) = a − b." },

  { chapitre: "N1 — Simplifier l'écriture", source: "moyen",
    question: "L'écriture simplifiée de (+ 5) + (− 3) − (+ 2) est :",
    choix: ["5 − 3 − 2", "5 + 3 + 2", "5 − 3 + 2", "− 5 − 3 − 2"],
    bonnesReponses: [0],
    explication: "On enlève les parenthèses superflues : + (− 3) devient − 3, et − (+ 2) devient − 2. On obtient 5 − 3 − 2." }

];
