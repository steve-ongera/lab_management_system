// Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { authAPI } from '../utils/api'

const navItems = [
  { section: 'Main' },
  { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
  { section: 'Laboratory' },
  { to: '/participants',  icon: 'bi-people-fill',          label: 'Participants' },
  { to: '/phlebotomy',   icon: 'bi-droplet-fill',          label: 'Phlebotomy' },
  { to: '/processing',   icon: 'bi-gear-fill',             label: 'Sample Processing' },
  { to: '/storage',      icon: 'bi-box-seam-fill',         label: 'Sample Storage' },
  { section: 'Management' },
  { to: '/inventory',    icon: 'bi-clipboard2-pulse-fill', label: 'Stock Inventory' },
  { to: '/audit',        icon: 'bi-journal-text',          label: 'Audit Logs' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
  }

  const initials = user
    ? (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()
    : 'U'

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User'

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">

        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo-wrap">
            <span className="sidebar-logo">🧪</span>
          </div>
          <div>
            <div className="sidebar-brand">LIMS</div>
            <div className="sidebar-subtitle">Laboratory Management</div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar-nav" role="navigation">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={`sec-${i}`} className="nav-section-label">
                  {item.section}
                </div>
              )
            }

            const isActive = item.exact
              ? location.pathname === item.to
              : item.to !== '/' && location.pathname.startsWith(item.to)

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="sidebar-footer">
          {/* User info strip */}
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">Lab Staff</div>
            </div>
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout} type="button">
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  )
}