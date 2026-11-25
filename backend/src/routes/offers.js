const express = require('express');
const { db, FieldValue } = require('../firebase');
const { acces } = require('../middleware/auth');
const { commerceDuCommercant, statutOffre } = require('../services/donnees');
const { wrap, erreur, texte, depuisDoc, enDate } = require('../utils');

const router = express.Router();

const CATEGORIES = ['Plat chaud', 'Sandwich', 'Pâtisserie', 'Boisson', 'Fruits et légumes', 'Autre'];

// Offre envoyée au client : statut calculé + nom du commerce.
const vue = (o, commerceNom) => ({ ...o, commerceNom, statut: statutOffre(o) });

// Validation commune à la publication et à la modification.
function lireOffre(b) {
  const titre = texte(b.titre);
  const prixInitial = Number(b.prixInitial);
  const prixReduit = Number(b.prixReduit);
  const quantite = Number(b.quantiteDisponible);
  const debut = new Date(b.heureDebutRecuperation);
  const fin = new Date(b.heureFinRecuperation);

  if (!titre) throw erreur(400, 'Titre obligatoire.');
  if (!CATEGORIES.includes(b.categorie)) throw erreur(400, 'Catégorie invalide.');
  if (!(prixInitial > 0) || !(prixReduit > 0)) throw erreur(400, 'Les prix doivent être positifs.');
  if (prixReduit >= prixInitial) throw erreur(400, 'Le prix réduit doit être inférieur au prix initial.');
  if (!Number.isInteger(quantite) || quantite <= 0) throw erreur(400, 'Quantité invalide.');
  if (isNaN(debut) || isNaN(fin)) throw erreur(400, 'Horaires de récupération invalides.');
  if (fin <= debut) throw erreur(400, "L'heure de fin doit être après l'heure de début.");

  const donnees = {
    titre,
    description: texte(b.description),
    categorie: b.categorie,
    prixInitial,
    prixReduit,
    quantiteDisponible: quantite,
    heureDebutRecuperation: debut,
    heureFinRecuperation: fin,
  };
  if (typeof b.photo === 'string' && b.photo) donnees.photo = b.photo;
  return donnees;
}

// Offres visibles par les étudiants : actives, en stock, commerce validé.
// Filtres optionnels : q (titre ou commerce), categorie, prixMax.
router.get(
  '/',
  ...acces('etudiant'),
  wrap(async (req, res) => {
    const [offres, commerces] = await Promise.all([
      db.collection('offers').get(),
      db.collection('commerces').where('statutValidation', '==', 'VALIDE').get(),
    ]);
    const noms = new Map(commerces.docs.map((d) => [d.id, d.data().nom]));

    let liste = offres.docs
      .map(depuisDoc)
      .filter((o) => noms.has(o.commerceId))
      .map((o) => vue(o, noms.get(o.commerceId)))
      .filter((o) => o.statut === 'ACTIVE');

    const q = texte(req.query.q).toLowerCase();
    if (q) {
      liste = liste.filter(
        (o) => o.titre.toLowerCase().includes(q) || o.commerceNom.toLowerCase().includes(q)
      );
    }
    if (req.query.categorie) liste = liste.filter((o) => o.categorie === req.query.categorie);
    const prixMax = Number(req.query.prixMax);
    if (req.query.prixMax && !isNaN(prixMax)) liste = liste.filter((o) => o.prixReduit <= prixMax);

    liste.sort((a, b) => enDate(a.heureFinRecuperation) - enDate(b.heureFinRecuperation));
    res.json(liste);
  })
);

router.get(
  '/mine',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const commerce = await commerceDuCommercant(req.uid);
    if (!commerce) return res.json([]);
    const snap = await db.collection('offers').where('commerceId', '==', commerce.id).get();
    const liste = snap.docs.map(depuisDoc).map((o) => vue(o, commerce.nom));
    liste.sort((a, b) => String(b.dateCreation).localeCompare(String(a.dateCreation)));
    res.json(liste);
  })
);

router.post(
  '/',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const commerce = await commerceDuCommercant(req.uid);
    if (!commerce) throw erreur(403, "Inscrivez d'abord votre commerce.");
    if (commerce.statutValidation !== 'VALIDE') {
      throw erreur(403, "Votre commerce doit être validé par l'administrateur.");
    }
    const donnees = lireOffre(req.body);
    const ref = db.collection('offers').doc();
    await ref.set({ ...donnees, commerceId: commerce.id, dateCreation: FieldValue.serverTimestamp() });
    res.status(201).json(vue(depuisDoc(await ref.get()), commerce.nom));
  })
);

// Récupère l'offre et vérifie qu'elle appartient au commerçant connecté.
async function offreDuCommercant(req) {
  const commerce = await commerceDuCommercant(req.uid);
  const ref = db.collection('offers').doc(req.params.id);
  const snap = await ref.get();
  if (!commerce || !snap.exists || snap.data().commerceId !== commerce.id) {
    throw erreur(404, 'Offre introuvable.');
  }
  return { commerce, ref };
}

router.put(
  '/:id',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const { commerce, ref } = await offreDuCommercant(req);
    await ref.update(lireOffre(req.body));
    res.json(vue(depuisDoc(await ref.get()), commerce.nom));
  })
);

router.delete(
  '/:id',
  ...acces('commercant'),
  wrap(async (req, res) => {
    const { ref } = await offreDuCommercant(req);
    await ref.delete();
    res.status(204).end();
  })
);

module.exports = router;
