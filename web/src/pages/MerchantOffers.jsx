import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'
import CommerceForm from '../components/CommerceForm'
import { imageEnBase64 } from '../imageBase64'


// Catégories acceptées par le backend.
const categories = [
  'Plat chaud',
  'Sandwich',
  'Pâtisserie',
  'Boisson',
  'Fruits et légumes',
  'Autre',
]

// Date -> format attendu par <input type="datetime-local">
const versLocal = (d) => {
  const x = new Date(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`
}

const dansQuatreHeures = () => versLocal(new Date(Date.now() + 4 * 3600 * 1000))

function MerchantOffers() {
  const [offres, setOffres] = useState([])
  const [produit, setProduit] = useState('')
  const [categorie, setCategorie] = useState(categories[0])
  const [prixInitial, setPrixInitial] = useState('')
  const [prixReduit, setPrixReduit] = useState('')
  const [photo, setPhoto] = useState('')
  const [quantite, setQuantite] = useState('')
  const [heureDebut, setHeureDebut] = useState(() => versLocal(new Date()))
  const [heureFin, setHeureFin] = useState(dansQuatreHeures)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [idEnModification, setIdEnModification] = useState(null)
  const [commerce, setCommerce] = useState(null)
const [commerceCharge, setCommerceCharge] = useState(false)

  const charger = () =>
    api('/offers/mine')
      .then(setOffres)
      .catch((e) => setErreur(e.message))

  useEffect(() => {
  api('/commerces/me')
    .then(setCommerce)
    .catch(() => setCommerce(null))
    .finally(() => setCommerceCharge(true))
}, [])

  const choisirPhoto = async (e) => {
    const fichier = e.target.files[0]
    if (!fichier) return
    try {
      setPhoto(await imageEnBase64(fichier))
    } catch (err) {
      setErreur(err.message)
    }
  }

  const viderFormulaire = () => {
    setProduit('')
    setCategorie(categories[0])
    setPrixInitial('')
    setPrixReduit('')
    setQuantite('')
    setPhoto('')
    setHeureDebut(versLocal(new Date()))
    setHeureFin(dansQuatreHeures())
    setErreur('')
    setIdEnModification(null)
  }

  const commencerModification = (o) => {
    setIdEnModification(o.id)
    setProduit(o.titre)
    setCategorie(o.categorie)
    setPrixInitial(String(o.prixInitial))
    setPrixReduit(String(o.prixReduit))
    setQuantite(String(o.quantiteDisponible))
    setPhoto(o.photo || '')
    setHeureDebut(versLocal(o.heureDebutRecuperation))
    setHeureFin(versLocal(o.heureFinRecuperation))
    setErreur('')
  }

  const soumettre = async (e) => {
    e.preventDefault()

    if (!produit.trim() || !prixInitial || !prixReduit || !quantite) {
      setErreur('Tous les champs sont obligatoires.')
      return
    }
    if (Number(prixReduit) >= Number(prixInitial)) {
      setErreur('Le prix réduit doit être inférieur au prix initial.')
      return
    }
    if (!Number.isInteger(Number(quantite)) || Number(quantite) < 1) {
      setErreur('La quantité doit être un entier d\'au moins 1.')
      return
    }
    if (new Date(heureFin) <= new Date(heureDebut)) {
      setErreur("L'heure de fin doit être après l'heure de début.")
      return
    }

    const corps = {
      titre: produit.trim(),
      categorie,
      prixInitial: Number(prixInitial),
      prixReduit: Number(prixReduit),
      quantiteDisponible: Number(quantite),
      heureDebutRecuperation: new Date(heureDebut).toISOString(),
      heureFinRecuperation: new Date(heureFin).toISOString(),
      ...(photo ? { photo } : {}),
    }

    setEnvoi(true)
    setErreur('')
    try {
      if (idEnModification !== null) {
        await api(`/offers/${idEnModification}`, {
          method: 'PUT',
          body: JSON.stringify(corps),
        })
      } else {
        await api('/offers', { method: 'POST', body: JSON.stringify(corps) })
      }
      viderFormulaire()
      await charger()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  const supprimer = async (id) => {
    try {
      await api(`/offers/${id}`, { method: 'DELETE' })
      if (id === idEnModification) viderFormulaire()
      await charger()
    } catch (err) {
      setErreur(err.message)
    }
  }
  if (!commerceCharge) return <p className="p-8">Chargement…</p>

if (!commerce) {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <CommerceForm onCree={setCommerce} />
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Mes offres</h1>
        {commerce.statutValidation !== 'VALIDE' && (
  <p className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
    Votre commerce est en attente de validation par l'administrateur.
    Vous pourrez publier des offres une fois validé.
  </p>
)}

        <form
          onSubmit={soumettre}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-3 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800">
            {idEnModification !== null ? "Modifier l'offre" : 'Publier une offre'}
          </h2>

          <input
            type="text"
            placeholder="Nom du produit"
            value={produit}
            onChange={(e) => setProduit(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />

          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Prix initial (DT)"
              value={prixInitial}
              onChange={(e) => setPrixInitial(e.target.value)}
              className="w-1/3 border border-gray-300 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              placeholder="Prix réduit (DT)"
              value={prixReduit}
              onChange={(e) => setPrixReduit(e.target.value)}
              className="w-1/3 border border-gray-300 rounded-lg px-4 py-2"
            />
            <input
              type="number"
              placeholder="Quantité"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-1/3 border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex gap-3">
            <label className="w-1/2 text-sm text-gray-600">
              Récupération : début
              <input
                type="datetime-local"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </label>
            <label className="w-1/2 text-sm text-gray-600">
              Récupération : fin
              <input
                type="datetime-local"
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </label>
          </div>

          <label className="text-sm text-gray-600">
            Photo (facultatif)
            <input
              type="file"
              accept="image/*"
              onChange={choisirPhoto}
              className="mt-1 block w-full text-sm"
            />
          </label>
          {photo && (
            <img
              src={photo}
              alt="Aperçu"
              className="h-32 w-48 object-cover rounded-lg"
            />
          )}

          {erreur && (
            <p className="bg-red-100 text-red-700 p-3 rounded-lg">{erreur}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={envoi}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {envoi
                ? 'Envoi…'
                : idEnModification !== null
                  ? 'Enregistrer'
                  : 'Publier'}
            </button>
            {idEnModification !== null && (
              <button
                type="button"
                onClick={viderFormulaire}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-col gap-3">
          {offres.length === 0 && (
            <p className="text-gray-600">Aucune offre publiée pour le moment.</p>
          )}
          {offres.map((o) => (
            <div
              key={o.id}
              className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {o.photo && (
                  <img
                    src={o.photo}
                    alt={o.titre}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-800">{o.titre}</p>
                  <p className="text-sm text-gray-500">
                    {o.categorie} · {o.prixReduit} DT (au lieu de{' '}
                    {o.prixInitial} DT) · Quantité : {o.quantiteDisponible}
                    {o.statut && ` · ${o.statut}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => commencerModification(o)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Modifier
                </button>
                <button
                  onClick={() => supprimer(o.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MerchantOffers