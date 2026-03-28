import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { authAPI } from '../utils/api'

const navItems = [
  { section: 'Main' },
  { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
  { section: 'Laboratory' },
  { to: '/participants', icon: 'bi-people-fill', label: 'Participants' },
  { to: '/phlebotomy', icon: 'bi-droplet-fill', label: 'Phlebotomy' },
  { to: '/processing', icon: 'bi-gear-fill', label: 'Sample Processing' },
  { to: '/storage', icon: 'bi-box-seam-fill', label: 'Sample Storage' },
  { section: 'Management' },
  { to: '/inventory', icon: 'bi-clipboard2-pulse-fill', label: 'Stock Inventory' },
  { to: '/audit', icon: 'bi-journal-text', label: 'Audit Logs' },
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🧪</span>
          <div>
            <div className="sidebar-brand">LIMS</div>
            <div className="sidebar-subtitle">Laboratory Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section-label">{item.section}</div>
            }
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/'
                ? true
                : item.to === '/' && location.pathname === '/'
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}