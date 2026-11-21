import { useState } from 'react'
import Navbar from '../components/Navbar'

const fakeMerchants = [
  { id: 1, nom: 'Café Campus', adresse: 'Rue de la Fac, Tunis', statut: 'en attente' },
  { id: 2, nom: 'Pizzeria Essect', adresse: 'Avenue Habib Bourguiba, Tunis', statut: 'validé' },
  { id: 3, nom: 'Boulangerie Lac', adresse: 'Les Berges du Lac, Tunis', statut: 'en attente' },
]

function AdminMerchants() {
  const [merchants, setMerchants] = useState(fakeMerchants)

  const changerStatut = (id, statut) => {
    setMerchants(
      merchants.map((m) => (m.id === id ? { ...m, statut } : m))
    )
  }

  const couleur = (statut) => {
    if (statut === 'validé') return 'bg-green-100 text-green-800'
    if (statut === 'refusé') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Validation des commerçants
        </h1>

        <div className="flex flex-col gap-3">
          {merchants.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-gray-800">{m.nom}</p>
                <p className="text-sm text-gray-500">{m.adresse}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${couleur(m.statut)}`}
                >
                  {m.statut}
                </span>
              </div>

              {m.statut === 'en attente' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => changerStatut(m.id, 'validé')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => changerStatut(m.id, 'refusé')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminMerchants