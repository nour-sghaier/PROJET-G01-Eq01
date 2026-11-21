import { QRCodeSVG } from 'qrcode.react'
import Navbar from '../components/Navbar'

const fakeOrders = [
  {
    id: 'CMD-1001',
    produit: 'Pizza margherita',
    commerce: 'Pizzeria Essect',
    quantite: 2,
    total: 12,
    statut: 'Payée',
  },
  {
    id: 'CMD-1002',
    produit: 'Croissant',
    commerce: 'Boulangerie Lac',
    quantite: 3,
    total: 3,
    statut: 'Payée',
  },
]

function Orders() {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Mes commandes
        </h1>

        <div className="flex flex-col gap-4">
          {fakeOrders.map((o) => (
            <div
              key={o.id}
              className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm text-gray-500">{o.id}</p>
                <p className="text-xl font-bold text-gray-800">
                  {o.quantite} x {o.produit}
                </p>
                <p className="text-gray-500">{o.commerce}</p>
                <p className="text-green-700 font-semibold mt-1">
                  {o.total} DT · {o.statut}
                </p>
              </div>
              <QRCodeSVG value={o.id} size={96} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders