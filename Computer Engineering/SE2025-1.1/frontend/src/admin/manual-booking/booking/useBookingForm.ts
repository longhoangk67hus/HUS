import { useState } from 'react'
import type { Movie, TheaterOption as Theater, Showtime, Seat } from '../../../types/manual-booking'

type BookingStep = 'select-movie' | 'select-date' | 'select-theater' | 'select-showtime' | 'select-seats' | 'customer-info' | 'confirm' | 'payment'

export const useBookingForm = () => {
  const [step, setStep] = useState<BookingStep>('select-movie')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [reservationId, setReservationId] = useState<number | null>(null)

  const resetAfterBooking = () => {
    setStep('select-movie')
    setSelectedMovie(null)
    setSelectedDate('')
    setSelectedTheater(null)
    setSelectedShowtime(null)
    setSelectedSeats([])
    setSelectedPaymentMethod('cash')
    setCustomerName('')
    setCustomerPhone('')
    setLoading(false)
    setError('')
    setSuccess('')
    setBookingResult(null)
    setReservationId(null)
  }

  const resetFromStep = (fromStep: BookingStep) => {
    const steps: BookingStep[] = ['select-movie', 'select-date', 'select-theater', 'select-showtime', 'select-seats', 'customer-info', 'confirm', 'payment']
    const fromIndex = steps.indexOf(fromStep)
    if (fromIndex === -1) return

    // Only clear fields for steps *after* the provided fromStep.
    if (fromIndex < steps.indexOf('select-date')) setSelectedDate('')
    if (fromIndex < steps.indexOf('select-theater')) setSelectedTheater(null)
    if (fromIndex < steps.indexOf('select-showtime')) setSelectedShowtime(null)
    if (fromIndex < steps.indexOf('select-seats')) setSelectedSeats([])
    // Reset payment method when navigating back from payment step
    if (fromIndex < steps.indexOf('payment')) setSelectedPaymentMethod('cash')
    if (fromIndex < steps.indexOf('select-seats')) setReservationId(null)
  }

  return {
    step, setStep,
    selectedMovie, setSelectedMovie,
    selectedDate, setSelectedDate,
    selectedTheater, setSelectedTheater,
    selectedShowtime, setSelectedShowtime,
    selectedSeats, setSelectedSeats,
    selectedPaymentMethod, setSelectedPaymentMethod,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    loading, setLoading,
    error, setError,
    success, setSuccess,
    bookingResult, setBookingResult,
    resetAfterBooking,
    resetFromStep,
    reservationId, setReservationId,
  }
}
