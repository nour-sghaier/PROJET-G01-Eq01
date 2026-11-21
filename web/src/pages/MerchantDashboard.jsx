import Navbar from '../components/Navbar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const stats = [
  { titre: 'Offres publiées', valeur: 12 },
  { titre: 'Commandes reçues', valeur: 48 },
  { titre: 'Revenu', valeur: '215 DT' },
  { titre: 'Repas sauvés', valeur: 63 },
]

const ventesSemaine = [
  { jour: 'Lun', commandes: 5 },
  { jour: 'Mar', commandes: 8 },
  { jour: 'Mer', commandes: 6 },
  { jour: 'Jeu', commandes: 10 },
  { jour: 'Ven', commandes: 12 },
  { jour: 'Sam', commandes: 4 },
  { jour: 'Dim', commandes: 3 },
]

function MerchantDashboard() {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Tableau de bord
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.titre} className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-500">{s.titre}</p>
              <p className="text-2xl font-bold text-green-700">{s.valeur}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Commandes de la semaine
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventesSemaine}>
                <XAxis dataKey="jour" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="commandes" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MerchantDashboard