const express = require('express');
const { db, FieldValue } = require('../config/firebase');
const { authentifier, acces } = require('../middleware/auth');
const { wrap, erreur, texte } = require('../utils');

const router = express.Router();

const vue = (id, u) => ({
  id,
  nom: u.nom,
  prenom: u.prenom,
  email: u.email,
  telephone: u.telephone || null,
  role: u.role,
});

function lireIdentite(body) {
  const prenom = texte(body.prenom);
  const nom = texte(body.nom);
  const telephone = texte(body.telephone);
  if (!prenom || !nom) throw erreur(400, 'Nom et prénom obligatoires.');
  if (telephone && !/^\d{8}$/.test(telephone)) {
    throw erreur(400, 'Téléphone : 8 chiffres.');
  }
  return { prenom, nom, telephone };
}

// Création du profil juste après l'inscription Firebase (token valide, profil inexistant).
router.post(
  '/',
  authentifier,
  wrap(async (req, res) => {
    if (req.user) throw erreur(409, 'Ce compte a déjà un profil.');
    const { prenom, nom, telephone } = lireIdentite(req.body);
    const role = req.body.role;
    if (role === 'admin') {
      throw erreur(403, "Le rôle administrateur ne peut pas être choisi à l'inscription.");
    }
    if (!['etudiant', 'commercant'].includes(role)) throw erreur(400, 'Rôle invalide.');

    const donnees = {
      nom,
      prenom,
      email: req.email || '',
      telephone,
      role,
      active: true,
      fcmToken: null,
      dateCreation: FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(req.uid).set(donnees);
    res.status(201).json(vue(req.uid, donnees));
  })
);

router.get(
  '/me',
  ...acces(),
  wrap(async (req, res) => {
    res.json(vue(req.user.id, req.user));
  })
);

router.put(
  '/me',
  ...acces(),
  wrap(async (req, res) => {
    const { prenom, nom, telephone } = lireIdentite(req.body);
    await db.collection('users').doc(req.uid).update({ prenom, nom, telephone });
    res.json(vue(req.uid, { ...req.user, prenom, nom, telephone }));
  })
);

router.post(
  '/me/fcm-token',
  ...acces(),
  wrap(async (req, res) => {
    const token = texte(req.body.fcmToken);
    if (!token) throw erreur(400, 'Token manquant.');
    await db.collection('users').doc(req.uid).update({ fcmToken: token });
    res.status(204).end();
  })
);

module.exports = router;
