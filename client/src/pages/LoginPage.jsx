import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/authService'
import { showToast } from '../components/Toast/Toast'

export default function LoginPage() {
  const { login: authLogin, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'Sign In — Cardie' }, [])
  useEffect(() => { if (token) navigate('/decks', { replace: true }) }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier.trim() || !form.password) {
      setError('Both fields are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await login(form.identifier.trim(), form.password)
      authLogin(result.token, result.user)
      navigate('/decks', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Cardie</Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue studying</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="your_username or email@example.com"
              value={form.identifier}
              onChange={e => { setForm(f => ({ ...f, identifier: e.target.value })); setError('') }}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
