import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Participants from './pages/Participants'
import Phlebotomy from './pages/Phlebotomy'
import Processing from './pages/Processing'
import Storage from './pages/Storage'
import Inventory from './pages/Inventory'
import AuditLogs from './pages/AuditLogs'
import Layout from './components/Layout'

export const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('lims_user')
    return u ? JSON.parse(u) : null
  })

  const login = (userData, token) => {
    localStorage.setItem('lims_token', token)
    localStorage.setItem('lims_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('lims_token')
    localStorage.removeItem('lims_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="participants" element={<Participants />} />
            <Route path="phlebotomy" element={<Phlebotomy />} />
            <Route path="processing" element={<Processing />} />
            <Route path="storage" element={<Storage />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="audit" element={<AuditLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}