import React, { useState, useEffect } from 'react'
import type { RevenueByMovie } from '../statisticsAPI'
import { statisticsAPI } from '../statisticsAPI'

interface Props {
  dateRange: {
    startDate: string
    endDate: string
  }
}

const RevenueByMovieChart: React.FC<Props> = ({ dateRange }) => {
  const [data, setData] = useState<RevenueByMovie | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await statisticsAPI.getRevenueByMovie(
          dateRange.startDate,
          dateRange.endDate,
          10
        )
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movie revenue data')
        console.error('Error fetching movie revenue:', err)
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
  if (!data || data.movies.length === 0) return <div style={{ padding: '30px', textAlign: 'center' }}>Không có dữ liệu</div>

  // Find max revenue for scaling
  const maxRevenue = Math.max(...data.movies.map(m => m.totalRevenue))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {data.movies.slice(0, 10).map((movie, index) => (
        <div key={movie.movieId} style={{ display: 'flex', alignItems: 'stretch', gap: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '700', fontSize: '1.1rem', borderRadius: '50%', flexShrink: 0 }}>
            {index + 1}
          </div>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0 }}>
            {movie.posterUrl && (
              <img src={movie.posterUrl} alt={movie.title} style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }} />
            )}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {movie.title}
              </h4>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#666' }}>
                <span>🎬 {movie.totalShowtimes} suất chiếu</span>
                <span>🎫 {movie.totalTickets} vé</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', minWidth: '150px', flexShrink: 0 }}>
            <div style={{ width: '100%', height: '30px', background: '#1e1c1cff', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  width: `${(movie.totalRevenue / maxRevenue) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {formatCurrency(movie.totalRevenue)}
            </div>
          </div>
        </div>
        ))}
    </div>
  )
}

export default RevenueByMovieChart
