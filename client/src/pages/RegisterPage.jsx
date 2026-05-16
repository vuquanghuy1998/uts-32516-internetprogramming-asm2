import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register, adminExists } from '../services/authService'
import { showToast } from '../components/Toast/Toast'

export default function RegisterPage() {
  const { login: authLogin, token } = useAuth()
  const navigate = useNavigate()
  const [isFirstAdmin, setIsFirstAdmin] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => { document.title = 'Create Account — Cardie' }, [])
  useEffect(() => { if (token) navigate('/decks', { replace: true }) }, [token, navigate])

  useEffect(() => {
    adminExists().then(exists => setIsFirstAdmin(!exists)).catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required.'
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters.'
    if (!form.email.trim()) e.email = 'Email is required.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    try {
      const result = await register(form.username.trim(), form.email.trim(), form.password, form.fullName)
      authLogin(result.token, result.user)
      showToast(isFirstAdmin ? 'Admin account created!' : 'Account created!')
      navigate('/decks', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed.'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-input ${errors[key] ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(prev => ({ ...prev, [key]: '' })) }}
        autoComplete={key === 'password' || key === 'confirm' ? 'new-password' : key}
      />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Cardie</Link>
        {isFirstAdmin
          ? <><h1 className="auth-title">Set Up Admin Account</h1>
              <p className="auth-sub auth-admin-note">No admin exists yet — this account will become the admin.</p></>
          : <><h1 className="auth-title">Create Account</h1>
              <p className="auth-sub">Start studying smarter today</p></>
        }

        <form onSubmit={handleSubmit} className="auth-form">
          {field('username', 'Username *', 'text', 'e.g. john_doe')}
          {field('email', 'Email *', 'email', 'you@example.com')}
          {field('fullName', 'Full Name (optional)', 'text', 'Your display name')}
          {field('password', 'Password *', 'password', '6+ characters')}
          {field('confirm', 'Confirm Password *', 'password', 'Repeat your password')}
          {errors.general && <p className="field-error">{errors.general}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : isFirstAdmin ? 'Create Admin Account' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
