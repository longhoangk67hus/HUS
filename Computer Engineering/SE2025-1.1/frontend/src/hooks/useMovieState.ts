import { useState } from "react"
import type { Movie, Showtime, Seat, BookingHistoryItem, Booking } from "../types"

export const useMovieState = () => {
  const [moviesList, setMoviesList] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [movieDetails, setMovieDetails] = useState<Movie | null>(null)

  const [showtimesList, setShowtimesList] = useState<Showtime[]>([])
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)

  const [seatMap, setSeatMap] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  const [reservationId, setReservationId] = useState<string | null>(null)
  const [bookingInfo, setBookingInfo] = useState<Booking | null>(null)

  const [bookingHistory, setBookingHistory] = useState<BookingHistoryItem[]>([])

  return {
    moviesList,
    setMoviesList,
    selectedMovie,
    setSelectedMovie,
    movieDetails,
    setMovieDetails,
    showtimesList,
    setShowtimesList,
    selectedShowtime,
    setSelectedShowtime,
    seatMap,
    setSeatMap,
    selectedSeats,
    setSelectedSeats,
    reservationId,
    setReservationId,
    bookingInfo,
    setBookingInfo,
    bookingHistory,
    setBookingHistory,
  }
}
