// Layout.jsx
import { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const DESKTOP_BP = 1024

function isMobileNow() {
  return typeof window !== 'undefined' && window.innerWidth < DESKTOP_BP
}

export default function Layout() {
  const [isMobile,     setIsMobile]     = useState(isMobileNow)
  const [desktopOpen,  setDesktopOpen]  = useState(!isMobileNow())  // sidebar visible on desktop
  const [mobileOpen,   setMobileOpen]   = useState(false)            // drawer open on mobile
  const location = useLocation()

  // ── Track resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      const mobile = isMobileNow()
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)   // reset drawer when going desktop
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ── Close mobile drawer on navigation ─────────────────────────────────────
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    if (isMobile) setMobileOpen(v => !v)
    else          setDesktopOpen(v => !v)
  }, [isMobile])

  const handleClose = useCallback(() => setMobileOpen(false), [])

  // ── Derived ───────────────────────────────────────────────────────────────
  // sidebarOpen drives the <Sidebar> "open" prop
  const sidebarOpen = isMobile ? mobileOpen : desktopOpen

  // navbarShifted: only shift navbar right on desktop when sidebar is open
  const navbarShifted = !isMobile && desktopOpen

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        isMobile={isMobile}
        onClose={handleClose}
      />

      {/*
        main-content gets margin-left only on desktop when sidebar is open.
        On mobile it's always full-width (CSS handles margin-left:0 via media query).
      */}
      <div className={`main-content${navbarShifted ? '' : ' sidebar-collapsed'}`}>
        <Navbar sidebarOpen={navbarShifted} onToggle={handleToggle} />
        <div className="page-body page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  )
}