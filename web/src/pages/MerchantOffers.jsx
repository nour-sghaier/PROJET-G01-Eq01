import { useState } from 'react'
import Navbar from '../components/Navbar'
import { fakeOffers, categories } from '../data/fakeOffers'

function MerchantOffers() {
  const [offres, setOffres] = useState(fakeOffers)
  const [produit, setProduit] = useState('')
  const [categorie, setCategorie] = useState(categories[0])
  const [prixInitial, setPrixInitial] = useState('')
  const [prixReduit, setPrixReduit] = useState('')
  const [quantite, setQuantite] = useState('')
  const [erreur, setErreur] = useState('')
  const [idEnModification, setIdEnModification] = useState(null)

  const viderFormulaire = () => {
    setProduit('')
    setCategorie(categories[0])
    setPrixInitial('')
    setPrixReduit('')
    setQuantite('')
    setErreur('')
    setIdEnModification(null)
  }

  const commencerModification = (o) => {
    setIdEnModification(o.id)
    setProduit(o.produit)
    setCategorie(o.categorie)
    setPrixInitial(String(o.prixInitial))
    setPrixReduit(String(o.prixReduit))
    setQuantite(String(o.quantite))
    setErreur('')
  }

  const soumettre = (e) => {
    e.preventDefault()

    if (!produit.trim() || !prixInitial || !prixReduit || !quantite) {
      setErreur('Tous les champs sont obligatoires.')
      return
    }
    if (Number(prixReduit) >= Number(prixInitial)) {
      setErreur('Le prix réduit doit être inférieur au prix initial.')
      return
    }
    if (Number(quantite) < 1) {
      setErreur('La quantité doit être au moins 1.')
      return
    }

    if (idEnModification !== null) {
      setOffres(
        offres.map((o) =>
          o.id === idEnModification
            ? {
                ...o,
                produit: produit.trim(),
                categorie,
                prixInitial: Number(prixInitial),
                prixReduit: Number(prixReduit),
                quantite: Number(quantite),
              }
            : o
        )
      )
    } else {
      const nouvelle = {
        id: Date.now(),
        produit: produit.trim(),
        commerce: 'Mon commerce',
        categorie,
        prixInitial: Number(prixInitial),
        prixReduit: Number(prixReduit),
        quantite: Number(quantite),
        photo: 'https://placehold.co/400x300?text=Nouvelle+offre',
      }
      setOffres([...offres, nouvelle])
    }
    viderFormulaire()
  }

  const supprimer = (id) => {
    setOffres(offres.filter((o) => o.id !== id))
    if (id === idEnModification) viderFormulaire()
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Mes offres</h1>

        <form
          onSubmit={soumettre}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-3 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800">
            {idEnModification !== null ? 'Modifier l\'offre' : 'Publier une offre'}
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

          {erreur && (
            <p className="bg-red-100 text-red-700 p-3 rounded-lg">{erreur}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              {idEnModification !== null ? 'Enregistrer' : 'Publier'}
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
          {offres.map((o) => (
            <div
              key={o.id}
              className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-gray-800">{o.produit}</p>
                <p className="text-sm text-gray-500">
                  {o.categorie} · {o.prixReduit} DT (au lieu de {o.prixInitial}{' '}
                  DT) · Quantité : {o.quantite}
                </p>
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