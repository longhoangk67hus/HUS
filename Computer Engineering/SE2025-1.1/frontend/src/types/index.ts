// // ===== User =====
// export interface User {
//   id: number
//   name: string
//   email: string
//   role: "user" | "admin"
// }

// export interface AuthResponse {
//   token: string
//   user: User
// }

// // ===== Movie =====
// export interface Movie {
//   MovieId: number
//   Title: string
//   Slug: string
//   Description: string
//   Duration: number // phút
//   ReleaseDate: string 
//   AverageRating: number
//   PosterUrl: string
//   TrailerUrl: string
//   Status: "NowShowing" | "ComingSoon" | "Ended"
//   // ReleaseDate: string // ISO
//   // Price?: number // Added price field
// }

// export interface MovieListResponse {
//   data: Movie[]
//   meta: {
//     page: number
//     limit: number
//     total: number
//   }
// }

// // ===== Showtime =====
// export interface Showtime {
//   id: number
//   movieId: number
//   cinemaId: number
//   screenId: number
//   startTime: string
//   price: number
// }

// export interface Seat {
//   row: string
//   number: number
//   status: "available" | "sold" | "priority"
// }

// // ===== Reservation / Booking =====
// export interface Reservation {
//   reservationId: string
//   lockedSeats: string[]
//   expiresAt: string
// }

// export interface Booking {
//   bookingId: string
//   tickets: {
//     seat: string
//     qrCode: string
//   }[]
//   totalPrice: number
// }

// export interface BookingHistoryItem {
//   bookingId: string
//   movieTitle: string
//   showtime: string
//   seats: string[]
//   status: "confirmed" | "cancelled"
//   totalPrice: number
// }

// // ===== Admin Report =====
// export interface SalesReport {
//   totalRevenue: number
//   totalTickets: number
//   byMovie: {
//     movieId: number
//     title: string
//     tickets: number
//     revenue: number
//   }[]
// }


// ===== User =====
export interface User {
  userId: string
  userName: string
  fullName: string
  email: string
  roles: string[]
  phoneNumber?: string | null
}

export interface AuthResponse {
  token: string
  user: User
}

// ===== Movie =====
export interface Movie {
  MovieId: number
  Title: string
  Slug: string
  Description: string
  Duration: number // phút
  ReleaseDate: string 
  AverageRating: number
  PosterUrl: string
  TrailerUrl: string
  Director?: string
  Cast?: string
  Language?: string
  AgeRating?: string
  Status: "NowShowing" | "ComingSoon" | "Ended"
  Genres?: string[]
  // ReleaseDate: string // ISO
  // Price?: number // Added price field
  status?: string; // Thêm trường status để hỗ trợ logic chuẩn hóa
}

export interface MovieListResponse {
  data: Movie[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

// ===== Showtime =====
export interface Showtime {
  // New canonical fields (matches backend naming)
  showtimeId?: number
  movieId: number
  roomId: number
  showDate?: string // YYYY-MM-DD
  showTime?: string // HH:MM:SS
  basePrice?: number
  status?: string
  movie?: Movie
  room?: Partial<Room>
  // Theater and Room names
  theaterName?: string
  roomName?: string
  // Legacy/compat fields used across the frontend
  id?: number
  price?: number
  startTime?: string
}

export interface Seat {
  row: string
  number: number
  status: "available" | "sold" | "priority"
}

// ===== Reservation / Booking =====
export interface Reservation {
  reservationId: string
  lockedSeats: string[]
  expiresAt: string
  // Optional fields returned by the backend
  seatIds?: number[]
  totalPrice?: number
  status?: string
}

export interface Booking {
  bookingId: string
  tickets: {
    seat: string
    qrCode: string
  }[]
  totalPrice: number
}

export interface BookingHistoryItem {
  bookingId: string
  movieTitle: string
  showtime: string
  seats: string[]
  status: "confirmed" | "cancelled"
  totalPrice: number
}

// ===== Admin Report =====
export interface SalesReport {
  totalRevenue: number
  totalTickets: number
  byMovie: {
    movieId: number
    title: string
    tickets: number
    revenue: number
  }[]
}

// ===== Theaters / Rooms =====
export interface Theater {
  theaterId: number
  theaterCode?: string
  name: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  phone?: string
  email?: string
  status?: string
}

export interface Room {
  roomId: number
  roomName: string
  roomTypeId?: number
  theaterId?: number
  totalSeats?: number
  status?: string
  theater?: Partial<Theater>
}
