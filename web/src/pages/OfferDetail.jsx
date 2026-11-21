import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fakeOffers } from '../data/fakeOffers'

function OfferDetail() {
  const { id } = useParams()
  const offer = fakeOffers.find((o) => o.id === Number(id))

  const [quantite, setQuantite] = useState(1)
  const [message, setMessage] = useState('')

  if (!offer) {
    return (
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <div className="p-8">
          <p className="text-gray-600 mb-4">Offre introuvable.</p>
          <Link to="/offers" className="text-green-700 font-semibold">
            Retour aux offres
          </Link>
        </div>
      </div>
    )
  }

  const total = quantite * offer.prixReduit

  const diminuer = () => {
    if (quantite > 1) setQuantite(quantite - 1)
  }

  const augmenter = () => {
    if (quantite < offer.quantite) setQuantite(quantite + 1)
  }

  const reserver = () => {
    setMessage(
      `Réservation enregistrée : ${quantite} x ${offer.produit} pour ${total} DT.`
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-3xl mx-auto">
        <Link to="/offers" className="text-green-700 font-semibold">
          ← Retour aux offres
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-4">
          <img
            src={offer.photo}
            alt={offer.produit}
            className="w-full h-64 object-cover"
          />
          <div className="p-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-800">
              {offer.produit}
            </h1>
            <p className="text-gray-500">
              {offer.commerce} · {offer.categorie}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-gray-400 line-through">
                {offer.prixInitial} DT
              </span>
              <span className="text-3xl font-bold text-green-700">
                {offer.prixReduit} DT
              </span>
            </div>
            <p className="text-gray-600">
              Quantité disponible : {offer.quantite}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={diminuer}
                className="w-10 h-10 rounded-lg bg-gray-200 text-xl font-bold hover:bg-gray-300"
              >
                −
              </button>
              <span className="text-xl font-bold">{quantite}</span>
              <button
                onClick={augmenter}
                className="w-10 h-10 rounded-lg bg-gray-200 text-xl font-bold hover:bg-gray-300"
              >
                +
              </button>
            </div>

            <p className="text-lg font-semibold text-gray-800 mt-2">
              Total : {total} DT
            </p>

            <button
              onClick={reserver}
              className="mt-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Réserver
            </button>

            {message && (
              <p className="mt-2 bg-green-100 text-green-800 p-3 rounded-lg">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfferDetail