export interface Seat {
  seatId: number
  rowNumber: string
  columnNumber: number
  price?: number
  isBooked?: boolean
  isHeld?: boolean
  isCouple?: boolean
  pairWith?: number
  span?: number
  seatClass?: string
  seatTypeName?: string
}

export type SeatSelection = Seat[]

export interface Movie {
  MovieId: number
  Title: string
  PosterUrl?: string
  [key: string]: any
}

export interface TheaterOption {
  theaterId: number
  name: string
  address?: string
  city?: string
  [key: string]: any
}

export interface Showtime {
  showtimeId: number
  showDate?: string
  showTime?: string
  startTime?: string 
  roomName?: string
  roomId?: number
  [key: string]: any
}
