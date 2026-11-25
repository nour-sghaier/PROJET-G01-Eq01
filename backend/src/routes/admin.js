const express = require('express');
const { db } = require('../firebase');
const { acces } = require('../middleware/auth');
const { notifier } = require('../services/notifications');
const { wrap, erreur, depuisDoc } = require('../utils');

const router = express.Router();
router.use(...acces('admin')); // toutes les routes /admin sont réservées à l'administrateur

// Liste des commerces, filtrable : ?statut=EN_ATTENTE|VALIDE|REFUSE
router.get(
  '/commerces',
  wrap(async (req, res) => {
    const [commerces, users] = await Promise.all([db.collection('commerces').get(), db.collection('users').get()]);
    const proprietaires = new Map(users.docs.map((d) => [d.id, d.data()]));
    let liste = commerces.docs.map(depuisDoc);
    if (req.query.statut) liste = liste.filter((c) => c.statutValidation === req.query.statut);
    res.json(
      liste.map(({ proprietaireId, ...c }) => {
        const p = proprietaires.get(proprietaireId);
        return { ...c, proprietaireNom: p ? `${p.prenom} ${p.nom}` : '', proprietaireEmail: p ? p.email : '' };
      })
    );
  })
);

// Validation ou refus d'un commerce. Corps : { statut: "VALIDE" | "REFUSE" }
router.put(
  '/commerces/:id/statut',
  wrap(async (req, res) => {
    const statut = req.body.statut;
    if (!['VALIDE', 'REFUSE'].includes(statut)) throw erreur(400, 'Statut invalide.');
    const ref = db.collection('commerces').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw erreur(404, 'Commerce introuvable.');
    await ref.update({ statutValidation: statut });
    await notifier(
      snap.data().proprietaireId,
      statut === 'VALIDE' ? 'Commerce validé' : 'Commerce refusé',
      statut === 'VALIDE' ? 'Vous pouvez maintenant publier des offres.' : "Votre commerce n'a pas été accepté."
    );
    res.json({ id: ref.id, ...(await ref.get()).data(), proprietaireId: undefined });
  })
);

router.get(
  '/users',
  wrap(async (req, res) => {
    const snap = await db.collection('users').get();
    res.json(
      snap.docs.map((d) => {
        const u = d.data();
        return {
          id: d.id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone || null,
          role: u.role,
          active: u.active !== false,
        };
      })
    );
  })
);

// Active ou désactive un compte. Corps : { active: true | false }
router.put(
  '/users/:id/active',
  wrap(async (req, res) => {
    if (typeof req.body.active !== 'boolean') throw erreur(400, 'Valeur invalide.');
    const ref = db.collection('users').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw erreur(404, 'Utilisateur introuvable.');
    if (snap.data().role === 'admin') throw erreur(400, "Un administrateur ne peut pas être désactivé.");
    await ref.update({ active: req.body.active });
    res.json({ id: ref.id, active: req.body.active });
  })
);

module.exports = router;
