import { API } from "../api/endpoints"
import type {
  AuthResponse,
  Movie,
  Showtime,
  Reservation,
  Booking,
  User,
  BookingHistoryItem,
  Room,
  Theater,
} from "../types"

// Lấy biến môi trường Vite đúng kiểu
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"

let authToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null

const apiCall = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Try to parse error body safely, fall back to generic message
    const errText = await response.text().catch(() => '')
    let parsedErr: any = { errorMessage: 'API Error' }
    if (errText) {
      try { parsedErr = JSON.parse(errText) } catch { parsedErr = { errorMessage: errText } }
    }
    throw new Error(parsedErr.errorMessage || parsedErr.message || `API Error: ${response.status}`)
  }

  // Handle 204 No Content - return empty object
  if (response.status === 204) {
    return {} as T
  }

  // Some endpoints may legitimately return an empty body with 200.
  // Safely read text first and parse JSON only when body exists to avoid
  // "Unexpected end of JSON input" errors from `response.json()`.
  const text = await response.text().catch(() => '')
  let data: any
  if (!text || text.trim() === '') {
    data = {}
  } else {
    try {
      data = JSON.parse(text)
    } catch (e) {
      // Non-JSON response (e.g., plain text) — return raw text so callers can handle it
      data = text
    }
  }

  // The backend may return either:
  // 1) a raw array/object (legacy), or
  // 2) a ServiceResponse wrapper { isSuccess, data, message }
  // Support both. If a wrapper is present, validate isSuccess and start
  // unwrapping from its `data` field; otherwise treat the whole JSON as payload.
  let payload: any
  if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "isSuccess")) {
    if (!data.isSuccess) {
      throw new Error(data?.errorMessage || data?.message || "API Error")
    }
    payload = data.data
  } else {
    payload = data
  }

  // Unwrap any nested ServiceResponse wrappers found inside `data` repeatedly.
  while (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "isSuccess") &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    if (!payload.isSuccess) {
      throw new Error(payload.errorMessage || payload.message || "API Error")
    }
    payload = payload.data
  }

  return payload as T
}

// ======== 🧩 AUTH API ========
export const authAPI = {
  register: async (userName: string, password: string, name: string, email?: string): Promise<AuthResponse> => {
    const payload: any = {
      userName,
      password,
      fullName: name,
    }
    if (email) payload.email = email

    const response = await apiCall<{
      token?: string
      user: User
    }>(API.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const returnedToken = (response as any).token ?? null
    if (returnedToken) {
      authToken = returnedToken
      localStorage.setItem("authToken", returnedToken)
    }

    return {
      token: returnedToken ?? "",
      user: response.user,
    };
  },

  login: async (userName: string, password: string): Promise<AuthResponse> => {
    const response = await apiCall<{
      token: string
      user: User
    }>(API.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ 
        userName,
        password
      }),
    });
    authToken = response.token;
    localStorage.setItem("authToken", response.token);
    return {
      token: response.token,
      user: response.user
    };
  },

  me: async (): Promise<User> => {
    return apiCall<User>(API.AUTH.ME);
  },

  logout: (): void => {
    authToken = null;
    localStorage.removeItem("authToken");
  },
};

// ======== 🎬 MOVIES API ========
export const moviesAPI = {
  list: async (): Promise<Movie[]> => {
    try {
      const response = await apiCall<any[]>(API.MOVIES.LIST);
      if (!Array.isArray(response)) return []

      // Normalize fields - handle both camelCase (backend) and PascalCase (legacy)
      const normalize = (m: Record<string, unknown>): Movie => {
        const get = (keys: string[]) => {
          for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(m, k)) return m[k]
          }
          return undefined
        }

        return {
          MovieId: Number(get(["movieId", "MovieId", "id"]) ?? 0),
          Title: String(get(["title", "Title"]) ?? ""),
          Slug: String(get(["slug", "Slug"]) ?? ""),
          Description: String(get(["description", "Description"]) ?? ""),
          Duration: Number(get(["duration", "Duration"]) ?? 0),
          ReleaseDate: String(get(["releaseDate", "ReleaseDate"]) ?? ""),
          AverageRating: Number(get(["averageRating", "AverageRating"]) ?? 0),
          PosterUrl: String(get(["posterUrl", "PosterUrl"]) ?? ""),
          TrailerUrl: String(get(["trailerUrl", "TrailerUrl"]) ?? ""),
          Director: String(get(["director", "Director"]) ?? ""),
          Cast: String(get(["cast", "Cast"]) ?? ""),
          Language: String(get(["language", "Language"]) ?? ""),
          AgeRating: String(get(["ageRating", "AgeRating"]) ?? ""),
          Status: (String(get(["status", "Status"]) ?? "ComingSoon") as unknown) as Movie["Status"],
        }
      }

      return response.map((r) => normalize(r as Record<string, unknown>))
    } catch (error) {
      console.error("Error fetching movies:", error);
      return [];
    }
  },

  nowShowing: async (): Promise<Movie[]> => {
    try {
      const response = await apiCall<any[]>(API.MOVIES.NOW_SHOWING);
      if (!Array.isArray(response)) return []

      // Normalize fields and try to extract genres if present
      const normalize = (m: Record<string, unknown>): Movie => {
        const get = (keys: string[]) => {
          for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(m, k)) return m[k]
          }
          return undefined
        }

        const rawGenres = get(["genres", "Genres", "GenreNames", "genresList", "categories", "tags", "genre"])
        let genres: string[] | undefined
        if (Array.isArray(rawGenres)) {
          genres = (rawGenres as unknown[]).map((g) => String(g))
        } else if (typeof rawGenres === 'string' && rawGenres.trim().length) {
          // comma-separated string
          genres = rawGenres.split(',').map(s => s.trim()).filter(Boolean)
        }

        return {
          MovieId: Number(get(["movieId", "MovieId", "id"]) ?? 0),
          Title: String(get(["title", "Title"]) ?? ""),
          Slug: String(get(["slug", "Slug"]) ?? ""),
          Description: String(get(["description", "Description"]) ?? ""),
          Duration: Number(get(["duration", "Duration"]) ?? 0),
          AverageRating: Number(get(["averageRating", "AverageRating"]) ?? 0),
          PosterUrl: String(get(["posterUrl", "PosterUrl"]) ?? ""),
          TrailerUrl: String(get(["trailerUrl", "TrailerUrl"]) ?? ""),
          Director: String(get(["director", "Director"]) ?? ""),
          Cast: String(get(["cast", "Cast"]) ?? ""),
          Language: String(get(["language", "Language"]) ?? ""),
          AgeRating: String(get(["ageRating", "AgeRating"]) ?? ""),
          Status: (String(get(["status", "Status"]) ?? "NowShowing") as unknown) as Movie["Status"],
          ReleaseDate: String(get(["releaseDate", "ReleaseDate"]) ?? ""),
          Genres: genres,
        }
      }

      return response.map((r) => normalize(r as Record<string, unknown>))
    } catch (error) {
      console.error("Error fetching now showing movies:", error);
      return [];
    }
  },

  comingSoon: async (): Promise<Movie[]> => {
    try {
      const response = await apiCall<any[]>(API.MOVIES.COMING_SOON);
      if (!Array.isArray(response)) return []

      const normalize = (m: Record<string, unknown>): Movie => {
        const get = (keys: string[]) => {
          for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(m, k)) return m[k]
          }
          return undefined
        }

        const rawGenres = get(["genres", "Genres", "GenreNames", "genresList", "categories", "tags", "genre"])
        let genres: string[] | undefined
        if (Array.isArray(rawGenres)) {
          genres = (rawGenres as unknown[]).map((g) => String(g))
        } else if (typeof rawGenres === 'string' && rawGenres.trim().length) {
          genres = rawGenres.split(',').map(s => s.trim()).filter(Boolean)
        }

        return {
          MovieId: Number(get(["movieId", "MovieId", "id"]) ?? 0),
          Title: String(get(["title", "Title"]) ?? ""),
          Slug: String(get(["slug", "Slug"]) ?? ""),
          Description: String(get(["description", "Description"]) ?? ""),
          Duration: Number(get(["duration", "Duration"]) ?? 0),
          AverageRating: Number(get(["averageRating", "AverageRating"]) ?? 0),
          PosterUrl: String(get(["posterUrl", "PosterUrl"]) ?? ""),
          TrailerUrl: String(get(["trailerUrl", "TrailerUrl"]) ?? ""),
          Director: String(get(["director", "Director"]) ?? ""),
          Cast: String(get(["cast", "Cast"]) ?? ""),
          Language: String(get(["language", "Language"]) ?? ""),
          AgeRating: String(get(["ageRating", "AgeRating"]) ?? ""),
          Status: (String(get(["status", "Status"]) ?? "ComingSoon") as unknown) as Movie["Status"],
          ReleaseDate: String(get(["releaseDate", "ReleaseDate"]) ?? ""),
          Genres: genres,
        }
      }

      return response.map((r) => normalize(r as Record<string, unknown>))
    } catch (error) {
      console.error("Error fetching coming soon movies:", error);
      return [];
    }
  },

  search: async (keyword: string): Promise<Movie[]> => {
    try {
      const response = await apiCall<any[]>(
        `${API.MOVIES.SEARCH}?keyword=${encodeURIComponent(keyword)}`
      );
      if (!Array.isArray(response)) return []

      // reuse normalization logic to ensure consistent shape for frontend
      const normalize = (m: Record<string, unknown>): Movie => {
        const get = (keys: string[]) => {
          for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(m, k)) return m[k]
          }
          return undefined
        }

        const rawGenres = get(["genres", "Genres", "GenreNames", "genresList", "categories", "tags", "genre"])
        let genres: string[] | undefined
        if (Array.isArray(rawGenres)) {
          genres = (rawGenres as unknown[]).map((g) => String(g))
        } else if (typeof rawGenres === 'string' && rawGenres.trim().length) {
          genres = rawGenres.split(',').map(s => s.trim()).filter(Boolean)
        }

        return {
          MovieId: Number(get(["movieId", "MovieId", "id"]) ?? 0),
          Title: String(get(["title", "Title"]) ?? ""),
          Slug: String(get(["slug", "Slug"]) ?? ""),
          Description: String(get(["description", "Description"]) ?? ""),
          Duration: Number(get(["duration", "Duration"]) ?? 0),
          AverageRating: Number(get(["averageRating", "AverageRating"]) ?? 0),
          PosterUrl: String(get(["posterUrl", "PosterUrl"]) ?? ""),
          TrailerUrl: String(get(["trailerUrl", "TrailerUrl"]) ?? ""),
          Status: (String(get(["status", "Status"]) ?? "NowShowing") as unknown) as Movie["Status"],
          ReleaseDate: String(get(["releaseDate", "ReleaseDate"]) ?? ""),
          Genres: genres,
        }
      }

      return response.map((r) => normalize(r as Record<string, unknown>))
    } catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }
  },

  details: async (id: number): Promise<Movie | null> => {
    try {
      const res = await apiCall<any>(API.MOVIES.DETAILS(id));
      if (!res) return null

      const get = (m: Record<string, unknown>, keys: string[]) => {
        for (const k of keys) if (Object.prototype.hasOwnProperty.call(m, k)) return m[k]
        return undefined
      }

      const rawGenres = get(res as Record<string, unknown>, ["Genres", "genres", "GenreNames", "genresList", "categories", "tags", "genre"])
      let genres: string[] | undefined
      if (Array.isArray(rawGenres)) genres = (rawGenres as unknown[]).map((g) => String(g))
      else if (typeof rawGenres === 'string' && rawGenres.trim()) genres = rawGenres.split(',').map(s => s.trim()).filter(Boolean)

      // return shape compatible with Movie type
      return {
        MovieId: Number(get(res, ["movieId", "MovieId", "id"]) ?? 0),
        Title: String(get(res, ["title", "Title"]) ?? ""),
        Slug: String(get(res, ["slug", "Slug"]) ?? ""),
        Description: String(get(res, ["description", "Description"]) ?? ""),
        Duration: Number(get(res, ["duration", "Duration"]) ?? 0),
        AverageRating: Number(get(res, ["averageRating", "AverageRating"]) ?? 0),
        PosterUrl: String(get(res, ["posterUrl", "PosterUrl"]) ?? ""),
        TrailerUrl: String(get(res, ["trailerUrl", "TrailerUrl"]) ?? ""),
        Status: (String(get(res, ["status", "Status"]) ?? "NowShowing") as unknown) as Movie["Status"],
        ReleaseDate: String(get(res, ["releaseDate", "ReleaseDate"]) ?? ""),
        Genres: genres,
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
      return null;
    }
  },

  bySlug: async (slug: string): Promise<Movie | null> => {
    try {
      return await apiCall<Movie>(API.MOVIES.SLUG(slug));
    } catch (error) {
      console.error("Error fetching movie by slug:", error);
      return null;
    }
  },
  
  /**
   * Get genres for a specific movie ID
   * Returns an array of genre objects (may include { genreId, genreName } or similar)
   */
  genresByMovie: async (movieId: number): Promise<any[]> => {
    try {
      const response = await apiCall<any[]>(API.MOVIES.GENRES_BY_MOVIE(movieId));
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching genres for movie:", error);
      return [];
    }
  },

  /**
   * Get all genres (for admin create/update movie form)
   */
  genresAll: async (): Promise<Array<{ genreId: number; genreName: string }>> => {
    try {
      const response = await apiCall<any[]>(API.MOVIES.GENRES_ALL);
      if (!Array.isArray(response)) return [];

      return response
        .map((g: any) => ({
          genreId: Number(g.genreId ?? g.GenreId ?? g.id ?? 0),
          genreName: String(g.genreName ?? g.GenreName ?? g.name ?? ''),
        }))
        .filter((g) => g.genreId > 0 && g.genreName);
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  },

  /**
   * Create a new movie (Admin only)
   */
  create: async (movieData: any): Promise<any> => {
    try {
      const response = await apiCall<any>(API.MOVIES.LIST, {
        method: 'POST',
        body: JSON.stringify(movieData),
      })
      return response
    } catch (error) {
      console.error('Error creating movie:', error)
      throw error
    }
  },

  /**
   * Update a movie (Admin only)
   */
  update: async (id: number, movieData: any): Promise<any> => {
    try {
      const response = await apiCall<any>(API.MOVIES.DETAILS(id), {
        method: 'PUT',
        body: JSON.stringify(movieData),
      })
      return response
    } catch (error) {
      console.error('Error updating movie:', error)
      throw error
    }
  },

  /**
   * Delete a movie (Admin only)
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiCall<void>(API.MOVIES.DETAILS(id), {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting movie:', error)
      throw error
    }
  },
};

// ======== � SHOWTIMES API ========
// ======== �🏟️ ROOMS API ========
export const roomsAPI = {
  list: async (): Promise<Room[]> => {
    try {
      const response = await apiCall<Room[]>(API.ROOMS.LIST)
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
  },

  byTheater: async (theaterId: number): Promise<Room[]> => {
    try {
      const response = await apiCall<Room[]>(API.ROOMS.BY_THEATER(theaterId))
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching rooms by theater:', error)
      return []
    }
  },

  details: async (id: number): Promise<Room | null> => {
    try {
      return await apiCall<Room>(API.ROOMS.DETAILS(id))
    } catch (error) {
      console.error('Error fetching room details:', error)
      return null
    }
  },
}

// ======== 🎫 SEAT TYPES API ========
export const seatTypesAPI = {
  list: async (): Promise<any[]> => {
    try {
      const response = await apiCall<any[]>(API.SEAT_TYPES.LIST)
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching seat types:', error)
      return []
    }
  },

  details: async (id: number): Promise<any | null> => {
    try {
      return await apiCall<any>(API.SEAT_TYPES.DETAILS(id))
    } catch (error) {
      console.error('Error fetching seat type details:', error)
      return null
    }
  }
}

// ======== 💺 SEATS API ========
export const seatsAPI = {
  list: async (): Promise<any[]> => {
    try {
      const response = await apiCall<any[]>(API.SEATS.LIST)
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching seats:', error)
      return []
    }
  },

  byRoom: async (roomId: number): Promise<any[]> => {
    try {
      const response = await apiCall<any[]>(API.SEATS.ROOM(roomId))
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching seats by room:', error)
      return []
    }
  },

  byRoomAndShowtime: async (roomId: number, showtimeId: number): Promise<any[]> => {
    try {
      const response = await apiCall<any[]>(`/seats/room/${roomId}/showtime/${showtimeId}`)
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Error fetching seats by room and showtime:', error)
      return []
    }
  },

  roomLayout: async (roomId: number): Promise<any | null> => {
    try {
      return await apiCall<any>(API.SEATS.ROOM_LAYOUT(roomId))
    } catch (error) {
      console.error('Error fetching room layout:', error)
      return null
    }
  },

  details: async (id: number): Promise<any | null> => {
    try {
      return await apiCall<any>(API.SEATS.DETAILS(id))
    } catch (error) {
      console.error('Error fetching seat details:', error)
      return null
    }
  }
}

// ======== ⏰ SHOWTIMES API ========
export const showtimesAPI = {
  list: async (
    movieId?: number,
    date?: string,
    theaterId?: number,
    roomId?: number,
    fromDate?: string,
    toDate?: string
  ): Promise<Showtime[]> => {
    let endpoint = API.SHOWTIMES.LIST;
    const params = new URLSearchParams();
    if (movieId) params.append("movieId", movieId.toString());
    if (date) params.append("fromDate", date);
    if (date) params.append("toDate", date);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (theaterId) params.append("theaterId", theaterId.toString());
    if (roomId) params.append("roomId", roomId.toString());
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    try {
      const response = await apiCall<Showtime[]>(endpoint);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      return [];
    }
  },

  details: async (id: number): Promise<Showtime | null> => {
    try {
      return await apiCall<Showtime>(API.SHOWTIMES.DETAILS(id));
    } catch (error) {
      console.error("Error fetching showtime details:", error);
      return null;
    }
  },

  create: async (showtimeData: any): Promise<Showtime | null> => {
    try {
      return await apiCall<Showtime>(API.SHOWTIMES.LIST, {
        method: 'POST',
        body: JSON.stringify(showtimeData),
      });
    } catch (error) {
      console.error('Error creating showtime:', error);
      throw error;
    }
  },

  update: async (id: number, showtimeData: any): Promise<Showtime | null> => {
    try {
      return await apiCall<Showtime>(API.SHOWTIMES.DETAILS(id), {
        method: 'PUT',
        body: JSON.stringify(showtimeData),
      });
    } catch (error) {
      console.error('Error updating showtime:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      await apiCall<void>(API.SHOWTIMES.DETAILS(id), {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting showtime:', error);
      throw error;
    }
  },
};

// ======== 🏛️ THEATERS API ========
export const theatersAPI = {
  list: async (): Promise<Theater[]> => {
    try {
      const response = await apiCall<Theater[]>(API.THEATERS.LIST);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching theaters:', error);
      return [];
    }
  },

  details: async (id: number): Promise<Theater | null> => {
    try {
      return await apiCall<Theater>(API.THEATERS.DETAILS(id));
    } catch (error) {
      console.error('Error fetching theater details:', error);
      return null;
    }
  },
}

// ======== 📚 GENRES (static fallback) ========
export const genresAPI = {
  list: async (): Promise<string[]> => {
    // db.sql does not contain a dedicated genres table in this dump,
    // so we provide a reasonable default set for the frontend to display.
    return [
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Crime",
      "Documentary",
      "Drama",
      "Family",
      "Fantasy",
      "Historical",
      "Horror",
      "Music",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Sport",
      "Thriller",
      "War",
      "Western"
    ];
  }
};

// ======== 🎟️ RESERVATIONS API ========
export const reservationsAPI = {
  /**
   * Create a reservation.
   * @param showtimeId showtime id
   * @param seatIds array of seat ids (numbers)
   * @param opts optional object: { userId, sessionId }
   */
  create: async (
    showtimeId: number,
    seatIds: number[],
    opts?: { userId?: string; sessionId?: string },
  ): Promise<Reservation | null> => {
    try {
      const body: any = { showtimeId, seatIds };

      if (opts?.userId) body.userId = opts.userId;
      else {
        // ensure we provide a sessionId for anonymous users
        let sessionId = opts?.sessionId ?? (typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null);
        if (!sessionId && typeof window !== 'undefined') {
          sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
          try { localStorage.setItem('sessionId', sessionId) } catch (e) { console.debug('localStorage setItem failed', e) }
        }
        if (sessionId) body.sessionId = sessionId;
      }

      return await apiCall<Reservation>(API.RESERVATIONS.CREATE, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      // Rethrow so callers can detect HTTP conflict (409) and act accordingly
      throw error;
    }
  },

  confirm: async (
    reservationId: string,
    paymentMethod: string
  ): Promise<Booking | null> => {
    try {
      return await apiCall<Booking>(API.RESERVATIONS.CONFIRM, {
        method: "POST",
        body: JSON.stringify({ reservationId, paymentMethod }),
      });
    } catch (error) {
      console.error("Error confirming reservation:", error);
      return null;
    }
  },

  details: async (id: number) => {
    try {
      return await apiCall<any>(API.RESERVATIONS.DETAILS(String(id)))
    } catch (error) {
      console.error('Error fetching reservation details:', error)
      return null
    }
  },

  history: async (): Promise<BookingHistoryItem[]> => {
    try {
      const response = await apiCall<BookingHistoryItem[]>(API.RESERVATIONS.HISTORY);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Error fetching booking history:", error);
      return [];
    }
  },

  cancel: async (bookingId: string): Promise<boolean> => {
    try {
      await apiCall<void>(API.RESERVATIONS.CANCEL(bookingId), {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return false;
    }
  },
  /**
   * Check seats availability for a showtime. Returns seats with isAvailable/isLocked info.
   */
  checkAvailability: async (showtimeId: number, seatIds?: number[]): Promise<any | null> => {
    try {
      let endpoint = API.RESERVATIONS.AVAILABILITY(showtimeId)
      if (seatIds && seatIds.length > 0) endpoint += `?seatIds=${seatIds.join(',')}`
      return await apiCall<any>(endpoint)
    } catch (error) {
      console.error('Error checking seat availability:', error)
      return null
    }
  }
};

// ======== 📦 BOOKINGS API ========
export const bookingsAPI = {
  create: async (reservationId: number, idempotencyKey: string) => {
    try {
      return await apiCall<any>(API.BOOKINGS.CREATE, {
        method: 'POST',
        body: JSON.stringify({ reservationId, idempotencyKey }),
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      return null
    }
  },

  details: async (bookingId: number) => {
    try {
      return await apiCall<any>(API.BOOKINGS.DETAILS(bookingId))
    } catch (error) {
      console.error('Error fetching booking details:', error)
      return null
    }
  },

  byReservation: async (reservationId: number) => {
    try {
      return await apiCall<any>(API.BOOKINGS.BY_RESERVATION(reservationId))
    } catch (error) {
      // If there's no booking yet for the reservation the backend returns 404
      // with a friendly message; don't spam the console for this expected case.
      try {
        const msg = String((error as Error).message || '')
        if (msg.includes('Chưa có booking') || msg.includes('404')) {
          return null
        }
      } catch (e) {
        // fallthrough to logging
      }
      console.error('Error fetching booking by reservation:', error)
      return null
    }
  }
    ,
  /** Get current user's bookings */
  history: async (): Promise<any[]> => {
    try {
      const resp = await apiCall<any[]>(API.BOOKINGS.USER_ME)
      return Array.isArray(resp) ? resp : []
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      return []
    }
  }
}

// ======== 💳 PAYMENTS API ========
export const paymentsAPI = {
  create: async (
    bookingId: number,
    idempotencyKey: string,
    opts?: { returnUrl?: string; paymentMethod?: string; paymentGateway?: string; bankCode?: string }
  ) => {
    try {
      const body: any = { bookingId }
      if (idempotencyKey) body.idempotencyKey = idempotencyKey
      if (opts?.returnUrl) body.returnUrl = opts.returnUrl
      if (opts?.paymentMethod) body.paymentMethod = opts.paymentMethod
      if (opts?.paymentGateway) body.paymentGateway = opts.paymentGateway
      if (opts?.bankCode) body.bankCode = opts.bankCode

      return await apiCall<any>(API.PAYMENTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('Error creating payment:', error)
      return null
    }
  },

  details: async (id: string) => {
    try {
      return await apiCall<any>(API.PAYMENTS.DETAILS(id))
    } catch (error) {
      console.error('Error fetching payment details:', error)
      return null
    }
  },

  byBooking: async (bookingId: number) => {
    try {
      return await apiCall<any>(API.PAYMENTS.BY_BOOKING(bookingId))
    } catch (error) {
      console.error('Error fetching payments by booking:', error)
      return null
    }
  },

  // test only: simulate success callback
  simulateSuccess: async (paymentId: string) => {
    try {
      return await apiCall<any>(API.PAYMENTS.SIMULATE_SUCCESS(paymentId), {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error simulating payment success:', error)
      return null
    }
  }
}


