export const API = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/profile",
  },
  ADMIN: {
    MANUAL_BOOKING: {
      CREATE: "/admin/manual-booking",
      DETAILS: (bookingId: number) => `/admin/manual-booking/${bookingId}`,
      CANCEL: (bookingId: number) => `/admin/manual-booking/${bookingId}/cancel`,
      CONFIRM: (bookingId: number) => `/admin/manual-booking/${bookingId}/confirm`,
    },
    BOOKINGS: {
      ALL: "/admin/bookings",
      STATS: "/admin/bookings/stats",
    },
  },
  MOVIES: {
    LIST: "/movies",
    NOW_SHOWING: "/movies/now-showing",
    COMING_SOON: "/movies/coming-soon",
    SEARCH: "/movies/search",
    DETAILS: (id: number) => `/movies/${id}`,
    SLUG: (slug: string) => `/movies/slug/${slug}`,
    GENRES_ALL: "/movies/genres/all",
    GENRES_BY_MOVIE: (id: number) => `/movies/${id}/genres`,
  },
  THEATERS: {
    LIST: "/theaters",
    ACTIVE: "/theaters/active",
    CITY: "/theaters/city",
    DETAILS: (id: number) => `/theaters/${id}`,
  },
  ROOM_TYPES: {
    LIST: "/room-types",
    STATISTICS: "/room-types/statistics",
    DETAILS: (id: number) => `/room-types/${id}`,
  },
  ROOMS: {
    LIST: "/rooms",
    STATISTICS: "/rooms/statistics",
    ACTIVE: "/rooms/active",
    BY_THEATER: (theaterId: number) => `/rooms/theater/${theaterId}`,
    BY_TYPE: (roomTypeId: number) => `/rooms/type/${roomTypeId}`,
    DETAILS: (id: number) => `/rooms/${id}`,
  },
  SHOWTIMES: {
    LIST: "/showtimes",
    DETAILS: (id: number) => `/showtimes/${id}`,
  },
  SEAT_TYPES: {
    LIST: "/seat-types",
    DETAILS: (id: number) => `/seat-types/${id}`,
  },
  SEATS: {
    LIST: "/seats",
    ROOM: (roomId: number) => `/seats/room/${roomId}`,
    ROOM_LAYOUT: (roomId: number) => `/seats/room/${roomId}/layout`,
    TYPE: (seatTypeId: number) => `/seats/type/${seatTypeId}`,
    DETAILS: (id: number) => `/seats/${id}`,
  },
  RESERVATIONS: {
    CREATE: "/reservations",
    CONFIRM: "/reservations/confirm",
    AVAILABILITY: (showtimeId: number) => `/reservations/showtime/${showtimeId}/availability`,
    HISTORY: "/reservations/user",
    DETAILS: (id: string) => `/reservations/${id}`,
    CANCEL: (id: string) => `/reservations/${id}`,
  },
  BOOKINGS: {
    CREATE: "/bookings",
    DETAILS: (id: number) => `/bookings/${id}`,
    BY_RESERVATION: (reservationId: number) => `/bookings/reservation/${reservationId}`,
    USER_ME: `/bookings/user/me`,
  },
  PAYMENTS: {
    CREATE: "/payments",
    DETAILS: (id: string) => `/payments/${id}`,
    BY_BOOKING: (bookingId: number) => `/payments/booking/${bookingId}`,
    VNPAY_RETURN: "/payments/vnpay/return",
    VNPAY_CALLBACK: "/payments/vnpay/callback",
    SIMULATE_SUCCESS: (id: string) => `/payments/test/simulate-success/${id}`,
  },
}

export default API