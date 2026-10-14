import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { await login({ email, password }); navigate(location.state?.from?.pathname || '/', { replace: true }) }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }

  return <section className="auth-wrap"><div className="auth-card"><p className="eyebrow">Welcome back</p><h1 className="auth-title">Good to see you.</h1><p className="mt-3 text-sm text-ink/55">Sign in to pick up where your style left off.</p>
    <form className="mt-8 space-y-5" onSubmit={submit}><div><label className="field-label" htmlFor="email">Email address</label><input className="field w-full" id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div><div><label className="field-label" htmlFor="password">Password</label><input className="field w-full" id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div><Alert>{error}</Alert><button className="button button-dark w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form>
    <p className="mt-6 text-center text-sm text-ink/60">New to StyleHub? <Link className="font-semibold text-pine underline" to="/register">Create an account</Link></p>
  </div></section>
}
