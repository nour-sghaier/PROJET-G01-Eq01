// Initialisation de Firebase Admin (Auth, Firestore, Cloud Messaging).
// Les identifiants viennent du fichier indiqué par GOOGLE_APPLICATION_CREDENTIALS.
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

module.exports = {
  admin,
  auth: admin.auth(),
  db: admin.firestore(),
  messaging: admin.messaging(),
};
