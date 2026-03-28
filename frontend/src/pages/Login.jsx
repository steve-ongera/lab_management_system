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
    <div className="login-page">

      {/* ── Left: Brand Panel ── */}
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <i className="bi bi-hospital-fill" style={{ color: '#fff' }}></i>
          </div>
          <div className="login-brand-title">LIMS</div>
          <div className="login-brand-desc">
            Laboratory Information Management System — your complete solution for sample tracking, inventory and audit compliance.
          </div>

          <div className="login-brand-features">
            <div className="login-feature">
              <i className="bi bi-droplet-fill"></i>
              <span className="login-feature-text">Sample collection & processing tracking</span>
            </div>
            <div className="login-feature">
              <i className="bi bi-clipboard2-pulse-fill"></i>
              <span className="login-feature-text">Real-time inventory & stock management</span>
            </div>
            <div className="login-feature">
              <i className="bi bi-shield-fill-check"></i>
              <span className="login-feature-text">Full audit trail & compliance logging</span>
            </div>
            <div className="login-feature">
              <i className="bi bi-bar-chart-fill"></i>
              <span className="login-feature-text">Analytics dashboard & Excel exports</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">

          <div className="login-form-header">
            <h1 className="login-form-title">Welcome back</h1>
            <p className="login-form-sub">Sign in to your LIMS account to continue</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="form-group">
              <label className="form-label">
                Username <span className="required">*</span>
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
            <div className="form-group">
              <label className="form-label">
                Password <span className="required">*</span>
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
              className="btn btn-primary w-full"
              style={{ marginTop: 8, height: 42, fontSize: '0.9375rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-white"></span>
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

          {/* Footer note */}
          <div className="login-form-footer" style={{ marginTop: 28 }}>
            <div className="login-secure-note">
              <i className="bi bi-shield-lock-fill text-success"></i>
              Secure access · Authorized personnel only
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}