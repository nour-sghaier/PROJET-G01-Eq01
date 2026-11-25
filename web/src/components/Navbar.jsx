import { Link, NavLink, useNavigate } from 'react-router-dom'
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

const classeLien = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
    isActive ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-700 hover:text-white'
  }`

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const seDeconnecter = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 bg-green-800 shadow-sm">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-green-800" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z" />
              <path d="M5 19c3-4 6-7 10-9" />
            </svg>
          </span>
          <span className="text-xl font-bold text-white">CampusSave</span>
        </Link>

        {/* Sur mobile, les liens passent sur une 2e ligne défilable */}
        <div className="order-3 -mx-1 flex w-full items-center gap-1 overflow-x-auto md:order-none md:mx-0 md:w-auto md:flex-1 md:justify-end md:overflow-visible">
          {user ? (
            liens[user.role]?.map((l) => (
              <NavLink key={l.to} to={l.to} className={classeLien}>
                {l.label}
              </NavLink>
            ))
          ) : (
            <>
              <NavLink to="/login" className={classeLien}>Connexion</NavLink>
              <NavLink to="/register" className={classeLien}>Inscription</NavLink>
            </>
          )}
        </div>

        {user && (
          <button
            onClick={seDeconnecter}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Déconnexion
          </button>
        )}
      </nav>
    </header>
  )
}

export default Navbar