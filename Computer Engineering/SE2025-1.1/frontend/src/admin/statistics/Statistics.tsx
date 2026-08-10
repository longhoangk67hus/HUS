import React, { useState, useEffect } from 'react'
import './Statistics.css'
import type { DashboardSummary } from './statisticsAPI'
import { statisticsAPI } from './statisticsAPI'
import DashboardSummaryCard from './components/DashboardSummaryCard'
import RevenueByMovieChart from './components/RevenueByMovieChart'
import RevenueByTheaterChart from './components/RevenueByTheaterChart'
import DailyRevenueChart from './components/DailyRevenueChart'
import MonthlyRevenueChart from './components/MonthlyRevenueChart'

interface DateRange {
  startDate: string
  endDate: string
}

interface MonthRange {
  startMonth: string
  endMonth: string
}

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    }
  })

  const [monthRange, setMonthRange] = useState<MonthRange>(() => {
    const today = new Date()
    return {
      startMonth: `${today.getFullYear()}-01`,
      endMonth: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
    }
  })

  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await statisticsAPI.getDashboard(dateRange.startDate, dateRange.endDate)
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        console.error('Error fetching dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMonthRange(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="statistics-container">
      <h1>📊 Thống kê doanh thu</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Date Range Picker */}
      <div className="filter-section">
        <h3>Lọc theo ngày</h3>
        <div className="date-picker-group">
          <div className="date-picker">
            <label htmlFor="startDate">Từ ngày:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="date-picker">
            <label htmlFor="endDate">Đến ngày:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      {loading && <div className="loading">Đang tải dữ liệu...</div>}
      {dashboardData && !loading && (
        <DashboardSummaryCard data={dashboardData} />
      )}

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>💰 Doanh thu theo phim</h3>
          <RevenueByMovieChart dateRange={dateRange} />
        </div>

        <div className="chart-container">
          <h3>🎭 Doanh thu theo rạp chiếu</h3>
          <RevenueByTheaterChart dateRange={dateRange} />
        </div>

        <div className="chart-container full-width">
          <h3>📈 Xu hướng doanh thu hàng ngày</h3>
          <DailyRevenueChart dateRange={dateRange} />
        </div>

        <div className="chart-container full-width">
          <h3>📅 Xu hướng doanh thu hàng tháng</h3>
          <div className="month-filter">
            <div className="date-picker">
              <label htmlFor="startMonth">Từ tháng:</label>
              <input
                type="month"
                id="startMonth"
                name="startMonth"
                value={monthRange.startMonth}
                onChange={handleMonthChange}
              />
            </div>
            <div className="date-picker">
              <label htmlFor="endMonth">Đến tháng:</label>
              <input
                type="month"
                id="endMonth"
                name="endMonth"
                value={monthRange.endMonth}
                onChange={handleMonthChange}
              />
            </div>
          </div>
          <MonthlyRevenueChart monthRange={monthRange} />
        </div>
      </div>
    </div>
  )
}

export default Statistics
