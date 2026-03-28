// Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import { authAPI } from '../utils/api'

const navItems = [
  { section: 'Main' },
  { to: '/', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
  { section: 'Laboratory' },
  { to: '/participants', icon: 'bi-people-fill',          label: 'Participants' },
  { to: '/phlebotomy',   icon: 'bi-droplet-fill',          label: 'Phlebotomy' },
  { to: '/processing',   icon: 'bi-gear-fill',             label: 'Sample Processing' },
  { to: '/storage',      icon: 'bi-box-seam-fill',         label: 'Sample Storage' },
  { section: 'Management' },
  { to: '/inventory',    icon: 'bi-clipboard2-pulse-fill', label: 'Stock Inventory' },
  { to: '/audit',        icon: 'bi-journal-text',          label: 'Audit Logs' },
]

export default function Sidebar({ open, isMobile, onClose }) {
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

  /*
   * CSS class strategy:
   *
   * Desktop (isMobile=false):
   *   - sidebar is always position:fixed and visible (no translateX)
   *   - when open=false we add "desktop-hidden" which translateX(-100%)
   *   - Layout shifts main-content margin via sidebar-collapsed class
   *
   * Mobile (isMobile=true):
   *   - sidebar starts translated off-screen
   *   - "open" class slides it in
   *   - overlay appears behind it
   */
  const sidebarClass = [
    'sidebar',
    isMobile
      ? (open ? 'open' : '')           // mobile: open = slide in
      : (open ? '' : 'desktop-hidden'), // desktop: hidden = slide out
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Overlay — only renders/visible on mobile when drawer is open */}
      {isMobile && (
        <div
          className={`sidebar-overlay${open ? ' visible' : ''}`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClass} aria-label="Main navigation">

        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo-wrap">
            <span className="sidebar-logo">🧪</span>
          </div>
          <div style={{ minWidth: 0 }}>
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
                onClick={isMobile ? onClose : undefined}
                className={`nav-link${isActive ? ' active' : ''}`}
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
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">Lab Staff</div>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout} type="button">
            <i className="bi bi-box-arrow-left"></i>
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  )
}