const express = require('express');
const { db, FieldValue } = require('../config/firebase');
const { acces } = require('../middleware/auth');
const { commerceDuCommercant, vueCommerce } = require('../services/donnees');
const { wrap, erreur, texte } = require('../utils');

const router = express.Router();

function lireCommerce(body) {
  const nom = texte(body.nom);
  const adresse = texte(body.adresse);
  const telephone = texte(body.telephone);
  if (!nom || !adresse) throw erreur(400, 'Nom et adresse obligatoires.');
  if (!['RESTAURANT', 'CAFETERIA'].includes(body.type)) throw erreur(400, 'Type invalide.');
  if (telephone && !/^\d{8}$/.test(telephone)) throw erreur(400, 'Téléphone : 8 chiffres.');
  return { nom, type: body.type, adresse, telephone, description: texte(body.description) };
}

router.get(
  '/me',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const commerce = await commerceDuCommercant(req.uid);
    if (!commerce) throw erreur(404, "Vous n'avez pas encore de commerce.");
    res.json(vueCommerce(commerce));
  })
);

router.post(
  '/',
  ...acces('commercant'),
  wrap(async (req, res) => {
    if (await commerceDuCommercant(req.uid)) throw erreur(409, 'Vous avez déjà un commerce.');
    const ref = db.collection('commerces').doc();
    await ref.set({
      ...lireCommerce(req.body),
      proprietaireId: req.uid,
      statutValidation: 'EN_ATTENTE', // validé ensuite par l'administrateur
      dateCreation: FieldValue.serverTimestamp(),
    });
    res.status(201).json(vueCommerce({ id: ref.id, ...(await ref.get()).data() }));
  })
);

router.put(
  '/me',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const commerce = await commerceDuCommercant(req.uid);
    if (!commerce) throw erreur(404, "Vous n'avez pas encore de commerce.");
    const ref = db.collection('commerces').doc(commerce.id);
    await ref.update(lireCommerce(req.body));
    res.json(vueCommerce({ id: ref.id, ...(await ref.get()).data() }));
  })
);

module.exports = router;
