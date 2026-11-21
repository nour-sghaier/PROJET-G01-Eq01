import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const liens = {
  student: [
    { to: '/offers', label: 'Offres' },
    { to: '/orders', label: 'Mes commandes' },
    { to: '/dashboard', label: 'Mon tableau de bord' },
  ],
  merchant: [
    { to: '/merchant/offers', label: 'Mes offres' },
    { to: '/merchant/scan', label: 'Scanner' },
    { to: '/merchant/dashboard', label: 'Tableau de bord' },
  ],
  admin: [
    { to: '/admin/merchants', label: 'Commerçants' },
    { to: '/admin/users', label: 'Utilisateurs' },
    { to: '/admin/dashboard', label: 'Tableau de bord' },
  ],
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const seDeconnecter = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-green-700 text-white px-8 py-4 flex items-center justify-between">
      <span className="text-2xl font-bold">CampusSave</span>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            {liens[user.role].map((l) => (
              <Link key={l.to} to={l.to} className="hover:underline">
                {l.label}
              </Link>
            ))}
            <button
              onClick={seDeconnecter}
              className="bg-white text-green-700 px-4 py-1 rounded-lg font-semibold hover:bg-green-100"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Connexion
            </Link>
            <Link to="/register" className="hover:underline">
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar