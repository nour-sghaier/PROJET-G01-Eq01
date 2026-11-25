import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, messageFirebase } from '../context/AuthContext'
import AuthLayout, { Champ, MotDePasse, classeChamp } from '../components/AuthLayout'

const pageAccueil = {
  student: '/offers',
  merchant: '/merchant/offers',
  admin: '/admin/dashboard',
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setEnvoi(true)
    try {
      const u = await login(email.trim(), password)
      navigate(pageAccueil[u.role] || '/')
    } catch (err) {
      setErreur(messageFirebase(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <AuthLayout
      titre="Connexion"
      sousTitre="Content de te revoir. Connecte-toi pour voir les offres du jour."
      pied={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-green-700 hover:underline">
            S'inscrire
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Champ id="email" label="Adresse email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@mail.com"
            autoComplete="email"
            required
            className={classeChamp(false)}
          />
        </Champ>

        <Champ id="password" label="Mot de passe">
          <MotDePasse
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Champ>

        {erreur && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login