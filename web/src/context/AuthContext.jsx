import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Fausse connexion : on choisit juste un rôle.
  // Plus tard, ce sera remplacé par Firebase.
  const login = (role) => {
    setUser({ nom: 'Utilisateur test', role })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}