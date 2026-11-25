import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../firebase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Le backend utilise etudiant/commercant, le reste du web utilise student/merchant.
const roleWeb = { etudiant: 'student', commercant: 'merchant', admin: 'admin' }
const versUtilisateur = (profil) => ({
  ...profil,
  role: roleWeb[profil.role] || profil.role,
})

async function appelApi(chemin, token, options = {}) {
  const res = await fetch(`${API}${chemin}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Erreur serveur')
  return data
}

export function messageFirebase(e) {
  switch (e.code) {
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou mot de passe incorrect.'
    case 'auth/weak-password':
      return 'Mot de passe trop faible (6 caractères minimum).'
    case 'auth/network-request-failed':
      return 'Problème de connexion réseau.'
    default:
      return e.message || 'Une erreur est survenue.'
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [chargement, setChargement] = useState(true)
  const enInscription = useRef(false)

  // Restaure la session au rechargement de la page.
  useEffect(() => {
    const stop = onAuthStateChanged(auth, async (fbUser) => {
      if (enInscription.current) return
      if (!fbUser) {
        setUser(null)
        setChargement(false)
        return
      }
      try {
        const token = await fbUser.getIdToken()
        setUser(versUtilisateur(await appelApi('/users/me', token)))
      } catch {
        setUser(null)
      }
      setChargement(false)
    })
    return stop
  }, [])

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    try {
      const token = await cred.user.getIdToken()
      const u = versUtilisateur(await appelApi('/users/me', token))
      setUser(u)
      return u
    } catch (e) {
      await signOut(auth)
      throw e
    }
  }

  const register = async ({ nom, email, password, role }) => {
    enInscription.current = true
    let cred
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password)
      const token = await cred.user.getIdToken()
      const [prenom, ...reste] = nom.trim().split(/\s+/)
      const profil = await appelApi('/users', token, {
        method: 'POST',
        body: JSON.stringify({
          prenom,
          nom: reste.join(' ') || prenom,
          email,
          role: role === 'merchant' ? 'commercant' : 'etudiant',
        }),
      })
      const u = versUtilisateur(profil)
      setUser(u)
      return u
    } catch (e) {
      // Évite un compte Auth orphelin sans profil Firestore.
      if (cred) await cred.user.delete().catch(() => {})
      throw e
    } finally {
      enInscription.current = false
    }
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, chargement, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}