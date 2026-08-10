
import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/global.css';
import Layout from './components/Layout/Layout';
// Import JSX components sẵn có
import LoginPage from './pages/Login';
import BookList from './pages/BookList';
import AdminBooks from './pages/AdminBooks';
import Borrowers from './pages/Borrowers';
// Import components mới
import Dashboard from './components/Dashboard/Dashboard';
import BorrowReturn from './components/BorrowReturn/BorrowReturn';
import ApiTestComponent from './components/ApiTestComponent';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check for existing auth on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedUser && savedRole && savedAuth === 'true') {
      setCurrentUser(savedUser);
      setUserRole(savedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username, role) => {
    setCurrentUser(username);
    setUserRole(role);
    setIsAuthenticated(true);
    // Save to localStorage to persist login
    localStorage.setItem('currentUser', username);
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole} onPageChange={handlePageChange} />;
      case 'books':
        return userRole === 'admin' ? 
          <AdminBooks userRole={userRole} /> : 
          <BookList userRole={userRole} />;
      case 'book-list':
        return <BookList userRole={userRole} />;
      case 'authors':
        return <div className="page-placeholder">
          <h2>✍️ Trang Quản lý Tác giả</h2>
          <p>Chức năng quản lý tác giả đang được phát triển...</p>
        </div>;
      case 'categories':
        return <div className="page-placeholder">
          <h2>🏷️ Trang Quản lý Thể loại</h2>
          <p>Chức năng quản lý thể loại đang được phát triển...</p>
        </div>;
      case 'borrowing':
        return <BorrowReturn />;
      case 'borrowers':
        return userRole === 'admin' ? 
          <Borrowers userRole={userRole} /> :
          <BookList userRole={userRole} />;
      case 'reports':
        return <div className="page-placeholder">
          <h2>📈 Trang Báo cáo</h2>
          <p>Chức năng báo cáo đang được phát triển...</p>
        </div>;
      case 'api-test':
        return <ApiTestComponent />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="App">
      <Layout 
        currentPage={currentPage} 
        currentUser={currentUser}
        userRole={userRole}
        onLogout={handleLogout}
        onPageChange={handlePageChange}
      >
        {renderCurrentPage()}
      </Layout>
    </div>
  );
}

export default App;