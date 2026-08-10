import React, { useState } from 'react';
import './Login.css';

const LoginPage = ({ onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (isRegisterMode) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập họ tên';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Vui lòng nhập email';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Vui lòng nhập số điện thoại';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isRegisterMode) {
        // Xử lý đăng ký
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        if (users.some(user => user.username === formData.username)) {
          setErrors({ username: 'Tên đăng nhập đã tồn tại' });
          return;
        }

        const newUser = {
          id: Date.now(),
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: 'user',
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsRegisterMode(false);
        resetForm();
      } else {
        // Xử lý đăng nhập
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const defaultUsers = [
          { username: 'admin', password: '123456', role: 'admin', fullName: 'Administrator' },
          { username: 'long', password: '123456', role: 'user', fullName: 'Hoàng Long' }
        ];

        const allUsers = [...defaultUsers, ...users];
        const user = allUsers.find(u => u.username === formData.username && u.password === formData.password);

        if (user) {
          onLogin(user.username, user.role, user.fullName || user.username);
        } else {
          setErrors({ password: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ password: 'Có lỗi xảy ra, vui lòng thử lại' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: ''
    });
    setErrors({});
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo">📚</div>
            <h1>{isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập'}</h1>
            <p>{isRegisterMode ? 'Tạo tài khoản mới để sử dụng hệ thống' : 'Chào mừng bạn quay trở lại'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
            <div className="form-group">
              <label htmlFor="fullName">Họ tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'error' : ''}
                placeholder="Nhập họ tên đầy đủ"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'error' : ''}
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {isRegisterMode && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Nhập địa chỉ email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Đang xử lý...' : (isRegisterMode ? 'Đăng ký' : 'Đăng nhập')}
          </button>

          <div className="form-footer">
            <p>
              {isRegisterMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              <button type="button" onClick={toggleMode} className="toggle-mode-btn">
                {isRegisterMode ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
              </button>
            </p>

            {!isRegisterMode && (
              <div className="demo-accounts">
                <p><strong>Tài khoản demo:</strong></p>
                <p>Admin: admin / 123456</p>
                <p>User: long / 123456</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
