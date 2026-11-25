const express = require('express');
const { db } = require('../firebase');
const { acces } = require('../middleware/auth');
const { commerceDuCommercant, statutOffre } = require('../services/donnees');
const { wrap, depuisDoc } = require('../utils');

const router = express.Router();

const payee = (c) => c.statut === 'PAYEE' || c.statut === 'RECUPEREE';
const somme = (liste, f) => Math.round(liste.reduce((t, x) => t + f(x), 0) * 1000) / 1000;

// Statistiques selon le rôle du token.
router.get(
  '/me',
  ...acces(),
  wrap(async (req, res) => {
    const role = req.user.role;

    if (role === 'etudiant') {
      const snap = await db.collection('orders').where('etudiantId', '==', req.uid).get();
      const commandes = snap.docs.map(depuisDoc).filter((c) => c.statut !== 'ANNULEE');
      const reglees = commandes.filter(payee);
      return res.json({
        nbCommandes: commandes.length,
        nbRecuperees: commandes.filter((c) => c.statut === 'RECUPEREE').length,
        totalDepense: somme(reglees, (c) => c.montantTotal),
        // économie = Σ (prix initial - prix payé) × quantité
        totalEconomise: somme(reglees, (c) =>
          c.lignes.reduce((t, l) => t + (l.prixInitial - l.prixUnitaire) * l.quantite, 0)
        ),
      });
    }

    if (role === 'commercant') {
      const commerce = await commerceDuCommercant(req.uid);
      if (!commerce) return res.json({ nbCommandes: 0, nbRecuperees: 0, chiffreAffaires: 0, offresActives: 0 });
      const [cmd, off] = await Promise.all([
        db.collection('orders').where('commerceId', '==', commerce.id).get(),
        db.collection('offers').where('commerceId', '==', commerce.id).get(),
      ]);
      const commandes = cmd.docs.map(depuisDoc).filter((c) => c.statut !== 'ANNULEE');
      return res.json({
        nbCommandes: commandes.length,
        nbRecuperees: commandes.filter((c) => c.statut === 'RECUPEREE').length,
        chiffreAffaires: somme(commandes.filter(payee), (c) => c.montantTotal),
        offresActives: off.docs.filter((d) => statutOffre(d.data()) === 'ACTIVE').length,
      });
    }

    // Administrateur : vue globale de la plateforme.
    const [users, commerces, orders] = await Promise.all([
      db.collection('users').get(),
      db.collection('commerces').get(),
      db.collection('orders').get(),
    ]);
    const u = users.docs.map((d) => d.data());
    const c = commerces.docs.map((d) => d.data());
    const commandes = orders.docs.map(depuisDoc).filter((x) => x.statut !== 'ANNULEE');
    res.json({
      nbUtilisateurs: u.length,
      nbEtudiants: u.filter((x) => x.role === 'etudiant').length,
      nbCommercants: u.filter((x) => x.role === 'commercant').length,
      commercesEnAttente: c.filter((x) => x.statutValidation === 'EN_ATTENTE').length,
      commercesValides: c.filter((x) => x.statutValidation === 'VALIDE').length,
      nbCommandes: commandes.length,
      chiffreAffaires: somme(commandes.filter(payee), (x) => x.montantTotal),
    });
  })
);

module.exports = router;
