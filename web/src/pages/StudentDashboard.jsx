import Navbar from '../components/Navbar'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const stats = [
  { titre: 'Commandes', valeur: 14 },
  { titre: 'Argent économisé', valeur: '42 DT' },
  { titre: 'Repas sauvés', valeur: 14 },
  { titre: 'Commerce favori', valeur: 'Café Campus' },
]

const depensesMois = [
  { mois: 'Août', depense: 12 },
  { mois: 'Sept', depense: 25 },
  { mois: 'Oct', depense: 18 },
  { mois: 'Nov', depense: 30 },
]

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Mon tableau de bord
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.titre} className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-500">{s.titre}</p>
              <p className="text-xl font-bold text-green-700">{s.valeur}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Mes dépenses par mois (DT)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={depensesMois}>
                <XAxis dataKey="mois" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="depense"
                  stroke="#16a34a"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard