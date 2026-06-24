/**
 * Carnet de séance — serveur Apps Script (v9)
 * + capacités/savoir-faire à revoir (liste par éval + cases par élève)
 * + devoirs : ajout avec date du prochain cours, affichage des devoirs dus en séance
 *
 * Après collage : lance UNE FOIS  migrate()  (ajoute colonnes Remarques/Revoir, onglet Devoirs).
 */

const CONFIG = {
  CAL_IDS: [],
  TZ: 'Europe/Paris',
  TRIMESTRES: [
    { n: 1, start: '2025-09-01', end: '2025-12-01' },
    { n: 2, start: '2025-12-02', end: '2026-03-01' },
    { n: 3, start: '2026-03-02', end: '2026-06-15' }
  ]
};

const COMPS = ['Ch', 'Mo', 'Re', 'Ra', 'Ca', 'Co'];
const SUBCODES = ['Ch1','Ch2','Ch3','Ch4','Mo1','Mo2','Mo3','Mo4','Re1','Re2','Re3','Re4',
                  'Ra1','Ra2','Ra3','Ra4','Ca1','Ca2','Ca3','Co1','Co2','Co3'];
const EVENTS = ['P', 'IntPlus', 'IntMoins', 'Tplus', 'Tmoins', 'B', 'G',
                'MotOubli', 'MotTNF', 'MotAttitude', 'Retenue', 'Abs', 'R', 'O', 'I'];

const JOURNAL_COLS    = ['Date', 'Classe', 'Eleve'].concat(EVENTS).concat(['Commentaire', 'MAJ']);
const ELEVES_COLS     = ['Classe', 'Prenom'];
const MAITRISE_COLS   = ['Classe', 'Eleve'].concat(COMPS);
const EVAL_COLS       = ['Date', 'Classe', 'Eleve', 'Eval', 'Note', 'Bareme'].concat(SUBCODES).concat(['Revoir', 'Remarque']);
const EVALCONFIG_COLS = ['Classe', 'Eval', 'Date', 'Bareme', 'Coeff', 'Items', 'Remarques', 'S1', 'S2', 'S3'];
const PROFILS_COLS    = ['Classe', 'Eleve', 'PAP', 'TiersTemps', 'Gevasco', 'Remarques'];
const DEVOIRS_COLS    = ['Classe', 'DateDue', 'Texte', 'Cree'];
const PP_COLS         = ['Classe', 'Eleve', 'Matiere', 'T1', 'T2', 'T3'];
const PP_APPMAT_COLS  = ['Classe', 'Eleve', 'Matiere', 'T1', 'T2', 'T3'];
const PP_BILAN_COLS   = ['Classe', 'Eleve', 'Trimestre', 'Moyenne', 'Appreciation', 'MAJ'];
const REFERENTIEL_COLS = ['Niveau', 'ChapCode', 'ChapTitre', 'ChapTheme', 'CompsProg', 'ObjCode', 'Famille', 'Texte'];
const SHEET_COLS = {
  Eleves: ELEVES_COLS, Journal: JOURNAL_COLS, Maitrise: MAITRISE_COLS,
  Evaluations: EVAL_COLS, EvalConfig: EVALCONFIG_COLS, Profils: PROFILS_COLS, Devoirs: DEVOIRS_COLS,
  PP: PP_COLS, PP_AppMat: PP_APPMAT_COLS, PP_Bilan: PP_BILAN_COLS, Referentiel: REFERENTIEL_COLS
};

/* ----------------------------- web app ---------------------------- */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Carnet de séance').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
function diagnostic() {
  var out = [], ss = ss_();
  if (!ss) { Logger.log('⚠️ Script non lié à un classeur.'); return; }
  out.push('Classeur : ' + ss.getName() + '  —  ' + ss.getUrl());
  out.push('Onglets  : ' + ss.getSheets().map(function (s) { return s.getName(); }).join(', '));
  out.push('\nAGENDAS (nom + ID) :');
  CalendarApp.getAllCalendars().forEach(function (c) { out.push('  • ' + c.getName() + '  [' + c.getId() + ']'); });
  Logger.log(out.join('\n'));
}
function migrate() {
  var ss = ss_(); if (!ss) { Logger.log('Non lié à un classeur.'); return; }
  Object.keys(SHEET_COLS).forEach(function (n) {
    var sh = ss.getSheetByName(n) || ss.insertSheet(n);
    var cols = SHEET_COLS[n], lastCol = sh.getLastColumn();
    var header = lastCol ? sh.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    if (!header.length) { sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold'); sh.setFrozenRows(1); return; }
    var have = {}; header.forEach(function (h) { have[h] = true; });
    var missing = cols.filter(function (c) { return !have[c]; });
    if (missing.length) sh.getRange(1, header.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold');
  });
  ss.toast('Colonnes à jour ✓');
}
function setup() { migrate(); }

/* ----------------------------- agenda ----------------------------- */

function getSeancesDuJour(isoDate) {
  const date = parseIso_(isoDate), cals = getCalendars_(), classes = getClasses_(), seen = {}, out = [];
  cals.forEach(function (cal) {
    cal.getEventsForDay(date).forEach(function (e) {
      var key = e.getId ? e.getId() : (e.getTitle() + e.getStartTime());
      if (seen[key]) return; seen[key] = true;
      out.push({
        titre: e.getTitle() || '', classe: matchClasse_(e.getTitle() || '', classes), agenda: cal.getName(),
        debut: Utilities.formatDate(e.getStartTime(), CONFIG.TZ, 'HH:mm'),
        fin: Utilities.formatDate(e.getEndTime(), CONFIG.TZ, 'HH:mm'),
        salle: e.getLocation() || '', contenu: e.getDescription() || ''
      });
    });
  });
  return out.sort(function (a, b) { return a.debut.localeCompare(b.debut); });
}
function getCalendars_() {
  if (CONFIG.CAL_IDS && CONFIG.CAL_IDS.length)
    return CONFIG.CAL_IDS.map(function (id) { return CalendarApp.getCalendarById(id); }).filter(function (c) { return c; });
  return CalendarApp.getAllCalendars();
}
function nextCourse_(classe, afterIso) {
  var start = parseIso_(afterIso); start.setDate(start.getDate() + 1);
  var end = new Date(start.getTime()); end.setDate(end.getDate() + 21);
  var best = null;
  getCalendars_().forEach(function (cal) {
    cal.getEvents(start, end).forEach(function (e) {
      if (matchClasse_(e.getTitle() || '', [classe]) === classe) {
        var t = e.getStartTime(); if (!best || t < best) best = t;
      }
    });
  });
  return best ? Utilities.formatDate(best, CONFIG.TZ, 'yyyy-MM-dd') : '';
}

/* -------------------------- séance (obs) -------------------------- */

function getSeanceData(isoDate, classe) {
  const journal = readJournal_(isoDate, classe), part = readParticipation_(classe), profils = readProfils_(classe);
  return {
    classe: classe,
    devoirs: getDevoirsDue_(classe, isoDate),
    nextCourse: nextCourse_(classe, isoDate),
    eleves: readEleves_(classe).map(function (p) {
      var pr = profils[p] || {};
      return {
        prenom: p, obs: journal[p] || emptyObs_(), part: part[p] || { p: 0, ip: 0, im: 0 },
        pap: String(pr.PAP || '').trim() !== '', tiersTemps: String(pr.TiersTemps || '').trim() !== ''
      };
    })
  };
}

function saveSeance(isoDate, classe, eleves) {
  const sh = sheet_('Journal'), values = sh.getDataRange().getValues(), header = values[0], idx = colIndex_(header), rowOf = {};
  for (var r = 1; r < values.length; r++) rowOf[isoKey_(values[r][idx.Date], values[r][idx.Classe], values[r][idx.Eleve])] = r + 1;
  const stamp = Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss'), appended = [], toDelete = [];
  eleves.forEach(function (el) {
    var key = isoKey_(isoDate, classe, el.prenom);
    if (isEmptyObs_(el.obs || {})) { if (rowOf[key]) toDelete.push(rowOf[key]); return; }
    var row = buildJournalRow_(header, isoDate, classe, el, stamp);
    if (rowOf[key]) sh.getRange(rowOf[key], 1, 1, header.length).setValues([row]); else appended.push(row);
  });
  if (appended.length) sh.getRange(sh.getLastRow() + 1, 1, appended.length, header.length).setValues(appended);
  toDelete.sort(function (a, b) { return b - a; }).forEach(function (rn) { sh.deleteRow(rn); });
  return { ok: true, at: Utilities.formatDate(new Date(), CONFIG.TZ, 'HH:mm:ss') };
}

function isEmptyObs_(obs) {
  for (var i = 0; i < EVENTS.length; i++) if (Number(obs[EVENTS[i]]) > 0) return false;
  return !(obs.Commentaire && String(obs.Commentaire).trim());
}
function readParticipation_(classe) {
  var sh = sheet_('Journal'), out = {};
  if (sh.getLastRow() < 2) return out;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idx.Classe]) !== String(classe)) continue;
    var e = String(vals[r][idx.Eleve]); if (!out[e]) out[e] = { p: 0, ip: 0, im: 0 };
    out[e].p += Number(vals[r][idx.P]) || 0;
  }
  return out;
}
function readProfils_(classe) {
  var sh = sheet_('Profils'), out = {};
  if (sh.getLastRow() < 2) return out;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idx.Classe]) !== String(classe)) continue;
    out[String(vals[r][idx.Eleve])] = { PAP: vals[r][idx.PAP], TiersTemps: vals[r][idx.TiersTemps], Gevasco: vals[r][idx.Gevasco], Remarques: vals[r][idx.Remarques] };
  }
  return out;
}

/* ----------------------------- devoirs ---------------------------- */

function getDevoirsDue_(classe, iso) {
  var sh = sheet_('Devoirs'), out = [];
  if (sh.getLastRow() < 2) return out;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idx.Classe]) === String(classe) && normDate_(vals[r][idx.DateDue]) === iso)
      out.push(String(vals[r][idx.Texte]));
  }
  return out;
}
function addDevoir(classe, dateDue, texte) {
  if (!texte || !String(texte).trim()) return { ok: false };
  var sh = sheet_('Devoirs');
  sh.appendRow([classe, dateDue, String(texte).trim(), Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd HH:mm')]);
  return { ok: true };
}

/* --------------------------- évaluations -------------------------- */

function listEvals(classe) {
  var sh = sheet_('EvalConfig'), out = [];
  if (sh.getLastRow() < 2) return out;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idx.Classe]) !== String(classe)) continue;
    out.push({ eval: String(vals[r][idx.Eval]), date: normDate_(vals[r][idx.Date]) });
  }
  return out.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
}
function getCapacitesLibrary() {
  var sh = sheet_('EvalConfig'), set = {};
  if (sh.getLastRow() >= 2) {
    var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
    for (var r = 1; r < vals.length; r++)
      String(vals[r][idx.Remarques] || '').split('\n').forEach(function (s) { s = s.trim(); if (s) set[s] = true; });
  }
  return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
}
function getClasses() { return getClasses_(); }
function getClassOverview(classe) {
  var eleves = readEleves_(classe), evals = listEvals(classe);
  var fams = ['Ch', 'Mo', 'Re', 'Ra', 'Ca', 'Co'];
  var per = {}; eleves.forEach(function (p) { per[p] = { sum: 0, cnt: 0, fam: {} }; fams.forEach(function (f) { per[p].fam[f] = { s: 0, n: 0 }; }); });
  var evalsOut = evals.map(function (e) {
    var s = getEvalSetup(classe, e.eval), b = s.bareme || 20, notes = [];
    eleves.forEach(function (p) {
      var r = s.data[p];
      if (!r) return;
      if (r.note !== '' && r.note != null) {
        var v = Number(String(r.note).replace(',', '.'));
        if (!isNaN(v)) { notes.push(v); per[p].sum += v / b * 20; per[p].cnt++; }
      }
      if (r.levels) { Object.keys(r.levels).forEach(function (c) { var lv = Number(r.levels[c]) || 0; if (lv > 0) { var f = c.slice(0, 2); if (per[p].fam[f]) { per[p].fam[f].s += lv; per[p].fam[f].n++; } } }); }
    });
    var mean = notes.length ? notes.reduce(function (a, c) { return a + c; }, 0) / notes.length : null;
    return { eval: e.eval, date: e.date, bareme: b, n: notes.length, mean20: (mean == null ? null : mean / b * 20) };
  });
  var beh = readAllBehavior_(classe);
  var students = eleves.map(function (p) {
    var mait = {}; fams.forEach(function (f) { mait[f] = per[p].fam[f].n ? per[p].fam[f].s / per[p].fam[f].n : 0; });
    return { prenom: p, avg20: (per[p].cnt ? per[p].sum / per[p].cnt : null), n: per[p].cnt, maitrise: mait, behavior: (beh[p] || {}) };
  });
  return { classe: classe, count: eleves.length, evals: evalsOut, students: students };
}
function readBehavior_(classe, prenom) {
  var keys = ['P', 'Tmoins', 'B', 'O', 'G', 'R', 'Abs', 'I', 'Retenue'], o = {};
  keys.forEach(function (k) { o[k] = 0; });
  var sh = sheet_('Journal'); if (sh.getLastRow() < 2) return o;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idx.Classe]) !== String(classe) || String(vals[r][idx.Eleve]) !== String(prenom)) continue;
    keys.forEach(function (k) { if (idx[k] != null) o[k] += Number(vals[r][idx[k]]) || 0; });
  }
  return o;
}
function readAllBehavior_(classe) {
  var keys = ['P', 'Tmoins', 'B', 'O', 'G', 'R', 'Abs', 'I', 'Retenue'], out = {};
  var sh = sheet_('Journal'); if (sh.getLastRow() < 2) return out;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idx.Classe]) !== String(classe)) continue;
    var p = String(vals[r][idx.Eleve]); if (!out[p]) { out[p] = {}; keys.forEach(function (k) { out[p][k] = 0; }); }
    keys.forEach(function (k) { if (idx[k] != null) out[p][k] += Number(vals[r][idx[k]]) || 0; });
  }
  return out;
}
function getStudentDetail(classe, prenom) {
  var profils = readProfils_(classe), profil = profils[prenom] || { PAP: '', TiersTemps: '', Gevasco: '', Remarques: '' };
  var evals = listEvals(classe).slice().reverse();
  var timeline = evals.map(function (e) {
    var s = getEvalSetup(classe, e.eval), b = s.bareme || 20, r = s.data[prenom] || { note: '', levels: {}, revoir: [], remarque: '' };
    var note = (r.note === '' || r.note == null) ? null : Number(String(r.note).replace(',', '.')); if (note != null && isNaN(note)) note = null;
    var notes = []; Object.keys(s.data).forEach(function (k) { var rr = s.data[k]; if (rr && rr.note !== '' && rr.note != null) { var v = Number(String(rr.note).replace(',', '.')); if (!isNaN(v)) notes.push(v); } });
    var cm = notes.length ? notes.reduce(function (a, c) { return a + c; }, 0) / notes.length : null;
    return { eval: e.eval, date: e.date, bareme: b, note: note, note20: (note == null ? null : note / b * 20), classMean20: (cm == null ? null : cm / b * 20), levels: r.levels || {}, revoir: (r.revoir || []), remarque: (r.remarque || '') };
  });
  var fams = ['Ch', 'Mo', 'Re', 'Ra', 'Ca', 'Co'], acc = {}; fams.forEach(function (f) { acc[f] = { s: 0, n: 0 }; });
  timeline.forEach(function (t) { Object.keys(t.levels).forEach(function (c) { var lv = Number(t.levels[c]) || 0; if (lv > 0) { var f = c.slice(0, 2); if (acc[f]) { acc[f].s += lv; acc[f].n++; } } }); });
  var maitrise = {}; fams.forEach(function (f) { maitrise[f] = acc[f].n ? acc[f].s / acc[f].n : 0; });
  return { classe: classe, prenom: prenom, profil: profil, timeline: timeline, maitrise: maitrise, behavior: readBehavior_(classe, prenom) };
}
function getEvalSetup(classe, evalName) {
  var cfg = { date: '', bareme: 20, coeff: 1, items: [], remarques: [], seuils: [0.30, 0.65, 0.80] };
  var shc = sheet_('EvalConfig');
  if (shc.getLastRow() >= 2) {
    var cv = shc.getDataRange().getValues(), ci = colIndex_(cv[0]);
    for (var r = 1; r < cv.length; r++) {
      if (String(cv[r][ci.Classe]) === String(classe) && String(cv[r][ci.Eval]) === String(evalName)) {
        cfg.date = normDate_(cv[r][ci.Date]); cfg.bareme = Number(cv[r][ci.Bareme]) || 20;
        cfg.coeff = (cv[r][ci.Coeff] === '' || cv[r][ci.Coeff] == null) ? 1 : (Number(cv[r][ci.Coeff]) || 1);
        cfg.items = String(cv[r][ci.Items] || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        cfg.remarques = String(cv[r][ci.Remarques] || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        cfg.seuils = [Number(cv[r][ci.S1]) || 0.30, Number(cv[r][ci.S2]) || 0.65, Number(cv[r][ci.S3]) || 0.80];
        break;
      }
    }
  }
  var data = {}, she = sheet_('Evaluations');
  if (she.getLastRow() >= 2) {
    var ev = she.getDataRange().getValues(), ei = colIndex_(ev[0]);
    for (var r2 = 1; r2 < ev.length; r2++) {
      if (String(ev[r2][ei.Classe]) !== String(classe) || String(ev[r2][ei.Eval]) !== String(evalName)) continue;
      var levels = {}; SUBCODES.forEach(function (c) { var v = ev[r2][ei[c]]; levels[c] = (v === '' || v == null) ? 0 : (Number(v) || 0); });
      var revoir = String((ei.Revoir != null ? ev[r2][ei.Revoir] : '') || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var remarque = String((ei.Remarque != null ? ev[r2][ei.Remarque] : '') || '');
      data[String(ev[r2][ei.Eleve])] = { note: (ev[r2][ei.Note] == null ? '' : ev[r2][ei.Note]), levels: levels, revoir: revoir, remarque: remarque };
    }
  }
  return { eval: evalName, date: cfg.date, bareme: cfg.bareme, coeff: cfg.coeff, items: cfg.items, remarques: cfg.remarques, seuils: cfg.seuils, data: data };
}
function saveEval(classe, evalName, payload) {
  var items = payload.items || [], itemset = {}; items.forEach(function (c) { itemset[c] = true; });
  var remarques = payload.remarques || [];
  var seuils = payload.seuils || [0.30, 0.65, 0.80], bareme = Number(payload.bareme) || 20;
  var coeff = (payload.coeff === '' || payload.coeff == null) ? 1 : (Number(payload.coeff) || 1);
  var isoDate = payload.date || Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd');

  var shc = sheet_('EvalConfig'), cv = shc.getDataRange().getValues(), ch = cv[0], ci = colIndex_(ch), crow = -1;
  for (var r = 1; r < cv.length; r++) if (String(cv[r][ci.Classe]) === String(classe) && String(cv[r][ci.Eval]) === String(evalName)) { crow = r + 1; break; }
  var configRow = ch.map(function (h) {
    if (h === 'Classe') return classe; if (h === 'Eval') return evalName; if (h === 'Date') return isoDate;
    if (h === 'Bareme') return bareme; if (h === 'Coeff') return coeff; if (h === 'Items') return items.join(',');
    if (h === 'Remarques') return remarques.join('\n');
    if (h === 'S1') return seuils[0]; if (h === 'S2') return seuils[1]; if (h === 'S3') return seuils[2]; return '';
  });
  if (crow > 0) shc.getRange(crow, 1, 1, ch.length).setValues([configRow]);
  else shc.getRange(shc.getLastRow() + 1, 1, 1, ch.length).setValues([configRow]);

  var she = sheet_('Evaluations'), ev = she.getDataRange().getValues(), eh = ev[0], ei = colIndex_(eh), rowOf = {};
  for (var r2 = 1; r2 < ev.length; r2++) rowOf[String(ev[r2][ei.Classe]) + '|' + String(ev[r2][ei.Eleve]) + '|' + String(ev[r2][ei.Eval])] = r2 + 1;
  var appended = [];
  (payload.eleves || []).forEach(function (el) {
    var lv = el.levels || {}, rv = (el.revoir || []).join(' | ');
    var row = eh.map(function (h) {
      if (h === 'Date') return isoDate; if (h === 'Classe') return classe; if (h === 'Eleve') return el.prenom;
      if (h === 'Eval') return evalName;
      if (h === 'Note') return (el.note === '' || el.note == null) ? '' : Number(el.note);
      if (h === 'Bareme') return bareme;
      if (h === 'Revoir') return rv;
      if (h === 'Remarque') return el.remarque || '';
      if (itemset[h]) return Number(lv[h]) || 0; return '';
    });
    var key = String(classe) + '|' + String(el.prenom) + '|' + String(evalName);
    if (rowOf[key]) she.getRange(rowOf[key], 1, 1, eh.length).setValues([row]); else appended.push(row);
  });
  if (appended.length) she.getRange(she.getLastRow() + 1, 1, appended.length, eh.length).setValues(appended);

  recalcMaitrise_(classe);
  return { ok: true, at: Utilities.formatDate(new Date(), CONFIG.TZ, 'HH:mm:ss') };
}
function recalcMaitrise_(classe) {
  var she = sheet_('Evaluations'), acc = {};
  if (she.getLastRow() >= 2) {
    var ev = she.getDataRange().getValues(), ei = colIndex_(ev[0]);
    for (var r = 1; r < ev.length; r++) {
      if (String(ev[r][ei.Classe]) !== String(classe)) continue;
      var e = String(ev[r][ei.Eleve]); if (!acc[e]) acc[e] = {};
      SUBCODES.forEach(function (code) {
        var v = Number(ev[r][ei[code]]) || 0; if (v <= 0) return;
        var fam = code.slice(0, 2); if (!acc[e][fam]) acc[e][fam] = { s: 0, k: 0 }; acc[e][fam].s += v; acc[e][fam].k++;
      });
    }
  }
  var sh = sheet_('Maitrise'), width = MAITRISE_COLS.length;
  var vals = sh.getLastRow() > 0 ? sh.getDataRange().getValues() : [MAITRISE_COLS.slice()];
  var idx = colIndex_(vals[0]), keep = [MAITRISE_COLS.slice()];
  for (var r2 = 1; r2 < vals.length; r2++) if (String(vals[r2][idx.Classe]) !== String(classe)) keep.push(normRow_(vals[r2], width));
  Object.keys(acc).forEach(function (e) {
    keep.push(MAITRISE_COLS.map(function (h) {
      if (h === 'Classe') return classe; if (h === 'Eleve') return e; var a = acc[e][h]; return a ? Math.round(a.s / a.k) : 0;
    }));
  });
  sh.clearContents(); sh.getRange(1, 1, keep.length, width).setValues(keep); sh.getRange(1, 1, 1, width).setFontWeight('bold');
}

/* ----------------------------- fiches PDF ------------------------- */

function genFiches(classe, evalName) {
  var setup = getEvalSetup(classe, evalName);
  var eleves = readEleves_(classe);
  var bareme = setup.bareme || 20, seuils = setup.seuils || [0.30, 0.65, 0.80], items = setup.items || [];
  var cut = [bareme * seuils[0], bareme * seuils[1], bareme * seuils[2]];
  var LVLCOL = { 1: '#c75f57', 2: '#a9762e', 3: '#5183c0', 4: '#5aa06a' };
  function lvlOfNote(n) { if (n === '' || n == null) return 0; n = Number(String(n).replace(',', '.')); if (isNaN(n)) return 0; if (n <= cut[0]) return 1; if (n <= cut[1]) return 2; if (n <= cut[2]) return 3; return 4; }

  var empty = '<td style="width:50%;padding:4px"></td>';
  function lab(t) { return '<div class="lab" style="margin:7px 0 3px">' + t + '</div>'; }
  function radarSVG(its, levels) {
    var n = its.length; if (n < 3) return '';
    var size = 138, cx = size / 2, cy = size / 2, R = 45, rings = '', axes = '', labels = '', dp = [], i, a;
    for (var r = 1; r <= 4; r++) {
      var pp = [];
      for (i = 0; i < n; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / n; pp.push((cx + R * r / 4 * Math.cos(a)).toFixed(1) + ',' + (cy + R * r / 4 * Math.sin(a)).toFixed(1)); }
      rings += '<polygon points="' + pp.join(' ') + '" fill="none" stroke="#e3d9c7" stroke-width="0.8"/>';
    }
    for (i = 0; i < n; i++) {
      a = -Math.PI / 2 + i * 2 * Math.PI / n;
      var ex = cx + R * Math.cos(a), ey = cy + R * Math.sin(a);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="#e3d9c7" stroke-width="0.8"/>';
      var lv = Number(levels[its[i]]) || 0;
      dp.push((cx + R * lv / 4 * Math.cos(a)).toFixed(1) + ',' + (cy + R * lv / 4 * Math.sin(a)).toFixed(1));
      var lx = cx + (R + 10) * Math.cos(a), ly = cy + (R + 10) * Math.sin(a) + 3;
      labels += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" font-size="8" fill="#6f5436" text-anchor="middle" font-family="Arial">' + its[i] + '</text>';
    }
    var poly = '<polygon points="' + dp.join(' ') + '" fill="#9c7a52" fill-opacity="0.30" stroke="#6f5436" stroke-width="1.5"/>';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' + rings + axes + poly + labels + '</svg>';
  }
  var cells = eleves.map(function (p) {
    var row = setup.data[p] || { note: '', levels: {}, revoir: [], remarque: '' };
    var has = !(row.note === '' || row.note == null);
    var noteTxt = has ? (String(row.note).replace('.', ',') + ' / ' + bareme) : '—';
    var nl = lvlOfNote(row.note), nbg = nl ? LVLCOL[nl] : '#bfae93';
    var conv20 = '';
    if (bareme != 20 && has) {
      var x = Number(String(row.note).replace(',', '.')) / bareme * 20, qq = Math.round(x * 4) / 4, exact = Math.abs(x - qq) < 1e-9;
      var cv = exact ? (Math.round(qq * 100) / 100) : (Math.round(x * 10) / 10);
      conv20 = '<div style="font-size:10px;color:#fff;margin-top:1px">' + (exact ? '=' : '&#8776;') + ' ' + String(cv).replace('.', ',') + ' / 20</div>';
    }
    var badge = '<table style="border-collapse:collapse"><tr><td class="nm" style="background:' + nbg + ';color:#fff;font-size:16px;padding:5px 11px;text-align:center;letter-spacing:0">' + noteTxt + conv20 + '</td></tr></table>';
    var comp = '';
    items.forEach(function (c) { var l = Number(row.levels[c]) || 0, col = l ? LVLCOL[l] : '#b7ab93'; comp += '<span style="display:inline-block;background:' + col + ';color:#fff;padding:2px 9px;font-size:11px;font-weight:700;margin:0 4px 4px 0">' + c + (l ? ' &#183; ' + l : '') + '</span>'; });
    if (!comp) comp = '<span style="color:#a89a86">—</span>';
    var rev = (row.revoir && row.revoir.length) ? '<ul style="margin:2px 0 0;padding-left:17px;font-size:12px;line-height:1.4">' + row.revoir.map(function (x) { return '<li>' + escapeHtml_(x) + '</li>'; }).join('') + '</ul>' : '<div style="font-size:12px;color:#a89a86">—</div>';
    var remHtml = row.remarque ? '<span class="hand">' + escapeHtml_(row.remarque) + '</span>' : '';
    var radar = radarSVG(items, row.levels);
    var leftBody = lab('Compétences') + '<div>' + comp + '</div>' + lab('À revoir') + rev;
    var body = radar
      ? ('<table style="width:100%"><tr><td style="width:57%;vertical-align:top">' + leftBody + '</td><td style="width:43%;vertical-align:middle;text-align:center">' + radar + '</td></tr></table>')
      : leftBody;
    return '<td style="width:50%;vertical-align:top;padding:4px">'
      + '<table style="width:100%;border-collapse:collapse;background:#fffdf8;border:1px solid #e6ddcd"><tr><td style="padding:10px 13px">'
      + '<table style="width:100%"><tr>'
      + '<td class="pre" style="text-align:left;vertical-align:middle;width:30%">' + escapeHtml_(p) + '</td>'
      + '<td style="text-align:center;vertical-align:middle;padding:0 10px">' + remHtml + '</td>'
      + '<td style="text-align:right;vertical-align:middle;white-space:nowrap">' + badge + '</td>'
      + '</tr></table>'
      + '<div style="border-top:1px solid #ece2d2;margin:8px 0 0"></div>'
      + body
      + '</td></tr></table></td>';
  });

  var pages = '';
  for (var i = 0; i < cells.length; i += 4) {
    var r1 = '<tr>' + (cells[i] || empty) + (cells[i + 1] || empty) + '</tr>';
    var r2 = '<tr>' + (cells[i + 2] || empty) + (cells[i + 3] || empty) + '</tr>';
    var last = (i + 4 >= cells.length);
    pages += '<div style="' + (last ? '' : 'page-break-after:always;') + '">'
      + '<div style="color:#6f5436;border-bottom:2px solid #c9a96a;padding-bottom:5px;margin-bottom:7px">'
      + '<span class="ttl" style="font-size:17px">Bilan d\u2019\u00e9valuation</span> '
      + '<span style="font-size:12px;color:#9c7a52">&#8212; ' + escapeHtml_(classe) + ' &#183; ' + escapeHtml_(evalName) + '</span></div>'
      + '<table style="width:100%;border-collapse:collapse">' + r1 + r2 + '</table></div>';
  }
  if (!cells.length) pages = '<p>Aucun élève.</p>';

  var fonts = '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Oswald:wght@500;600;700&family=Caveat:wght@500;600&family=Pacifico&display=swap" rel="stylesheet">';
  var css = '@page{size:A4 landscape;margin:10mm}'
    + 'body{margin:0;font-family:"Open Sans",Arial,Helvetica,sans-serif;color:#3a342c;font-size:13px}'
    + '.nm{font-family:"Oswald","Arial Narrow",sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.02em;color:#6f5436}'
    + '.pre{font-family:"Pacifico","Brush Script MT",cursive;font-size:19px;color:#6f5436;line-height:1.1}'
    + '.ttl{font-family:"Oswald","Arial Narrow",sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.03em}'
    + '.lab{font-family:"Oswald","Arial Narrow",sans-serif;font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:#9c7a52}'
    + '.hand{font-family:"Caveat","Bradley Hand","Comic Sans MS",cursive;font-style:italic;font-size:16px;color:#5a4632;line-height:1.15}';
  var html = '<html><head><meta charset="utf-8">' + fonts + '<style>' + css + '</style></head><body>' + pages + '</body></html>';
  var blob = Utilities.newBlob(html, 'text/html', 'fiches.html').getAs('application/pdf').setName('Fiches ' + classe + ' — ' + evalName + '.pdf');
  var folder = fichesFolder_(), file = folder.createFile(blob);
  return { url: file.getUrl(), name: file.getName() };
}
function fichesFolder_() {
  var it = DriveApp.getFoldersByName('Carnet — Fiches');
  return it.hasNext() ? it.next() : DriveApp.createFolder('Carnet — Fiches');
}
function escapeHtml_(s) { return String(s == null ? '' : s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

/* --------------------------- helpers feuilles --------------------- */

/* ----------------------------- suivi PP --------------------------- */
function ppNum_(x) { if (x === '' || x == null) return ''; var n = Number(String(x).replace(',', '.')); return isNaN(n) ? '' : n; }
function getPP(classe, prenom) {
  var notes = {}, bilan = {};
  var sh = sheet_('PP');
  if (sh.getLastRow() >= 2) {
    var v = sh.getDataRange().getValues(), idx = colIndex_(v[0]);
    for (var r = 1; r < v.length; r++) {
      if (String(v[r][idx.Classe]) === String(classe) && String(v[r][idx.Eleve]) === String(prenom))
        notes[String(v[r][idx.Matiere])] = { T1: ppNum_(v[r][idx.T1]), T2: ppNum_(v[r][idx.T2]), T3: ppNum_(v[r][idx.T3]) };
    }
  }
  var sb = sheet_('PP_Bilan');
  if (sb.getLastRow() >= 2) {
    var w = sb.getDataRange().getValues(), j = colIndex_(w[0]);
    for (var k = 1; k < w.length; k++) {
      if (String(w[k][j.Classe]) === String(classe) && String(w[k][j.Eleve]) === String(prenom))
        bilan[String(w[k][j.Trimestre])] = { moy: ppNum_(w[k][j.Moyenne]), app: String(w[k][j.Appreciation] || '') };
    }
  }
  var appmat = {};
  var sa = sheet_('PP_AppMat');
  if (sa.getLastRow() >= 2) {
    var av = sa.getDataRange().getValues(), ai = colIndex_(av[0]);
    for (var x = 1; x < av.length; x++) {
      if (String(av[x][ai.Classe]) === String(classe) && String(av[x][ai.Eleve]) === String(prenom))
        appmat[String(av[x][ai.Matiere])] = { T1: String(av[x][ai.T1] || ''), T2: String(av[x][ai.T2] || ''), T3: String(av[x][ai.T3] || '') };
    }
  }
  return { classe: classe, prenom: prenom, notes: notes, bilan: bilan, appmat: appmat };
}
function savePP(classe, prenom, notes, bilan) {
  notes = notes || {}; bilan = bilan || {};
  var stamp = Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');
  // --- PP (notes par matière) : on remplace le bloc de cet élève ---
  var sh = sheet_('PP'), head = PP_COLS, idx = colIndex_(head);
  var all = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues() : [];
  var keep = all.filter(function (r) { return !(String(r[idx.Classe]) === String(classe) && String(r[idx.Eleve]) === String(prenom)); });
  Object.keys(notes).forEach(function (m) {
    var t = notes[m] || {};
    if ((t.T1 === '' || t.T1 == null) && (t.T2 === '' || t.T2 == null) && (t.T3 === '' || t.T3 == null)) return;
    var row = []; row[idx.Classe] = classe; row[idx.Eleve] = prenom; row[idx.Matiere] = m;
    row[idx.T1] = (t.T1 == null ? '' : t.T1); row[idx.T2] = (t.T2 == null ? '' : t.T2); row[idx.T3] = (t.T3 == null ? '' : t.T3);
    keep.push(normRow_(row, head.length));
  });
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, head.length).clearContent();
  if (keep.length) sh.getRange(2, 1, keep.length, head.length).setValues(keep);
  // --- PP_Bilan (moyenne + appréciation par trimestre) ---
  var sb = sheet_('PP_Bilan'), bh = PP_BILAN_COLS, bidx = colIndex_(bh);
  var ball = sb.getLastRow() >= 2 ? sb.getRange(2, 1, sb.getLastRow() - 1, bh.length).getValues() : [];
  var bkeep = ball.filter(function (r) { return !(String(r[bidx.Classe]) === String(classe) && String(r[bidx.Eleve]) === String(prenom)); });
  ['T1', 'T2', 'T3'].forEach(function (tr) {
    var b = bilan[tr]; if (!b) return;
    var moy = (b.moy == null ? '' : b.moy), app = String(b.app || '');
    if (moy === '' && !app.trim()) return;
    var row = []; row[bidx.Classe] = classe; row[bidx.Eleve] = prenom; row[bidx.Trimestre] = tr;
    row[bidx.Moyenne] = moy; row[bidx.Appreciation] = app; row[bidx.MAJ] = stamp;
    bkeep.push(normRow_(row, bh.length));
  });
  if (sb.getLastRow() >= 2) sb.getRange(2, 1, sb.getLastRow() - 1, bh.length).clearContent();
  if (bkeep.length) sb.getRange(2, 1, bkeep.length, bh.length).setValues(bkeep);
  return { ok: true, at: Utilities.formatDate(new Date(), CONFIG.TZ, 'HH:mm:ss') };
}

function getRoster(classe) { return readEleves_(classe); }
function savePPClass(classe, matiere, trimestre, map, appMap) {
  if (['T1', 'T2', 'T3'].indexOf(trimestre) < 0) throw new Error('Trimestre invalide');
  map = map || {}; appMap = appMap || {};
  var sh = sheet_('PP'), head = PP_COLS, idx = colIndex_(head);
  var data = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues() : [];
  var pos = {};
  for (var i = 0; i < data.length; i++) pos[data[i][idx.Classe] + '|' + data[i][idx.Eleve] + '|' + data[i][idx.Matiere]] = i;
  var n = 0;
  Object.keys(map).forEach(function (prenom) {
    var val = map[prenom]; if (val === '' || val == null) return;
    var num = Number(String(val).replace(',', '.')); if (isNaN(num)) return;
    var k = classe + '|' + prenom + '|' + matiere, i = pos[k];
    if (i == null) {
      var row = []; for (var c = 0; c < head.length; c++) row[c] = '';
      row[idx.Classe] = classe; row[idx.Eleve] = prenom; row[idx.Matiere] = matiere; row[idx[trimestre]] = num;
      data.push(row); pos[k] = data.length - 1;
    } else { data[i][idx[trimestre]] = num; }
    n++;
  });
  if (data.length) sh.getRange(2, 1, data.length, head.length).setValues(data);
  // appréciations par matière
  if (Object.keys(appMap).length) {
    var sa = sheet_('PP_AppMat'), ah = PP_APPMAT_COLS, aidx = colIndex_(ah);
    var adata = sa.getLastRow() >= 2 ? sa.getRange(2, 1, sa.getLastRow() - 1, ah.length).getValues() : [];
    var apos = {};
    for (var a = 0; a < adata.length; a++) apos[adata[a][aidx.Classe] + '|' + adata[a][aidx.Eleve] + '|' + adata[a][aidx.Matiere]] = a;
    Object.keys(appMap).forEach(function (prenom) {
      var txt = String(appMap[prenom] || ''); if (!txt) return;
      var k = classe + '|' + prenom + '|' + matiere, i = apos[k];
      if (i == null) {
        var row = []; for (var c = 0; c < ah.length; c++) row[c] = '';
        row[aidx.Classe] = classe; row[aidx.Eleve] = prenom; row[aidx.Matiere] = matiere; row[aidx[trimestre]] = txt;
        adata.push(row); apos[k] = adata.length - 1;
      } else { adata[i][aidx[trimestre]] = txt; }
    });
    if (adata.length) sa.getRange(2, 1, adata.length, ah.length).setValues(adata);
  }
  return { ok: true, n: n };
}

function savePPClassMulti(classe, trimestre, rows, appMap) {
  if (['T1', 'T2', 'T3'].indexOf(trimestre) < 0) throw new Error('Trimestre invalide');
  rows = rows || []; appMap = appMap || {};
  var stamp = Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');
  // PP : notes par matière
  var sh = sheet_('PP'), head = PP_COLS, idx = colIndex_(head);
  var data = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues() : [];
  var pos = {}; for (var i = 0; i < data.length; i++) pos[data[i][idx.Classe] + '|' + data[i][idx.Eleve] + '|' + data[i][idx.Matiere]] = i;
  rows.forEach(function (rw) {
    var subs = rw.subjects || {};
    Object.keys(subs).forEach(function (mat) {
      var num = Number(String(subs[mat]).replace(',', '.')); if (isNaN(num)) return;
      var k = classe + '|' + rw.prenom + '|' + mat, i = pos[k];
      if (i == null) { var row = []; for (var c = 0; c < head.length; c++) row[c] = ''; row[idx.Classe] = classe; row[idx.Eleve] = rw.prenom; row[idx.Matiere] = mat; row[idx[trimestre]] = num; data.push(row); pos[k] = data.length - 1; }
      else data[i][idx[trimestre]] = num;
    });
  });
  if (data.length) sh.getRange(2, 1, data.length, head.length).setValues(data);
  // PP_Bilan : moyenne générale (on préserve l'appréciation générale existante)
  var sb = sheet_('PP_Bilan'), bh = PP_BILAN_COLS, bidx = colIndex_(bh);
  var bdata = sb.getLastRow() >= 2 ? sb.getRange(2, 1, sb.getLastRow() - 1, bh.length).getValues() : [];
  var bpos = {}; for (var i = 0; i < bdata.length; i++) bpos[bdata[i][bidx.Classe] + '|' + bdata[i][bidx.Eleve] + '|' + bdata[i][bidx.Trimestre]] = i;
  rows.forEach(function (rw) {
    if (rw.moyGen === '' || rw.moyGen == null) return; var num = Number(String(rw.moyGen).replace(',', '.')); if (isNaN(num)) return;
    var k = classe + '|' + rw.prenom + '|' + trimestre, i = bpos[k];
    if (i == null) { var row = []; for (var c = 0; c < bh.length; c++) row[c] = ''; row[bidx.Classe] = classe; row[bidx.Eleve] = rw.prenom; row[bidx.Trimestre] = trimestre; row[bidx.Moyenne] = num; row[bidx.MAJ] = stamp; bdata.push(row); bpos[k] = bdata.length - 1; }
    else { bdata[i][bidx.Moyenne] = num; bdata[i][bidx.MAJ] = stamp; }
  });
  if (bdata.length) sb.getRange(2, 1, bdata.length, bh.length).setValues(bdata);
  // PP_AppMat : appréciations de maths
  if (Object.keys(appMap).length) {
    var sa = sheet_('PP_AppMat'), ah = PP_APPMAT_COLS, aidx = colIndex_(ah);
    var adata = sa.getLastRow() >= 2 ? sa.getRange(2, 1, sa.getLastRow() - 1, ah.length).getValues() : [];
    var apos = {}; for (var a = 0; a < adata.length; a++) apos[adata[a][aidx.Classe] + '|' + adata[a][aidx.Eleve] + '|' + adata[a][aidx.Matiere]] = a;
    Object.keys(appMap).forEach(function (prenom) {
      var txt = String(appMap[prenom] || ''); if (!txt) return;
      var k = classe + '|' + prenom + '|Mathématiques', i = apos[k];
      if (i == null) { var row = []; for (var c = 0; c < ah.length; c++) row[c] = ''; row[aidx.Classe] = classe; row[aidx.Eleve] = prenom; row[aidx.Matiere] = 'Mathématiques'; row[aidx[trimestre]] = txt; adata.push(row); apos[k] = adata.length - 1; }
      else adata[i][aidx[trimestre]] = txt;
    });
    if (adata.length) sa.getRange(2, 1, adata.length, ah.length).setValues(adata);
  }
  return { ok: true, n: rows.length };
}

function importEvalsED(classe, evals, apprecMap, trimestre) {
  evals = evals || []; apprecMap = apprecMap || {};
  var nE = 0;
  evals.forEach(function (ev) {
    saveEval(classe, ev.eval, { date: ev.date, bareme: ev.bareme, coeff: ev.coeff, items: ev.items || [], remarques: [], eleves: ev.eleves || [] });
    nE++;
  });
  var nA = 0;
  if (trimestre && ['T1', 'T2', 'T3'].indexOf(trimestre) >= 0 && Object.keys(apprecMap).length) {
    var sa = sheet_('PP_AppMat'), ah = PP_APPMAT_COLS, aidx = colIndex_(ah);
    var adata = sa.getLastRow() >= 2 ? sa.getRange(2, 1, sa.getLastRow() - 1, ah.length).getValues() : [];
    var apos = {}; for (var i = 0; i < adata.length; i++) apos[adata[i][aidx.Classe] + '|' + adata[i][aidx.Eleve] + '|' + adata[i][aidx.Matiere]] = i;
    Object.keys(apprecMap).forEach(function (prenom) {
      var txt = String(apprecMap[prenom] || ''); if (!txt) return;
      var k = classe + '|' + prenom + '|Mathématiques', i = apos[k];
      if (i == null) { var row = []; for (var c = 0; c < ah.length; c++) row[c] = ''; row[aidx.Classe] = classe; row[aidx.Eleve] = prenom; row[aidx.Matiere] = 'Mathématiques'; row[aidx[trimestre]] = txt; adata.push(row); apos[k] = adata.length - 1; }
      else adata[i][aidx[trimestre]] = txt;
      nA++;
    });
    if (adata.length) sa.getRange(2, 1, adata.length, ah.length).setValues(adata);
  }
  return { ok: true, evals: nE, apprec: nA };
}

function importReferentiel(payload) {
  var niveau = String((payload && payload.niveau) || '').trim() || 'inconnu';
  var sh = sheet_('Referentiel'), h = REFERENTIEL_COLS, idx = colIndex_(h);
  var data = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues() : [];
  var kept = data.filter(function (r) { return String(r[idx.Niveau]) !== niveau; });
  var rows = [];
  (payload.chapitres || []).forEach(function (c) {
    var comps = (c.comps_progression || c.comps || []).join(',');
    (c.objectifs || []).forEach(function (o) {
      var row = []; for (var k = 0; k < h.length; k++) row[k] = '';
      row[idx.Niveau] = niveau; row[idx.ChapCode] = c.code || ''; row[idx.ChapTitre] = c.titre || c.title || '';
      row[idx.ChapTheme] = c.theme || ''; row[idx.CompsProg] = comps;
      row[idx.ObjCode] = o.code || ''; row[idx.Famille] = o.famille || ''; row[idx.Texte] = o.texte || o.text || '';
      rows.push(row);
    });
  });
  var all = kept.concat(rows);
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, h.length).clearContent();
  if (all.length) sh.getRange(2, 1, all.length, h.length).setValues(all);
  return { ok: true, niveau: niveau, chapitres: (payload.chapitres || []).length, objectifs: rows.length };
}

function getReferentielNiveaux() {
  var sh = sheet_('Referentiel'), h = REFERENTIEL_COLS, idx = colIndex_(h);
  if (sh.getLastRow() < 2) return [];
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues(), m = {};
  data.forEach(function (r) { var n = String(r[idx.Niveau]); if (!n) return; if (!m[n]) m[n] = { ch: {}, o: 0 }; m[n].ch[r[idx.ChapCode]] = 1; m[n].o++; });
  return Object.keys(m).map(function (n) { return { niveau: n, chapitres: Object.keys(m[n].ch).length, objectifs: m[n].o }; });
}

function getReferentiel(niveau) {
  var sh = sheet_('Referentiel'), h = REFERENTIEL_COLS, idx = colIndex_(h);
  if (sh.getLastRow() < 2) return { niveau: niveau, chapitres: [] };
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues(), byChap = {}, order = [];
  data.forEach(function (r) {
    if (String(r[idx.Niveau]) !== String(niveau)) return;
    var code = r[idx.ChapCode];
    if (!byChap[code]) { byChap[code] = { code: code, titre: r[idx.ChapTitre], theme: r[idx.ChapTheme], comps: String(r[idx.CompsProg] || '').split(',').filter(Boolean), objectifs: [] }; order.push(code); }
    byChap[code].objectifs.push({ code: r[idx.ObjCode], famille: r[idx.Famille], texte: r[idx.Texte] });
  });
  return { niveau: niveau, chapitres: order.map(function (c) { return byChap[c]; }) };
}

function clearReferentiel(niveau) {
  var sh = sheet_('Referentiel'), h = REFERENTIEL_COLS, idx = colIndex_(h);
  if (sh.getLastRow() < 2) return { ok: true };
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues();
  var kept = data.filter(function (r) { return String(r[idx.Niveau]) !== String(niveau); });
  sh.getRange(2, 1, sh.getLastRow() - 1, h.length).clearContent();
  if (kept.length) sh.getRange(2, 1, kept.length, h.length).setValues(kept);
  return { ok: true };
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name) {
  var ss = ss_(); if (!ss) throw new Error('Script non lié à un classeur.');
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); var c = SHEET_COLS[name]; if (c) { sh.getRange(1, 1, 1, c.length).setValues([c]).setFontWeight('bold'); sh.setFrozenRows(1); } }
  return sh;
}
function colIndex_(h) { var i = {}; h.forEach(function (x, k) { i[x] = k; }); return i; }
function normRow_(row, w) { var r = row.slice(0, w); while (r.length < w) r.push(''); return r; }
function getClasses_() {
  var sh = sheet_('Eleves'); if (sh.getLastRow() < 2) return [];
  var set = {}; sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { if (r[0] !== '') set[String(r[0])] = true; });
  return Object.keys(set);
}
function readEleves_(classe) {
  var sh = sheet_('Eleves'); if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().filter(function (r) { return String(r[0]) === String(classe); }).map(function (r) { return String(r[1]); });
}
function readJournal_(isoDate, classe) {
  var sh = sheet_('Journal'), out = {}; if (sh.getLastRow() < 2) return out;
  var vals = sh.getDataRange().getValues(), idx = colIndex_(vals[0]);
  for (var r = 1; r < vals.length; r++) {
    if (normDate_(vals[r][idx.Date]) !== isoDate || String(vals[r][idx.Classe]) !== String(classe)) continue;
    var obs = emptyObs_(); EVENTS.forEach(function (k) { obs[k] = Number(vals[r][idx[k]]) || 0; });
    obs.Commentaire = String(vals[r][idx.Commentaire] || ''); out[String(vals[r][idx.Eleve])] = obs;
  }
  return out;
}
function buildJournalRow_(header, isoDate, classe, el, stamp) {
  var obs = el.obs || {};
  return header.map(function (h) {
    if (h === 'Date') return isoDate; if (h === 'Classe') return classe; if (h === 'Eleve') return el.prenom;
    if (h === 'MAJ') return stamp; if (h === 'Commentaire') return obs.Commentaire || ''; return Number(obs[h]) || 0;
  });
}

/* --------------------------- utilitaires -------------------------- */

function emptyObs_() { var o = { Commentaire: '' }; EVENTS.forEach(function (k) { o[k] = 0; }); return o; }
function parseIso_(iso) { var p = String(iso).split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
function normDate_(v) { return (v instanceof Date) ? Utilities.formatDate(v, CONFIG.TZ, 'yyyy-MM-dd') : String(v); }
function isoKey_(d, c, e) { return normDate_(d) + '|' + String(c) + '|' + String(e); }
function norm_(s) { return String(s).toLowerCase().replace(/\s+/g, ''); }
function matchClasse_(titre, classes) {
  var t = norm_(titre), hit = '';
  classes.forEach(function (c) { if (norm_(c) && t.indexOf(norm_(c)) !== -1 && norm_(c).length > norm_(hit).length) hit = c; });
  return hit;
}
