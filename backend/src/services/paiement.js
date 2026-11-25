const crypto = require('crypto');
const { db } = require('../firebase');
const { notifier } = require('./notifications');
const konnect = require('./konnect');

// Seul point où une commande passe à PAYEE : le QR code est généré ici, jamais avant.
// Idempotent : un deuxième appel (webhook + rafraîchissement) ne change rien.
async function confirmerPaiement(commandeId) {
  const ref = db.collection('orders').doc(commandeId);
  const commande = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.data().statut !== 'EN_ATTENTE_PAIEMENT') return null;
    tx.update(ref, {
      statut: 'PAYEE',
      qrCode: crypto.randomUUID(),
      datePaiement: new Date(),
    });
    return snap.data();
  });
  if (!commande) return false;

  await notifier(commande.etudiantId, 'Commande payée', 'Votre QR code est disponible.');
  const commerce = await db.collection('commerces').doc(commande.commerceId).get();
  if (commerce.exists) {
    await notifier(
      commerce.data().proprietaireId,
      'Nouvelle commande',
      `${commande.etudiantNom} a payé une commande.`
    );
  }
  return true;
}

// Interroge Konnect pour une commande en attente (au cas où le webhook n'est pas reçu).
async function verifierPaiement(commandeId, paymentRef) {
  if (!konnect.configure() || !paymentRef) return false;
  try {
    if (await konnect.paiementTermine(paymentRef)) {
      return await confirmerPaiement(commandeId);
    }
  } catch (e) {
    console.warn('Vérification Konnect impossible :', e.message);
  }
  return false;
}

module.exports = { confirmerPaiement, verifierPaiement };
