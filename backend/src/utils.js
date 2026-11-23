// Petits outils partagés par les routes.

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// throw erreur(400, 'message') -> le client reçoit { message } avec ce statut.
const erreur = (status, message) => new HttpError(status, message);

// Permet d'utiliser async/await dans les routes Express 4.
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Convertit les Timestamp Firestore en chaînes ISO 8601 (récursif).
function enJson(v) {
  if (v && typeof v.toDate === 'function') return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(enJson);
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    const o = {};
    for (const k of Object.keys(v)) o[k] = enJson(v[k]);
    return o;
  }
  return v;
}

const depuisDoc = (snap) => ({ id: snap.id, ...enJson(snap.data()) });

const texte = (v) => (typeof v === 'string' ? v.trim() : '');

const enDate = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : new Date(v));

module.exports = { HttpError, erreur, wrap, enJson, depuisDoc, texte, enDate };
