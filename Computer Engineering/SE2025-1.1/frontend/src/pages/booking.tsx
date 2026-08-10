import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import Header from "../components/Header"
import "./booking.css"
import { useMovieState } from "../hooks/useMovieState"
import Footer from "../components/Footer"
import { useAuth } from "../context/useAuth"
import { moviesAPI, showtimesAPI, reservationsAPI, seatsAPI, bookingsAPI, paymentsAPI } from "../services/api"
import type { Showtime, Seat } from "../types"

const Booking = () => {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const {
    selectedMovie,
    setSelectedMovie,
    showtimesList,
    setShowtimesList,
    seatMap,
    setSeatMap,
    selectedSeats,
    setSelectedSeats,
  } = useMovieState()
  const { isLoggedIn, user } = useAuth()
  const [seatIdMap, setSeatIdMap] = useState<Record<string, number>>({})
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const [showReservation, setShowReservation] = useState<boolean>(Boolean(searchParams.get('reservation')))
  const [bookingInfo, setBookingInfo] = useState<any | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [_isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [_isFakeShowing, setIsFakeShowing] = useState(false)
  const reservationParamRender = searchParams.get('reservation')
  useEffect(() => {
    setShowReservation(Boolean(searchParams.get('reservation')))
  }, [searchParams])

  useEffect(() => {
    setShowReservation(Boolean(searchParams.get('reservation')))
  }, [searchParams])

  // Format currency as integer VND without decimals, e.g. 1308000VNĐ
  // Format currency as integer VND with dot thousands separators, e.g. 1.308.000 VNĐ
  const formatCurrency = (amt: any) => {
    const n = Number(amt ?? 0);
    if (Number.isNaN(n)) return '0 VNĐ';
    return `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} VNĐ`;
  }

  // Confirmed seats are stored server-side with reservations/bookings.
  // Client should not persist confirmed seats to localStorage anymore.
  const persistConfirmedSeats = (_booking: any) => {
    // no-op: backend holds authoritative confirmed seats; UI updates should come
    // from fetching booking/reservation details or seats API. Keeping this
    // function as a no-op preserves existing call sites without writing to
    // localStorage.
    return
  }

  useEffect(() => {
    // On mount clear any legacy booking-related localStorage keys so
    // confirmed seats and booking-mapping aren't persisted client-side.
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith('booking-mapping-') || key.startsWith('booking-inflight-') || key.startsWith('confirmed_booking_')) {
            try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
          }
        }
      }
    } catch (e) { /* ignore environment without localStorage */ }
    const fetchData = async () => {
      try {
        if (!movieId) return
        const id = Number(movieId)
        if (Number.isNaN(id)) {
          setError("Invalid movie id")
          return
        }
        const movie = await moviesAPI.details(id)
        setSelectedMovie(movie)

        const today = new Date().toISOString().split("T")[0]
        const showtimes = await showtimesAPI.list(id, today)
        setShowtimesList(showtimes)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [movieId, setSelectedMovie, setShowtimesList])

  // Ensure global selected seats are cleared when switching movies or unmounting
  useEffect(() => {
    const hasReservation = Boolean(searchParams.get('reservation'))
    if (!hasReservation) setSelectedSeats([])
    return () => {
      if (!hasReservation) {
        setSelectedSeats([])
        setSeatMap([])
      }
    }
  }, [movieId, setSelectedSeats, setSeatMap, searchParams])

  // Reservation -> booking -> payment flow
  useEffect(() => {
    let pollHandle: number | undefined

    const handleReservationFlow = async () => {
      const reservationParam = searchParams.get('reservation')
      if (!reservationParam) return
      const reservationId = Number(reservationParam)
      if (Number.isNaN(reservationId)) {
        setError('Invalid reservation id')
        return
      }

      try {
        setIsLoading(true)

        if (!isLoggedIn) {
          setError('Vui lòng đăng nhập để tiếp tục thanh toán cho đặt chỗ này')
          setIsLoading(false)
          return
        }

        let booking: any = null
        try {
          const existing = await bookingsAPI.byReservation(reservationId)
          booking = existing && existing.bookingId ? existing : null
        } catch (e) {
          // byReservation might 404, that's ok
          booking = null
        }
        
        if (!booking) {
          const mappingKey = `booking-mapping-${reservationId}`;
          const inflightKey = `booking-inflight-${reservationId}`;

          // Try to reuse mapping from localStorage
          const mapped = localStorage.getItem(mappingKey);
          if (mapped) {
            try {
              const mappedNum = Number(mapped);
              if (!Number.isNaN(mappedNum)) {
                const existing = await bookingsAPI.details(mappedNum);
                if (existing && (existing.bookingId ?? existing.id)) {
                  booking = existing;
                }
              }
            } catch (e) { /* ignore */ }
          }

          // If another tab is inflight creating booking, wait shortly for mapping
          if (!booking) {
            const inflight = localStorage.getItem(inflightKey);
            if (inflight) {
              for (let i = 0; i < 15 && !booking; i++) {
                await new Promise((r) => setTimeout(r, 200));
                const m = localStorage.getItem(mappingKey);
                if (m) {
                  try {
                    const n = Number(m);
                    if (!Number.isNaN(n)) {
                      const existing = await bookingsAPI.details(n);
                      if (existing && (existing.bookingId ?? existing.id)) {
                        booking = existing;
                        break;
                      }
                    }
                  } catch (e) { /* ignore */ }
                }
              }
            }
          }

          if (!booking) {
            // Use deterministic idempotency key per reservation so repeated
            // booking.create calls for the same reservation don't create duplicates.
            const idempotencyKey = `booking-res-${reservationId}`
            // Do not persist inflight marker to localStorage; backend is authoritative.
            try {
              booking = await bookingsAPI.create(Number(reservationId), idempotencyKey)
              if (booking && (booking.bookingId ?? booking.id)) {
                // Do not persist mapping to localStorage; rely on backend booking records.
              }
            } finally {
              // ensure we don't leave any inflight marker (we never set one)
            }
          }
        }

        if (booking) {
          setBookingInfo(booking)
                    try {
            const stId = booking.showtimeId ?? booking.showtime?.showtimeId ?? booking.showtimeId
            if (stId && !selectedShowtime) {
              try {
                const st = await showtimesAPI.details(stId)
                if (st) setSelectedShowtime(st)
              } catch (e) {
                // ignore fetch failure
              }
            }

            const mvId = booking.movieId ?? booking.movie?.movieId ?? booking.movie?.id
            if (mvId && !selectedMovie) {
              try {
                const mv = await moviesAPI.details(mvId)
                if (mv) setSelectedMovie(mv)
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            // ignore
          }
        }

        pollHandle = window.setInterval(async () => {
          try {
            const bId = booking?.bookingId ?? (await bookingsAPI.byReservation(reservationId))?.bookingId
            if (!bId) return
            const latest = await bookingsAPI.details(bId)
            if (latest) setBookingInfo(latest)
            if (latest && (latest.status === 'Confirmed' || latest.status === 'Paid' || latest.status === 'Completed')) {
              if (pollHandle) clearInterval(pollHandle)
              try {
                const showtimeId = latest.showtimeId ?? latest.showtime?.showtimeId
                if (showtimeId && selectedShowtime) {
                  const roomId = (selectedShowtime as any).roomId ?? (selectedShowtime as any).room?.roomId
                  if (roomId) {
                    const layout = await seatsAPI.roomLayout(roomId)
                    const seatsRaw = Array.isArray(layout) ? layout : (layout && layout.seats) ? layout.seats : []
                    const uiSeats = (seatsRaw || []).map((s: any) => ({ row: s.row ?? (String((s.seatNumber || '').charAt(0) || 'A')), number: s.col ?? (Number((s.seatNumber || '').slice(1)) || 1), status: (s.isBooked || s.status === 'Reserved' || s.status === 'reserved') ? 'sold' : 'available' }))
                    setSeatMap(uiSeats)
                  }
                }
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            // ignore
          }
        }, 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reservation flow failed')
      } finally {
        setIsLoading(false)
      }
    }

    handleReservationFlow()

    return () => { if (pollHandle) clearInterval(pollHandle) }
  }, [searchParams, isLoggedIn, selectedShowtime, setSeatMap, selectedMovie, setSelectedMovie])

  useEffect(() => {
    let pollId: number | undefined
    const fetchSeats = async () => {
      if (!selectedShowtime) return
      try {
        const roomId = (selectedShowtime as any).roomId ?? (selectedShowtime as any).room?.roomId
        if (roomId) {
          const layout = await seatsAPI.roomLayout(roomId)
          const seatsRaw = Array.isArray(layout) ? layout : (layout && layout.seats) ? layout.seats : []
          const idMap: Record<string, number> = {}
          const uiSeats: Seat[] = (seatsRaw || []).map((s: any) => {
            const row = s.row ?? String((s.seatNumber || '').charAt(0) || 'A')
            const col = s.col ?? (Number((s.seatNumber || '').slice(1)) || 1)
            const seatStr = `${row}${col}`
            idMap[seatStr] = s.seatId ?? s.id
            return { row: String(row), number: Number(col), status: (s.isBooked || s.status === 'Reserved' || s.status === 'reserved') ? 'sold' : 'available' }
          })
          setSeatIdMap(idMap)
          setSeatMap(uiSeats)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load seats")
      }
    }
    fetchSeats()
    if (selectedShowtime) pollId = window.setInterval(fetchSeats, 5000)
    return () => { if (pollId) clearInterval(pollId) }
  }, [selectedShowtime, setSeatMap])

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== "available") return
    setSelectedSeats((prev) => {
      const seatStr = `${seat.row}${seat.number}`
      return prev.includes(seatStr) ? prev.filter((s) => s !== seatStr) : [...prev, seatStr]
    })
  }

  const totalPrice = selectedSeats.length * (selectedShowtime?.price || 0)

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) { setError("Please select a showtime and at least one seat"); return }
    let booking: any = null
    try {
      setIsLoading(true)
      const showtimeId = selectedShowtime.id ?? selectedShowtime.showtimeId
      if (showtimeId === undefined) { setError("Invalid showtime id"); return }
      const seatIds = selectedSeats.map(s => seatIdMap[s]).filter(Boolean)
      if (seatIds.length === 0) { setError('Không tìm thấy id ghế tương ứng. Vui lòng thử lại.'); return }

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

      const reservation = await reservationsAPI.create(showtimeId, seatIds, opts)
      if (!reservation) { setError("Failed to create reservation"); return }

      // Try to eagerly create booking + payment so user sees QR immediately.
      try {
        const reservationId = reservation.reservationId
        let booking: any = null

        // attempt to reuse mapping/inflight to avoid duplicate booking creation
        const mappingKey = `booking-mapping-${reservationId}`;
        const inflightKey = `booking-inflight-${reservationId}`;
        const mapped = localStorage.getItem(mappingKey);
        if (mapped) {
          try {
            const mappedNum = Number(mapped);
            if (!Number.isNaN(mappedNum)) {
              const existing = await bookingsAPI.details(mappedNum);
              if (existing && (existing.bookingId ?? existing.id)) booking = existing
            }
          } catch (e) { /* ignore */ }
        }

        if (!booking) {
          const inflight = localStorage.getItem(inflightKey);
          if (inflight) {
            for (let i = 0; i < 15 && !booking; i++) {
              await new Promise((r) => setTimeout(r, 200));
              const m = localStorage.getItem(mappingKey);
              if (m) {
                try {
                  const n = Number(m);
                  if (!Number.isNaN(n)) {
                    const existing = await bookingsAPI.details(n);
                    if (existing && (existing.bookingId ?? existing.id)) { booking = existing; break }
                  }
                } catch (e) { /* ignore */ }
              }
            }
          }
        }

        if (!booking) {
          const idempotencyKey = `booking-res-${reservationId}`
          // Do not write booking mapping or inflight markers to localStorage.
          booking = await bookingsAPI.create(Number(reservationId), idempotencyKey)
          if (booking && (booking.bookingId ?? booking.id)) {
            // booking created in backend; do not mirror id into localStorage
          }
        }

        if (booking) setBookingInfo(booking)

        // create payment for booking if booking exists
        if (booking && booking.bookingId) {
          setIsProcessingPayment(true)
          try {
            const payIdempotency = (window.crypto && (window.crypto as any).randomUUID) ? (window.crypto as any).randomUUID() : `pay_${Date.now()}_${Math.random().toString(36).slice(2,9)}`
            const returnUrl = `${window.location.origin}/payment-success`

            // Show immediate fake QR so user sees amount while backend processes
            const fakeDisplay = `Thanh toán tạm - ${formatCurrency(booking.finalAmount ?? reservation.totalPrice)}`
            setPaymentUrl(fakeDisplay)
            setIsFakeShowing(true)

            const payment = await paymentsAPI.create(booking.bookingId, payIdempotency, { returnUrl, paymentMethod: 'EWallet' })
            if (payment) {
              // Keep showing the fake QR instead of exposing VNPay URL to the user.
              // Store payment id so simulate can use it later.
              setPaymentId(payment.paymentId || payment.id || null)
              setPaymentUrl(fakeDisplay)
              setIsFakeShowing(true)

              // start polling for payment status (same logic as in handleStartPayment)
              const pollHandle = window.setInterval(async () => {
                try {
                  const pid = payment.paymentId || payment.id || paymentId
                  if (!pid) return
                  // don't call details if no auth token (prevents 401 spam)
                  if (!localStorage.getItem('authToken')) return
                  const latestPay = await paymentsAPI.details(pid)
                  if (latestPay && (latestPay.status === 'Paid' || latestPay.status === 'Success' || latestPay.status === 'Confirmed')) {
                      clearInterval(pollHandle)
                      try {
                        const latestBooking = await bookingsAPI.details(booking.bookingId)
                        if (latestBooking) setBookingInfo(latestBooking)
                        // persist confirmed seats so theaters will mark them unavailable
                        try { persistConfirmedSeats(latestBooking) } catch (e) { /* ignore */ }
                      } catch (e) { /* ignore */ }
                      try { toast.success('Đã tạo đặt chỗ và thanh toán khởi tạo. Vui lòng quét mã QR để hoàn tất.'); } catch (e) { /* ignore */ }
                      navigate('/')
                    }
                } catch (e) {
                  // ignore
                }
              }, 3000)
            }
          } catch (e) {
            // if payment creation fails, continue to reservation payment flow
            console.warn('Payment creation failed, falling back to manual payment start', e)
          } finally { setIsProcessingPayment(false) }
        }

        try { toast.success('Đã tạo đặt chỗ. Bạn sẽ được chuyển đến trang thanh toán để hoàn tất.'); } catch (e) { /* ignore */ }
      } catch (e) {
        // ignore alert failures in some environments
          console.warn('Eager booking/payment attempt failed', e)
      }

      // If we created a booking above, navigate directly to payment for that booking.
      if (booking && (booking.bookingId ?? booking.id)) {
        const bId = booking.bookingId ?? booking.id
        navigate(`/payment?bookingId=${encodeURIComponent(String(bId))}`)
      } else {
        // Navigate to reservation payment view so user can continue if eager flow failed
        navigate(`/booking?reservation=${encodeURIComponent(String(reservation.reservationId))}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed")
    } finally { setIsLoading(false) }
  }

 

  // Note: movieTitle, hallName, and showtimeDate variables removed as they were not used in JSX


  const reservationFlow = (
    <div className="reservation-flow-container">
      {!paymentUrl && <h3>Thanh toán cho đặt chỗ</h3>}
          {!isLoggedIn ? (
        <div className="login-prompt-text">
          <p>Vui lòng đăng nhập để tiếp tục thanh toán cho đặt chỗ này.</p>
            <div className="flex-gap-8">
            <button className="book-button-loader" onClick={() => navigate(`/login?reservation=${encodeURIComponent(reservationParamRender ?? '')}`)}>
              Đăng nhập
            </button>
                <button className="trailer-button-loader" onClick={() => navigate('/payment-failed')}>Hủy</button>
          </div>
        </div>
      ) : bookingInfo ? (
        <div>
          {/* Hide the top booking summary once a paymentUrl is shown */}
          {!paymentUrl && (
            <>
              <p>Booking code: <strong className="booking-info-text">{bookingInfo.bookingCode}</strong></p>
              <p>Số tiền cần thanh toán: <strong className="booking-info-text">{formatCurrency(bookingInfo.finalAmount ?? bookingInfo.totalAmount ?? 0)}</strong></p>
              <p>Thời hạn: {bookingInfo.expiryDate ? new Date(bookingInfo.expiryDate).toLocaleString() : '—'}</p>
            </>
          )}

          {/* hide the top action buttons once paymentUrl exists (QR is shown) */}
          {!paymentUrl && (
            <div className="flex-gap-8 mt-12">
              {/* Open payment page directly (shows fake QR immediately on payment page) */}
              {reservationParamRender && (
                <button className="trailer-button-loader" onClick={() => navigate(`/payment?bookingId=${encodeURIComponent(reservationParamRender)}`)}>
                  Mở trang thanh toán
                </button>
              )}
              <button className="trailer-button-loader" onClick={() => navigate('/payment-failed')}>
                Hủy
              </button>
            </div>
          )}

          {paymentUrl ? (
            <div className="flex-gap-90">
              <img alt="QR code" src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`} className="qr-code-image" />
              <div className="qr-instructions">
                <p>Quét mã QR bằng ứng dụng thanh toán để thanh toán.</p>
                <p className="mt-12">Sau khi thanh toán, trạng thái sẽ được cập nhật tự động.</p>
                <div className="flex-gap-8 mt-12">
                  <button className="book-button-loader" onClick={async () => {
                    setIsLoading(true)
                    try {
                      const latest = await bookingsAPI.details(bookingInfo.bookingId)
                      if (latest) setBookingInfo(latest)
                      if (latest && (latest.status === 'Confirmed' || latest.status === 'Paid' || latest.status === 'Completed')) {
                        // persist seats so theaters shows them as sold immediately
                        try { persistConfirmedSeats(latest) } catch (e) { /* ignore */ }
                        navigate('/payment-success')
                        const roomId = (selectedShowtime as any)?.roomId ?? (selectedShowtime as any)?.room?.roomId
                        if (roomId) {
                          const layout = await seatsAPI.roomLayout(roomId)
                          const seatsRaw = Array.isArray(layout) ? layout : (layout && layout.seats) ? layout.seats : []
                          const uiSeats = (seatsRaw || []).map((s: any) => ({ row: s.row ?? (String((s.seatNumber || '').charAt(0) || 'A')), number: s.col ?? (Number((s.seatNumber || '').slice(1)) || 1), status: (s.isBooked || s.status === 'Reserved' || s.status === 'reserved') ? 'sold' : 'available' }))
                          setSeatMap(uiSeats)
                        }
                      } else {
                        toast.error('Chưa thấy thanh toán. Vui lòng đợi vài giây rồi thử lại.')
                      }
                    } catch (e) {
                      console.error(e)
                      toast.error('Lỗi khi kiểm tra trạng thái thanh toán')
                    } finally { setIsLoading(false) }
                  }}>Kiểm tra thanh toán</button>
                  {import.meta.env.DEV && (
                    <button className="trailer-button-loader" onClick={async () => {
                      setIsLoading(true)
                      try {
                        // Ensure we have a payment id. If none, create a backend payment first.
                        let pid = String(paymentId || bookingInfo?.paymentId || '')
                        if (!pid) {
                          try {
                            const payIdempotency = (window.crypto && (window.crypto as any).randomUUID) ? (window.crypto as any).randomUUID() : `pay_${Date.now()}_${Math.random().toString(36).slice(2,9)}`
                            const returnUrl = `${window.location.origin}/payment-success`
                            const payment = await paymentsAPI.create(bookingInfo.bookingId, payIdempotency, { returnUrl, paymentMethod: 'EWallet' })
                            pid = String(payment?.paymentId || payment?.id || '')
                            if (!pid) {
                              toast.error('Không thể tạo payment để mô phỏng')
                              return
                            }
                            // update state so UI reflects the real paymentId/url
                            if (payment?.paymentUrl) setPaymentUrl(payment.paymentUrl)
                            if (payment?.paymentId || payment?.id) setPaymentId(payment.paymentId || payment.id)
                            setIsFakeShowing(false)
                          } catch (e) {
                            console.error('Failed to create payment for simulate', e)
                            toast.error('Không thể tạo payment để mô phỏng')
                            return
                          }
                        }

                        // Call backend simulate endpoint to mark payment as successful
                        const simResp = await paymentsAPI.simulateSuccess(pid)
                        if (!simResp) {
                          toast.error('Mô phỏng không thành công (không có phản hồi từ server)')
                          return
                        }

                        // refresh booking/payment state
                        try {
                          const latestPay = await paymentsAPI.details(pid)
                          const latestBooking = bookingInfo?.bookingId ? await bookingsAPI.details(bookingInfo.bookingId) : null
                          if (latestBooking) setBookingInfo(latestBooking)
                          if (latestPay && (latestPay.status === 'Paid' || latestPay.status === 'Success' || latestPay.status === 'Confirmed')) {
                            try { persistConfirmedSeats(latestBooking ?? bookingInfo) } catch (e) { /* ignore */ }
                            // ensure UI reflects paid state immediately
                            if (latestBooking) setBookingInfo({ ...latestBooking, status: 'Paid' })
                            toast.success('Đã mô phỏng thanh toán thành công')
                            navigate('/payment-success')
                          } else {
                            // optimistic fallback: mark booking confirmed/paid locally
                            try { persistConfirmedSeats(latestBooking ?? bookingInfo) } catch (e) { /* ignore */ }
                            if (bookingInfo) setBookingInfo({ ...bookingInfo, status: 'Confirmed' })
                            toast.success('Gọi mô phỏng đã gửi. Tạm thời đánh dấu đã thanh toán')
                            navigate('/payment-success')
                          }
                        } catch (e) {
                          console.error(e)
                          toast.error('Lỗi khi làm mới trạng thái sau mô phỏng')
                        }
                      } catch (e) {
                        console.error(e)
                        toast.error('Mô phỏng thất bại')
                      } finally { setIsLoading(false) }
                    }}>Simulate success</button>
                  )}
                  <button className="trailer-button-loader" onClick={() => navigate('/payment-failed')}>Hủy</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12" />
          )}

        </div>
      ) : (
        <div>Vui lòng chờ...</div>
      )}
    </div>
  )

  if (isLoading) return <div className="loading">Đang tải...</div>

  const normalFlow = (
    <>
      <div className="showtimes">
        <h3>Chọn suất chiếu</h3>
        <div className="showtimes-grid">
          {showtimesList.map((showtime) => {
            const timeStr = showtime.startTime ?? showtime.showTime ?? showtime.showDate
            const displayTime = timeStr ? new Date(timeStr).toLocaleTimeString() : "-"
            const active = selectedShowtime?.id === showtime.id
            return (
              <button
                key={showtime.id}
                onClick={() => setSelectedShowtime(showtime)}
                className={`showtime-button ${active ? 'active' : ''}`}
              >
                {displayTime}
              </button>
            )
          })}
        </div>
      </div>

      {selectedShowtime && (
        <div className="seats-section-container">
          <div className="screen">
            <p>MÀN HÌNH</p>
            <div className="screen-bar" />
          </div>

          <div className="seats-grid">
            {seatMap.map((seat) => {
              const seatStr = `${seat.row}${seat.number}`
              const isSelected = selectedSeats.includes(seatStr)
              const cls = isSelected ? 'selected' : (seat.status === 'sold' ? 'sold' : seat.status === 'priority' ? 'priority' : 'available')
              return (
                <button
                  key={seatStr}
                  onClick={() => toggleSeat(seat)}
                  disabled={seat.status !== "available"}
                  className={`seat-btn ${cls}`}
                  title={seat.status === "sold" ? "Sold" : seat.status === "priority" ? "Held by another user" : "Available"}
                >
                  {seatStr}
                </button>
              )
            })}
          </div>

          <div className="legend">
            <div className="item"><div className="box legend-box-available" /> <span className="legend-text">Available</span></div>
            <div className="item"><div className="box legend-box-held" /> <span className="legend-text">Held</span></div>
            <div className="item"><div className="box legend-box-sold" /> <span className="legend-text">Sold</span></div>
          </div>

          <div className="summary">
            <div className="info">
              <p>Ghế đã chọn: {selectedSeats && selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}</p>
              <p className="price">{formatCurrency(totalPrice)}</p>
            </div>
            <button onClick={handleBooking} disabled={isLoading} className="confirm-button">
              {isLoading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="booking-page">
      <Header />
      
      <main className="booking-main">
        {/* <button onClick={() => { setSelectedSeats([]); setSeatMap([]); navigate("/") }} className="back-button">← Quay lại </button> */}

        {error && <div className="error-box">{error}</div>}

        <div className="booking-card">
          <h2 className="booking-title">{selectedMovie?.Title}</h2>
          <p className="booking-subtext">{paymentUrl ? 'Thanh Toán Đặt vé' : 'Thông tin đặt vé'}</p>

          {/* If opened from reservation -> show QR/payment flow */}
          {showReservation ? reservationFlow : normalFlow}

        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Booking