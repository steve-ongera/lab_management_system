// Layout.jsx
import { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  // On desktop (≥1024px) sidebar starts open; on mobile it starts closed
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Close sidebar on mobile when route changes
  const location = useLocation()
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), [])

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Navbar sidebarOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="page-body page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  )
}