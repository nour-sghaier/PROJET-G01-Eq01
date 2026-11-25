const express = require('express');
const { db } = require('../firebase');
const { acces } = require('../middleware/auth');
const { commerceDuCommercant, statutOffre } = require('../services/donnees');
const { notifier } = require('../services/notifications');
const { verifierPaiement } = require('../services/paiement');
const konnect = require('../services/konnect');
const { wrap, erreur, texte, depuisDoc, enDate } = require('../utils');
const crypto = require('crypto');

const router = express.Router();

// Commande envoyée au client. Le QR code n'est visible que par l'étudiant,
// et seulement une fois la commande payée.
function vue(c, role) {
  const { etudiantId, paymentRef, ...reste } = c;
  if (role !== 'etudiant' || c.statut !== 'PAYEE') reste.qrCode = null;
  return reste;
}

const plusRecentesDabord = (a, b) => enDate(b.dateCommande) - enDate(a.dateCommande);

// Réservation : le prix et le stock sont toujours lus côté serveur, dans une transaction.
router.post(
  '/',
  ...acces('etudiant'),
  wrap(async (req, res) => {
    const commerceId = texte(req.body.commerceId);
    const brutes = Array.isArray(req.body.lignes) ? req.body.lignes : [];
    if (!commerceId || brutes.length === 0) throw erreur(400, 'Commande invalide.');

    const quantites = new Map(); // offreId -> quantité (lignes identiques fusionnées)
    for (const l of brutes) {
      const id = texte(l.offreId);
      const q = Number(l.quantite);
      if (!id || !Number.isInteger(q) || q <= 0) throw erreur(400, 'Ligne de commande invalide.');
      quantites.set(id, (quantites.get(id) || 0) + q);
    }
    const ids = [...quantites.keys()];
    const ref = db.collection('orders').doc();

    const donnees = await db.runTransaction(async (tx) => {
      // Toutes les lectures d'abord, puis les écritures.
      const commerceSnap = await tx.get(db.collection('commerces').doc(commerceId));
      const offres = await Promise.all(ids.map((id) => tx.get(db.collection('offers').doc(id))));
      if (!commerceSnap.exists || commerceSnap.data().statutValidation !== 'VALIDE') {
        throw erreur(400, "Ce commerce n'est pas disponible.");
      }

      const lignes = [];
      let total = 0;
      offres.forEach((snap, i) => {
        if (!snap.exists || snap.data().commerceId !== commerceId) {
          throw erreur(400, 'Offre introuvable.');
        }
        const o = snap.data();
        const q = quantites.get(ids[i]);
        if (statutOffre(o) !== 'ACTIVE' || o.quantiteDisponible < q) {
          throw erreur(400, `Stock insuffisant pour « ${o.titre} ».`);
        }
        lignes.push({
          offreId: ids[i],
          titre: o.titre,
          quantite: q,
          prixUnitaire: o.prixReduit,
          prixInitial: o.prixInitial,
        });
        total += q * o.prixReduit;
        tx.update(snap.ref, { quantiteDisponible: o.quantiteDisponible - q });
      });

      const commande = {
        etudiantId: req.uid,
        etudiantNom: `${req.user.prenom} ${req.user.nom}`,
        commerceId,
        commerceNom: commerceSnap.data().nom,
        dateCommande: new Date(),
        montantTotal: Math.round(total * 1000) / 1000,
        statut: 'EN_ATTENTE_PAIEMENT',
        lignes,
        qrCode: null,
        paymentRef: null,
      };
      tx.set(ref, commande);
      return commande;
    });

    res.status(201).json(vue({ id: ref.id, ...donnees }, 'etudiant'));
  })
);

router.get(
  '/mine',
  ...acces('etudiant'),
  wrap(async (req, res) => {
    const snap = await db.collection('orders').where('etudiantId', '==', req.uid).get();
    res.json(snap.docs.map(depuisDoc).sort(plusRecentesDabord).map((c) => vue(c, 'etudiant')));
  })
);

router.get(
  '/received',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const commerce = await commerceDuCommercant(req.uid);
    if (!commerce) return res.json([]);
    const snap = await db.collection('orders').where('commerceId', '==', commerce.id).get();
    res.json(snap.docs.map(depuisDoc).sort(plusRecentesDabord).map((c) => vue(c, 'commercant')));
  })
);

// Validation du QR code au retrait.
router.post(
  '/validate-qr',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const code = texte(req.body.qrCode);
    const commerce = await commerceDuCommercant(req.uid);
    if (!code) throw erreur(400, 'QR code manquant.');
    if (!commerce) throw erreur(403, "Inscrivez d'abord votre commerce.");

    const q = await db.collection('orders').where('qrCode', '==', code).limit(1).get();
    if (q.empty) throw erreur(404, 'QR code inconnu.');
    const ref = q.docs[0].ref;

    // Transaction : un QR code ne peut être validé qu'une seule fois.
    await db.runTransaction(async (tx) => {
      const c = (await tx.get(ref)).data();
      if (c.commerceId !== commerce.id) throw erreur(403, 'Cette commande appartient à un autre commerce.');
      if (c.statut === 'RECUPEREE') throw erreur(400, 'Commande déjà récupérée.');
      if (c.statut !== 'PAYEE') throw erreur(400, "Cette commande n'est pas payée.");
      tx.update(ref, { statut: 'RECUPEREE', dateRecuperation: new Date() });
    });

    const commande = depuisDoc(await ref.get());
    await notifier(commande.etudiantId, 'Commande récupérée', 'Merci pour votre geste anti-gaspillage !');
    res.json(vue(commande, 'commercant'));
  })
);

router.get(
  '/:id',
  ...acces(),
  wrap(async (req, res) => {
    const ref = db.collection('orders').doc(req.params.id);
    let snap = await ref.get();
    if (!snap.exists) throw erreur(404, 'Commande introuvable.');

    const role = req.user.role;
    const c = snap.data();
    let autorise = role === 'admin' || (role === 'etudiant' && c.etudiantId === req.uid);
    if (role === 'commercant') {
      const commerce = await commerceDuCommercant(req.uid);
      autorise = Boolean(commerce) && commerce.id === c.commerceId;
    }
    if (!autorise) throw erreur(404, 'Commande introuvable.');

    // Paiement en attente : on demande à Konnect (utile si le webhook n'est pas joignable).
    if (c.statut === 'EN_ATTENTE_PAIEMENT' && c.paymentRef) {
      if (await verifierPaiement(snap.id, c.paymentRef)) snap = await ref.get();
    }
    res.json(vue(depuisDoc(snap), role));
  })
);

router.post(
  '/:id/cancel',
  ...acces('etudiant'),
  wrap(async (req, res) => {
    const ref = db.collection('orders').doc(req.params.id);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data().etudiantId !== req.uid) throw erreur(404, 'Commande introuvable.');
      const c = snap.data();
      if (c.statut !== 'EN_ATTENTE_PAIEMENT') {
        throw erreur(400, 'Seule une commande non payée peut être annulée.');
      }
      const offres = await Promise.all(c.lignes.map((l) => tx.get(db.collection('offers').doc(l.offreId))));
      offres.forEach((o, i) => {
        // On remet le stock (si l'offre existe encore).
        if (o.exists) tx.update(o.ref, { quantiteDisponible: o.data().quantiteDisponible + c.lignes[i].quantite });
      });
      tx.update(ref, { statut: 'ANNULEE' });
    });
    res.json(vue(depuisDoc(await ref.get()), 'etudiant'));
  })
);

// Initialise le paiement et renvoie le lien à ouvrir dans le navigateur.
router.post(
  '/:id/pay',
  ...acces('etudiant'),
  wrap(async (req, res) => {
    const ref = db.collection('orders').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data().etudiantId !== req.uid) throw erreur(404, 'Commande introuvable.');
    const c = { id: snap.id, ...snap.data() };
    if (c.statut !== 'EN_ATTENTE_PAIEMENT') throw erreur(400, 'Cette commande ne peut plus être payée.');

    let payUrl;
    let paymentRef;
    if (konnect.configure()) {
      try {
        ({ payUrl, paymentRef } = await konnect.initierPaiement(c, req.user));
      } catch (e) {
        console.error('Konnect :', e.message);
        throw erreur(502, "Le service de paiement est indisponible. Réessayez plus tard.");
      }
    } else {
      // Mode démonstration (aucune clé Konnect) : page de paiement simulée du backend.
      paymentRef = crypto.randomUUID();
      const base = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
      payUrl = `${base}/api/payments/simulate/${paymentRef}`;
    }
    await ref.update({ paymentRef });
    res.json({ payUrl });
  })
);

module.exports = router;
