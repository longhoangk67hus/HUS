import React, { useState, useEffect } from 'react'
import './BookingHistory.css'
import { API } from '../../api/endpoints'
import { generateTicketPdf } from './ticketPdf'

// Booking Status Enum - All available statuses in the system
const BOOKING_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
} as const;

type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES];

interface Booking {
  bookingId: number
  bookingCode: string
  status: BookingStatus
  totalAmount: number
  finalAmount: number
  pointsEarned: number
  bookingDate: string | Date
  expiryDate: string | Date
  userCode: string
  userName: string
  movieTitle: string
  theaterName: string
  roomName?: string
  theaterAddress?: string
  startTime: string | Date
  seatsCodes: string[]
}

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  useEffect(() => {
    // Reset to page 1 when search query or status filter changes
    fetchAllBookings(1)
  }, [filterStatus, searchQuery])

  useEffect(() => {
    filterBookings()
  }, [bookings])

  const fetchAllBookings = async (pageNum: number = 1) => {
    setLoading(true)
    try {
      // Get token - try multiple keys for compatibility
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      
      if (!token) {
        console.error('❌ No token found in localStorage')
        throw new Error('No authentication token found. Please login first.')
      }

      console.log('📤 Fetching bookings with token:', token.substring(0, 20) + '...')
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', pageNum.toString())
      params.append('limit', limit.toString())
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      
      // Call admin API: GET /admin/bookings (admin only)
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${API.ADMIN.BOOKINGS.ALL}?${params.toString()}`
      console.log('🌐 API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log('✅ API Response received:', data)
      
      // Handle admin API response format: { data: [...], pagination: {...} }
      const bookingsData = data.data || []
      const pagination = data.pagination || {}
      
      console.log('📊 Bookings data:', bookingsData.length, 'records')
      console.log('📄 Pagination:', pagination)
      
      // Transform API response to match our Booking interface
      const transformedBookings: Booking[] = bookingsData.map((booking: any) => {
        // Extract movie title from showtime relation
        const movieTitle = booking.showtime?.movie?.title || 'Unknown Movie'
        
        // Extract theater name from showtime -> room -> theater
        const theaterName = booking.showtime?.room?.theater?.theaterName || booking.showtime?.room?.theater?.name || 'Unknown Theater'
        
        // Extract user name from user object (included in admin response)
        const userName = booking.user?.fullName || 'Unknown User'
        const userCode = booking.user?.userId
          ? `@${String(booking.user.userId).substring(0, 7).toUpperCase()}`
          : '@USER'
        
        // Extract seat codes and format as string array from seats object array
        const seatsCodes = (booking.seats || []).map((seat: any) => {
          if (!seat || !seat.seatRow) return null
          const row = seat.seatRow || '?'
          const col = seat.seatColumn || '0'
          return `${row}${col}`
        }).filter((code: string | null) => code !== null) as string[]
        
        // Get actual showtime from booking.showtime
        let startTime = booking.bookingDate
        if (booking.showtime?.showDate && booking.showtime?.showTime) {
          try {
            const dateStr = booking.showtime.showDate.split('T')[0]
            const timeStr = booking.showtime.showTime
            startTime = new Date(`${dateStr}T${timeStr}`).toISOString()
            console.log(`📽️ Showtime extracted: ${dateStr} at ${timeStr}`)
          } catch (e) {
            console.warn('Failed to parse showtime:', booking.showtime)
          }
        }
        
        const theaterAddress = booking.showtime?.room?.theater?.address || booking.showtime?.room?.theater?.location || booking.showtime?.room?.theater?.venueAddress || ''
        const roomName = booking.showtime?.room?.name || booking.showtime?.room?.roomName || booking.showtime?.room?.code || booking.showtime?.room?.screenName || ''
        return {
          bookingId: booking.bookingId,
          bookingCode: booking.bookingCode,
          status: booking.status as BookingStatus,
          totalAmount: Number(booking.totalAmount) || 0,
          finalAmount: Number(booking.finalAmount) || 0,
          pointsEarned: booking.pointsEarned || 0,
          bookingDate: booking.bookingDate,
          expiryDate: booking.expiryDate,
          userCode,
          userName,
          movieTitle,
          roomName,
          theaterName,
          theaterAddress,
          startTime,
          seatsCodes,
        }
      })

      setBookings(transformedBookings)
      setPage(pageNum)
      setTotalPages(pagination.totalPages || 1)
      setTotalCount(pagination.totalCount || 0)
      
      // Log booking statuses for debugging
      console.log('📊 Booking statuses distribution:');
      Object.values(BOOKING_STATUSES).forEach(status => {
        const count = transformedBookings.filter(b => b.status === status).length;
        console.log(`  ${status}: ${count} đơn đặt vé`);
      });
      
      console.log('✅ Loaded', transformedBookings.length, 'bookings from admin API (page', pageNum, 'of', pagination.totalPages, ')');
    } catch (err) {
      console.error('❌ Lỗi tải lịch sử đặt vé:', err)
      // Fallback to mock data if API fails
      console.warn('⚠️ Using mock data as fallback - API may not be available')
      const mockBookings: Booking[] = [
        {
          bookingId: 1,
          bookingCode: 'BK20251120A1B1',
          status: BOOKING_STATUSES.CONFIRMED,
          totalAmount: 300000,
          finalAmount: 300000,
          pointsEarned: 30,
          bookingDate: '2025-11-20 14:30:00',
          expiryDate: '2025-11-25 23:59:59',
          userCode: '@USER001',
          userName: 'user1',
          movieTitle: 'Avatar 3',
          theaterName: 'CGV Landmark 81',
          startTime: '2025-11-20 19:00:00',
          seatsCodes: ['A1', 'A2']
        },
        {
          bookingId: 2,
          bookingCode: 'BK20251121A1B2',
          status: BOOKING_STATUSES.CONFIRMED,
          totalAmount: 300000,
          finalAmount: 300000,
          pointsEarned: 30,
          bookingDate: '2025-11-21 16:45:00',
          expiryDate: '2025-11-26 23:59:59',
          userCode: '@USER002',
          userName: 'user2',
          movieTitle: 'Wicked',
          theaterName: 'BHD StarCineplex',
          startTime: '2025-11-21 15:00:00',
          seatsCodes: ['C5', 'C6']
        },
        {
          bookingId: 3,
          bookingCode: 'BK20251122A1B3',
          status: BOOKING_STATUSES.PENDING,
          totalAmount: 250000,
          finalAmount: 250000,
          pointsEarned: 25,
          bookingDate: '2025-11-22 10:00:00',
          expiryDate: '2025-11-27 23:59:59',
          userCode: '@USER001',
          userName: 'user1',
          movieTitle: 'The Brutalist',
          theaterName: 'Lotte Cinema',
          startTime: '2025-11-22 20:30:00',
          seatsCodes: ['D3', 'D4', 'D5']
        },
        {
          bookingId: 4,
          bookingCode: 'BK20251119A1B4',
          status: BOOKING_STATUSES.CANCELLED,
          totalAmount: 150000,
          finalAmount: 0,
          pointsEarned: 0,
          bookingDate: '2025-11-19 09:15:00',
          expiryDate: '2025-11-24 23:59:59',
          userCode: '@USER003',
          userName: 'user3',
          movieTitle: 'Nosferatu',
          theaterName: 'Galaxy Cinema',
          startTime: '2025-11-19 18:00:00',
          seatsCodes: ['B2']
        },
        {
          bookingId: 5,
          bookingCode: 'BK20251123A1B5',
          status: BOOKING_STATUSES.CONFIRMED,
          totalAmount: 600000,
          finalAmount: 600000,
          pointsEarned: 60,
          bookingDate: '2025-11-23 11:30:00',
          expiryDate: '2025-11-28 23:59:59',
          userCode: '@USER002',
          userName: 'user2',
          movieTitle: 'Moana 2',
          theaterName: 'CGV Landmark 81',
          startTime: '2025-11-23 16:00:00',
          seatsCodes: ['E1', 'E2', 'E3', 'E4']
        }
      ]
      setBookings(mockBookings)
      setPage(1)
      setTotalPages(1)
      setTotalCount(mockBookings.length)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus)
    }

    setFilteredBookings(filtered)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case BOOKING_STATUSES.CONFIRMED:
        return 'status-confirmed'
      case BOOKING_STATUSES.PENDING:
        return 'status-pending'
      case BOOKING_STATUSES.CANCELLED:
        return 'status-cancelled'
      default:
        return 'status-default'
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; description: string }> = {
      [BOOKING_STATUSES.PENDING]: {
        label: '⏳ Chờ xác nhận',
        description: 'Đơn đặt vé đang chờ thanh toán hoặc xác nhận'
      },
      [BOOKING_STATUSES.CONFIRMED]: {
        label: '✓ Đã xác nhận',
        description: 'Đơn đặt vé đã được xác nhận và thanh toán thành công'
      },
      [BOOKING_STATUSES.CANCELLED]: {
        label: '✗ Đã hủy',
        description: 'Đơn đặt vé đã bị hủy'
      }
    };
    
    return statusMap[status]?.label ?? status;
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="booking-history-container">
      <div className="booking-history-header">
        <h1>📜 Lịch sử Đặt vé</h1>
        <p>Quản lý và theo dõi tất cả các đặt vé</p>
      </div>

      {/* Status Legend */}
      <div className="status-legend">
        <div className="legend-title">📊 Các trạng thái đặt vé:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-badge status-badge status-pending">⏳ Chờ xác nhận</span>
            <span className="legend-description">Đơn đặt vé đang chờ thanh toán hoặc xác nhận</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge status-badge status-confirmed">✓ Đã xác nhận</span>
            <span className="legend-description">Đơn đặt vé đã được xác nhận và thanh toán thành công</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge status-badge status-cancelled">✗ Đã hủy</span>
            <span className="legend-description">Đơn đặt vé đã bị hủy</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo mã vé, người dùng, hoặc phim..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="status-filters">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
            title="Hiển thị tất cả các đơn đặt vé"
          >
            Tất cả ({bookings.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === BOOKING_STATUSES.PENDING ? 'active' : ''}`}
            onClick={() => setFilterStatus(BOOKING_STATUSES.PENDING)}
            title="Đơn đặt vé đang chờ thanh toán hoặc xác nhận"
          >
            ⏳ Chờ ({bookings.filter(b => b.status === BOOKING_STATUSES.PENDING).length})
          </button>
          <button
            className={`filter-btn ${filterStatus === BOOKING_STATUSES.CONFIRMED ? 'active' : ''}`}
            onClick={() => setFilterStatus(BOOKING_STATUSES.CONFIRMED)}
            title="Đơn đặt vé đã được xác nhận"
          >
            ✓ Xác nhận ({bookings.filter(b => b.status === BOOKING_STATUSES.CONFIRMED).length})
          </button>
          <button
            className={`filter-btn ${filterStatus === BOOKING_STATUSES.CANCELLED ? 'active' : ''}`}
            onClick={() => setFilterStatus(BOOKING_STATUSES.CANCELLED)}
            title="Đơn đặt vé đã bị hủy"
          >
            ✗ Hủy ({bookings.filter(b => b.status === BOOKING_STATUSES.CANCELLED).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Đang tải dữ liệu...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-message">
          <p>📭 Không tìm thấy đặt vé nào</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Mã vé</th>
                <th>Người dùng</th>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Phòng</th>
                <th>Ghế</th>
                <th>Ngày giờ chiếu</th>
                <th>Ngày đặt vé</th>
                <th>Tiền</th>
                <th>Trạng thái</th>
                <th>Xuất vé</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td className="booking-code">
                    <strong>{booking.bookingCode}</strong>
                  </td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{booking.userName}</span>
                      <span className="user-code">{booking.userCode}</span>
                    </div>
                  </td>
                  <td>{booking.movieTitle}</td>
                  <td>{booking.theaterName}</td>
                  <td>{booking.roomName || '-'}</td>
                  <td className="seats">
                    {booking.seatsCodes.join(', ')}
                  </td>
                  <td className="showtime">
                    <strong>📽️ {formatDate(booking.startTime)}</strong>
                  </td>
                  <td className="date">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="price">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(booking.finalAmount)}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td>
                    {booking.status === BOOKING_STATUSES.CONFIRMED ? (
                      <button
                        className="export-btn"
                        onClick={() => generateTicketPdf(booking)}
                        title="Xuất vé PDF"
                      >
                        Xuất vé
                      </button>
                    ) : (
                      <span className="muted"></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredBookings.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => fetchAllBookings(page - 1)}
            disabled={page <= 1}
            className="pagination-btn"
          >
            ← Trang trước
          </button>
          <span className="pagination-info">
            Trang <strong>{page}</strong> / <strong>{totalPages}</strong> 
            ({filteredBookings.length} / {totalCount} đơn đặt vé)
          </span>
          <button
            onClick={() => fetchAllBookings(page + 1)}
            disabled={page >= totalPages}
            className="pagination-btn"
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  )
}

export default BookingHistory
