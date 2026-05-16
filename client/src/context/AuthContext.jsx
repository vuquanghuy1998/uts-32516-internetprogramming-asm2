import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cardie_token'))
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('cardie_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = (tokenValue, userData) => {
    localStorage.setItem('cardie_token', tokenValue)
    localStorage.setItem('cardie_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('cardie_token')
    localStorage.removeItem('cardie_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser }
    localStorage.setItem('cardie_user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
