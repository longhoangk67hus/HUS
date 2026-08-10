import React, { useState, useEffect } from 'react'
import type { Movie } from '../../types'
import type { Room } from '../../types'
import './Showtimes.css'
import { showtimesAPI, roomsAPI } from '../../services/api'

interface Showtime {
  showtimeId: number
  movieId: number
  roomId: number
  showDate: string
  showTime: string
  basePrice: number
  status: 'Scheduled' | 'Cancelled' | 'Completed'
  movieTitle?: string
  roomName?: string
  theaterName?: string
}

interface ShowtimeForm {
  movieId: number
  roomId: number
  showDate: string
  showTime: string
  basePrice: number
  status: 'Scheduled' | 'Cancelled' | 'Completed'
}

const Showtimes: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ShowtimeForm>({
    movieId: 0,
    roomId: 0,
    showDate: '',
    showTime: '',
    basePrice: 120000,
    status: 'Scheduled',
  })

  useEffect(() => {
    loadShowtimes()
    loadMovies()
    loadRooms()
  }, [])

  const loadShowtimes = async () => {
    setLoading(true)
    try {
      const data = await showtimesAPI.list()
      console.log('Raw showtimes data from API:', data)
      console.log('Data type:', typeof data, 'Is Array:', Array.isArray(data), 'Length:', Array.isArray(data) ? data.length : 'N/A')
      
      const normalizedShowtimes = Array.isArray(data)
        ? data.map((s: any) => {
            // Handle showDate - could be Date object or string
            let showDate = s.showDate || s.ShowDate || ''
            if (showDate instanceof Date) {
              showDate = showDate.toISOString().split('T')[0]
            }

            // Handle basePrice - could be string or number
            let basePrice = s.basePrice || s.BasePrice || 0
            if (typeof basePrice === 'string') {
              basePrice = parseFloat(basePrice)
            }

            return {
              showtimeId: s.showtimeId || s.ShowtimeId || 0,
              movieId: s.movieId || s.MovieId || 0,
              roomId: s.roomId || s.RoomId || 0,
              showDate: String(showDate),
              showTime: s.showTime || s.ShowTime || '',
              basePrice: Number(basePrice),
              status: s.status || s.Status || 'Scheduled',
              movieTitle: s.movieTitle || s.MovieTitle || '',
              roomName:
                s.roomName ||
                s.RoomName ||
                s.room?.roomName ||
                s.room?.RoomName ||
                '',
              theaterName:
                s.theaterName ||
                s.TheaterName ||
                s.room?.theater?.name ||
                s.room?.theater?.Name ||
                '',
            }
          })
        : []
      
      console.log('Normalized showtimes:', normalizedShowtimes)
      setShowtimes(normalizedShowtimes)
    } catch (error) {
      console.error('Error loading showtimes:', error)
      alert('Lỗi khi tải danh sách suất chiếu: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const loadMovies = async () => {
    try {
      const { moviesAPI } = await import('../../services/api')
      const data = await moviesAPI.list()
      setMovies(data)
    } catch (error) {
      console.error('Error loading movies:', error)
    }
  }

  const loadRooms = async () => {
    try {
      const data = await roomsAPI.list()
      setRooms(data)
    } catch (error) {
      console.error('Error loading rooms:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue: any = value

    if (name === 'movieId' || name === 'roomId') {
      processedValue = Number(value)
    } else if (name === 'basePrice') {
      processedValue = value ? Number(value) : 0
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate movieId
      if (!formData.movieId || formData.movieId <= 0) {
        alert('Vui lòng chọn phim')
        return
      }

      // Validate roomId
      if (!formData.roomId || formData.roomId <= 0) {
        alert('Vui lòng chọn phòng')
        return
      }

      // Validate basePrice
      if (isNaN(formData.basePrice) || formData.basePrice < 0) {
        alert('Giá cơ bản phải là số hợp lệ và >= 0')
        return
      }

      // Validate showDate
      if (!formData.showDate) {
        alert('Vui lòng chọn ngày chiếu')
        return
      }

      // Validate showTime
      if (!formData.showTime) {
        alert('Vui lòng chọn giờ chiếu')
        return
      }

      // Convert showTime to HH:mm:ss format (HTML time input gives HH:mm)
      let showTimeFormatted = formData.showTime
      if (showTimeFormatted) {
        const timeParts = showTimeFormatted.split(':')
        if (timeParts.length === 2) {
          // Add seconds if not present
          showTimeFormatted = formData.showTime + ':00'
        }
      }

      const payload = {
        movieId: formData.movieId,
        roomId: formData.roomId,
        showDate: formData.showDate,
        showTime: showTimeFormatted,
        basePrice: formData.basePrice,
        status: formData.status,
      }

      console.log('Sending payload:', payload)

      if (editingId) {
        await showtimesAPI.update(editingId, payload)
        alert('Cập nhật suất chiếu thành công!')
      } else {
        await showtimesAPI.create(payload)
        alert('Suất chiếu được thêm thành công!')
      }

      handleCloseModal()

      // Reload showtimes after a small delay to ensure DB update completes
      setTimeout(() => {
        loadShowtimes()
      }, 500)
    } catch (error) {
      console.error('Error saving showtime:', error)
      alert('Lỗi khi lưu suất chiếu: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleEdit = (showtime: Showtime) => {
    setEditingId(showtime.showtimeId)
    setFormData({
      movieId: showtime.movieId,
      roomId: showtime.roomId,
      showDate: showtime.showDate,
      showTime: showtime.showTime,
      basePrice: showtime.basePrice && showtime.basePrice > 0 ? showtime.basePrice : 120000,
      status: showtime.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa suất chiếu này?')) {
      try {
        await showtimesAPI.delete(id)
        alert('Xóa suất chiếu thành công!')
        await loadShowtimes()
      } catch (error) {
        console.error('Error deleting showtime:', error)
        alert('Lỗi khi xóa suất chiếu: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      movieId: 0,
      roomId: 0,
      showDate: '',
      showTime: '',
      basePrice: 120000,
      status: 'Scheduled',
    })
  }

  const getMovieTitle = (movieId: number) => {
    const movie = movies.find((m) => m.MovieId === movieId)
    return movie ? movie.Title : `Phim #${movieId}`
  }

  const getRoomName = (showtime: Showtime) => {
    if (showtime.roomName && String(showtime.roomName).trim()) return showtime.roomName
    const room = rooms.find((r) => r.roomId === showtime.roomId)
    return room?.roomName || `Phòng #${showtime.roomId}`
  }

  const getTheaterName = (showtime: Showtime) => {
    if (showtime.theaterName && String(showtime.theaterName).trim()) return showtime.theaterName
    const room = rooms.find((r) => r.roomId === showtime.roomId)
    return room?.theater?.name || (room?.theaterId ? `Rạp #${room.theaterId}` : '--')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled'
      case 'Cancelled':
        return 'status-cancelled'
      case 'Completed':
        return 'status-completed'
      default:
        return 'status-scheduled'
    }
  }

  const calculateEndTime = (startTime: string, movieDuration: number): string => {
    if (!startTime) return '--:--'
    
    // Handle both HH:mm and HH:mm:ss formats
    const timeParts = startTime.split(':')
    const hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1], 10)
    
    if (isNaN(hours) || isNaN(minutes)) return '--:--'
    
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0)
    startDate.setMinutes(startDate.getMinutes() + movieDuration)
    
    const endHours = String(startDate.getHours()).padStart(2, '0')
    const endMinutes = String(startDate.getMinutes()).padStart(2, '0')
    
    return `${endHours}:${endMinutes}`
  }

  const getMovieDuration = (movieId: number): number => {
    const movie = movies.find((m) => m.MovieId === movieId)
    return movie ? movie.Duration : 120
  }

  return (
    <div className="showtimes-container">
      <div className="showtimes-header">
        <h1>Quản Lý Suất Chiếu</h1>
        <button className="btn-add-showtime" onClick={() => setShowModal(true)}>
          + Thêm Suất Chiếu
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : showtimes.length === 0 ? (
        <div className="no-showtimes">Không có suất chiếu nào</div>
      ) : (
        <div className="showtimes-table-wrapper">
          <table className="showtimes-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Phòng</th>
                <th>Ngày Chiếu</th>
                <th>Giờ Bắt Đầu</th>
                <th>Giờ Kết Thúc</th>
                <th>Giá</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => {
                const movieDuration = getMovieDuration(showtime.movieId)
                const endTime = calculateEndTime(showtime.showTime, movieDuration)
                return (
                  <tr key={showtime.showtimeId} className={`status-row ${getStatusColor(showtime.status)}`}>
                    <td className="movie-cell">
                      <strong>{getMovieTitle(showtime.movieId)}</strong>
                    </td>
                    <td className="movie-cell">
                      {getTheaterName(showtime)}
                    </td>
                    <td className="movie-cell">
                      {getRoomName(showtime)}
                    </td>
                    <td className="date-cell">
                      {new Date(showtime.showDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="time-cell">{showtime.showTime}</td>
                    <td className="time-cell">{endTime}</td>
                    <td className="price-cell">
                      {showtime.basePrice.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusColor(showtime.status)}`}>
                        {showtime.status === 'Scheduled'
                          ? 'Lên Lịch'
                          : showtime.status === 'Cancelled'
                            ? 'Hủy'
                            : 'Đã Kết Thúc'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn-edit" onClick={() => handleEdit(showtime)}>
                        Sửa
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(showtime.showtimeId)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm/Sửa Suất Chiếu */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Sửa Suất Chiếu' : 'Thêm Suất Chiếu'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="showtime-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Phim *</label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>-- Chọn Phim --</option>
                    {movies.map((movie) => (
                      <option key={movie.MovieId} value={movie.MovieId}>
                        {movie.Title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phòng *</label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>-- Chọn Phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Chiếu *</label>
                  <input
                    type="date"
                    name="showDate"
                    value={formData.showDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giờ Bắt Đầu *</label>
                  <input
                    type="time"
                    name="showTime"
                    value={formData.showTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá Cơ Bản *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1000"
                    placeholder="Giá tiền"
                  />
                </div>
                <div className="form-group">
                  <label>Trạng Thái *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="Scheduled">Lên Lịch</option>
                    <option value="Cancelled">Hủy</option>
                    <option value="Completed">Đã Kết Thúc</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={!formData.movieId || !formData.roomId || !formData.showDate || !formData.showTime || formData.basePrice < 0}
                >
                  {editingId ? 'Cập Nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Showtimes
