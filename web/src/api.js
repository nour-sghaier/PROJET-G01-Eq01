import { auth } from './firebase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function api(chemin, options = {}) {
  const token = await auth.currentUser?.getIdToken()
  const res = await fetch(`${API}${chemin}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Erreur serveur')
  return data
}