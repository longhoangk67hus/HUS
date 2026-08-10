import React from 'react'
import './AdminHome.css'
import Footer from '../components/Footer'

const AdminHome: React.FC = () => {
  return (
    <>
      <div className="admin-home-container">
        <div className="welcome-section">
          <h1>🎬 Trang quản trị viên</h1>
          <p>Chào mừng đến trang quản lý của bạn</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">📜</div>
            <h3>Lịch sử Đặt vé</h3>
            <p>Theo dõi tất cả các đặt vé và tình trạng của chúng</p>
            <a href="/admin/booking-history" className="card-link">Truy cập →</a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🎥</div>
            <h3>Phim</h3>
            <p>Quản lý danh sách phim và thông tin chi tiết</p>
            <a href="/admin/movies" className="card-link">Truy cập →</a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🕒</div>
            <h3>Suất Chiếu</h3>
            <p>Quản lý lịch chiếu và suất chiếu</p>
            <a href="/admin/showtimes" className="card-link">Truy cập →</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default AdminHome
