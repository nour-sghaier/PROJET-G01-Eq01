import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ roles, children }) {
  const { user, chargement } = useAuth()

  // Attend que Firebase restaure la session avant de décider.
  if (chargement) {
    return <p className="p-8 text-gray-600">Chargement…</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute