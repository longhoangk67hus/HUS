import React, { useState } from 'react';
import './Layout.css';

const Layout = ({ children, currentPage = 'dashboard', currentUser, userRole, onLogout, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleNavClick = (pageId) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
    // Close user menu if open
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Filter menu items based on user role
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/', roles: ['admin', 'user'] },
    { id: 'books', label: 'Quản lý Sách', icon: '📚', path: '/books', roles: ['admin'] },
    { id: 'authors', label: 'Quản lý Tác giả', icon: '✍️', path: '/authors', roles: ['admin'] },
    { id: 'categories', label: 'Quản lý Thể loại', icon: '🏷️', path: '/categories', roles: ['admin'] },
    { id: 'borrowing', label: 'Mượn/Trả Sách', icon: '🔄', path: '/borrowing', roles: ['admin', 'user'] },
    { id: 'reports', label: 'Báo cáo', icon: '📈', path: '/reports', roles: ['admin'] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Library Management</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm sách, tác giả..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>

        <div className="header-right">
          <div className="notifications">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
          </div>
          
          <div className="user-menu">
            <button className="user-btn" onClick={toggleUserMenu}>
              <div className="user-avatar">👤</div>
              <span className="user-name">{currentUser || 'User'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {userMenuOpen && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  👤 Hồ sơ cá nhân
                </div>
                <div className="dropdown-item">
                  ⚙️ Cài đặt
                </div>
                <hr className="dropdown-divider" />
                <div className="dropdown-item logout" onClick={handleLogout}>
                  🚪 Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-number">1,245</span>
              <span className="stat-label">Tổng sách</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">89</span>
              <span className="stat-label">Đang mượn</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'content-with-sidebar' : 'content-full'}`}>
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;