import React, { useState, useEffect } from 'react'
import { formatPriceVN } from './bookingHelpers'
import { generateTicketPdf } from '../../booking-history/ticketPdf'
import './PaymentStep.css'

/**
 * Helper to generate QR code image URL using api.qrserver.com
 * Same method as pages/payment.tsx for consistency
 */
const generateQRCodeUrl = (data: string, size: string = '240x240'): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}`
}

interface PaymentStepProps {
  totalPrice: number
  selectedPaymentMethod?: string
  onSelectPaymentMethod: (m: string) => void
  onBack: () => void
  onBackHome?: () => void
  onContinue: (method: string) => Promise<any> | void
  isLoading?: boolean
  paymentQRUrl?: string
  bookingCode?: string
  bookingId?: number
  paymentId?: number
  paymentStatus?: string
  // Additional info for PDF export
  selectedMovie?: any
  selectedShowtime?: any
  selectedSeats?: any[]
  customerName?: string
  customerPhone?: string
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  totalPrice,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onBack,
  onBackHome,
  onContinue,
  isLoading,
  
  bookingCode,
  bookingId,
  paymentStatus,
  selectedMovie,
  selectedShowtime,
  selectedSeats,
  customerName,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [pollCounter, setPollCounter] = useState(0)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  
  
  // When bookingCode arrives from parent, mark payment as confirmed
  useEffect(() => {
    if (isProcessing && bookingCode && bookingCode.length > 0) {
      console.log('[PaymentStep] Booking code received:', bookingCode)
      setPaymentConfirmed(true)
    }
  }, [bookingCode, isProcessing])

  // Poll payment status when bank transfer in progress
  useEffect(() => {
    if (!paymentConfirmed || !bookingId || pollCounter >= 120) return

    const interval = setInterval(async () => {
      try {
        // You can add polling logic here if backend supports payment status endpoint
        // For now, just count and let user manually check
        setPollCounter((prev) => prev + 1)
      } catch (err) {
        console.error('Payment polling error:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [paymentConfirmed, bookingId, pollCounter])
  
  console.log('[PaymentStep] State:', { bookingCode, isProcessing, paymentConfirmed, selectedPaymentMethod, paymentStatus })

  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt', icon: '💵', description: 'Thanh toán bằng tiền mặt tại rạp' },
    { id: 'bank', name: 'Chuyển khoản (VNPAY)', icon: '🏦', description: 'Thanh toán qua VNPAY QR' },
  ]

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'cash') {
      // Mark as processing before calling onContinue
      setIsProcessing(true)
      setPollCounter(0)
      // Call onContinue and let useEffect handle showing success when bookingCode arrives
      await onContinue('cash')
    } else if (selectedPaymentMethod === 'bank') {
      // For bank: call onContinue to get payment data
      setIsProcessing(true)
      setPollCounter(0)
      await onContinue('bank')
    }
  }

  // ========== PAYMENT FORM SCREEN ==========
  return (
    <div className="admin-booking-step">
      {!paymentConfirmed ? (
        <>
          <h2>Chọn phương thức thanh toán</h2>

          <div className="admin-booking-payment-methods">
            {paymentMethods.map((method) => (
              <label key={method.id} className="admin-booking-payment-option">
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={() => onSelectPaymentMethod(method.id)}
                  disabled={isLoading}
                />
                <span className="admin-booking-payment-icon">{method.icon}</span>
                <div className="admin-booking-payment-content">
                  <div className="admin-booking-payment-name">{method.name}</div>
                  <div className="admin-booking-payment-description">{method.description}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="payment-total-section">
            <strong className="payment-total-label">Tổng cần thanh toán: </strong>
            <span className="payment-total-amount">{formatPriceVN(totalPrice)}</span>
          </div>

          {/* Additional info for bank transfer */}
          {selectedPaymentMethod === 'bank' && !isProcessing && (
            <>
              <div className="payment-qr-container bank-qr" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <h3>Quét mã QR để thanh toán</h3>
                <img
                  alt="VNPAY Payment QR Code"
                  src={generateQRCodeUrl(`${totalPrice}`, '240x240')}
                  width={240}
                  height={240}
                  className="payment-qr-image"
                  style={{ marginBottom: '15px' }}
                />
              </div>
          
            </>
          )}

          <div className="payment-actions-section admin-booking-actions">
            <button className="admin-booking-btn admin-booking-btn-secondary" onClick={onBack} disabled={isLoading || isProcessing}>
              Quay lại
            </button>

            <button
              className="admin-booking-btn admin-booking-btn-primary"
              onClick={handlePayment}
              disabled={isLoading || isProcessing || !selectedPaymentMethod}
            >
              {isLoading || isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
          </div>
        </>
      ) : (
        // Payment Confirmed - Show Booking Code
        <div className="payment-success-container">
          <span className="payment-success-icon">✓</span>
          <h2 className="payment-success-title">Thanh toán thành công!</h2>
          
          {bookingCode && (
            <div className="booking-code-box">
              <p className="booking-code-label">Mã đặt vé:</p>
              <p className="booking-code-value">{bookingCode}</p>
              <p className="booking-code-hint">Khách hàng sử dụng mã này để nhận vé và thanh toán</p>
            </div>
          )}

          <div className="admin-booking-actions">
            <button
              className="admin-booking-btn admin-booking-btn-secondary"
              onClick={() => {
                setPaymentConfirmed(false)
                setIsProcessing(false)
                setPollCounter(0)
                // Use onBackHome if provided, otherwise fall back to onBack
                if (onBackHome) {
                  onBackHome()
                } else {
                  onBack()
                }
              }}
            >
              Trang chủ đặt vé
            </button>
            <button
              className="admin-booking-btn admin-booking-btn-primary"
              onClick={() => {
                console.log('Export button clicked', {
                  bookingCode,
                  bookingId,
                  selectedMovie,
                  selectedShowtime,
                  selectedSeats,
                  customerName,
                  totalPrice,
                })
                
                if (bookingCode && bookingId) {
                  const bookingForPdf = {
                    bookingCode,
                    bookingId,
                    userName: customerName,
                    movieTitle: selectedMovie?.Title,
                    theaterName: selectedShowtime?.room?.theater?.name || selectedShowtime?.theaterName,
                    roomName: selectedShowtime?.roomName || selectedShowtime?.room?.roomName || selectedShowtime?.room?.name,
                    startTime: selectedShowtime?.showDate && selectedShowtime?.showTime 
                      ? `${selectedShowtime.showDate} ${selectedShowtime.showTime}`
                      : selectedShowtime?.startTime,
                    seatsCodes: selectedSeats?.map(s => `${s.rowNumber}${s.columnNumber}`) || [],
                    finalAmount: totalPrice,
                  }
                  console.log('Booking data for PDF:', bookingForPdf)
                  generateTicketPdf(bookingForPdf)
                } else {
                  console.error('Missing bookingCode or bookingId:', { bookingCode, bookingId })
                }
              }}
            >
              Xuất vé
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentStep
