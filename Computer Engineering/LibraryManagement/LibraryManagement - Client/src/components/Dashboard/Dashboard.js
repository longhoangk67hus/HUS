import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ onPageChange, userRole }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalCategories: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    totalUsers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalBooks: 1245,
        totalAuthors: 342,
        totalCategories: 28,
        activeBorrows: 89,
        overdueBorrows: 12,
        totalUsers: 156
      });

      setRecentActivities([
        { id: 1, type: 'borrow', user: 'Nguyễn Văn A', book: 'Clean Code', time: '2 phút trước', icon: '📚' },
        { id: 2, type: 'return', user: 'Trần Thị B', book: 'Design Patterns', time: '15 phút trước', icon: '📖' },
        { id: 3, type: 'overdue', user: 'Lê Văn C', book: 'JavaScript Guide', time: '1 giờ trước', icon: '⚠️' },
        { id: 4, type: 'borrow', user: 'Phạm Thị D', book: 'React Handbook', time: '2 giờ trước', icon: '📚' },
        { id: 5, type: 'return', user: 'Hoàng Văn E', book: 'Node.js Guide', time: '3 giờ trước', icon: '📖' }
      ]);

      setPopularBooks([
        { id: 1, title: 'Clean Code', author: 'Robert Martin', borrows: 45, rating: 4.8 },
        { id: 2, title: 'Design Patterns', author: 'Gang of Four', borrows: 38, rating: 4.7 },
        { id: 3, title: 'JavaScript Guide', author: 'Douglas Crockford', borrows: 32, rating: 4.6 },
        { id: 4, title: 'React Handbook', author: 'Alex Banks', borrows: 28, rating: 4.5 },
        { id: 5, title: 'Node.js Guide', author: 'Kyle Simpson', borrows: 25, rating: 4.4 }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <span>{icon}</span>
      </div>
      <div className="stat-content">
        <div className="stat-value">{loading ? '...' : value.toLocaleString()}</div>
        <div className="stat-title">{title}</div>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗️' : '↘️'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className={`activity-item ${activity.type}`}>
      <div className="activity-icon">{activity.icon}</div>
      <div className="activity-content">
        <div className="activity-text">
          <strong>{activity.user}</strong>
          {activity.type === 'borrow' && ' đã mượn '}
          {activity.type === 'return' && ' đã trả '}
          {activity.type === 'overdue' && ' quá hạn '}
          <em>{activity.book}</em>
        </div>
        <div className="activity-time">{activity.time}</div>
      </div>
    </div>
  );

  const BookItem = ({ book, index }) => (
    <div className="popular-book-item">
      <div className="book-rank">#{index + 1}</div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">by {book.author}</div>
        <div className="book-stats">
          <span className="book-borrows">📊 {book.borrows} lượt mượn</span>
          <span className="book-rating">⭐ {book.rating}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Dashboard</h1>
        <p className="dashboard-subtitle">
          {userRole === 'admin' ? 'Tổng quan hệ thống thư viện' : 'Thông tin cá nhân và hoạt động mượn sách'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {userRole === 'admin' ? (
          <>
            <StatCard
              title="Tổng số sách"
              value={stats.totalBooks}
              icon="📚"
              color="primary"
              trend={8.2}
            />
            <StatCard
              title="Tác giả"
              value={stats.totalAuthors}
              icon="✍️"
              color="success"
              trend={3.1}
            />
            <StatCard
              title="Thể loại"
              value={stats.totalCategories}
              icon="🏷️"
              color="info"
              trend={1.5}
            />
            <StatCard
              title="Đang mượn"
              value={stats.activeBorrows}
              icon="📖"
              color="warning"
              trend={-2.3}
            />
            <StatCard
              title="Quá hạn"
              value={stats.overdueBorrows}
              icon="⚠️"
              color="danger"
              trend={-15.7}
            />
            <StatCard
              title="Người dùng"
              value={stats.totalUsers}
              icon="👥"
              color="secondary"
              trend={12.4}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Sách đang mượn"
              value={5}
              icon="📖"
              color="warning"
            />
            <StatCard
              title="Lịch sử mượn"
              value={23}
              icon="📚"
              color="info"
            />
            <StatCard
              title="Quá hạn"
              value={1}
              icon="⚠️"
              color="danger"
            />
            <StatCard
              title="Yêu thích"
              value={12}
              icon="❤️"
              color="success"
            />
          </>
        )}
      </div>

      <div className="dashboard-content">
        {/* Recent Activities */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h3>🔄 {userRole === 'admin' ? 'Hoạt động gần đây' : 'Hoạt động mượn sách của bạn'}</h3>
              <a href="#" className="view-all">Xem tất cả</a>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Books */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <h3>🔥 Sách phổ biến</h3>
              <a href="#" className="view-all">Xem chi tiết</a>
            </div>
            <div className="card-body">
              <div className="popular-books-list">
                {popularBooks.map((book, index) => (
                  <BookItem key={book.id} book={book} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="quick-actions-title">⚡ Thao tác nhanh</h3>
        <div className="quick-actions-grid">
          {userRole === 'admin' && (
            <>
              <button 
                onClick={() => onPageChange && onPageChange('books')} 
                className="quick-action-card"
              >
                <div className="quick-action-icon">📚</div>
                <div className="quick-action-text">Thêm sách mới</div>
              </button>
              <button 
                onClick={() => onPageChange && onPageChange('authors')} 
                className="quick-action-card"
              >
                <div className="quick-action-icon">✍️</div>
                <div className="quick-action-text">Thêm tác giả</div>
              </button>
            </>
          )}
          <button 
            onClick={() => onPageChange && onPageChange('borrowing')} 
            className="quick-action-card"
          >
            <div className="quick-action-icon">🔄</div>
            <div className="quick-action-text">Mượn sách</div>
          </button>
          <button 
            onClick={() => onPageChange && onPageChange('borrowing')} 
            className="quick-action-card"
          >
            <div className="quick-action-icon">📖</div>
            <div className="quick-action-text">Trả sách</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;