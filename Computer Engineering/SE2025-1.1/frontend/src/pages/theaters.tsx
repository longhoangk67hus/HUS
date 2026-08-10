import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import ReactDOM from "react-dom"
import toast from "react-hot-toast"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { theatersAPI, showtimesAPI, moviesAPI, seatTypesAPI, seatsAPI, reservationsAPI } from "../services/api"
import { useAuth } from "../context/useAuth"
import type { Theater, Showtime } from "../types"
import "./theaters.css"


const TheatersPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showSeatSelection, setShowSeatSelection] = useState(false)
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [searchParams] = useSearchParams()
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null)
  const [focusMovieId, setFocusMovieId] = useState<number | null>(null)
  const [weekOffset, setWeekOffset] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [error, setError] = useState<string | null>(null)
  const [seatTypes, setSeatTypes] = useState<any[]>([])
  const [seatMap, setSeatMap] = useState<any[]>([])
  const [layoutMeta, setLayoutMeta] = useState<any | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const MAX_SEATS = 10
  
  // Ensure selections are cleared when the seat modal closes
  useEffect(() => {
    if (!showSeatSelection) setSelectedSeats([])
  }, [showSeatSelection])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await theatersAPI.list()
        if (!mounted) return
        setTheaters(Array.isArray(data) ? data : [])
        // Do not auto-select the first theater here — selection comes from header via ?theaterId
      } catch (err: unknown) {
        console.error(err)
        if (!mounted) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message || "Lỗi khi tải dữ liệu rạp")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const idStr = searchParams.get('theaterId')
    const movieIdStr = searchParams.get('movieId')
    if (movieIdStr) {
      const mid = Number(movieIdStr)
      if (!Number.isNaN(mid)) setFocusMovieId(mid)
    }
    if (!idStr) {
      setSelectedTheaterId(null)
      return
    }
    const id = Number(idStr)
    if (Number.isNaN(id)) setSelectedTheaterId(null)
    else setSelectedTheaterId(id)
  }, [searchParams])

  // When grouped showtimes update and a focusMovieId is present, scroll it into view
  useEffect(() => {
    if (!focusMovieId) return
    const el = document.getElementById(`movie-${focusMovieId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // add a temporary highlight
      el.classList.add('focused-movie')
      setTimeout(() => el.classList.remove('focused-movie'), 2500)
    }
  }, [focusMovieId])

  useEffect(() => {
    if (!selectedTheaterId) return
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await showtimesAPI.list(undefined, selectedDate, selectedTheaterId)
        if (!mounted) return
        setShowtimes(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        console.error(err)
        if (!mounted) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message || "Lỗi khi tải lịch chiếu")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [selectedTheaterId, selectedDate])

  const grouped = showtimes.reduce((acc: Record<string, Showtime[]>, s) => {
    const id = s.movieId ?? (s.movie as any)?.movieId ?? 0
    const key = String(id)
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const fetchSeatTypesAndMap = async (showtimeId: number, roomId?: number) => {
    try {
      // Fetch seat types and room layout from backend
      const [types, layout] = await Promise.all([
        seatTypesAPI.list(),
        roomId ? seatsAPI.roomLayout(roomId) : Promise.resolve(null),
      ])

      setSeatTypes(Array.isArray(types) ? types : [])
      // Capture layout meta if available
      if (layout && typeof layout === 'object' && !Array.isArray(layout)) {
        setLayoutMeta({
          roomId: layout.roomId,
          roomName: layout.roomName,
          roomPriceMultiplier: layout.roomPriceMultiplier ?? 1,
          totalSeats: layout.totalSeats,
        })
      } else {
        setLayoutMeta(null)
      }
      // layout comes from backend as { seats: [...] , rows, maxCol, ... }
      // Normalize into frontend-friendly seat objects: { id, label, isAvailable, seatTypeId, priceMultiplier }
      if (!layout) {
        setSeatMap([])
      } else if (Array.isArray(layout)) {
        // If layout is already an array of seats
        const norm = layout.map((s: any) => ({
          id: s.seatId ?? s.id,
          label: s.seatNumber ?? ((s.row != null && s.col != null) ? `${s.row}${s.col}` : s.label),
          isAvailable: (s.isBooked === undefined ? (s.status === 'Available' || s.status === 'available') : !s.isBooked),
          seatTypeId: s.seatTypeId ?? s.seatType?.seatTypeId ?? s.typeId,
          priceMultiplier: s.priceMultiplier ?? s.seatType?.priceMultiplier ?? 1,
          row: s.row,
          col: s.col,
        }))
        setSeatMap(norm)
      } else if (layout.seats && Array.isArray(layout.seats)) {
        const norm = layout.seats.map((s: any) => ({
          id: s.seatId ?? s.id,
          label: s.seatNumber ?? ((s.row != null && s.col != null) ? `${s.row}${s.col}` : s.label),
          isAvailable: (s.isBooked === undefined ? (s.status === 'Available' || s.status === 'available') : !s.isBooked),
          seatTypeId: s.seatTypeId ?? s.seatType?.seatTypeId ?? s.typeId,
          priceMultiplier: s.priceMultiplier ?? s.seatType?.priceMultiplier ?? 1,
          row: s.row,
          col: s.col,
        }))
        setSeatMap(norm)
      } else {
        // fallback: try to normalize whatever structure we got
        try {
          const rawSeats = (layout && (layout.seats || layout.items || layout.rows)) ?? []
          if (Array.isArray(rawSeats)) {
            const norm = rawSeats.map((s: any) => ({
              id: s.seatId ?? s.id,
              label: s.seatNumber ?? ((s.row != null && s.col != null) ? `${s.row}${s.col}` : s.label),
              isAvailable: (s.isBooked === undefined ? (s.status === 'Available' || s.status === 'available') : !s.isBooked),
              seatTypeId: s.seatTypeId ?? s.seatType?.seatTypeId ?? s.typeId,
              priceMultiplier: s.priceMultiplier ?? s.seatType?.priceMultiplier ?? 1,
              row: s.row,
              col: s.col,
            }))
            setSeatMap(norm)
          } else {
            setSeatMap([])
          }
        } catch (e) {
          console.error('Failed to normalize layout', e)
          setSeatMap([])
        }
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
        // availability check failed — ignore silently but log
        console.error('❌ Availability check failed', e)
      }
      // Seats are determined from backend availability; do not use localStorage for confirmed bookings.
    } catch (err) {
      console.error('Failed to load seat map', err)
    }
  }

  const selectedTheater = theaters.find((t) => t.theaterId === selectedTheaterId)
  const [movieTitles, setMovieTitles] = useState<Record<number, string>>({})
  // simple color palette fallback when seat type doesn't provide a color
  const palette = ['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#FB7185', '#F97316']
  const getColorForSeatType = (seatTypeId?: number | string) => {
    if (!seatTypeId) return palette[0]
    const found = seatTypes.find((t) => (t.seatTypeId ?? t.id) === Number(seatTypeId))
    if (found) return (found.color || found.hex || found.backgroundColor || palette[Number(seatTypeId) % palette.length])
    return palette[Number(seatTypeId) % palette.length]
  }

  const getSeatPrice = (seat: any) => {
    const base = Number(selectedShowtime?.basePrice ?? selectedShowtime?.price ?? 0)
    const roomMult = Number(layoutMeta?.roomPriceMultiplier ?? 1)
    const seatMult = Number(seat.priceMultiplier ?? 1)
    return Math.round(base * roomMult * seatMult)
  }

  useEffect(() => {
    let mounted = true

    // Collect unique movieIds that are missing a title in the returned showtime relation
    const ids = Array.from(new Set(showtimes.map(s => s.movieId).filter((id): id is number => !!id)))
    const missingIds = ids.filter((id) => {
      // if we already cached title, skip
      if (movieTitles[id]) return false
      // if any showtime for this id already includes a movie title, skip
      const hasTitleInRelation = showtimes.some(s => s.movieId === id && ((s.movie as any)?.Title || (s.movie as any)?.title))
      return !hasTitleInRelation
    })

    if (missingIds.length === 0) return

    const load = async () => {
      try {
        const pairs = await Promise.all(missingIds.map(async (id) => {
          try {
            const m = await moviesAPI.details?.(id)
            const title = (m && (m.Title || (m as any).title)) ? (m.Title || (m as any).title) : `Movie ${id}`
            return [id, title] as const
          } catch {
            return [id, `Movie ${id}`] as const
          }
        }))
        if (!mounted) return
        setMovieTitles((prev) => {
          const next = { ...prev }
          for (const [id, title] of pairs) next[id] = title
          return next
        })
      } catch (err) {
        // ignore
      }
    }

    load()
    return () => { mounted = false }
  }, [showtimes, movieTitles])

  return (
    <div className="theaters-page">
      <Header />

      <main className="theaters-container">
        <div className="theaters-grid">

          {/* Right: selected theater + 7-day picker + movies */}
          <section className="right-column">
            <div className="theater-header">
              <h1 className="selected-theater-name">{selectedTheater?.name ?? 'Bạn chưa chọn rạp'}</h1>
              <div className="selected-theater-subtitle">{selectedTheater?.address}</div>
            </div>

            {/* 7-day picker with week navigation */}
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
                  // ✅ Use local date instead of UTC to avoid timezone offset issues
                  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

            {/* Show movies for selected theater & day */}
            <div className="movies-grid">
              {isLoading ? (
                <div className="loading">Đang tải lịch chiếu...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : showtimes.length === 0 ? (
                <div className="loading">Không tìm thấy lịch chiếu cho rạp này trong ngày đã chọn.</div>
              ) : (
                Object.entries(grouped).map(([movieIdStr, arr]) => {
                  const movieId = parseInt(movieIdStr, 10)
                  const first = arr?.[0]
                  const titleFromRelation = first?.movie?.Title || (first?.movie as any)?.title
                  const displayTitle = titleFromRelation || movieTitles[movieId] || `Movie ${movieId}`
                  const posterUrl = first?.movie?.PosterUrl || (first?.movie as any)?.posterUrl || (first?.movie as any)?.Poster || undefined
                  return (
                    <div key={movieIdStr} id={`movie-${movieId}`} className={`movie-card-loader ${focusMovieId === movieId ? 'focused-movie' : ''}`}>
                      <div className="movie-card-loader-left">
                        {posterUrl ? (
                          <img src={posterUrl} alt={displayTitle} className="movie-logo" />
                        ) : (
                          <div className="movie-logo placeholder" aria-hidden />
                        )}
                      </div>
                      <div className="movie-card-loader-right">
                        <h3 className="movie-title-loader">{displayTitle}</h3>
                        <div className="showtimes">
                          {arr.map((s) => (
                            <button
                              key={s.showtimeId}
                              className="showtime-button"
                              onClick={() => {
                                // clear any previous seat selection before selecting a new showtime
                                setSelectedSeats([])
                                if (!isLoggedIn) {
                                  setSelectedShowtime(s)
                                  setShowAuthPrompt(true)
                                } else {
                                  // logged in: open seat selection modal after fetching seat types/map
                                  setSelectedShowtime(s)
                                  fetchSeatTypesAndMap(s.showtimeId!, s.roomId)
                                  setShowSeatSelection(true)
                                }
                              }}
                            >
                              {s.showTime?.slice(0,5) ?? s.showTime}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && selectedShowtime && ReactDOM.createPortal(
        <div className="auth-prompt-modals" onClick={() => setShowAuthPrompt(false)}>
          <div className="auth-prompt-contents" onClick={(e) => e.stopPropagation()}>
            {/* <button 
              className="auth-prompt-close" 
              onClick={() => setShowAuthPrompt(false)}
              aria-label="Close"
            >
              ×
            </button> */}
            <h3>Vui lòng đăng nhập để mua vé</h3>
            <p>Bạn cần đăng nhập hoặc đăng ký để tiếp tục mua vé</p>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: 20 }}>
              {/* {selectedShowtime.movie?.Title || (selectedShowtime.movie as any)?.title || 'Phim'} - {selectedShowtime.showTime?.slice(0, 5)} */}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => { 
                  setShowAuthPrompt(false)
                  navigate('/login') 
                }} 
                className="book-button-loader"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => { 
                  setShowAuthPrompt(false)
                  navigate('/login?signup=1') 
                }} 
                className="book-button-loader"
              >
                Đăng ký
              </button>
              <button 
                onClick={() => setShowAuthPrompt(false)} 
                style={{ 
                  background: "transparent", 
                  color: "#cbbd5e1", 
                  border: "1px solid #333",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Seat selection modal for logged-in users */}
      {showSeatSelection && selectedShowtime && ReactDOM.createPortal(
        <div className="auth-prompt-modal" onClick={() => { setShowSeatSelection(false); setSelectedSeats([]) }}>
          <div className="auth-prompt-content" onClick={(e) => e.stopPropagation()} >
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
                        // prefer alphabetical order for letter rows (A before B)
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
                                              if (prev.length + 2 > MAX_SEATS) { toast.error(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`); return prev }
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
                                              if (prev.length >= MAX_SEATS) { toast.error(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`); return prev }
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
                      toast.error('Vui lòng chọn ghế trước khi tiếp tục')
                      return
                    }
                    if (selectedSeats.length > MAX_SEATS) {
                      toast.error(`Chỉ được chọn tối đa ${MAX_SEATS} ghế`) 
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
                    } catch (err) {
                      console.error(err)
                      const msg = String((err as Error)?.message ?? '')
                      if (msg.includes('reservation') && msg.includes('chờ')) {
                        // ✅ Tự động xóa reservation cũ và tạo reservation mới
                        try {
                          // Wait a moment for backend to process
                          await new Promise(resolve => setTimeout(resolve, 800))
                          
                          // Retry creating the new reservation
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
                          if (!reservation) throw new Error('Tạo đặt chỗ thất bại')
                          
                          setShowSeatSelection(false)
                          setSelectedSeats([])
                          const id = (reservation as any).reservationId ?? (reservation as any).ReservationId ?? null
                          if (id) {
                            navigate(`/booking?reservation=${id}`)
                          }
                        } catch (retryErr) {
                          console.error('Retry failed:', retryErr)
                          toast.error('Lỗi khi đặt vé: ' + (String((retryErr as Error)?.message ?? '') || 'Vui lòng thử lại'))
                        }
                      } else {
                        toast.error('Lỗi khi đặt vé: ' + (msg || 'Vui lòng thử lại'))
                      }
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

export default TheatersPage
