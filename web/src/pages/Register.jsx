import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, messageFirebase } from '../context/AuthContext'
import AuthLayout, { Champ, MotDePasse, classeChamp } from '../components/AuthLayout'

const pageAccueil = {
  student: '/offers',
  merchant: '/merchant/offers',
}

const roles = [
  { valeur: 'student', titre: 'Étudiant', detail: 'Je réserve des repas' },
  { valeur: 'merchant', titre: 'Commerçant', detail: 'Je propose mes invendus' },
]

function Register() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [role, setRole] = useState('student')
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const valider = () => {
    const e = {}
    if (nom.trim().length < 3) e.nom = 'Le nom doit contenir au moins 3 caractères.'
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Email invalide (exemple : nom@mail.com).'
    if (password.length < 6) e.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    if (confirmation !== password) e.confirmation = 'Les mots de passe ne sont pas identiques.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = valider()
    setErreurs(e)
    if (Object.keys(e).length > 0) return

    setEnvoi(true)
    try {
      const u = await register({ nom, email, password, role })
      navigate(pageAccueil[u.role] || '/')
    } catch (err) {
      setErreurs({ serveur: messageFirebase(err) })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <AuthLayout
      titre="Créer un compte"
      sousTitre="Quelques secondes suffisent pour accéder aux offres."
      pied={
        <>
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-green-700 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col gap-5">
        {/* Choix du rôle */}
        <div role="radiogroup" aria-label="Type de compte" className="grid grid-cols-2 gap-3">
          {roles.map((r) => {
            const actif = role === r.valeur
            return (
              <button
                key={r.valeur}
                type="button"
                role="radio"
                aria-checked={actif}
                onClick={() => setRole(r.valeur)}
                className={`rounded-xl border-2 p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${
                  actif
                    ? 'border-green-700 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <span className={`block font-semibold ${actif ? 'text-green-800' : 'text-gray-800'}`}>
                  {r.titre}
                </span>
                <span className="block text-sm text-gray-500">{r.detail}</span>
              </button>
            )
          })}
        </div>

        <Champ id="nom" label="Nom complet" erreur={erreurs.nom}>
          <input
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            autoComplete="name"
            aria-invalid={!!erreurs.nom}
            aria-describedby={erreurs.nom ? 'nom-erreur' : undefined}
            className={classeChamp(erreurs.nom)}
          />
        </Champ>

        <Champ id="email" label="Adresse email" erreur={erreurs.email}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@mail.com"
            autoComplete="off"
            aria-invalid={!!erreurs.email}
            aria-describedby={erreurs.email ? 'email-erreur' : undefined}
            className={classeChamp(erreurs.email)}
          />
        </Champ>

        <div className="grid gap-5 sm:grid-cols-2">
          <Champ id="password" label="Mot de passe" erreur={erreurs.password}>
            <MotDePasse
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              invalide={!!erreurs.password}
            />
          </Champ>

          <Champ id="confirmation" label="Confirmation" erreur={erreurs.confirmation}>
            <MotDePasse
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              invalide={!!erreurs.confirmation}
            />
          </Champ>
        </div>

        {erreurs.serveur && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreurs.serveur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {envoi ? 'Inscription…' : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register