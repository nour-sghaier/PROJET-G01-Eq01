import { Link, useNavigate } from 'react-router-dom'

function OfferCard({ offer }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {offer.photo ? (
        <img
          src={offer.photo}
          alt={offer.produit}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
          Pas de photo
        </div>
      )}
      <div className="p-4 flex flex-col gap-1">
        <Link to={`/offers/${offer.id}`}>
          <h2 className="text-lg font-bold text-gray-800 hover:underline">
            {offer.produit}
          </h2>
        </Link>
        <p className="text-sm text-gray-500">{offer.commerce}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-400 line-through">
            {offer.prixInitial} DT
          </span>
          <span className="text-xl font-bold text-green-700">
            {offer.prixReduit} DT
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Quantité restante : {offer.quantite}
        </p>
        <button
          onClick={() => navigate(`/offers/${offer.id}`)}
          className="mt-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Réserver
        </button>
      </div>
    </div>
  )
}

export default OfferCard