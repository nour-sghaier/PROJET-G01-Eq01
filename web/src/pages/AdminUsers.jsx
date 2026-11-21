import { useState } from 'react'
import Navbar from '../components/Navbar'

const fakeUsers = [
  { id: 1, nom: 'Amine Ben Salah', email: 'amine@mail.com', role: 'student', bloque: false },
  { id: 2, nom: 'Sarra Trabelsi', email: 'sarra@mail.com', role: 'student', bloque: false },
  { id: 3, nom: 'Café Campus', email: 'cafe@mail.com', role: 'merchant', bloque: false },
  { id: 4, nom: 'Pizzeria Essect', email: 'pizza@mail.com', role: 'merchant', bloque: true },
]

const nomsRoles = {
  student: 'Étudiant',
  merchant: 'Commerçant',
  admin: 'Administrateur',
}

function AdminUsers() {
  const [users, setUsers] = useState(fakeUsers)
  const [filtreRole, setFiltreRole] = useState('')

  const basculerBlocage = (id) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, bloque: !u.bloque } : u)))
  }

  const usersFiltres = users.filter(
    (u) => filtreRole === '' || u.role === filtreRole
  )

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Gestion des utilisateurs
        </h1>

        <select
          value={filtreRole}
          onChange={(e) => setFiltreRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white mb-6"
        >
          <option value="">Tous les rôles</option>
          <option value="student">Étudiants</option>
          <option value="merchant">Commerçants</option>
        </select>

        <div className="flex flex-col gap-3">
          {usersFiltres.map((u) => (
            <div
              key={u.id}
              className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-gray-800">{u.nom}</p>
                <p className="text-sm text-gray-500">
                  {u.email} · {nomsRoles[u.role]}
                </p>
                {u.bloque && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                    bloqué
                  </span>
                )}
              </div>

              <button
                onClick={() => basculerBlocage(u.id)}
                className={
                  u.bloque
                    ? 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700'
                    : 'bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600'
                }
              >
                {u.bloque ? 'Débloquer' : 'Bloquer'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers