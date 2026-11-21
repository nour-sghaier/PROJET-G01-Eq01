import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [role, setRole] = useState('student')
  const [erreurs, setErreurs] = useState({})
  const navigate = useNavigate()

  const valider = () => {
    const e = {}
    if (nom.trim().length < 3) {
      e.nom = 'Le nom doit contenir au moins 3 caractères.'
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.email = 'Email invalide (exemple : nom@mail.com).'
    }
    if (password.length < 6) {
      e.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    }
    if (confirmation !== password) {
      e.confirmation = 'Les mots de passe ne sont pas identiques.'
    }
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = valider()
    setErreurs(e)
    if (Object.keys(e).length > 0) return

    // Sera remplacé par Firebase
    console.log('Inscription :', nom, email, role)
    navigate('/login')
  }

  const classeInput = (champ) =>
    `border rounded-lg px-4 py-2 ${
      erreurs[champ] ? 'border-red-500' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-3"
      >
        <h1 className="text-3xl font-bold text-green-700 text-center">
          Inscription
        </h1>

        <input
          type="text"
          placeholder="Nom complet"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className={classeInput('nom')}
        />
        {erreurs.nom && <p className="text-sm text-red-600">{erreurs.nom}</p>}

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={classeInput('email')}
        />
        {erreurs.email && (
          <p className="text-sm text-red-600">{erreurs.email}</p>
        )}

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={classeInput('password')}
        />
        {erreurs.password && (
          <p className="text-sm text-red-600">{erreurs.password}</p>
        )}

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className={classeInput('confirmation')}
        />
        {erreurs.confirmation && (
          <p className="text-sm text-red-600">{erreurs.confirmation}</p>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="student">Étudiant</option>
          <option value="merchant">Commerçant</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          S'inscrire
        </button>

        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-700 font-semibold">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register