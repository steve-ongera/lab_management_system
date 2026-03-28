import { useLocation } from 'react-router-dom'
import { useAuth } from '../App'

const titles = {
  '/': 'Dashboard',
  '/participants': 'Participants',
  '/phlebotomy': 'Phlebotomy',
  '/processing': 'Sample Processing',
  '/storage': 'Sample Storage',
  '/inventory': 'Stock Inventory',
  '/audit': 'Audit Logs',
}

export default function Navbar({ sidebarOpen, onToggle }) {
  const { user } = useAuth()
  const loc = useLocation()
  const title = titles[loc.pathname] || 'LIMS'
  const initials = user ? (user.first_name?.[0] || user.username[0]).toUpperCase() : 'U'

  return (
    <header className={`navbar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <button className="nav-toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
        <i className={`bi ${sidebarOpen ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse'}`}></i>
      </button>
      <span className="navbar-title">{title}</span>
      <div className="nav-user">
        <span className="d-none d-sm-inline text-muted" style={{fontSize:'0.8rem'}}>
          {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
        </span>
        <div className="nav-avatar">{initials}</div>
      </div>
    </header>
  )
}