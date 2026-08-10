import React, { useState, useEffect } from 'react'
import type { RevenueByMonth } from '../statisticsAPI'
import { statisticsAPI } from '../statisticsAPI'

interface Props {
  monthRange: {
    startMonth: string
    endMonth: string
  }
}

const MonthlyRevenueChart: React.FC<Props> = ({ monthRange }) => {
  const [data, setData] = useState<RevenueByMonth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await statisticsAPI.getRevenueByMonth(
          monthRange.startMonth,
          monthRange.endMonth
        )
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monthly revenue data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [monthRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Đang tải...</div>
  if (error) return <div style={{ color: '#c00' }}>{error}</div>
  if (!data || data.monthlyRevenue.length === 0) return <div style={{ padding: '30px', textAlign: 'center' }}>Không có dữ liệu</div>

  const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue))
  const chartHeight = 300

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0fff0', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Tháng tốt nhất: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{data.peakMonth}</div>
            <div style={{ color: '#43e97b' }}>{formatCurrency(data.peakRevenue)}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Tổng doanh thu: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatCurrency(data.totalRevenue)}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Trung bình/tháng: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatCurrency(data.averageMonthlyRevenue)}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>Tăng trưởng toàn kỳ: </span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: data.overallGrowthRate >= 0 ? '#43e97b' : '#f44336' }}>
              {data.overallGrowthRate > 0 ? '+' : ''}{data.overallGrowthRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: `${chartHeight}px`, justifyContent: 'space-around', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' }}>
        {data.monthlyRevenue.map((month) => (
          <div key={month.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '100%',
                height: `${(month.revenue / maxRevenue) * (chartHeight - 40)}px`,
                background: 'linear-gradient(180deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              title={`${month.month}: ${formatCurrency(month.revenue)}`}
            />
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px', textAlign: 'center' }}>{month.month}</div>
          </div>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Tháng</th>
            <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Doanh thu</th>
            <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Vé</th>
            <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Đơn</th>
            <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>Tăng trưởng</th>
          </tr>
        </thead>
        <tbody>
          {data.monthlyRevenue.map((month) => (
            <tr key={month.month} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px', color: '#333' }}>{month.month}</td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                {formatCurrency(month.revenue)}
              </td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>{month.tickets}</td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>{month.bookings}</td>
              <td style={{ padding: '10px', textAlign: 'right', color: month.growthRate && month.growthRate >= 0 ? '#43e97b' : '#f44336' }}>
                {month.growthRate !== undefined ? `${month.growthRate > 0 ? '+' : ''}${month.growthRate.toFixed(1)}%` : '---'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MonthlyRevenueChart
