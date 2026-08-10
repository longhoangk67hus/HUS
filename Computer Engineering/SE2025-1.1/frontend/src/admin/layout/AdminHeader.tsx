import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/useAuth'
import './AdminHeader.css'
import TokenSetter from './TokenSetter'

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const toggleMenu = () => setMenuOpen((s) => !s)

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target as Node)) return
      setMenuOpen(false)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <Link
        to="/"
        className="logo"
        onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
      >
        🎥 CINEMAX
      </Link>

      <nav className="nav">
        <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
          Bảng điều khiển
        </Link>
        <Link to="/admin/manual-booking" className={isActive('/admin/manual-booking') ? 'active' : ''}>
          Đặt vé
        </Link>
        <Link to="/admin/statistics" className={isActive('/admin/statistics') ? 'active' : ''}>
          Thống kê
        </Link>
      </nav>

      <div className="header-actions">
        {user ? (
          <div className="auth-user" ref={menuRef}>
            <button
              type="button"
              className="greeting-btn"
              onClick={toggleMenu}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              Xin chào: {user?.fullName ?? user?.userName ?? 'Admin'}
            </button>

            {menuOpen && (
              <div className="user-dropdown" role="menu">
                <button className="dropdown-item" role="menuitem" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/admin/login" className="btn btn-sm">
              Admin Sign In
            </Link>
            <TokenSetter />
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminHeader
