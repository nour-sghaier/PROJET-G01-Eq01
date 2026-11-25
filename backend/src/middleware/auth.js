const { auth, db } = require('../firebase');
const { erreur, wrap } = require('../utils');

// Vérifie le token Firebase (en-tête Authorization: Bearer ...) et charge le profil
// Firestore users/{uid} dans req.user (null si le profil n'existe pas encore).
const authentifier = wrap(async (req, res, next) => {
  const entete = req.headers.authorization || '';
  const token = entete.startsWith('Bearer ') ? entete.slice(7) : null;
  if (!token) throw erreur(401, 'Non authentifié.');

  let decode;
  try {
    decode = await auth.verifyIdToken(token);
  } catch (e) {
    throw erreur(401, 'Session expirée. Reconnectez-vous.');
  }
  req.uid = decode.uid;
  req.email = decode.email;

  const snap = await db.collection('users').doc(req.uid).get();
  req.user = snap.exists ? { id: snap.id, ...snap.data() } : null;
  next();
});

// acces('etudiant') -> authentifié + profil existant + rôle autorisé.
// acces() sans rôle -> tout utilisateur ayant un profil.
function acces(...roles) {
  const verifierProfil = (req, res, next) => {
    if (!req.user) return next(erreur(404, 'Profil introuvable.'));
    if (req.user.active === false) return next(erreur(403, 'Compte désactivé.'));
    if (roles.length && !roles.includes(req.user.role)) {
      return next(erreur(403, 'Accès refusé pour votre rôle.'));
    }
    next();
  };
  return [authentifier, verifierProfil];
}

module.exports = { authentifier, acces };
