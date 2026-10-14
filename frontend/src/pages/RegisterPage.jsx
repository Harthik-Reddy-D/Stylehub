import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { await register({ full_name: fullName, email, password }); navigate('/', { replace: true }) }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }

  return <section className="auth-wrap"><div className="auth-card"><p className="eyebrow">Join the edit</p><h1 className="auth-title">Make it yours.</h1><p className="mt-3 text-sm text-ink/55">Create your account and keep your favourite finds together.</p>
    <form className="mt-8 space-y-5" onSubmit={submit}><div><label className="field-label" htmlFor="full-name">Full name</label><input className="field w-full" id="full-name" autoComplete="name" minLength="2" maxLength="120" required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div><div><label className="field-label" htmlFor="email">Email address</label><input className="field w-full" id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div><div><label className="field-label" htmlFor="password">Password</label><input className="field w-full" id="password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={password} onChange={(e) => setPassword(e.target.value)} /><p className="mt-1 text-xs text-ink/45">Use 8–72 characters.</p></div><Alert>{error}</Alert><button className="button button-dark w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button></form>
    <p className="mt-6 text-center text-sm text-ink/60">Already have an account? <Link className="font-semibold text-pine underline" to="/login">Sign in</Link></p>
  </div></section>
}
