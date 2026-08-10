"use client"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import ReactDOM from "react-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { theatersAPI, showtimesAPI, moviesAPI, seatTypesAPI, seatsAPI, reservationsAPI } from "../services/api"
import { useAuth } from "../context/useAuth"
import type { Theater, Showtime, Movie } from "../types"
import "./theaters.css"

const PurchasePage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const [searchParams] = useSearchParams()
  const movieIdParam = Number(searchParams.get('movieId'))
  const [movie, setMovie] = useState<Movie | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null)
  const toLocalISODate = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const [selectedDate, setSelectedDate] = useState<string>(() => toLocalISODate(new Date()))
  const [weekOffset, setWeekOffset] = useState<number>(0)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [showSeatSelection, setShowSeatSelection] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  // seatTypes are not currently displayed separately in this simplified purchase flow
  const [seatMap, setSeatMap] = useState<any[]>([])
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [layoutMeta, setLayoutMeta] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const MAX_SEATS = 10

  const selectedTheater = theaters.find(t => t.theaterId === selectedTheaterId) ?? null
  // reference the setter to avoid unused-variable TypeScript error
  void setSelectedTheaterId

  // seat types loaded from API
  const [seatTypes, setSeatTypes] = useState<any[]>([])
  // simple color palette fallback when seat type doesn't provide a color
  const palette = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#FB7185', '#F97316']
  const getColorForSeatType = (seatTypeId?: number | string) => {
    if (!seatTypeId) return palette[0]
    const found = seatTypes.find((t) => (t.seatTypeId ?? t.id) === Number(seatTypeId))
    if (found) return (found.color || found.hex || found.backgroundColor || palette[Number(seatTypeId) % palette.length])
    return palette[Number(seatTypeId) % palette.length]
  }

  useEffect(() => {
    if (!movieIdParam) return
    let mounted = true
    ;(async () => {
      try {
        const m = await moviesAPI.details?.(movieIdParam)
        if (!mounted) return
        setMovie(m as Movie)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [movieIdParam])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await theatersAPI.list()
        if (!mounted) return
        setTheaters(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedTheaterId) return
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        const data = await showtimesAPI.list(movieIdParam || undefined, selectedDate, selectedTheaterId)
        if (!mounted) return
        setShowtimes(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally { if (mounted) setIsLoading(false) }
    })()
    return () => { mounted = false }
  }, [selectedTheaterId, selectedDate, movieIdParam])

  // Clear selected seats when modal closes or when movie changes so selections don't persist
  useEffect(() => {
    if (!showSeatSelection) setSelectedSeats([])
  }, [showSeatSelection])

  useEffect(() => {
    // when switching movie parameter, reset seat selection state
    setSelectedSeats([])
    setSeatMap([])
    setShowSeatSelection(false)
  }, [movieIdParam])

  // If this page was opened for a specific movie, only show that movie's showtimes
  const filteredShowtimes = movie
    ? showtimes.filter((s) => {
        const mid = Number(movieIdParam)
        // check several possible shapes safely using casts
        const maybe = s as any
        if (maybe.movieId != null && Number(maybe.movieId) === mid) return true
        const mv = maybe.movie as any
        if (!mv) return false
        if (mv.MovieId != null && Number(mv.MovieId) === mid) return true
        if (mv.movieId != null && Number(mv.movieId) === mid) return true
        if (mv.id != null && Number(mv.id) === mid) return true
        return false
      })
    : showtimes

  const fetchSeatTypesAndMap = async (showtimeId: number, roomId?: number) => {
    // mark showtimeId as used to avoid TS6133 when not otherwise referenced
    void showtimeId
    try {
      const [types, layout] = await Promise.all([
        seatTypesAPI.list(),
        roomId ? seatsAPI.roomLayout(roomId) : Promise.resolve(null),
      ])

      setSeatTypes(Array.isArray(types) ? types : [])
      const layoutObj = layout
      if (!layoutObj) { setSeatMap([]); setLayoutMeta(null); return }

      if (Array.isArray(layoutObj)) {
        const norm = layoutObj.map((s: any) => ({
          id: s.seatId ?? s.id,
          label: s.seatNumber ?? `${s.row}${s.col}`,
          isAvailable: (s.isBooked === undefined ? (s.status === 'Available' || s.status === 'available') : !s.isBooked),
          seatTypeId: s.seatTypeId ?? s.seatType?.seatTypeId ?? 1,
          priceMultiplier: s.priceMultiplier ?? 1,
          row: s.row,
          col: s.col,
        }))
        setSeatMap(norm)
      } else if (layoutObj.seats && Array.isArray(layoutObj.seats)) {
        const norm = layoutObj.seats.map((s: any) => ({
          id: s.seatId ?? s.id,
          label: s.seatNumber ?? `${s.row}${s.col}`,
          isAvailable: (s.isBooked === undefined ? (s.status === 'Available' || s.status === 'available') : !s.isBooked),
          seatTypeId: s.seatTypeId ?? s.seatType?.seatTypeId ?? 1,
          priceMultiplier: s.priceMultiplier ?? 1,
          row: s.row,
          col: s.col,
        }))
        setSeatMap(norm)
      } else {
        setSeatMap([])
      }

      if (layoutObj && typeof layoutObj === 'object' && !Array.isArray(layoutObj)) {
        setLayoutMeta({ roomId: layoutObj.roomId, roomName: layoutObj.roomName, roomPriceMultiplier: layoutObj.roomPriceMultiplier ?? 1 })
      }
    } catch (e) {
      console.error('seat map error', e)
      setSeatMap([])
    }

    // After we have seatMap, check availability for this showtime and mark locked/booked seats as unavailable
    try {
      const availability = await reservationsAPI.checkAvailability(showtimeId)
      console.log('🔍 Availability response:', availability) // DEBUG
      if (availability) {
        // Handle different response structures
        const seatsData = Array.isArray(availability) ? availability : (availability.seats ?? [])
        
        if (Array.isArray(seatsData) && seatsData.length > 0) {
          const unavailableSeatIds = new Set<number>()
          seatsData.forEach((s: any) => {
            // s.isAvailable comes from backend - false means locked or confirmed booked
            if (s.isAvailable === false) {
              unavailableSeatIds.add(s.seatId)
            }
          })
          console.log('❌ Unavailable seat IDs:', unavailableSeatIds) // DEBUG
          setSeatMap((prev: any[]) => {
            const updated = prev.map((seat) => {
              const isUnavailable = unavailableSeatIds.has(seat.id)
              return { ...seat, isAvailable: !isUnavailable }
            })
            console.log('📊 Updated seatMap after availability check:', updated) // DEBUG
            return updated
          })
        }
      }
    } catch (e) {
      console.error('❌ Availability check failed', e)
    }

    // Seats are determined from backend availability; do not use localStorage for confirmed bookings.
  }

  const getSeatPrice = (seat: any) => {
    const base = Number(selectedShowtime?.basePrice ?? selectedShowtime?.price ?? 0)
    const roomMult = Number(layoutMeta?.roomPriceMultiplier ?? 1)
    const seatMult = Number(seat.priceMultiplier ?? 1)
    return Math.round(base * roomMult * seatMult)
  }

  return (
    <div className="theaters-page">
      <Header />
    <main className="theaters-container">
      <div className="theaters-grid">
        <aside className="left-column">
          <h3 className="page-sidebar-title">Chọn rạp</h3>
          {isLoading && theaters.length === 0 ? (
            <div className="loading">Đang tải rạp...</div>
          ) : (
            <div className="theater-list">
              {theaters.map((t) => (
                <button
                  key={t.theaterId}
                  className={`theater-list-button ${t.theaterId === selectedTheaterId ? 'selected' : ''}`}
                    onClick={() => {
                    const base = new Date()
                    base.setHours(0,0,0,0)
                    const iso = toLocalISODate(base)
                    setSelectedDate(iso)
                    setSelectedTheaterId(t.theaterId)
                  }}
                  aria-pressed={t.theaterId === selectedTheaterId}
                >
                  <div className="theater-list-name">{t.name}</div>
                  <div className="theater-list-address">{t.address}</div>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="right-column">
          <div className="theater-header">
            <h1 className="selected-theater-name">{selectedTheater?.name ?? 'Bạn chưa chọn rạp'}</h1>
            <div className="selected-theater-subtitle">{selectedTheater?.address}</div>
          </div>

          <div className="day-picker-section">
            <div className="day-picker-wrapper">
              <div className="week-nav">
                <button className="week-nav-button" aria-label="Previous week" onClick={() => setWeekOffset((w) => w - 1)}>‹</button>
                <div className="week-range-label">{(() => {
                  const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() + weekOffset * 7)
                  const end = new Date(start); end.setDate(start.getDate() + 6)
                  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
                  return `${fmt(start)} — ${fmt(end)}`
                })()}</div>
                <button className="week-nav-button" aria-label="Next week" onClick={() => setWeekOffset((w) => w + 1)}>›</button>
              </div>

              <div className="day-picker" role="tablist" aria-label="Chọn ngày">
                  {Array.from({ length: 7 }).map((_, i) => {
                  const base = new Date()
                  base.setHours(0, 0, 0, 0)
                  const d = new Date(base)
                  d.setDate(base.getDate() + weekOffset * 7 + i)
                  const iso = toLocalISODate(d)
                  const label = d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })
                  const active = iso === selectedDate
                  return (
                    <button
                      key={iso}
                      className={`day-button ${active ? 'active' : ''}`}
                      onClick={() => setSelectedDate(iso)}
                      aria-pressed={active}
                    >
                      <div className="day-label">{label}</div>
                      <div className="day-sub">{d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="movies-grid">
            {isLoading ? <div className="loading">Đang tải lịch chiếu...</div> : (
              showtimes.length === 0 ? <div className="loading">Không có suất cho rạp/ngày đã chọn.</div> : (
                <div>
                  <h3>Chọn suất chiếu</h3>
                  {movie ? (
                    (() => {
                      const displayTitle = movie?.Title ?? (movie as any)?.title ?? `Movie ${movieIdParam}`
                      const posterUrl = (movie as any).PosterUrl || (movie as any).posterUrl || (movie as any).Poster || undefined
                      return (
                        <div className="movie-card-loader movie-card-loader-flex">
                          <div className="movie-card-loader-left">
                            {posterUrl ? <img src={posterUrl} alt={displayTitle} className="movie-logo" /> : <div className="movie-logo placeholder" aria-hidden />}
                          </div>
                          <div className="movie-card-loader-right">
                            <h3 className="movie-title-loader">{displayTitle}</h3>
                            <div className="showtimes">
                              {(filteredShowtimes.length === 0) ? <div className="loading">Không có suất cho phim đã chọn.</div> : filteredShowtimes.map((s) => (
                                <button key={s.showtimeId} className="showtime-button" onClick={() => {
                                  if (!isLoggedIn) { setSelectedShowtime(s); setShowAuthPrompt(true); return }
                                  setSelectedShowtime(s)
                                  fetchSeatTypesAndMap(s.showtimeId!, s.roomId)
                                  setShowSeatSelection(true)
                                }}>{s.showTime?.slice(0,5) ?? s.showTime}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="showtimes-flex">
                      {showtimes.map((s) => (
                        <button key={s.showtimeId} className="showtime-button" onClick={() => {
                          if (!isLoggedIn) { setSelectedShowtime(s); setShowAuthPrompt(true); return }
                          setSelectedShowtime(s)
                          fetchSeatTypesAndMap(s.showtimeId!, s.roomId)
                          setShowSeatSelection(true)
                        }}>{s.showTime?.slice(0,5) ?? s.showTime}</button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>

      {showAuthPrompt && ReactDOM.createPortal(
        <div className="auth-prompt-modals" onClick={() => setShowAuthPrompt(false)}>
          <div className="auth-prompt-contents" onClick={(e) => e.stopPropagation()}>
            <h3>Vui lòng đăng nhập để tiếp tục</h3>
            <p>Bạn cần đăng nhập hoặc đăng ký để tiếp tục mua vé cho suất này.</p>
            <div className="auth-buttons-container">
              <button onClick={() => { setShowAuthPrompt(false); navigate('/login') }} className="book-button-loader">Đăng nhập</button>
              <button onClick={() => { setShowAuthPrompt(false); navigate('/login?signup=1') }} className="book-button-loader">Đăng ký</button>
              <button onClick={() => setShowAuthPrompt(false)} className="auth-button-cancel">Hủy</button>
            </div>
          </div>
        </div>, document.body)
      }

      {showSeatSelection && selectedShowtime && ReactDOM.createPortal(
        <div className="auth-prompt-modal" onClick={() => { setShowSeatSelection(false); setSelectedSeats([]) }}>
                  <div className="auth-prompt-content" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="auth-prompt-close" 
                      onClick={() => { setShowSeatSelection(false); setSelectedSeats([]) }}
                      aria-label="Close"
                    >
                      ×
                    </button>
                    <h2 className="seat-modal-title">Chọn ghế - {selectedShowtime.movie?.Title ?? (selectedShowtime.movie as any)?.title}</h2>
                    <div className="seat-modal-container">
                      <div className="seat-modal-left">
                        <div className="seat-types-header"><strong>Hạng ghế</strong></div>
                        <div className="seat-types-list">
                          {seatTypes.length === 0 ? <div>Đang tải hạng ghế...</div> : seatTypes.map((t) => {
                            const id = t.seatTypeId ?? t.id
                            const color = getColorForSeatType(id)
                            return (
                              <div key={id} className="seat-type-item">
                                <div className="seat-type-color" style={{ background: color }} />
                                <div className="seat-type-name">{t.typeName ?? t.name ?? `Loại ${id}`}</div>
                              </div>
                            )
                          })}
                        </div>
        
                        <div className="seat-diagram-header"><strong>Sơ đồ ghế</strong></div>
                            <div className="screenn">
                              <p>MÀN HÌNH</p>
                            </div>
                        <div className="seat-gridd">
                          <div className="seat-grid-wrapper">
                          </div>
                          {seatMap.length === 0 ? (
                            <div>Đang tải sơ đồ ghế...</div>
                          ) : (
                            (() => {
                              // Group seats by row and render each row centered. This makes short rows
                              // (e.g. 6-seat couple rows) appear centered and visually pleasing.
                              const rows: Record<string, any[]> = {}
                              for (const s of seatMap) {
                                const r = (s.row ?? 0).toString()
                                if (!rows[r]) rows[r] = []
                                rows[r].push(s)
                              }
                              const rowKeys = Object.keys(rows).sort((a, b) => {
                                const na = Number(a)
                                const nb = Number(b)
                                if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
                                return String(a).localeCompare(String(b))
                              })
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {rowKeys.map((rk) => {
                                    const rowSeats = rows[rk].slice().sort((a, b) => (a.col ?? a.id) - (b.col ?? b.id))
                                    const isRowJ = String(rk).toUpperCase() === 'J'
                                    return (
                                      <div key={rk} className="seat-row" style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                                        {(() => {
                                          const elems: any[] = []
                                          for (let i = 0; i < rowSeats.length; i++) {
                                            const seat = rowSeats[i]
                                            const next = rowSeats[i + 1]
                                            const pairMatch = next && (seat.pairId && next.pairId && seat.pairId === next.pairId)
                                            const isCouple = Boolean(seat.isCouple || pairMatch)

                                            if (isCouple && next) {
                                              const bothAvailable = seat.isAvailable && next.isAvailable
                                              const isSelected = selectedSeats.includes(seat.id) || selectedSeats.includes(next.id)
                                              const bg = bothAvailable ? getColorForSeatType(seat.seatTypeId) : '#6b7280'
                                              elems.push(
                                                <button
                                                  key={`${seat.id}-${next.id}`}
                                                  onClick={() => {
                                                    if (!bothAvailable) return
                                                    setSelectedSeats((prev) => {
                                                      const has = prev.includes(seat.id) || prev.includes(next.id)
                                                      if (has) return prev.filter((x) => x !== seat.id && x !== next.id)
                                                      if (prev.length + 2 > MAX_SEATS) { alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`); return prev }
                                                      return [...prev, seat.id, next.id]
                                                    })
                                                  }}
                                                  disabled={!bothAvailable}
                                                  title={bothAvailable ? `${seat.label}/${next.label} • ${((selectedShowtime?.basePrice ?? selectedShowtime?.price ?? 0) * (layoutMeta?.roomPriceMultiplier ?? 1) * Math.max(seat.priceMultiplier ?? 1, next.priceMultiplier ?? 1)).toLocaleString()}đ` : `${seat.label}/${next.label} • Ghế đã có người mua`}
                                                  className={`seat-button ${bothAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isRowJ ? 'seat-double-width' : ''}`}
                                                  style={{
                                                    minWidth: isRowJ ? 108 : 96,
                                                    padding: '10px 8px',
                                                    background: bg,
                                                    color: '#021124',
                                                    cursor: bothAvailable ? 'pointer' : 'not-allowed',
                                                    filter: isSelected ? 'brightness(0.7)' : (bothAvailable ? 'none' : 'grayscale(1)'),
                                                    opacity: bothAvailable ? 1 : 0.6,
                                                    borderColor: isSelected ? '#0b5ed7' : undefined,
                                                  }}
                                                >{`${seat.label}-${next.label}`}</button>
                                              )
                                              i++
                                            } else {
                                              const color = getColorForSeatType(seat.seatTypeId)
                                              const isSelected = selectedSeats.includes(seat.id)
                                              const isSold = !seat.isAvailable
                                              const bg = isSold ? '#6b7280' : color
                                              elems.push(
                                                <button
                                                  key={seat.id}
                                                  onClick={() => {
                                                    if (isSold) return
                                                    setSelectedSeats((prev) => {
                                                      if (prev.includes(seat.id)) return prev.filter((x) => x !== seat.id)
                                                      if (prev.length >= MAX_SEATS) { alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`); return prev }
                                                      return [...prev, seat.id]
                                                    })
                                                  }}
                                                  disabled={isSold}
                                                  title={isSold ? `${seat.label} • Ghế đã có người mua` : `${seat.label} • ${((selectedShowtime?.basePrice ?? selectedShowtime?.price ?? 0) * (layoutMeta?.roomPriceMultiplier ?? 1) * (seat.priceMultiplier ?? 1)).toLocaleString()}đ`}
                                                  className={`seat-button ${isSold ? 'unavailable' : 'available'} ${isSelected ? 'selected' : ''} ${isRowJ ? 'seat-double-width' : ''}`}
                                                  style={{
                                                    minWidth: isRowJ ? 108 : undefined,
                                                    background: bg,
                                                    color: '#021124',
                                                    cursor: isSold ? 'not-allowed' : 'pointer',
                                                    filter: isSelected ? 'brightness(0.7)' : (isSold ? 'grayscale(1)' : 'none'),
                                                    opacity: isSold ? 0.6 : 1,
                                                    borderColor: isSelected ? '#0b5ed7' : undefined,
                                                  }}
                                                >{seat.label}</button>
                                              )
                                            }
                                          }
                                          return elems
                                        })()}
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()
                          )}
                        </div>
                      </div>
        
                      <div className="seat-modal-right">
                        <div className="booking-info-header"><strong>Thông tin đặt vé</strong></div>
                        <div className="booking-info-row">Rạp: {selectedTheater?.name}</div>
                        <div className="booking-info-row">Phòng: {selectedShowtime.room?.roomName ?? selectedShowtime.roomId}</div>
                        <div className="booking-info-row">Thời gian: {selectedShowtime.showTime}</div>
                        <div style={{ marginTop: 12 }}><strong>Ghế đã chọn ({selectedSeats.length}/{MAX_SEATS}):</strong></div>
                        <ul className="booking-seats-list">
                          {selectedSeats.map((id) => {
                            const seatObj = seatMap.find((s: any) => s.id === id)
                            const label = seatObj ? seatObj.label : id
                            const price = seatObj ? getSeatPrice(seatObj) : 0
                            return <li key={id}>Ghế {label} <span>{price.toLocaleString()}đ</span></li>
                          })}
                        </ul>
        
                        <div className="booking-total-section">
                          <div className="booking-total-row">
                            <strong>Tổng</strong>
                            <strong className="booking-total-value">{selectedSeats.reduce((sum, id) => {
                              const s = seatMap.find((se: any) => se.id === id)
                              return sum + (s ? getSeatPrice(s) : 0)
                            }, 0).toLocaleString()}đ</strong>
                          </div>
                        </div>
        
                        <div className="booking-buttons">
                          <button className="book-button-loader" onClick={async () => {
                            if (!selectedShowtime) return
                            if (selectedSeats.length === 0) {
                              alert('Vui lòng chọn ghế trước khi tiếp tục')
                              return
                            }
                            if (selectedSeats.length > MAX_SEATS) {
                              alert(`Chỉ được chọn tối đa ${MAX_SEATS} ghế`) 
                              return
                            }
                            try {
                              // send numeric seatIds and include userId or sessionId
                              const seatIds = selectedSeats.map(Number)
                              const opts: any = {}
                              if (isLoggedIn && user) opts.userId = user.userId
                              else {
                                let sessionId = localStorage.getItem('sessionId')
                                if (!sessionId) {
                                  sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
                                  try { localStorage.setItem('sessionId', sessionId) } catch (e) { console.debug('localStorage setItem failed', e) }
                                }
                                opts.sessionId = sessionId
                              }
        
                              const showtimeId = Number(selectedShowtime!.showtimeId)
                              const reservation = await reservationsAPI.create(showtimeId, seatIds, opts)
                              if (!reservation) throw new Error('Reservation failed')
                              setShowSeatSelection(false)
                              setSelectedSeats([])
                              const id = (reservation as any).reservationId ?? (reservation as any).ReservationId ?? null
                              if (id) navigate(`/booking?reservation=${id}`)
                              else alert('Đặt vé thành công')
                            } catch (err) {
                              console.error(err)
                              alert('Lỗi khi đặt vé')
                            }
                          }}>Tiếp tục</button>
                          <button className="book-button-loader" onClick={() => { setShowSeatSelection(false); setSelectedSeats([]) }}>Hủy</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>, document.body
              )}

      <Footer />
    </div>
  )
}

export default PurchasePage
