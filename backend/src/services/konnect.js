// Paiement Konnect (mode test / sandbox). Documentation : https://docs.konnect.network
// Si KONNECT_API_KEY / KONNECT_WALLET_ID sont vides, l'API utilise un paiement
// de démonstration (voir routes/paiements.js).
const URL_API =
  process.env.KONNECT_API_URL || 'https://api.sandbox.konnect.network/api/v2';

const configure = () =>
  Boolean(process.env.KONNECT_API_KEY && process.env.KONNECT_WALLET_ID);

async function appeler(chemin, options = {}) {
  const reponse = await fetch(`${URL_API}${chemin}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.KONNECT_API_KEY,
    },
  });
  const donnees = await reponse.json().catch(() => ({}));
  if (!reponse.ok) {
    throw new Error(donnees.message || `Konnect a répondu ${reponse.status}`);
  }
  return donnees;
}

// Initialise un paiement : renvoie { payUrl, paymentRef }.
async function initierPaiement(commande, utilisateur) {
  const corps = {
    receiverWalletId: process.env.KONNECT_WALLET_ID,
    token: 'TND',
    amount: Math.round(commande.montantTotal * 1000), // en millimes
    type: 'immediate',
    description: `Commande CampusSave ${commande.id}`,
    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
    lifespan: 30,
    firstName: utilisateur.prenom,
    lastName: utilisateur.nom,
    email: utilisateur.email,
    orderId: commande.id,
  };
  if (utilisateur.telephone) corps.phoneNumber = utilisateur.telephone;
  if (process.env.KONNECT_WEBHOOK_URL) corps.webhook = process.env.KONNECT_WEBHOOK_URL;

  const d = await appeler('/payments/init-payment', {
    method: 'POST',
    body: JSON.stringify(corps),
  });
  return { payUrl: d.payUrl, paymentRef: d.paymentRef };
}

// Vrai si Konnect confirme que le paiement est terminé.
async function paiementTermine(paymentRef) {
  const d = await appeler(`/payments/${paymentRef}`);
  return d.payment && d.payment.status === 'completed';
}

module.exports = { configure, initierPaiement, paiementTermine };
