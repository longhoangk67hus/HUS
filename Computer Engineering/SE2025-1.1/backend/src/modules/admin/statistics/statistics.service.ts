import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingSeat } from '../../bookings/entities/booking-seat.entity';
import {
  RevenueSummaryDto,
  RevenueByMovieDto,
  MovieRevenueDto,
  RevenueByTheaterDto,
  TheaterRevenueDto,
  RevenueByDateDto,
  DailyRevenueDto,
  RevenueByMonthDto,
  MonthlyRevenueDto,
} from './dto';

/**
 * Statistics Service
 * Business logic for admin revenue statistics
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private bookingSeatRepository: Repository<BookingSeat>,
  ) {}

  /**
   * Get revenue summary dashboard with timezone handling
   */
  async getRevenueSummary(startDate: string, endDate: string): Promise<RevenueSummaryDto> {
    try {
      // Parse dates with explicit time to avoid timezone issues
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');

      // Main period stats
      // Avoid double-counting FinalAmount when joining booking_seat by summing FinalAmount
      // separately for confirmed bookings, and compute tickets/avgPrice using booking_seat join.
      const statsQuery = `
        SELECT 
          COALESCE((SELECT SUM(b2.FinalAmount) FROM booking b2 WHERE DATE(b2.BookingDate) BETWEEN DATE(?) AND DATE(?) AND UPPER(b2.Status) = 'CONFIRMED'), 0) as totalRevenue,
          COUNT(DISTINCT b.BookingId) as totalBookings,
          COUNT(bs.BookingSeatId) as totalTickets,
          COALESCE(AVG(bs.Price), 0) as avgTicketPrice,
          SUM(CASE WHEN UPPER(b.Status) = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmedBookings,
          SUM(CASE WHEN UPPER(b.Status) = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledBookings,
          SUM(CASE WHEN UPPER(b.Status) = 'PENDING' THEN 1 ELSE 0 END) as pendingBookings,
          SUM(CASE WHEN UPPER(b.Status) = 'COMPLETED' THEN 1 ELSE 0 END) as completedBookings
        FROM booking b
        LEFT JOIN booking_seat bs ON b.BookingId = bs.BookingId
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
          AND UPPER(b.Status) = 'CONFIRMED'
      `;

      const statsResult = await this.bookingRepository.query(statsQuery, [start, end, start, end]);
      const stats = statsResult[0] || {
        totalRevenue: 0,
        totalBookings: 0,
        totalTickets: 0,
        avgTicketPrice: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        pendingBookings: 0,
        completedBookings: 0
      };

      // Calculate growth (compare with previous period)
      const periodLength = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - periodLength);
      const prevEnd = start;
const prevStatsResult = await this.bookingRepository.query(statsQuery, [prevStart, prevEnd, prevStart, prevEnd]);
      const prevStats = prevStatsResult[0] || {
        totalRevenue: 0,
        totalBookings: 0,
        totalTickets: 0,
        avgTicketPrice: 0
      };

      const calculateGrowth = (current: number, previous: number): number => {
        if (previous === 0) return 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
      };

      return {
        totalRevenue: Number(stats.totalRevenue || 0),
        totalBookings: Number(stats.totalBookings || 0),
        totalTickets: Number(stats.totalTickets || 0),
        averageTicketPrice: Number((stats.avgTicketPrice || 0).toString().split('.')[0]),
        growth: {
          revenue: calculateGrowth(Number(stats.totalRevenue || 0), Number(prevStats.totalRevenue || 0)),
          bookings: calculateGrowth(Number(stats.totalBookings || 0), Number(prevStats.totalBookings || 0)),
          tickets: calculateGrowth(Number(stats.totalTickets || 0), Number(prevStats.totalTickets || 0)),
        },
        bookingsByStatus: {
          confirmed: Number(stats.confirmedBookings || 0),
          cancelled: Number(stats.cancelledBookings || 0),
          pending: Number(stats.pendingBookings || 0),
          completed: Number(stats.completedBookings || 0),
        },
        startDate,
        endDate,
      };
    } catch (error) {
      console.error('Error in getRevenueSummary:', error);
      
      // Return default values if query fails
      return {
        totalRevenue: 0,
        totalBookings: 0,
        totalTickets: 0,
        averageTicketPrice: 0,
        growth: {
          revenue: 0,
          bookings: 0,
          tickets: 0,
        },
        bookingsByStatus: {
          confirmed: 0,
          cancelled: 0,
          pending: 0,
          completed: 0,
        },
        startDate,
        endDate,
      };
    }
  }

  /**
   * Get revenue by movie with timezone handling
   */
  async getRevenueByMovie(
    startDate: string,
    endDate: string,
    limit: number = 10,
  ): Promise<RevenueByMovieDto> {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    // Use booking -> showtime -> movie join to sum FinalAmount per movie for confirmed bookings only.
      const query = `
        SELECT
          m.MovieId AS movieId,
          m.Title AS title,
          m.PosterUrl AS posterUrl,

          COALESCE(rev.totalRevenue, 0) AS totalRevenue,
          COALESCE(tk.totalTickets, 0) AS totalTickets,
          COALESCE(rev.totalShowtimes, 0) AS totalShowtimes,

          CASE 
            WHEN COALESCE(tk.totalTickets, 0) > 0
            THEN rev.totalRevenue / tk.totalTickets
            ELSE 0
          END AS avgTicketPrice

        FROM movie m

        /* ===== DOANH THU: GROUP TỪ BOOKING ===== */
        LEFT JOIN (
          SELECT
            s.MovieId,
            SUM(b.FinalAmount) AS totalRevenue,
            COUNT(DISTINCT s.ShowtimeId) AS totalShowtimes
          FROM booking b
          JOIN showtime s ON b.ShowtimeId = s.ShowtimeId
          WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
            AND UPPER(b.Status) = 'CONFIRMED'
          GROUP BY s.MovieId
        ) rev ON m.MovieId = rev.MovieId

        /* ===== VÉ: GROUP TỪ BOOKING_SEAT ===== */
        LEFT JOIN (
          SELECT
            s.MovieId,
            COUNT(bs.BookingSeatId) AS totalTickets
          FROM booking b
          JOIN booking_seat bs ON b.BookingId = bs.BookingId
          JOIN showtime s ON b.ShowtimeId = s.ShowtimeId
          WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
            AND UPPER(b.Status) = 'CONFIRMED'
          GROUP BY s.MovieId
        ) tk ON m.MovieId = tk.MovieId

        WHERE rev.totalRevenue IS NOT NULL
        ORDER BY totalRevenue DESC
        LIMIT ?;
      `;



    const movies: MovieRevenueDto[] = await this.bookingRepository.query(query, [
      start,
      end,
      start,
      end,
      limit,
    ]);

    const totalRevenue = movies.reduce((sum, movie) => sum + Number(movie.totalRevenue), 0);

    return {
      movies: movies.map(m => ({
        ...m,
        totalRevenue: Number(m.totalRevenue),
        totalTickets: Number(m.totalTickets),
        totalShowtimes: Number(m.totalShowtimes),
        avgTicketPrice: Number(Number(m.avgTicketPrice).toFixed(0)),
        avgOccupancyRate: Number(Number(m.avgOccupancyRate).toFixed(1)),
      })),
      totalRevenue,
      startDate,
      endDate,
    };
  }

  /**
   * Get revenue by theater with timezone handling
   */
  async getRevenueByTheater(startDate: string, endDate: string): Promise<RevenueByTheaterDto> {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    // Sum FinalAmount per theater using booking -> showtime -> room -> theater join
    // and compute tickets/avg price using a derived aggregation per showtime to avoid double-counting.
const query = `
  SELECT
    t.TheaterId AS theaterId,
    t.Name AS theaterName,
    t.City AS city,

    COALESCE(rev.totalRevenue, 0) AS totalRevenue,
    COALESCE(tk.totalTickets, 0) AS totalTickets,
    COALESCE(rev.totalShowtimes, 0) AS totalShowtimes,

    COALESCE(
      (tk.totalTickets * 100.0) /
      NULLIF(cap.totalSeats, 0),
      0
    ) AS avgOccupancyRate,

    cap.totalRooms AS totalRooms

  FROM theater t

  /* ===== DOANH THU: GROUP TỪ BOOKING ===== */
  LEFT JOIN (
    SELECT
      r.TheaterId,
      SUM(b.FinalAmount) AS totalRevenue,
      COUNT(DISTINCT s.ShowtimeId) AS totalShowtimes
    FROM booking b
    JOIN showtime s ON b.ShowtimeId = s.ShowtimeId
    JOIN room r ON s.RoomId = r.RoomId
    WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
      AND UPPER(b.Status) = 'CONFIRMED'
    GROUP BY r.TheaterId
  ) rev ON t.TheaterId = rev.TheaterId

  /* ===== VÉ: GROUP TỪ BOOKING_SEAT ===== */
  LEFT JOIN (
    SELECT
      r.TheaterId,
      COUNT(bs.BookingSeatId) AS totalTickets
    FROM booking b
    JOIN booking_seat bs ON b.BookingId = bs.BookingId
    JOIN showtime s ON b.ShowtimeId = s.ShowtimeId
    JOIN room r ON s.RoomId = r.RoomId
    WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
      AND UPPER(b.Status) = 'CONFIRMED'
    GROUP BY r.TheaterId
  ) tk ON t.TheaterId = tk.TheaterId

  /* ===== SỨC CHỨA RẠP ===== */
  LEFT JOIN (
    SELECT
      r.TheaterId,
      COUNT(DISTINCT r.RoomId) AS totalRooms,
      COUNT(st.SeatId) AS totalSeats
    FROM room r
    JOIN seat st ON r.RoomId = st.RoomId
    GROUP BY r.TheaterId
  ) cap ON t.TheaterId = cap.TheaterId

  WHERE rev.totalRevenue IS NOT NULL
  ORDER BY totalRevenue DESC;
`;


    const theaters: TheaterRevenueDto[] = await this.bookingRepository.query(query, [start, end, start, end]);

    const totalRevenue = theaters.reduce((sum, theater) => sum + Number(theater.totalRevenue), 0);

    return {
      theaters: theaters.map(t => ({
        ...t,
        totalRevenue: Number(t.totalRevenue),
        totalTickets: Number(t.totalTickets),
        totalShowtimes: Number(t.totalShowtimes),
        avgOccupancyRate: Number(Number(t.avgOccupancyRate).toFixed(1)),
        totalRooms: Number(t.totalRooms),
      })),
      totalRevenue,
      startDate,
      endDate,
    };
  }

  /**
   * Get revenue by date (time-series)
   */
  /**
   * Get daily revenue time-series with timezone handling
   */
  async getRevenueByDate(startDate: string, endDate: string): Promise<RevenueByDateDto> {
    // Parse dates with explicit timezone (avoid UTC conversion issues)
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const query = `
      SELECT d.date as date,
             COALESCE(rev.revenue,0) as revenue,
             COALESCE(tickets.tickets,0) as tickets,
             COALESCE(rev.bookings,0) as bookings
      FROM (
        SELECT DISTINCT DATE(b.BookingDate) as date
        FROM booking b
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
      ) d
      LEFT JOIN (
        SELECT DATE(b.BookingDate) as date, SUM(b.FinalAmount) as revenue, COUNT(DISTINCT b.BookingId) as bookings
        FROM booking b
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
          AND UPPER(b.Status) = 'CONFIRMED'
        GROUP BY DATE(b.BookingDate)
      ) rev ON rev.date = d.date
      LEFT JOIN (
        SELECT DATE(b.BookingDate) as date, COUNT(bs.BookingSeatId) as tickets
        FROM booking b
        LEFT JOIN booking_seat bs ON b.BookingId = bs.BookingId
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
          AND UPPER(b.Status) = 'CONFIRMED'
        GROUP BY DATE(b.BookingDate)
      ) tickets ON tickets.date = d.date
      ORDER BY d.date ASC
    `;

    const dailyData: DailyRevenueDto[] = await this.bookingRepository.query(query, [start, end, start, end, start, end]);

    // Format dates properly without timezone conversion
    const formattedData = dailyData.map(d => {
      // Extract date string directly from MySQL DATE() result
      const dateStr = typeof d.date === 'string' 
        ? d.date.split(' ')[0] // Handle MySQL date string format
: new Date(d.date).toLocaleDateString('sv-SE')
; // Handle Date object
      
      return {
        date: dateStr,
        revenue: Number(d.revenue),
        tickets: Number(d.tickets),
        bookings: Number(d.bookings),
      };
    });

    // Find peak day
    const peakDay = formattedData.reduce(
      (max, current) => (current.revenue > max.revenue ? current : max),
      formattedData[0] || { date: startDate, revenue: 0, tickets: 0, bookings: 0 },
    );

    const totalRevenue = formattedData.reduce((sum, day) => sum + day.revenue, 0);

    return {
      dailyRevenue: formattedData,
      peakDate: peakDay.date,
      peakRevenue: peakDay.revenue,
      totalRevenue,
      startDate,
      endDate,
    };
  }

  /**
   * Get monthly revenue time-series with timezone handling
   */
  async getRevenueByMonth(startMonth: string, endMonth: string): Promise<RevenueByMonthDto> {
    // Parse month strings (YYYY-MM format) with explicit timezone handling
    const startDate = new Date(startMonth + '-01T00:00:00');
    const endDate = new Date(endMonth + '-01T00:00:00');
    // Set end date to last day of the end month
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of previous month
    endDate.setHours(23, 59, 59, 999);

    const query = `
      SELECT mth.month as month,
             COALESCE(rev.revenue,0) as revenue,
             COALESCE(tickets.tickets,0) as tickets,
             COALESCE(rev.bookings,0) as bookings
      FROM (
        SELECT DISTINCT DATE_FORMAT(b.BookingDate, '%Y-%m') as month
        FROM booking b
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
      ) mth
      LEFT JOIN (
        SELECT DATE_FORMAT(b.BookingDate, '%Y-%m') as month, SUM(b.FinalAmount) as revenue, COUNT(DISTINCT b.BookingId) as bookings
        FROM booking b
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
          AND UPPER(b.Status) = 'CONFIRMED'
        GROUP BY DATE_FORMAT(b.BookingDate, '%Y-%m')
      ) rev ON rev.month = mth.month
      LEFT JOIN (
        SELECT DATE_FORMAT(b.BookingDate, '%Y-%m') as month, COUNT(bs.BookingSeatId) as tickets
        FROM booking b
        LEFT JOIN booking_seat bs ON b.BookingId = bs.BookingId
        WHERE DATE(b.BookingDate) BETWEEN DATE(?) AND DATE(?)
          AND UPPER(b.Status) = 'CONFIRMED'
        GROUP BY DATE_FORMAT(b.BookingDate, '%Y-%m')
      ) tickets ON tickets.month = mth.month
      ORDER BY mth.month ASC
    `;

    const monthlyData: MonthlyRevenueDto[] = await this.bookingRepository.query(query, [startDate, endDate, startDate, endDate, startDate, endDate]);

    // Calculate growth rates
    const formattedData = monthlyData.map((d, index) => {
      const revenue = Number(d.revenue);
      const tickets = Number(d.tickets);
      const bookings = Number(d.bookings);
      
      // Calculate growth rate compared to previous month
      let growthRate = 0;
      if (index > 0) {
const prevRevenue = Number(monthlyData[index - 1].revenue);
        if (prevRevenue > 0) {
          growthRate = Number((((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1));
        }
      }

      return {
        month: d.month,
        revenue,
        tickets,
        bookings,
        growthRate: index === 0 ? undefined : growthRate,
      };
    });

    // Find peak month
    const peakMonth = formattedData.reduce(
      (max, current) => (current.revenue > max.revenue ? current : max),
      formattedData[0] || { month: startMonth, revenue: 0, tickets: 0, bookings: 0 },
    );

    // Calculate totals and averages
    const totalRevenue = formattedData.reduce((sum, month) => sum + month.revenue, 0);
    const averageMonthlyRevenue = formattedData.length > 0 ? Math.round(totalRevenue / formattedData.length) : 0;

    // Calculate overall growth rate (first month vs last month)
    let overallGrowthRate = 0;
    if (formattedData.length >= 2) {
      const firstMonthRevenue = formattedData[0].revenue;
      const lastMonthRevenue = formattedData[formattedData.length - 1].revenue;
      if (firstMonthRevenue > 0) {
        overallGrowthRate = Number((((lastMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100).toFixed(1));
      }
    }

    return {
      monthlyRevenue: formattedData,
      peakMonth: peakMonth.month,
      peakRevenue: peakMonth.revenue,
      totalRevenue,
      averageMonthlyRevenue,
      startMonth,
      endMonth,
      overallGrowthRate,
    };
  }
}