import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (isRegister && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (isRegister) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Họ tên không được để trống';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email không được để trống';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isRegister) {
        // Handle registration
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check if username already exists
        if (existingUsers.find(user => user.username === formData.username)) {
          setErrors({ general: 'Tên đăng nhập đã tồn tại' });
          return;
        }
        
        // Add new user
        const newUser = {
          id: Date.now(),
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          createdAt: new Date().toISOString()
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        // Auto login after registration
        onLogin(formData.username, formData.role);
      } else {
        // Handle login
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check default users first
        if (formData.username === 'admin' && formData.password === '123456') {
          onLogin(formData.username, 'admin');
        } else if (formData.username === 'long' && formData.password === '123456') {
          onLogin(formData.username, 'user');
        } else {
          // Check registered users
          const user = registeredUsers.find(u => 
            u.username === formData.username && u.password === formData.password
          );
          
          if (user) {
            onLogin(user.username, user.role);
          } else {
            setErrors({ general: 'Tên đăng nhập hoặc mật khẩu không đúng' });
          }
        }
      }
    } catch (error) {
      setErrors({ general: 'Có lỗi xảy ra, vui lòng thử lại' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (username) => {
    setFormData(prev => ({ ...prev, username, password: '123456' }));
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      role: 'user'
    });
    setErrors({});
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon">📚</span>
              <h1 className="logo-title">Library Management</h1>
            </div>
            <p className="login-subtitle">
              {isRegister ? 'Đăng ký tài khoản mới' : 'Hệ thống quản lý thư viện'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="alert alert-error">
                {errors.general}
              </div>
            )}

            {isRegister && (
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  👤 Họ và tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-control ${errors.fullName ? 'error' : ''}`}
                  placeholder="Nhập họ và tên"
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <div className="error-message">{errors.fullName}</div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                👤 Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-control ${errors.username ? 'error' : ''}`}
                placeholder="Nhập tên đăng nhập"
                disabled={isLoading}
              />
              {errors.username && (
                <div className="error-message">{errors.username}</div>
              )}
            </div>

            {isRegister && (
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  📧 Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Nhập địa chỉ email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                🔒 Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder={isRegister ? "Nhập mật khẩu (ít nhất 6 ký tự)" : "Nhập mật khẩu"}
                disabled={isLoading}
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            {isRegister && (
              <>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    🔒 Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <div className="error-message">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    👥 Vai trò
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-control"
                    disabled={isLoading}
                  >
                    <option value="user">👤 Người dùng</option>
                    <option value="admin">👨‍💼 Quản trị viên</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className={`btn btn-primary login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...'}
                </>
              ) : (
                isRegister ? '📝 Đăng ký' : '🚪 Đăng nhập'
              )}
            </button>

            <div className="auth-toggle">
              <p>
                {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleMode}
                  disabled={isLoading}
                >
                  {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                </button>
              </p>
            </div>
          </form>

          {!isRegister && (
            <div className="quick-login">
              <p className="quick-login-title">Đăng nhập nhanh (Demo):</p>
              <div className="quick-login-buttons">
                <button
                  type="button"
                  className="btn btn-secondary quick-btn"
                  onClick={() => quickLogin('admin')}
                  disabled={isLoading}
                >
                  👨‍💼 Admin
                </button>
                <button
                  type="button"
                  className="btn btn-secondary quick-btn"
                  onClick={() => quickLogin('long')}
                  disabled={isLoading}
                >
                  👤 Long
                </button>
              </div>
            </div>
          )}

          <div className="login-footer">
            <p className="footer-text">
              © 2025 Library Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;