"use client";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { moviesAPI, showtimesAPI, reservationsAPI, seatsAPI, roomsAPI, bookingsAPI, paymentsAPI } from "../services/api";
import "./payment.css";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const bookingId = searchParams.get("bookingId");
  const returnUrl = `${window.location.origin}/payment-success`;

  const [reservation, setReservation] = useState<any | null>(
    null
  );
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const cancelTimersRef = useRef<Record<string, number>>({});
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [pollCounter, setPollCounter] = useState(0);
  const [isFakeShowing, setIsFakeShowing] = useState(false);

  // Confirmed seats are stored in backend; do not persist them to localStorage from the client.

  // Remove duplicate bookings for the same reservation/showtime+seats, keep one (prefer paid/confirmed)
  const dedupeBookingsForReservation = async (reservationObj: any, preferredKeepId?: any) => {
    try {
      const history = await bookingsAPI.history();
      if (!Array.isArray(history) || history.length === 0) return;

      const resSeatIds: number[] = (reservationObj?.seatIds && Array.isArray(reservationObj.seatIds))
        ? reservationObj.seatIds.map((n: any) => Number(n)).filter((n: any) => !Number.isNaN(n))
        : (reservationObj?.seats && Array.isArray(reservationObj.seats) ? reservationObj.seats.map((s: any) => Number(s.seatId ?? s.id)).filter((n: any) => !Number.isNaN(n)) : []);

      const sameBookings = history.filter((b: any) => {
        try {
          const bShowtime = b.showtimeId ?? b.showtime?.showtimeId ?? b.showtime?.id;
          const rShowtime = reservationObj?.showtime?.showtimeId ?? reservationObj?.showtime?.id ?? reservationObj?.showtimeId;
          if (!bShowtime || !rShowtime) return false;
          if (Number(bShowtime) !== Number(rShowtime)) return false;
          const bSeats = Array.isArray(b.seats) ? b.seats : (Array.isArray(b.bookingSeats) ? b.bookingSeats : []);
          const bSeatIds = bSeats.map((s: any) => Number(s.seatId ?? s.seat?.seatId ?? s.id)).filter((n: any) => !Number.isNaN(n));
          if (resSeatIds.length !== bSeatIds.length) return false;
          const a = new Set(resSeatIds.map((n) => Number(n)));
          return bSeatIds.every((id: any) => a.has(Number(id)));
        } catch (e) { return false }
      });

      if (sameBookings.length <= 1) return;

      // choose keeper: prefer paid/confirmed, else preferredKeepId, else first
      let keeper = sameBookings.find((b: any) => String(b.status || '').toLowerCase().includes('confirmed') || String(b.status || '').toLowerCase().includes('paid')) || null;
      if (!keeper && preferredKeepId) keeper = sameBookings.find((b: any) => String(b.bookingId ?? b.id) === String(preferredKeepId)) || null;
      if (!keeper) keeper = sameBookings[0];

      for (const b of sameBookings) {
        const bid = b.bookingId ?? b.id ?? b.bookingIdString;
        if (!bid) continue;
        if (String(bid) === String(keeper.bookingId ?? keeper.id)) continue;
        // do not try to cancel local stubs
        if (String(bid).startsWith('local-')) continue;
        try {
          await reservationsAPI.cancel(String(bid));
          console.debug('[Payment] cancelled duplicate booking', bid);
        } catch (e) {
          console.debug('[Payment] failed cancelling duplicate booking', bid, e);
        }
      }
    } catch (e) {
      console.debug('dedupeBookingsForReservation failed', e);
    }
  }

  // ----------------------------------------------
  // LOAD RESERVATION DETAILS
  // ----------------------------------------------
  useEffect(() => {
    if (!bookingId) return;
    console.debug('[Payment] mounting, bookingId=', bookingId);
    (async () => {
      try {
        const reservationId = Number(bookingId);
        if (Number.isNaN(reservationId)) return;

        // 1) Load reservation details for UI
        const res = await reservationsAPI.details(reservationId);
        if (!res) return;

        // 2) Try to reuse existing booking/payment created by backend
        const existingBooking = await bookingsAPI.byReservation(reservationId);

        // Fetch showtime and seat details regardless (for display)
        const showtime: any = await showtimesAPI.details(res.showtimeId);

        // Ensure showtime has movie and room/theater data for UI display
        try {
          if (showtime) {
            // populate movie if backend returned only movieId
            if (!showtime.movie && (showtime.movieId || showtime.movieId === 0)) {
              try {
                const mv = await moviesAPI.details(showtime.movieId);
                if (mv) showtime.movie = mv;
              } catch (e) {
                console.debug('Failed to fetch movie details for showtime', e);
              }
            }

            // populate room (and possibly theater via room) if missing
            if (!showtime.room && showtime.roomId) {
              try {
                const rm = await roomsAPI.details(showtime.roomId);
                if (rm) showtime.room = rm;
              } catch (e) {
                console.debug('Failed to fetch room details for showtime', e);
              }
            }

            // if room contains nested theater, attach to showtime.theater for UI
            if (!showtime.theater && showtime.room && showtime.room.theater) {
              showtime.theater = showtime.room.theater;
            }
          }
        } catch (e) {
          console.debug('showtime enrichment error', e);
        }
        const seats = await Promise.all((res.seatIds || []).map((id: number) => seatsAPI.details(id)));

        // Compute pricing
        let roomMultiplier = Number((showtime as any)?.room?.roomType?.priceMultiplier ?? 1);
        const basePrice = Number(showtime?.basePrice ?? 0);
        if ((!showtime?.room || !(showtime as any).room.roomType) && showtime?.roomId) {
          try {
            const room = await roomsAPI.details(showtime.roomId);
            if (room) roomMultiplier = Number((room as any)?.roomType?.priceMultiplier ?? roomMultiplier ?? 1);
          } catch (err) {
            console.debug('Failed to fetch room details for multiplier fallback', err);
          }
        }

        const seatPrices: { seatId: number; seatNumber: string; price: number }[] = (seats || []).map((s: any) => {
          const seatTypeMultiplier = Number(s?.seatType?.priceMultiplier ?? 1);
          const finalPrice = basePrice * seatTypeMultiplier * roomMultiplier;
          return { seatId: s?.seatId, seatNumber: `${s?.row}${s?.col}`, price: finalPrice };
        });

        const totalPrice = seatPrices.reduce((sum: number, p: { price: number }) => sum + (p.price || 0), 0);

        setReservation({
          reservationId: res.reservationId,
          showtime,
          seats,
          seatInfo: seatPrices.map(p => `${p.seatNumber}(${p.price.toLocaleString('vi-VN')})`).join(', '),
          totalPrice,
          status: res.status,
        });

        // 3) If there's an existing booking, reuse it and try to fetch its payment
        if (existingBooking && existingBooking.bookingId) {
          const bId = existingBooking.bookingId;
          setCreatedBookingId(bId);

          // If backend already provided paymentUrl via booking response, use it
          if (existingBooking.paymentUrl) {
            setPaymentUrl(existingBooking.paymentUrl);
            if (existingBooking.paymentId) setPaymentId(existingBooking.paymentId);
            return;
          }

          // Otherwise, check payments by booking
          const payments = await paymentsAPI.byBooking(bId);
          if (Array.isArray(payments) && payments.length > 0) {
            const last = payments[payments.length - 1];
            setPaymentUrl(last.paymentUrl ?? null);
            setPaymentId(last.paymentId ?? null);
            return;
          }

          // No payment found - create one
          const idempotencyKey = `payment-res-${reservationId}`;
          const payResp = await paymentsAPI.create(bId, idempotencyKey, {
            returnUrl,
            paymentMethod: 'EWallet'
          });
          setPaymentUrl(payResp?.paymentUrl ?? null);
          setPaymentId(payResp?.paymentId ?? null);
          return;
        }

        // 4) No existing booking: leave UI ready and wait for user action (or auto-start)
        // We keep reservation in state so handlePayment can create booking+payment when user clicks.
      } catch (err) {
        console.error(err);
      }
    })();
  }, [bookingId]);

  // ----------------------------------------------
  // MAIN PAYMENT FLOW
  // ----------------------------------------------
  const handlePayment = async () => {
    if (!reservation || loading) return;
    if (!isLoggedIn) { navigate('/login'); return; }

    setLoading(true);
    try {
      // Use deterministic idempotency key per reservation to avoid duplicate bookings
      const idempotencyKey = `booking-res-${reservation.reservationId}`;

      // try reuse existing booking
      const byRes = await bookingsAPI.byReservation(Number(reservation.reservationId)).catch(() => null);
      let newBookingId: any = byRes?.bookingId ?? byRes?.id ?? null;

      if (!newBookingId) {
        const bookingResp = await bookingsAPI.create(Number(reservation.reservationId), idempotencyKey);
        newBookingId = bookingResp?.bookingId ?? bookingResp?.id ?? null;
        if (!newBookingId) throw new Error('Booking creation failed');
        setCreatedBookingId(newBookingId);
      }

      // show a temporary display while backend payment is created
      setPaymentUrl(`Thanh toán tạm (không thực) - ${reservation.totalPrice.toLocaleString('vi-VN')} VND`);
      setIsFakeShowing(true);

      const paymentResp = await paymentsAPI.create(Number(newBookingId), idempotencyKey, { returnUrl, paymentMethod: 'EWallet', bankCode: 'VNPAYQR' }).catch(() => null);
      if (paymentResp?.paymentId) setPaymentId(paymentResp.paymentId ?? null);
      if (paymentResp?.paymentUrl) setPaymentUrl(paymentResp.paymentUrl ?? null);
    } catch (err) {
      console.error(err);
      alert('Thanh toán lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------
  // POLLING PAYMENT STATUS
  // ----------------------------------------------
  useEffect(() => {
    if (!paymentId || !createdBookingId) return;
    if (pollCounter >= 120) return; // stop after 120 polls (~2 minutes)

    const interval = setInterval(async () => {
      try {
            // Skip calling backend if user is not authenticated to avoid 401 spam
            if (!localStorage.getItem('authToken')) return;

        // use paymentsAPI.details to get payment status by id
        const latest = await paymentsAPI.details(String(paymentId));
        const status = latest?.status ?? null;

        if (status === "Success" || status === "Paid") {
          navigate("/payment-success");
        } else if (status === "Failed" || status === "Error") {
          navigate("/payment-failed");
        }

        setPollCounter((prev) => prev + 1);
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [paymentId, createdBookingId, pollCounter, navigate]);

  // ----------------------------------------------
  // AUTO-START PAYMENT WHEN ARRIVING WITH A RESERVATION
  // If the page was opened with a reservation id (we use `bookingId` param for reservationId),
  // automatically start the booking+payment creation flow for logged-in users.
  // ----------------------------------------------
  useEffect(() => {
    // bookingId variable holds the incoming reservation id in this flow
    if (!bookingId) return;
    // If a payment is already in progress or created, don't auto-start again
    if (paymentId || createdBookingId || loading) return;

    // Only auto-start when user is logged in (handlePayment will redirect to login otherwise)
    if (isLoggedIn) {
      // small timeout to let initial state settle
      const t = setTimeout(() => {
        handlePayment().catch((e) => console.debug('Auto payment start failed', e));
      }, 300);
      return () => clearTimeout(t);
    }
  }, [bookingId, isLoggedIn, paymentId, createdBookingId, loading]);

  // ----------------------------------------------
  // UI RENDER
  // ----------------------------------------------
  if (!reservation) return <div className="loading-text">Đang tải...</div>;

  const seatList = (reservation.seats || []).map((s: any) => (
    s?.seatNumber
    ?? s?.seat?.seatNumber
    ?? (s?.row != null && s?.col != null ? `${s.row}${s.col}` : null)
    ?? s?.label
    ?? String(s?.seatId ?? s?.id ?? '')
  )).filter((v: any) => v).join(', ');

  // Friendly labels with multiple fallbacks so UI shows movie/theater reliably
  const movieLabel = (
    reservation.showtime?.movie?.name
    ?? reservation.showtime?.movieName
    ?? reservation.showtime?.movie?.title
    ?? reservation.showtime?.movieTitle
    ?? '—'
  );

  const theaterLabel = (
    reservation.showtime?.theater?.name
    ?? reservation.showtime?.theaterName
    ?? reservation.showtime?.room?.theater?.name
    ?? reservation.showtime?.room?.theaterName
    ?? reservation.showtime?.room?.name
    ?? 'r'
  );

  return (
    <div className="booking-page">
      <Header />

      <div className="payment-container">
        <h2>Thanh toán</h2>

        {/* Reservation Info */}
        <div className="info-box">
          <p>
            <strong>Phim:</strong> {movieLabel}
          </p>
          <p>
            <strong>Rạp:</strong> {theaterLabel}
          </p>
          <p>
            <strong>Ghế:</strong> {seatList}
          </p>
          <p>
            <strong>Tổng tiền:</strong>{" "}
            {(typeof reservation.totalPrice === 'number' ? reservation.totalPrice.toLocaleString("vi-VN") : String(reservation.totalPrice ?? '0'))} VND
          </p>
        </div>

        {/* Payment Button */}
        {!paymentUrl && (
          <div className="button-group-top">
            <button className="back-btn" onClick={() => navigate(-1)} disabled={loading}>
              Quay lại
            </button>
            <button className="pay-btn" disabled={loading} onClick={handlePayment}>
              {loading ? "Đang tạo QR..." : "Tiến hành thanh toán"}
            </button>
          </div>
        )}

        {/* QR CODE DISPLAY */}
        {paymentUrl && (
          <div className="qr-section">
            <h3>Quét mã QR để thanh toán</h3>
            <img alt="QR code" src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentUrl ?? '')}&size=240x240`} width={240} height={240} />



            <p>Đang chờ xác nhận thanh toán...</p>

            <div className="button-group">
              <button className="back-btn" onClick={() => navigate(-1)}>
                Quay lại
              </button>
              {/* Simulate button: if real paymentId exists call backend simulate, otherwise local success */}
              <button
                className="pay-btn"
                onClick={async () => {
                    try {
                      let pid = String(paymentId ?? '')
                      // If no backend payment exists yet, create one so we can call simulate
                      if (!pid && createdBookingId) {
                        try {
                          const payIdempotency = (window.crypto && (window.crypto as any).randomUUID) ? (window.crypto as any).randomUUID() : `pay_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
                          const paymentResp = await paymentsAPI.create(Number(createdBookingId), payIdempotency, { returnUrl, paymentMethod: 'EWallet' });
                          pid = String(paymentResp?.paymentId || paymentResp?.id || '')
                          if (paymentResp?.paymentUrl) setPaymentUrl(paymentResp.paymentUrl)
                          if (pid) setPaymentId(pid)
                          setIsFakeShowing(false)
                        } catch (e) {
                          console.error('Failed creating payment for simulate', e)
                        }
                      }

                      if (!pid) {
                        // If we have a local booking stub, treat simulate as local success
                        if (createdBookingId && String(createdBookingId).startsWith('local-')) {
                          navigate('/payment-success')
                          return
                        }

                        // fallback: navigate to success locally
                        navigate('/payment-success')
                        return
                      }

                      const simResp = await paymentsAPI.simulateSuccess(pid)
                      // optimistic UI update: fetch booking and mark paid locally if simulate succeeded
                      if (simResp) {
                        try {
                          if (createdBookingId) {
                            const latestBooking = await bookingsAPI.details(Number(createdBookingId))
                            if (latestBooking) {
                              // booking updated on backend; UI will read from backend when needed
                            }
                            // clear auto-cancel timer if present
                            try {
                              const tid = cancelTimersRef.current[String(createdBookingId)];
                              if (tid) {
                                clearTimeout(tid);
                                delete cancelTimersRef.current[String(createdBookingId)];
                              }
                            } catch (e) { /* ignore */ }
                          }
                        } catch (e) {
                          console.error('Failed to refresh booking after simulate', e)
                        }
                        try {
                          // dedupe bookings so only the confirmed one remains
                          await dedupeBookingsForReservation(reservation, createdBookingId ?? undefined);
                        } catch (e) { console.debug('dedupe after simulate failed', e) }
                        navigate('/payment-success')
                      } else {
                        // fallback local success
                        navigate('/payment-success')
                      }
                    } catch (e) {
                      console.error('Simulate failed', e);
                      alert('Mô phỏng thất bại');
                    }
                }}
              >
                {isFakeShowing ? 'Xác nhận thanh toán' : 'Xác nhận thanh toán thành công'}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
