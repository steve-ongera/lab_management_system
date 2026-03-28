// Navbar.jsx
import { useLocation } from 'react-router-dom'
import { useAuth } from '../App'

const titles = {
  '/':             { label: 'Dashboard',        icon: 'bi-speedometer2' },
  '/participants': { label: 'Participants',      icon: 'bi-people-fill' },
  '/phlebotomy':   { label: 'Phlebotomy',        icon: 'bi-droplet-fill' },
  '/processing':   { label: 'Sample Processing', icon: 'bi-gear-fill' },
  '/storage':      { label: 'Sample Storage',    icon: 'bi-box-seam-fill' },
  '/inventory':    { label: 'Stock Inventory',   icon: 'bi-clipboard2-pulse-fill' },
  '/audit':        { label: 'Audit Logs',        icon: 'bi-journal-text' },
}

export default function Navbar({ sidebarOpen, onToggle }) {
  const { user } = useAuth()
  const loc = useLocation()

  const page = titles[loc.pathname] || { label: 'LIMS', icon: 'bi-grid-fill' }

  const initials = user
    ? (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()
    : 'U'

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User'

  return (
    <header
      className={`navbar${sidebarOpen ? '' : ' sidebar-collapsed'}`}
      role="banner"
    >
      {/* Toggle */}
      <button
        className="nav-toggle-btn"
        onClick={onToggle}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        type="button"
      >
        <i className={`bi ${sidebarOpen ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse'}`}></i>
      </button>

      {/* Page title */}
      <div className="navbar-breadcrumb">
        <i
          className={`bi ${page.icon}`}
          style={{ color: 'var(--text-muted)', fontSize: '1rem' }}
        ></i>
        <span className="navbar-title">{page.label}</span>
      </div>

      {/* Right side */}
      <div className="nav-actions">
        <button
          className="nav-icon-btn d-none-mobile"
          aria-label="Notifications"
          type="button"
        >
          <i className="bi bi-bell"></i>
        </button>

        <div className="nav-sep d-none-mobile"></div>

        <div className="nav-user" role="button" tabIndex={0} aria-label="User menu">
          <div className="nav-user-info d-none-mobile">
            <span className="nav-user-name">{displayName}</span>
            <span className="nav-user-role">Lab Staff</span>
          </div>
          <div className="nav-avatar" aria-hidden="true">{initials}</div>
        </div>
      </div>
    </header>
  )
}