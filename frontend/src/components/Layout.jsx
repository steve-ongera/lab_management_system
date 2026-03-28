import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Navbar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}