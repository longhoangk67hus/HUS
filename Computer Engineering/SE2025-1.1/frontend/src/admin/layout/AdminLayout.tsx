import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import AdminHeader from './AdminHeader'
import './AdminLayout.css'

const AdminLayout: React.FC = () => {
  const { user, isLoading } = useAuth()

  // Check if user is loading - show loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // If not loading but no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has ADMIN role
  const isAdmin = user.roles?.includes('ADMIN')

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  // Only show sidebar on dashboard (admin home page)
  // const showSidebar = location.pathname === '/admin'

  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-container">
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
