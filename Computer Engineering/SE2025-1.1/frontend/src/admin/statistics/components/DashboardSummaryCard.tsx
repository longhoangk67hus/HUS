import React from 'react'
import type { DashboardSummary } from '../statisticsAPI'
import './DashboardSummaryCard.css'

interface Props {
  data: DashboardSummary
}

const DashboardSummaryCard: React.FC<Props> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? '#4caf50' : '#f44336'
  }

  return (
    <div className="dashboard-summary">
      <div className="summary-card main-card">
        <h3>Doanh thu</h3>
        <div className="summary-value">{formatCurrency(data.totalRevenue)}</div>
        <div className="summary-growth" style={{ color: getGrowthColor(data.growth.revenue) }}>
          
        </div>
      </div>

      <div className="summary-card">
        <h3>Tổng đơn</h3>
        <div className="summary-value">{data.totalBookings.toLocaleString('vi-VN')}</div>
        <div className="summary-growth" style={{ color: getGrowthColor(data.growth.bookings) }}>
          
        </div>
      </div>

      <div className="summary-card">
        <h3>Tổng vé bán</h3>
        <div className="summary-value">{data.totalTickets.toLocaleString('vi-VN')}</div>
        <div className="summary-growth" style={{ color: getGrowthColor(data.growth.tickets) }}>
          
        </div>
      </div>

      {/* <div className="summary-card">
        <h3>Giá vé trung bình</h3>
        <div className="summary-value">{formatCurrency(data.averageTicketPrice)}</div>
      </div> */}

      {/* Booking Status Breakdown */}
      {/* <div className="status-breakdown">
        <h4>Trạng thái đơn đặt</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">✅ Xác nhận</span>
            <span className="status-count">{data.bookingsByStatus.confirmed}</span>
          </div>
          <div className="status-item">
            <span className="status-label">⏳ Chưa xác nhận</span>
            <span className="status-count">{data.bookingsByStatus.pending}</span>
          </div>
          <div className="status-item">
            <span className="status-label">❌ Hủy</span>
            <span className="status-count">{data.bookingsByStatus.cancelled}</span>
          </div>
        </div>
      </div> */}

      {/* <div className="date-range">
        <small>Từ {data.startDate} đến {data.endDate}</small>
      </div> */}
    </div>
  )
}

export default DashboardSummaryCard
