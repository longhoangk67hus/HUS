// Get API base URL the same way as api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const STATS_BASE = `${API_BASE_URL}/admin/statistics`

export interface DashboardSummary {
  totalRevenue: number
  totalBookings: number
  totalTickets: number
  averageTicketPrice: number
  growth: {
    revenue: number
    bookings: number
    tickets: number
  }
  bookingsByStatus: {
    confirmed: number
    cancelled: number
    pending: number
    completed: number
  }
  startDate: string
  endDate: string
}

export interface MovieRevenue {
  movieId: number
  title: string
  posterUrl: string
  totalRevenue: number
  totalTickets: number
  totalShowtimes: number
  avgTicketPrice: number
  avgOccupancyRate: number
}

export interface RevenueByMovie {
  movies: MovieRevenue[]
  totalRevenue: number
  startDate: string
  endDate: string
}

export interface TheaterRevenue {
  theaterId: number
  theaterName: string
  city: string
  totalRevenue: number
  totalTickets: number
  totalShowtimes: number
  avgOccupancyRate: number
  totalRooms: number
}

export interface RevenueByTheater {
  theaters: TheaterRevenue[]
  totalRevenue: number
  startDate: string
  endDate: string
}

export interface DailyRevenue {
  date: string
  revenue: number
  tickets: number
  bookings: number
}

export interface RevenueByDate {
  dailyRevenue: DailyRevenue[]
  peakDate: string
  peakRevenue: number
  totalRevenue: number
  startDate: string
  endDate: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  tickets: number
  bookings: number
  growthRate?: number
}

export interface RevenueByMonth {
  monthlyRevenue: MonthlyRevenue[]
  peakMonth: string
  peakRevenue: number
  totalRevenue: number
  averageMonthlyRevenue: number
  startMonth: string
  endMonth: string
  overallGrowthRate: number
}

const getAuthToken = () => {
  return typeof window !== "undefined" ? localStorage.getItem("authToken") : null
}

const fetchWithAuth = async <T,>(endpoint: string): Promise<T> => {
  const token = getAuthToken()
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

export const statisticsAPI = {
  getDashboard: (startDate: string, endDate: string) =>
    fetchWithAuth<DashboardSummary>(
      `${STATS_BASE}/dashboard?startDate=${startDate}&endDate=${endDate}`
    ),

  getRevenueByMovie: (startDate: string, endDate: string, limit: number = 10) =>
    fetchWithAuth<RevenueByMovie>(
      `${STATS_BASE}/revenue/by-movie?startDate=${startDate}&endDate=${endDate}&limit=${limit}`
    ),

  getRevenueByTheater: (startDate: string, endDate: string) =>
    fetchWithAuth<RevenueByTheater>(
      `${STATS_BASE}/revenue/by-theater?startDate=${startDate}&endDate=${endDate}`
    ),

  getRevenueByDate: (startDate: string, endDate: string) =>
    fetchWithAuth<RevenueByDate>(
      `${STATS_BASE}/revenue/by-date?startDate=${startDate}&endDate=${endDate}`
    ),

  getRevenueByMonth: (startMonth: string, endMonth: string) =>
    fetchWithAuth<RevenueByMonth>(
      `${STATS_BASE}/revenue/by-month?startMonth=${startMonth}&endMonth=${endMonth}`
    ),
}
