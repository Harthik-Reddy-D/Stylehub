import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="page-shell py-20 text-center text-ink/60">Loading your StyleHub account…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
