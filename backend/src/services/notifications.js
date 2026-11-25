const { db, messaging } = require('../firebase');

// Envoie une notification FCM à un utilisateur. Ne bloque jamais l'API en cas d'échec.
async function notifier(userId, titre, texte) {
  try {
    const snap = await db.collection('users').doc(userId).get();
    const token = snap.exists ? snap.data().fcmToken : null;
    if (!token) return;
    await messaging.send({ token, notification: { title: titre, body: texte } });
  } catch (e) {
    console.warn('Notification non envoyée :', e.message);
  }
}

module.exports = { notifier };
