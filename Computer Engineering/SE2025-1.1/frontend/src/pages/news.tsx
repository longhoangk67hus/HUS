import { useState, useEffect } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "./news.css"
import { useAuth } from "../context/useAuth"
import { bookingsAPI } from "../services/api"

interface HistoryItem {
  bookingId: string
  movieTitle: string
  showtime: string
  seats: string[]
  theater?: string
  status: string
  totalPrice: number
}

const News = () => {
  const { isLoggedIn } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const data = await bookingsAPI.history()
        // Normalize backend booking items into HistoryItem shape
        const items = Array.isArray(data) ? data.map((b: any) => {
          // movie title: showtime.movie.title (backend uses camelCase property names)
          const movieTitle = b.showtime?.movie?.title ?? b.showtime?.movie?.Title ?? b.movieTitle ?? 'Unknown'

          // showtime: combine showDate + showTime if available
          let showtimeStr = ''
          if (b.showtime) {
            const sd = b.showtime.showDate ?? b.showtime.showDateString ?? b.showtime.date
            const st = b.showtime.showTime ?? b.showtime.showTimeString ?? b.showtime.time
            if (sd && st) {
              try {
                const d = new Date(sd)
                const datePart = d.toLocaleDateString('vi-VN')
                showtimeStr = `${datePart} ${st}`
              } catch (e) {
                showtimeStr = `${sd} ${st}`
              }
            } else if (b.showtime.startTime) {
              showtimeStr = new Date(b.showtime.startTime).toLocaleString()
            }
          }

          // seats: prefer bookingSeats -> seat.row + seat.col, but support many shapes
          let seatsArr: string[] = []
          if (Array.isArray(b.bookingSeats) && b.bookingSeats.length > 0) {
            seatsArr = b.bookingSeats.map((bs: any) => {
              // common nested seat object: bs.seat.row / bs.seat.col
              const row = bs.seat?.row ?? bs.row ?? bs.seatRow ?? bs.rowLabel ?? ''
              const col = bs.seat?.col ?? bs.col ?? bs.seatCol ?? bs.number ?? bs.seatNumber ?? ''
              const seatNum = (row && col) ? `${row}${col}` : (bs.seatNumber ?? bs.seatLabel ?? (bs.seat?.seatNumber ?? ''))
              return String(seatNum).trim()
            }).filter(Boolean)
          } else if (Array.isArray(b.seats) && b.seats.length > 0) {
            seatsArr = b.seats.map((s: any) => {
              if (typeof s === 'string') return s
              const row = s.row ?? s.rowLabel ?? ''
              const col = s.number ?? s.col ?? s.seatNumber ?? ''
              if (row && col) return `${row}${col}`
              return s.seatNumber ?? s.label ?? ''
            }).filter(Boolean)
          } else if (typeof b.seatNumbers === 'string' && b.seatNumbers.trim()) {
            seatsArr = b.seatNumbers.split(',').map((s: string) => s.trim()).filter(Boolean)
          } else if (Array.isArray(b.seatIds) && b.seatIds.length > 0) {
            // fallback: show raw ids when human-readable numbers not available
            seatsArr = b.seatIds.map((id: any) => String(id))
          }

          return {
            bookingId: String(b.bookingId ?? b.id ?? ''),
            movieTitle,
            showtime: showtimeStr,
            seats: seatsArr,
            theater: b.showtime?.room?.theater?.name ?? b.showtime?.room?.theater?.TheaterName ?? b.bookingSeats?.[0]?.seat?.room?.theater?.name ?? b.bookingSeats?.[0]?.seat?.room?.theater?.TheaterName ?? b.theaterName ?? b.theater?.name ?? b.theater ?? '',
            status: b.status ?? 'Unknown',
            totalPrice: Number(b.finalAmount ?? b.totalAmount ?? b.amount ?? 0),
          }
        }) : []

        // Show only bookings that represent successful/completed payments
        const successStatuses = new Set(['confirmed', 'paid', 'completed', 'success', 'successful'])
        const successful = items.filter(i => successStatuses.has(String(i.status ?? '').toLowerCase()))
        setHistory(successful)
      } catch (e) {
        setError('Không thể tải lịch sử đặt vé')
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoggedIn) fetchHistory()
    else {
      setHistory([])
      setIsLoading(false)
    }
  }, [isLoggedIn])

  const formatCurrency = (amt: number) => new Intl.NumberFormat('vi-VN').format(Math.round(amt)) + ' VNĐ'

  if (isLoading) {
    return (
      <div className="news-page">
        <Header />
        <main className="news-container">
          <div className="loading">Đang tải lịch sử đặt vé...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="news-page">
      <Header />
      <main className="news-container">
        <section className="news-section">
          <div className="section-header">
            <h2>Lịch sử đặt vé của bạn</h2>
          </div>

          {error && <div className="error-box">{error}</div>}

          {history.length === 0 ? (
            <div className="empty">Bạn chưa đặt vé nào.</div>
          ) : (
            <div className="history-grid">
              {history.map((h) => (
                <div key={h.bookingId} className="history-card">
                  <div className="history-row"><strong>Phim:</strong> {h.movieTitle}</div>
                  <div className="history-row"><strong>Suất chiếu:</strong> {h.showtime}</div>
                  <div className="history-row"><strong>Rạp chiếu:</strong> {h.theater ?? 'Unknown'}</div>
                  <div className="history-row"><strong>Ghế:</strong> {h.seats.join(', ')}</div>
                  <div className="history-row"><strong>Tổng số tiền:</strong> {formatCurrency(h.totalPrice ?? 0)}</div>
                </div>
              ))}
            </div>
          )}

        </section>
      </main>
      <Footer />
    </div>
  )
}

export default News
