import React, { useState, useEffect } from 'react'
import { seatsAPI } from '../../../services/api'
import type { Seat } from '../../../types/manual-booking'
import { formatPriceVN } from './bookingHelpers'
import './SelectSeatsStep.css'

interface SelectSeatsStepProps {
  selectedShowtime: any
  selectedMovie: any
  selectedSeats: Seat[]
  onSelectSeats: (seats: Seat[]) => void
  onBack: () => void
  onContinue: () => void
  isLoading?: boolean
}

const SelectSeatsStep: React.FC<SelectSeatsStepProps> = ({
  selectedShowtime,
  selectedMovie,
  selectedSeats,
  onSelectSeats,
  onBack,
  onContinue,
  isLoading,
}) => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [seatsError, setSeatsError] = useState<string>('')

  useEffect(() => {
    // Try to get roomId from multiple sources
    const roomId = selectedShowtime?.roomId || selectedShowtime?.room?.roomId
    const showtimeId = selectedShowtime?.showtimeId
    
    if (!roomId) {
      setSeatsError('Không có thông tin phòng chiếu')
      return
    }

    if (!showtimeId) {
      setSeatsError('Không có thông tin suất chiếu')
      return
    }

    // Debug log
    console.log('SelectSeatsStep - selectedShowtime:', selectedShowtime)
    console.log('SelectSeatsStep - roomId:', roomId)
    console.log('SelectSeatsStep - showtimeId:', showtimeId)

    const loadSeats = async () => {
      setSeatsLoading(true)
      setSeatsError('')
      try {
        // Load seats with booking status for this specific showtime
        const data = await seatsAPI.byRoomAndShowtime(roomId, showtimeId)
        if (Array.isArray(data)) {
          // Normalize seats from API response
          const basePrice = selectedShowtime?.basePrice ?? selectedShowtime?.price ?? 100000
          
          const normalizedSeats = data.map((s: any) => {
            // Support both backend shapes:
            // - nested: s.seatType?.typeName, s.seatType?.priceMultiplier
            // - flat: s.seatTypeName, s.priceMultiplier
            const seatTypeMultiplier = Number(
              s.seatType?.priceMultiplier ?? s.priceMultiplier ?? 1,
            )

            // Price = basePrice × seatTypeMultiplier
            const seatPrice = Math.round(basePrice * seatTypeMultiplier)

            const seatTypeName = s.seatType?.typeName ?? s.seatTypeName ?? 'Regular'

            return {
              seatId: s.seatId,
              rowNumber: s.row ?? '',
              columnNumber: s.col ?? 0,
              price: seatPrice,
              // isBooked is now from confirmed bookings for THIS showtime, not global seat status
              isBooked: s.isBooked,
              isHeld: s.status === 'Held' || s.status === 'held' || !!s.isHeld,
              isCouple: seatTypeName === 'Couple',
              pairWith: s.pairWith,
              span: s.span,
              seatClass: s.seatClass,
              seatTypeName,
            }
          })
          setSeats(normalizedSeats)
          console.log('Loaded seats with booking status for showtime:', normalizedSeats)
        } else {
          setSeatsError('Không thể tải danh sách ghế')
        }
      } catch (error) {
        setSeatsError(`Lỗi tải ghế: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.error('Error loading seats:', error)
      } finally {
        setSeatsLoading(false)
      }
    }

    loadSeats()
  }, [selectedShowtime])

  const toggleSeat = (s: Seat) => {
    // Prevent selecting reserved or held seats
    if (s.isBooked || (s as any).isHeld) {
      console.log(`Ghế ${s.rowNumber}${s.columnNumber} không thể chọn (đã đặt hoặc đang giữ chỗ)`)
      return
    }
    const exists = selectedSeats.find((x) => x.seatId === s.seatId)
    if (exists) {
      onSelectSeats(selectedSeats.filter((x) => x.seatId !== s.seatId))
    } else {
      onSelectSeats([...selectedSeats, s])
    }
  }

  // Calculate total price
  const totalPrice = Array.isArray(selectedSeats)
    ? selectedSeats.reduce((sum: number, s: Seat) => sum + (Number(s.price) || 0), 0)
    : 0

  // Group selected seats by type with prices
  const selectedSeatsByType = selectedSeats.reduce((acc: Record<string, Seat[]>, seat: Seat) => {
    const type = seat.seatTypeName || 'Regular'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(seat)
    return acc
  }, {})

  // Group seats by row for organized display
  const seatsByRow = seats.reduce((acc: Record<string, Seat[]>, seat: Seat) => {
    const row = seat.rowNumber || 'Unknown'
    if (!acc[row]) {
      acc[row] = []
    }
    acc[row].push(seat)
    return acc
  }, {})

  return (
    <div className="admin-booking-step">
      <h2>Chọn ghế</h2>

      <div className="seats-selection-container">
        <div className="seats-main-area">
          {seatsLoading && <div style={{ color: '#ff9800', marginBottom: 12 }}>Đang tải ghế...</div>}

          {seatsError && <div style={{ color: '#f44336', marginBottom: 12 }}>{seatsError}</div>}

          {/* Màn hình chiếu */}
          <div className="screen-container">
            <div className="screen">Màn Hình</div>
          </div>

          <div className="seats-container">
            {Object.entries(seatsByRow)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([row, rowSeats]) => (
                <div key={row} className="seats-row">
                  <div className="row-label">{row}</div>
                  <div className="row-seats">
                    {rowSeats
                      .sort((a, b) => (a.columnNumber || 0) - (b.columnNumber || 0))
                      .map((s) => {
                        const selected = selectedSeats.some((x) => x.seatId === s.seatId)
                        const seatLabel = `${s.rowNumber}${s.columnNumber}`
                        
                        return (
                          <button
                            key={s.seatId}
                            className={`seat ${s.seatTypeName ? s.seatTypeName.toLowerCase() : 'regular'} ${s.isBooked ? 'reserved' : ''} ${(s as any).isHeld ? 'held' : ''} ${selected ? 'selected' : ''} ${row === 'J' ? 'seat-double-width' : ''}`}
                            onClick={() => toggleSeat(s)}
                            disabled={s.isBooked || (s as any).isHeld}
                            title={`${seatLabel} - ${s.seatTypeName || 'Regular'}${s.isBooked ? ' (Đã đặt - không thể chọn)' : (s as any).isHeld ? ' (Đang giữ chỗ)' : ''}`}
                          >
                            {seatLabel}
                          </button>
                        )
                      })}
                  </div>
                </div>
              ))}
          </div>

          {/* Chú thích hạng ghế */}
          <div className="seat-legend">
            <div className="legend-title">Chú thích ghế:</div>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-seat regular"></div>
                <span>Ghế Thường</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat vip"></div>
                <span>Ghế VIP</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat couple"></div>
                <span>Ghế Đôi</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat selected"></div>
                <span>Ghế được chọn</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat held"></div>
                <span>Ghế đang giữ chỗ</span>
              </div>
              <div className="legend-item">
                <div className="legend-seat reserved"></div>
                <span>Ghế đã đặt</span>
              </div>
            </div>
          </div>
        </div>

        <div className="seats-sidebar">
          <div className="sidebar-movie-title">{selectedMovie?.Title || 'N/A'}</div>
          
          <div className="sidebar-header">Thông tin đặt vé</div>
          
          <div className="sidebar-info">
            <div className="info-row">
              <span>Rạp:</span>
              <strong>{selectedShowtime?.room?.name || selectedShowtime?.theaterName || 'N/A'}</strong>
            </div>
            <div className="info-row">
              <span>Phòng:</span>
              <strong>{selectedShowtime?.roomName || 'N/A'}</strong>
            </div>
            <div className="info-row">
              <span>Thời gian:</span>
              <strong>{selectedShowtime?.startTime || 'N/A'}</strong>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-header">Ghế đã chọn ({selectedSeats.length})</div>
          
          {selectedSeats.length > 0 ? (
            <div className="selected-seats-list">
              {Object.entries(selectedSeatsByType).map(([type, typeSeats]) => (
                <div key={type} className="selected-type-group">
                  <div className="type-label">{type}</div>
                  <div className="selected-seats-badges">
                    {typeSeats.map((seat) => (
                      <span key={seat.seatId} className="seat-badge-item">
                        {seat.rowNumber}{seat.columnNumber}
                      </span>
                    ))}
                  </div>
                  <div className="type-price">
                    {typeSeats.length} × {formatPriceVN(typeSeats[0].price || 0)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-selection">Chưa chọn ghế nào</div>
          )}

          <div className="sidebar-divider"></div>

          <div className="sidebar-total">
            <div className="total-label">Tổng tiền</div>
            <div className="total-amount">{formatPriceVN(totalPrice)}</div>
          </div>

          <div className="sidebar-actions">
            <button className="btn-back" onClick={onBack} disabled={isLoading}>
              Quay lại
            </button>
            <button className="btn-continue" onClick={onContinue} disabled={isLoading || selectedSeats.length === 0}>
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { SelectSeatsStep }
