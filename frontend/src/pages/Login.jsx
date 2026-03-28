import { useState } from 'react'
import { useAuth } from '../App'
import { authAPI } from '../utils/api'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.user, res.data.token)
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <i className="bi bi-hospital-fill" style={{color:'var(--primary)'}}></i>
          <div className="login-brand">LIMS</div>
          <div className="login-sub">Laboratory Information Management System</div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{position:'relative'}}>
              <i className="bi bi-person-fill" style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}></i>
              <input
                type="text"
                className="form-control"
                style={{paddingLeft:32}}
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({...f, username: e.target.value}))}
                required autoFocus
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{position:'relative'}}>
              <i className="bi bi-lock-fill" style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}></i>
              <input
                type="password"
                className="form-control"
                style={{paddingLeft:32}}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:8}} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}></span> Signing in…</> : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:20,fontSize:'0.75rem',color:'var(--text-muted)'}}>
          Secure access · Authorized personnel only
        </p>
      </div>
    </div>
  )
}