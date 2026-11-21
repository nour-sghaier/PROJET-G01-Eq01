import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const pageAccueil = {
  student: '/offers',
  merchant: '/merchant/offers',
  admin: '/admin/dashboard',
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Fausse connexion : sera remplacée par Firebase
    login(role)
    navigate(pageAccueil[role])
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-green-700 text-center">
          Connexion
        </h1>

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="student">Étudiant (test)</option>
          <option value="merchant">Commerçant (test)</option>
          <option value="admin">Administrateur (test)</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Se connecter
        </button>

        <p className="text-center text-sm text-gray-600">
          Pas de compte ?{' '}
          <Link to="/register" className="text-green-700 font-semibold">
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login