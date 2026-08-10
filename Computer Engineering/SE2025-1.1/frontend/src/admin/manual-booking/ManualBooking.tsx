import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import type { Seat } from '../../types/manual-booking'
import { manualBookingAPI } from '../servicesAdmin/api'
import { reservationsAPI } from '../../services/api'
// import { useAuth } from '../../context/useAuth'
import AdminHeader from '../layout/AdminHeader'
import { useBookingForm } from './booking/useBookingForm'
import { useBookingData } from './booking/useBookingData'
import { SelectSeatsStep } from './booking/SelectSeatsStep'
import { PaymentStep } from './booking/PaymentStep'
import BookingStepper from './booking/BookingStepper'
import {
  STEP_LABELS,
  BOOKING_MESSAGES,
  BUTTON_LABELS,
  PHONE_PATTERN
} from './booking/bookingConstants'
import {
  getMinDate,
  getMaxDate,
  formatDateVN,
  formatPriceVN,
} from './booking/bookingHelpers'
import './ManualBooking.css'
const ManualBooking: React.FC = () => {
  // const navigate = useNavigate()
  // const { user } = useAuth()

  // Booking form state management
  const {
    step,
    setStep,
    selectedMovie,
    setSelectedMovie,
    selectedDate,
    setSelectedDate,
    selectedTheater,
    setSelectedTheater,
    selectedShowtime,
    setSelectedShowtime,
    selectedSeats,
    setSelectedSeats,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    loading,
    setLoading,
    setError,
    setSuccess,
    bookingResult,
    setBookingResult,
    resetAfterBooking,
    resetFromStep,
    reservationId: _reservationId,
    setReservationId,
  } = useBookingForm() as any

  // Booking data management (movies, theaters, showtimes)
  const {
    movies,
    theaters,
    showtimes,
    loadingMovies,
    loadingTheaters,
    loadingShowtimes,
    errorTheaters,
    loadShowtimesForFilters,
    reloadTheaters,
  } = useBookingData() as any

  // Load showtimes when movie, date, and theater are selected
  useEffect(() => {
    if (!selectedMovie || !selectedDate || !selectedTheater) return
    
    loadShowtimesForFilters(selectedMovie.MovieId, selectedDate, selectedTheater.theaterId)
  }, [selectedMovie?.MovieId, selectedDate, selectedTheater?.theaterId, loadShowtimesForFilters])

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  // Debug: log step changes (helpful during development)
  useEffect(() => {
    console.log('[ManualBooking] current step:', step)
  }, [step])

  // Auto-redirect after successful booking
  // Do NOT auto-redirect for any payment method - user must click "Trang chủ đặt vé" button
  useEffect(() => {
    if (!bookingResult) return
    
    console.log('[ManualBooking] Booking complete - waiting for user to click home button')
    return
  }, [bookingResult, resetAfterBooking, selectedPaymentMethod])

  // ==================== Step Handlers ====================

  const handleBackFromSeats = () => {
    // UI-only reset: do not call any cancel API here
    setSelectedSeats([])
    setReservationId(null)
    setError('')
    setStep('select-showtime')
  }

  const handleBackFromCustomerInfo = () => {
    // UI-only reset: do not call any cancel API here
    setSelectedSeats([])
    setReservationId(null)
    setError('')
    setStep('select-seats')
  }

  const handleMovieSelect = (movieId: number) => {
    const movie = movies.find((m: any) => m.MovieId === movieId)
    if (!movie) return

    setSelectedMovie(movie)
    resetFromStep('select-date')
    setError('')
    setStep('select-date')
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    resetFromStep('select-theater')
    setError('')
    setStep('select-theater')
  }

  const handleTheaterSelect = (theaterId: number) => {
    const theater = theaters.find((t: any) => t.theaterId === theaterId)
    if (!theater) return

    setSelectedTheater(theater)
    resetFromStep('select-showtime')
    setError('')
    setStep('select-showtime')
  }

  const handleShowtimeSelect = (showtimeId: number) => {
    const showtime = showtimes.find((s: any) => s.showtimeId === showtimeId)
    if (!showtime) return

    setSelectedShowtime(showtime)
    resetFromStep('select-seats')
    setError('')
    setStep('select-seats')
  }

  const handleSeatsSelect = (seats: Seat[]) => {
    setSelectedSeats(seats)
  }

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      setError(BOOKING_MESSAGES.SELECT_SEATS_ERROR)
      return
    }

    // Create a reservation (Pending) for admin to hold seats same as user flow
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const seatIds = selectedSeats.map((s: any) => s.seatId)
        const opts: any = {}
        const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('authUser') || 'null') : null
        if (storedUser && storedUser.userId) opts.userId = storedUser.userId

        const reservation = await reservationsAPI.create(selectedShowtime.showtimeId, seatIds, opts)
        if (!reservation || !(reservation as any).reservationId) {
          setError('Không thể giữ chỗ cho ghế. Vui lòng thử lại.')
          return
        }

        setReservationId((reservation as any).reservationId)
        setStep('customer-info')
      } catch (err: any) {
        console.error('Error creating reservation for admin:', err)
        setError(err?.message || 'Lỗi khi giữ chỗ')
      } finally {
        setLoading(false)
      }
    })()
  }

  // (no-op removed) proceed is handled by handleProceedToPayment which now goes to customer-info

  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerName.trim()) {
      setError(BOOKING_MESSAGES.CUSTOMER_NAME_ERROR)
      return
    }

    if (!customerPhone.trim() || !PHONE_PATTERN.test(customerPhone)) {
      setError(BOOKING_MESSAGES.PHONE_ERROR)
      return
    }

    // Create booking as Pending now (so admin flow matches user flow)
    try {
      setLoading(true)
      setError('')

      // Use reservationId created earlier to link booking
      const result = await manualBookingAPI.create(
        selectedShowtime.showtimeId,
        selectedSeats.map((s: any) => s.seatId),
        customerName,
        customerPhone,
        'cash'
      )

      // store booking result for payment step / confirmation
      setBookingResult(result)
      setStep('confirm')
    } catch (err: any) {
      console.error('Error creating manual booking at customer info submit:', err)
      setError(err?.message || 'Lỗi khi tạo booking')
    } finally {
      setLoading(false)
    }
  }

  // Finalize booking (called after payment step)
  const handleFinalizeBooking = async (paymentMethod: string) => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      setError(BOOKING_MESSAGES.BOOKING_ERROR)
      return null
    }

    try {
      setLoading(true)
      setError('')

      // If booking was already created in the customer info step, handle according to payment method.
      if (bookingResult && bookingResult.bookingId) {
        console.log('[handleFinalizeBooking] Existing booking found:', bookingResult.bookingId, 'method:', paymentMethod)
        // For cash => confirm immediately. For bank => keep Pending so payment can be created.
        if (paymentMethod === 'cash') {
          await manualBookingAPI.confirm(bookingResult.bookingId)
        }

        const updated = await manualBookingAPI.getDetails(bookingResult.bookingId).catch(() => null)
        console.log('[handleFinalizeBooking] Updated booking from getDetails:', updated)

        // If getDetails fails, just use bookingResult directly
        const finalResult = updated || bookingResult
        console.log('[handleFinalizeBooking] Setting final result:', finalResult)
        setBookingResult(finalResult)
        setSuccess(BOOKING_MESSAGES.BOOKING_SUCCESS)
        return finalResult
      }

      // Otherwise create booking then confirm
      const seatIds = selectedSeats.map((s: any) => s.seatId)
      const created = await manualBookingAPI.create(
        selectedShowtime.showtimeId,
        seatIds,
        customerName,
        customerPhone,
        paymentMethod
      )

      console.log('[handleFinalizeBooking] Created booking response:', created)

      if (created && created.bookingId) {
        console.log('[handleFinalizeBooking] Created booking response:', created.bookingId, 'method:', paymentMethod)
        // Confirm immediately only for cash payments. For bank, leave Pending so payment can be created.
        if (paymentMethod === 'cash') {
          console.log('[handleFinalizeBooking] Confirming new booking (cash):', created.bookingId)
          await manualBookingAPI.confirm(created.bookingId)
        }

        const updated = await manualBookingAPI.getDetails(created.bookingId).catch(() => null)
        console.log('[handleFinalizeBooking] Updated booking from getDetails:', updated)

        // If getDetails fails, use created directly
        const finalResult = updated || created
        console.log('[handleFinalizeBooking] Setting final result:', finalResult)
        setBookingResult(finalResult)
        setSuccess(BOOKING_MESSAGES.BOOKING_SUCCESS)
        return finalResult
      }

      console.error('[handleFinalizeBooking] Created booking has no bookingId:', created)
      return null
    } catch (err: any) {
      const errorMsg = err?.message || 'Có lỗi khi đặt vé'
      setError(errorMsg)
      console.error('Booking error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = Array.isArray(selectedSeats)
    ? selectedSeats.reduce((sum: number, s: any) => sum + (Number(s.price) || 0), 0)
    : 0

  // Debug: log confirmation data
  useEffect(() => {
    if (step === 'confirm') {
      console.log('[ManualBooking] Confirm step data:', {
        selectedMovie: selectedMovie?.Title,
        selectedDate,
        selectedTheater: selectedTheater?.name,
        selectedShowtime,
        selectedSeats,
        totalPrice,
      })
    }
  }, [step, selectedMovie, selectedDate, selectedTheater, selectedShowtime, selectedSeats, totalPrice])

  return (
    <div className="admin-booking-wrapper">
      <AdminHeader />

      {/* Debug overlay removed - use browser console for logs */}

      <main className="admin-booking-container no-sidebar">
        <div className="admin-booking-content">
          {/* Booking Progress Stepper */}
          <BookingStepper currentStep={step} />

          {/* Step 1: Select Movie */}
          {step === 'select-movie' && (
            <div className="admin-booking-step">
              <h2>{STEP_LABELS['select-movie']}</h2>
              {loadingMovies ? (
                <div className="admin-booking-loading">
                  {BOOKING_MESSAGES.LOADING_MOVIES}
                </div>
              ) : movies.length === 0 ? (
                <div className="admin-booking-empty-state">
                  {BOOKING_MESSAGES.NO_MOVIES}
                </div>
              ) : (
                <div className="admin-booking-movies-grid">
                  {movies.map((movie: any) => (
                    <div
                      key={movie.MovieId}
                      className={`admin-booking-movie-card ${
                        selectedMovie?.MovieId === movie.MovieId ? 'selected' : ''
                      }`}
                      onClick={() => handleMovieSelect(movie.MovieId)}
                    >
                      {movie.PosterUrl && (
                        <img
                          src={movie.PosterUrl}
                          alt={movie.Title}
                          className="admin-booking-movie-poster"
                        />
                      )}
                      <div className="admin-booking-movie-info">
                        <p className="admin-booking-movie-title">{movie.Title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date */}
          {step === 'select-date' && selectedMovie && (
            <div className="admin-booking-step">
              <h2>{STEP_LABELS['select-date']}</h2>
              <div className="admin-booking-selected-info">
                <p>
                  Phim: <strong>{selectedMovie.Title}</strong>
                </p>
              </div>

              <div className="admin-booking-date-picker-container">
                <label htmlFor="booking-date">
                  {BOOKING_MESSAGES.SELECT_DATE_HINT}
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="admin-booking-date-input"
                />
                {selectedDate && (
                  <p className="admin-booking-selected-date">
                    Ngày đã chọn: <strong>{formatDateVN(selectedDate)}</strong>
                  </p>
                )}
              </div>

              <div className="admin-booking-actions">
                <button
                  className="admin-booking-btn admin-booking-btn-secondary"
                  onClick={() => setStep('select-movie')}
                >
                  {BUTTON_LABELS.BACK}
                </button>
                <button
                  className="admin-booking-btn admin-booking-btn-primary"
                  disabled={!selectedDate}
                  onClick={() => handleDateSelect(selectedDate)}
                >
                  {BUTTON_LABELS.CONTINUE}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Theater */}
          {step === 'select-theater' && selectedMovie && selectedDate && (
            <div className="admin-booking-step">
              <h2>{STEP_LABELS['select-theater']}</h2>
              <div className="admin-booking-selected-info">
                <p>
                  Phim: <strong>{selectedMovie.Title}</strong>
                </p>
                <p>
                  Ngày: <strong>{formatDateVN(selectedDate)}</strong>
                </p>
              </div>

              {loadingTheaters ? (
                <div className="admin-booking-loading">
                  {BOOKING_MESSAGES.LOADING_THEATERS}
                </div>
              ) : errorTheaters ? (
                <div className="admin-booking-error-state">
                  <div className="admin-booking-error-msg">{errorTheaters}</div>
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="admin-booking-btn admin-booking-btn-primary"
                      onClick={() => reloadTheaters && reloadTheaters()}
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : !Array.isArray(theaters) ? (
                <div className="admin-booking-empty-state" style={{ color: 'red', fontWeight: 'bold' }}>
                  ❌ Dữ liệu rạp không hợp lệ (type: {typeof theaters}): {JSON.stringify(theaters).slice(0, 150)}
                </div>
              ) : theaters.length === 0 ? (
                <div className="admin-booking-empty-state">
                  {BOOKING_MESSAGES.NO_THEATERS}
                </div>
              ) : (
                <div className="admin-booking-theaters-grid">
                  {theaters.map((theater: any) => (
                    <button
                      key={theater.theaterId}
                      className={`admin-booking-theater-card ${
                        selectedTheater?.theaterId === theater.theaterId ? 'selected' : ''
                      }`}
                      onClick={() => handleTheaterSelect(theater.theaterId)}
                    >
                      <div className="admin-booking-theater-name">{theater.name}</div>
                      {theater.address && (
                        <div className="admin-booking-theater-location">{theater.address}</div>
                      )}
                      {theater.city && (
                        <div className="admin-booking-theater-city">{theater.city}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="admin-booking-actions">
                <button
                  className="admin-booking-btn admin-booking-btn-secondary"
                  onClick={() => setStep('select-date')}
                >
                  {BUTTON_LABELS.BACK}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Showtime */}
          {step === 'select-showtime' &&
            selectedMovie &&
            selectedDate &&
            selectedTheater && (
              <div className="admin-booking-step">
                <h2>{STEP_LABELS['select-showtime']}</h2>
                <div className="admin-booking-selected-info">
                  <p>
                    Phim: <strong>{selectedMovie.Title}</strong>
                  </p>
                  <p>
                    Ngày: <strong>{formatDateVN(selectedDate)}</strong>
                  </p>
                  <p>
                    Rạp: <strong>{selectedTheater.name}</strong>
                  </p>
                </div>

                {loadingShowtimes ? (
                  <div className="admin-booking-loading">
                    {BOOKING_MESSAGES.LOADING_SHOWTIMES}
                  </div>
                ) : showtimes.length === 0 ? (
                  <div className="admin-booking-empty-state">
                    {BOOKING_MESSAGES.NO_SHOWTIMES}
                  </div>
                ) : (
                  <div className="admin-booking-showtimes-list">
                    <h4>{BOOKING_MESSAGES.SELECT_SHOWTIME_HINT}</h4>
                    {showtimes.map((showtime: any) => (
                      <button
                        key={showtime.showtimeId}
                        className={`admin-booking-showtime-btn ${
                          selectedShowtime?.showtimeId === showtime.showtimeId
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() => handleShowtimeSelect(showtime.showtimeId)}
                      >
                          <span className="time">{(showtime as any).startTime || (showtime as any).showTime || (showtime as any).start_time || 'N/A'}</span>
                          <span className="info">{(showtime as any).roomName || (showtime as any).room?.roomName || (showtime as any).room_name || ''}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="admin-booking-actions">
                  <button
                    className="admin-booking-btn admin-booking-btn-secondary"
                    onClick={() => setStep('select-theater')}
                  >
                    {BUTTON_LABELS.BACK}
                  </button>
                </div>
              </div>
            )}

          {/* Step 5: Select Seats */}
          {step === 'select-seats' && selectedShowtime && (
            <SelectSeatsStep
              selectedShowtime={selectedShowtime}
              selectedMovie={selectedMovie}
              selectedSeats={selectedSeats}
              onSelectSeats={handleSeatsSelect}
              onBack={handleBackFromSeats}
              onContinue={handleProceedToPayment}
              isLoading={loading}
            />
          )}

          {/* Step 6: Customer Info */}
          {step === 'customer-info' && (
            <div className="admin-booking-step">
              <h2>{STEP_LABELS['customer-info']}</h2>
              <form onSubmit={handleCustomerInfoSubmit}>
                <div className="admin-booking-form-group">
                  <label>Tên Khách Hàng *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập tên khách hàng"
                    required
                  />
                </div>

                <div className="admin-booking-form-group">
                  <label>Số Điện Thoại *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Nhập số điện thoại (10-11 chữ số)"
                    pattern="[0-9]{10,11}"
                    required
                  />
                </div>

                <div className="admin-booking-actions">
                  <button
                    type="button"
                    className="admin-booking-btn admin-booking-btn-secondary"
                    onClick={handleBackFromCustomerInfo}
                  >
                    {BUTTON_LABELS.BACK}
                  </button>
                  <button
                    type="submit"
                    className="admin-booking-btn admin-booking-btn-primary"
                  >
                    {BUTTON_LABELS.CONTINUE}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 7: Confirm */}
          {step === 'confirm' && (
            <div className="admin-booking-step">
              <h2>{STEP_LABELS['confirm']}</h2>
              <div className="admin-booking-confirmation-card">
                <div className="admin-booking-card-section">
                  <h3>Thông Tin Phim</h3>
                  <p>
                    <strong>Phim:</strong> {selectedMovie?.Title}
                  </p>
                  <p>
                    <strong>Ngày:</strong> {formatDateVN(selectedDate)}
                  </p>
                  <p>
                    <strong>Rạp:</strong> {selectedTheater?.name}
                  </p>
                  <p>
                    <strong>Phòng:</strong> {selectedShowtime?.roomName || selectedShowtime?.room?.roomName || 'N/A'}
                  </p>
                  <p>
                    <strong>Suất chiếu:</strong> {selectedShowtime?.startTime || selectedShowtime?.showTime || selectedShowtime?.time || 'N/A'}
                  </p>
                </div>

                <div className="admin-booking-card-section">
                  <h3>Ghế Đã Chọn</h3>
                  <div className="admin-booking-selected-seats">
                    {selectedSeats.map((seat: any) => (
                      <span key={seat.seatId} className="admin-booking-seat-badge">
                        {seat.rowNumber}
                        {seat.columnNumber}
                      </span>
                    ))}
                  </div>
                  <p className="admin-booking-seat-count">
                    Tổng cộng: {selectedSeats.length} ghế
                  </p>
                </div>

                <div className="admin-booking-card-section">
                  <h3>Thông Tin Khách Hàng</h3>
                  <p>
                    <strong>Tên:</strong> {customerName}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {customerPhone}
                  </p>
                </div>

                {/* payment method removed from confirm step (handled in payment step) */}

                <div className="admin-booking-card-section admin-booking-price-section">
                  <h3>Tổng Tiền</h3>
                  <p className="admin-booking-total-price">
                    {totalPrice > 0 ? formatPriceVN(totalPrice) : '0 ₫'}
                  </p>
                </div>

                <div className="admin-booking-actions">
                  <button
                    type="button"
                    className="admin-booking-btn admin-booking-btn-secondary"
                    onClick={() => setStep('customer-info')}
                    disabled={loading}
                  >
                    {BUTTON_LABELS.BACK}
                  </button>
                  <button
                    className="admin-booking-btn admin-booking-btn-primary admin-booking-btn-large"
                    onClick={() => setStep('payment')}
                    disabled={loading}
                  >
                    {BUTTON_LABELS.CONFIRM}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Payment */}
          {step === 'payment' && (
              <PaymentStep
              totalPrice={totalPrice}
              selectedPaymentMethod={selectedPaymentMethod}
              onSelectPaymentMethod={(m: string) => setSelectedPaymentMethod(m)}
              onBack={() => setStep('confirm')}
              onBackHome={() => resetAfterBooking()}
              onContinue={async (method: string) => {
                if (method === 'cash') {
                  // For cash: finalize immediately, create cash payment record, and show success with booking code
                  try {
                    const result = await handleFinalizeBooking('cash')
                    if (result && result.bookingId) {
                      // Create cash payment with Success status immediately
                      await manualBookingAPI.createCashPayment(result.bookingId)
                      // Fetch updated booking with payment info
                      const updated = await manualBookingAPI.getDetails(result.bookingId).catch(() => null)
                      setBookingResult(updated || result)
                    }
                  } catch (err: any) {
                    setError(err?.message || 'Lỗi khi tạo thanh toán tiền mặt')
                  }
                } else if (method === 'bank') {
                  // For bank transfer: finalize and create payment
                  try {
                    const result = await handleFinalizeBooking('bank')
                      if (result && result.bookingId) {
                      // Now create payment to get QR code
                      const paymentData = await manualBookingAPI.createPayment(result.bookingId)
                      if (paymentData && paymentData.paymentUrl) {
                        // ✅ Confirm booking for bank transfer so status changes to Confirmed
                        await manualBookingAPI.confirm(result.bookingId)
                        // ✅ Simulate payment success to update payment status
                        if (paymentData.paymentId) {
                          await manualBookingAPI.simulatePaymentSuccess(paymentData.paymentId)
                        }
                        // Fetch updated booking with Confirmed status and payment success
                        const updated = await manualBookingAPI.getDetails(result.bookingId).catch(() => null)
                        setBookingResult({
                          ...(updated || result),
                          qrCode: paymentData.paymentUrl,
                          paymentId: paymentData.paymentId
                        })
                      }
                    }
                  } catch (err: any) {
                    setError(err?.message || 'Lỗi khi tạo thanh toán')
                  }
                }
              }}
              isLoading={loading}
              paymentQRUrl={bookingResult?.qrCode}
              bookingCode={bookingResult?.bookingCode}
              bookingId={bookingResult?.bookingId}
              paymentId={bookingResult?.paymentId}
              selectedMovie={selectedMovie}
              selectedShowtime={selectedShowtime}
              selectedSeats={selectedSeats}
              customerName={customerName}
              customerPhone={customerPhone}
            />
          )}

          {/* Success Result */}
          {/* {bookingResult && (
            <div className="admin-booking-success">
              <div className="admin-booking-success-card">
                <div className="admin-booking-success-icon">✓</div>
                <h3>Đặt Vé Thành Công!</h3>
                <div className="admin-booking-details">
                  <p>
                    <strong>Mã Booking:</strong> {bookingResult.bookingCode || 'N/A'}
                  </p>
                  <p>
                    <strong>ID Booking:</strong> {bookingResult.bookingId || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </main>
    </div>
  )
}

export default ManualBooking
