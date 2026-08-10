import React, { useState, useEffect } from 'react'
import type { RevenueByDate } from '../statisticsAPI'
import { statisticsAPI } from '../statisticsAPI'

interface Props {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const DailyRevenueChart: React.FC<Props> = ({ dateRange }) => {
  const [data, setData] = useState<RevenueByDate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await statisticsAPI.getRevenueByDate(
          dateRange.startDate,
          dateRange.endDate
        )
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load daily revenue data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Đang tải...</div>
  if (error) return <div style={{ color: '#c00' }}>{error}</div>
  if (!data || data.dailyRevenue.length === 0) return <div style={{ padding: '30px', textAlign: 'center' }}>Không có dữ liệu</div>

  // Filter to only show last 7 days
  const last7Days = data.dailyRevenue.slice(-7)
  
  const maxRevenue = Math.max(...last7Days.map(d => d.revenue))
  const chartHeight = 300

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f7ff', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Ngày cao nhất: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{last7Days.length > 0 && last7Days.reduce((a, b) => a.revenue > b.revenue ? a : b).date}</div>
            <div style={{ color: '#667eea' }}>{last7Days.length > 0 && formatCurrency(Math.max(...last7Days.map(d => d.revenue)))}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Tổng doanh thu: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatCurrency(last7Days.reduce((sum, d) => sum + d.revenue, 0))}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Trung bình/ngày: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
              {formatCurrency(last7Days.reduce((sum, d) => sum + d.revenue, 0) / last7Days.length)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${chartHeight}px`, justifyContent: 'space-around', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
        {last7Days.map((day) => (
          <div
            key={day.date}
            style={{
              flex: 1,
              height: `${(day.revenue / maxRevenue) * (chartHeight - 40)}px`,
              background: 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease',
              minWidth: '4px',
            }}
            title={`${day.date}: ${formatCurrency(day.revenue)}`}
          />
        ))}
      </div>

      <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Ngày</th>
              <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Doanh thu</th>
              <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Vé</th>
              <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Đơn</th>
            </tr>
          </thead>
          <tbody>
            {last7Days.map((day) => (
              <tr key={day.date} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#333' }}>{day.date}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                  {formatCurrency(day.revenue)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>{day.tickets}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>{day.bookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DailyRevenueChart
