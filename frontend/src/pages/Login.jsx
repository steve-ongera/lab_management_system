// Login.jsx
import { useState } from 'react'
import { useAuth } from '../App'
import { authAPI } from '../utils/api'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.user, res.data.token)
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px 16px',
    }}>

      {/* Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        width: '100%',
        maxWidth: '420px',
        padding: '40px 36px 36px',
      }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--brand-600), var(--teal-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(2,113,198,0.28)',
          }}>
            <i className="bi bi-hospital-fill" style={{ color: '#fff', fontSize: '1.6rem' }}></i>
          </div>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}>
            LIMS
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              Username <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <div className="input-group">
              <i className="bi bi-person-fill input-icon"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
                autoComplete="username"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">
              Password <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <div className="input-group">
              <i className="bi bi-lock-fill input-icon"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control has-right-icon"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', fontSize: 'var(--text-md)', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-white" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                Signing in…
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Sign In
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: 'var(--text-subtle)',
        }}>
          <i className="bi bi-shield-lock-fill" style={{ color: 'var(--success-600)' }}></i>
          Secure access · Authorized personnel only
        </div>

      </div>
    </div>
  )
}