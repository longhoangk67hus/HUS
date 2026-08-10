import { useEffect, useState, useCallback } from 'react'
import { moviesAPI, theatersAPI, showtimesAPI } from '../../../services/api'
import type { Movie, Showtime } from '../../../types'

interface TheaterLocal {
  theaterId: number
  name: string
  address?: string
  city?: string
}

export const useBookingData = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [theaters, setTheaters] = useState<TheaterLocal[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [loadingTheaters, setLoadingTheaters] = useState(false)
  const [loadingShowtimes, setLoadingShowtimes] = useState(false)
  const [errorMovies, setErrorMovies] = useState<string>('')
  const [errorTheaters, setErrorTheaters] = useState<string>('')
  const [errorShowtimes, setErrorShowtimes] = useState<string>('')

  // Load movies on mount
  useEffect(() => {
    const loadMovies = async () => {
      setLoadingMovies(true)
      setErrorMovies('')
      try {
        const data = await moviesAPI.nowShowing()
        setMovies(data || [])
      } catch (error) {
        setErrorMovies(`Failed to load movies: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoadingMovies(false)
      }
    }

    loadMovies()
  }, [])

  // Load theaters on mount
  useEffect(() => {
    const loadTheaters = async () => {
      setLoadingTheaters(true)
      setErrorTheaters('')
      try {
        const data = await theatersAPI.list()
        console.log('Raw theaters data:', data)
        setTheaters((data || []) as unknown as TheaterLocal[])
      } catch (error) {
        setErrorTheaters(`Failed to load theaters: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.error('Error loading theaters:', error)
      } finally {
        setLoadingTheaters(false)
      }
    }

    loadTheaters()
  }, [])

  // Expose reload helpers so UI can retry on network errors
  const reloadMovies = async () => {
    setErrorMovies('')
    setLoadingMovies(true)
    try {
      const data = await moviesAPI.nowShowing()
      setMovies(data || [])
    } catch (error) {
      setErrorMovies(`Failed to load movies: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingMovies(false)
    }
  }

  const reloadTheaters = async () => {
    setErrorTheaters('')
    setLoadingTheaters(true)
    try {
      const data = await theatersAPI.list()
      setTheaters((data || []) as unknown as TheaterLocal[])
    } catch (error) {
      setErrorTheaters(`Failed to load theaters: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingTheaters(false)
    }
  }

  // Load showtimes for given filters
  const loadShowtimesForFilters = useCallback(async (movieId: number, date: string, theaterId: number) => {
    setLoadingShowtimes(true)
    setErrorShowtimes('')
    try {
      const data = await showtimesAPI.list(movieId, date, theaterId)
      console.log('Raw showtimes data:', data)
      
      // Normalize showtimes to ensure all required fields exist
      const normalizedShowtimes = (data || []).map((st: any) => ({
        showtimeId: st.showtimeId,
        movieId: st.movieId,
        roomId: st.roomId,
        showDate: st.showDate || st.date || date,
        showTime: st.showTime || st.time || '',
        startTime: st.startTime || st.time || st.showTime || '',
        endTime: st.endTime || '',
        basePrice: st.basePrice || st.price || 0,
        roomName: st.roomName || st.room?.roomName || st.room?.name || `Room ${st.roomId}`,
        // Theater name - lấy từ room.theater.name
        theaterName: st.room?.theater?.name || st.theater?.name || 'N/A',
        price: st.price,
        isActive: st.isActive,
        // Keep full room object for SelectSeatsStep
        room: st.room,
        ...st,
      }))
      
      setShowtimes(normalizedShowtimes as Showtime[])
    } catch (error) {
      setErrorShowtimes(`Failed to load showtimes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingShowtimes(false)
    }
  }, [])

  return {
    movies,
    theaters,
    showtimes,
    loadingMovies,
    loadingTheaters,
    loadingShowtimes,
    errorMovies,
    errorTheaters,
    errorShowtimes,
    loadShowtimesForFilters,
    reloadMovies,
    reloadTheaters,
  }
}
