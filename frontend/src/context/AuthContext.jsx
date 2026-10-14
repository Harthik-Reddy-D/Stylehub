import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('stylehub_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('stylehub_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const acceptAuth = (data) => {
    localStorage.setItem('stylehub_token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const register = async (values) => acceptAuth((await api.post('/auth/register', values)).data)
  const login = async (values) => acceptAuth((await api.post('/auth/login', values)).data)
  const logout = () => {
    localStorage.removeItem('stylehub_token')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, register, login, logout }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
