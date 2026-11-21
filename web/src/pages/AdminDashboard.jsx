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
  { titre: 'Utilisateurs', valeur: 230 },
  { titre: 'Commerçants validés', valeur: 18 },
  { titre: 'En attente', valeur: 4 },
  { titre: 'Commandes totales', valeur: 940 },
]

const inscriptions = [
  { mois: 'Août', total: 20 },
  { mois: 'Sept', total: 55 },
  { mois: 'Oct', total: 90 },
  { mois: 'Nov', total: 65 },
]

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Tableau de bord administrateur
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
            Nouvelles inscriptions par mois
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inscriptions}>
                <XAxis dataKey="mois" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard