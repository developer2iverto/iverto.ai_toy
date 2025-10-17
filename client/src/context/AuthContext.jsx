import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, register as apiRegister, me as apiMe } from '../services/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    apiMe().then(setUser).catch(() => { localStorage.removeItem('token'); setUser(null) }).finally(() => setLoading(false))
  }, [])

  const login = async ({ email, password }) => {
    const { token, user } = await apiLogin({ email, password })
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }

  const register = async ({ email, password, name }) => {
    const { token, user } = await apiRegister({ email, password, name })
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }

  const logout = () => { localStorage.removeItem('token'); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}