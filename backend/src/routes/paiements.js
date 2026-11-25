const express = require('express');
const { db } = require('../firebase');
const { confirmerPaiement } = require('../services/paiement');
const konnect = require('../services/konnect');
const { wrap, erreur } = require('../utils');

const router = express.Router();

// Webhook Konnect : appelé avec ?payment_ref=... après le paiement.
// On ne fait pas confiance à l'appel : on redemande l'état à Konnect.
router.get(
  '/webhook',
  wrap(async (req, res) => {
    const ref = String(req.query.payment_ref || '');
    if (!ref || !konnect.configure()) return res.status(400).end();
    const q = await db.collection('orders').where('paymentRef', '==', ref).limit(1).get();
    if (!q.empty && (await konnect.paiementTermine(ref))) {
      await confirmerPaiement(q.docs[0].id);
    }
    res.status(200).end();
  })
);

// ---- Paiement de DÉMONSTRATION (uniquement si Konnect n'est pas configuré) ----
const page = (titre, texte, lien) => `<!doctype html><html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CampusSave</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px">
<h2>${titre}</h2><p>${texte}</p>${lien || ''}</body></html>`;

async function commandeDuPaiement(ref) {
  if (konnect.configure()) throw erreur(404, 'Page indisponible.');
  const q = await db.collection('orders').where('paymentRef', '==', ref).limit(1).get();
  if (q.empty) throw erreur(404, 'Paiement introuvable.');
  return q.docs[0];
}

router.get(
  '/simulate/:ref',
  wrap(async (req, res) => {
    const snap = await commandeDuPaiement(req.params.ref);
    const c = snap.data();
    res.send(
      page(
        'Paiement de test',
        `${c.commerceNom} : <b>${c.montantTotal.toFixed(3)} DT</b>`,
        `<a href="/api/payments/simulate/${req.params.ref}/confirmer"
            style="background:#2e7d32;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none">
            Confirmer le paiement</a>`
      )
    );
  })
);

router.get(
  '/simulate/:ref/confirmer',
  wrap(async (req, res) => {
    const snap = await commandeDuPaiement(req.params.ref);
    await confirmerPaiement(snap.id);
<<<<<<< HEAD
    res.send(page('Paiement confirmé ✔', "Retournez dans l'application CampusSave : votre QR code est prêt."));
  })
);

module.exports = router;
=======
    const web = process.env.WEB_ORIGIN || 'http://localhost:5173';
    res.send(
      page(
        'Paiement confirmé ✔',
        'Votre QR code est prêt.',
        `<a href="${web}/orders"
            style="background:#2e7d32;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none">
            Retour à mes commandes</a>`
      )
    );
  })
);

module.exports = router;
>>>>>>> af66685a8c46d8b363b1251aacfddb968bcbb83d
