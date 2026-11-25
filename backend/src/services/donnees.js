const { db } = require('../firebase');
const { depuisDoc, enDate } = require('../utils');

// Commerce appartenant au commerçant (null s'il n'en a pas encore).
async function commerceDuCommercant(uid) {
  const q = await db
    .collection('commerces')
    .where('proprietaireId', '==', uid)
    .limit(1)
    .get();
  return q.empty ? null : depuisDoc(q.docs[0]);
}

// Le statut d'une offre est calculé (pas stocké) : épuisée, expirée ou active.
function statutOffre(offre) {
  if (offre.quantiteDisponible <= 0) return 'EPUISEE';
  if (enDate(offre.heureFinRecuperation) < new Date()) return 'EXPIREE';
  return 'ACTIVE';
}

const vueCommerce = (c) => ({
  id: c.id,
  nom: c.nom,
  type: c.type,
  adresse: c.adresse,
  telephone: c.telephone || null,
  description: c.description || '',
  statutValidation: c.statutValidation,
});

module.exports = { commerceDuCommercant, statutOffre, vueCommerce };
