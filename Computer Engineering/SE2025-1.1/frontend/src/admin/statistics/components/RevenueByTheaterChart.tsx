import React, { useState, useEffect } from 'react'
import type { RevenueByTheater } from '../statisticsAPI'
import { statisticsAPI } from '../statisticsAPI'

interface Props {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const RevenueByTheaterChart: React.FC<Props> = ({ dateRange }) => {
  const [data, setData] = useState<RevenueByTheater | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await statisticsAPI.getRevenueByTheater(
          dateRange.startDate,
          dateRange.endDate
        )
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load theater revenue data')
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
  if (!data || data.theaters.length === 0) return <div style={{ padding: '30px', textAlign: 'center' }}>Không có dữ liệu</div>

  const maxRevenue = Math.max(...data.theaters.map(t => t.totalRevenue))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {data.theaters.map((theater) => (
        <div
          key={theater.theaterId}
          style={{
            padding: '15px',
            background: '#f9f9f9',
            borderRadius: '8px',
            borderLeft: '4px solid #f093fb',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{theater.theaterName}</h4>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                📍 {theater.city} | 🎭 {theater.totalRooms} phòng
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>
                {formatCurrency(theater.totalRevenue)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Vé bán: </span>
              <span style={{ fontWeight: '600', color: '#333' }}>{theater.totalTickets}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Suất chiếu: </span>
              <span style={{ fontWeight: '600', color: '#333' }}>{theater.totalShowtimes}</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '25px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                width: `${(theater.totalRevenue / maxRevenue) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default RevenueByTheaterChart
