import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const libelle = {
  EN_ATTENTE_PAIEMENT: 'En attente de paiement',
  PAYEE: 'Payée',
  RECUPEREE: 'Récupérée',
  ANNULEE: 'Annulée',
}

function Orders() {
  const { user } = useAuth()
  const [commandes, setCommandes] = useState([])
  const [erreur, setErreur] = useState('')

  const charger = () =>
    api('/orders/mine').then(setCommandes).catch((e) => setErreur(e.message))

  useEffect(() => {
    if (user) charger()
  }, [user])

const payer = async (id) => {
  setErreur('')
  try {
    const { payUrl } = await api(`/orders/${id}/pay`, { method: 'POST' })
    window.location.href = payUrl.replace('10.0.2.2', 'localhost')
  } catch (e) {
    setErreur(e.message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Mes commandes
        </h1>

        {erreur && <p className="text-red-600 mb-4">{erreur}</p>}

        <div className="flex flex-col gap-4">
          {commandes.map((o) => (
            <div
              key={o.id}
              className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm text-gray-500">{o.id}</p>
                {o.lignes.map((l) => (
                  <p key={l.offreId} className="text-xl font-bold text-gray-800">
                    {l.quantite} x {l.titre}
                  </p>
                ))}
                <p className="text-gray-500">{o.commerceNom}</p>
                <p className="text-green-700 font-semibold mt-1">
                  {o.montantTotal} DT · {libelle[o.statut] || o.statut}
                </p>
                {o.statut === 'EN_ATTENTE_PAIEMENT' && (
                  <button
                    onClick={() => payer(o.id)}
                    className="mt-2 bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
                  >
                    Payer
                  </button>
                )}
              </div>
              {o.qrCode && <QRCodeSVG value={o.qrCode} size={96} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders