import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../auth/entities/user.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { AdminBookingDto } from './dto/admin-booking.dto';

export interface GetAllBookingsFilters {
  page: number;
  limit: number;
  status?: 'Pending' | 'Confirmed' | 'Cancelled';
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface BookingStatistics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  todayBookings: number;
  thisWeekBookings: number;
  thisMonthBookings: number;
}

/**
 * Admin Bookings Service
 * Handles admin operations for booking management
 * 
 * @author HNLong
 * @since 2025-12-13
 */
@Injectable()
export class AdminBookingsService {
  private readonly logger = new Logger(AdminBookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get all bookings with filters and pagination
   */
  async getAllBookings(filters: GetAllBookingsFilters) {
    const { page, limit, status, userId, startDate, endDate, search } = filters;
    
    const queryBuilder = this.createBookingsQuery();

    // Apply filters
    this.applyFilters(queryBuilder, { status, userId, startDate, endDate, search });

    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [bookings, totalCount] = await queryBuilder.getManyAndCount();

    // Get user data for bookings
    const userIds = [...new Set(bookings.map(b => b.userId))];
    const users = userIds.length > 0 ? await this.userRepository.find({
      where: userIds.map(id => ({ userId: id })),
    }) : [];
    const userMap = new Map(users.map(u => [u.userId, u]));

    // Transform to DTOs
    const bookingDtos: AdminBookingDto[] = await Promise.all(
      bookings.map(booking => this.transformToDto(booking, userMap.get(booking.userId)))
    );

    return {
      data: bookingDtos,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get booking statistics
   */
  async getBookingStatistics(): Promise<BookingStatistics> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      revenueResult,
      todayBookings,
      thisWeekBookings,
      thisMonthBookings,
    ] = await Promise.all([
      this.bookingRepository.count(),
      this.bookingRepository.count({ where: { status: 'Pending' } }),
      this.bookingRepository.count({ where: { status: 'Confirmed' } }),
      this.bookingRepository.count({ where: { status: 'Cancelled' } }),
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.totalAmount)', 'totalRevenue')
        .where('booking.status = :status', { status: 'Confirmed' })
        .getRawOne(),
      this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.bookingDate >= :startOfDay', { startOfDay })
        .getCount(),
      this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.bookingDate >= :startOfWeek', { startOfWeek })
        .getCount(),
      this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.bookingDate >= :startOfMonth', { startOfMonth })
        .getCount(),
    ]);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: parseFloat(revenueResult?.totalRevenue || '0'),
      todayBookings,
      thisWeekBookings,
      thisMonthBookings,
    };
  }

  /**
   * Create base query with relations
   */
  private createBookingsQuery(): SelectQueryBuilder<Booking> {
    return this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.showtime', 'showtime')
      .leftJoinAndSelect('showtime.movie', 'movie')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('booking.bookingSeats', 'bookingSeats')
      .leftJoinAndSelect('bookingSeats.seat', 'seat')
      .leftJoinAndSelect('seat.seatType', 'seatType')
      .orderBy('booking.bookingDate', 'DESC');
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(
    queryBuilder: SelectQueryBuilder<Booking>,
    filters: Omit<GetAllBookingsFilters, 'page' | 'limit'>,
  ) {
    const { status, userId, startDate, endDate, search } = filters;

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('booking.userId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('booking.bookingDate >= :startDate', { startDate });
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('booking.bookingDate <= :endDate', { endDate: endOfDay });
    }

    if (search) {
      queryBuilder.andWhere(
        '(booking.bookingCode LIKE :search)',
        { search: `%${search}%` },
      );
    }
  }

  /**
   * Transform booking entity to DTO
   */
  private transformToDto(booking: Booking, user?: User): AdminBookingDto {
    return {
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      status: booking.status,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount,
      finalAmount: booking.finalAmount,
      bookingDate: booking.bookingDate,
      expiryDate: booking.expiryDate,
      modifiedDate: booking.modifiedDate || undefined,
      qrCode: booking.qrCode || undefined,
      user: user ? {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || undefined,
      } : undefined,
      showtime: booking.showtime ? {
        showtimeId: booking.showtime.showtimeId,
        showDate: booking.showtime.showDate,
        showTime: booking.showtime.showTime,
        startTime: new Date(`${booking.showtime.showDate}T${booking.showtime.showTime}`),
        basePrice: booking.showtime.basePrice,
        status: booking.showtime.status,
        movie: booking.showtime.movie ? {
          movieId: booking.showtime.movie.movieId,
          title: booking.showtime.movie.title,
          duration: booking.showtime.movie.duration,
        } : undefined,
        room: booking.showtime.room ? {
          roomId: booking.showtime.room.roomId,
          roomName: booking.showtime.room.roomName,
          theater: booking.showtime.room.theater ? {
            theaterId: booking.showtime.room.theater.theaterId,
            theaterName: booking.showtime.room.theater.name || 'Unknown',
            location: `${booking.showtime.room.theater.address}, ${booking.showtime.room.theater.city}` || undefined,
          } : undefined,
        } : undefined,
      } : undefined,
      seats: booking.bookingSeats?.map(bs => ({
        seatId: bs.seat?.seatId,
        seatRow: bs.seat?.row,
        seatColumn: bs.seat?.col,
        seatType: bs.seat?.seatType?.typeName,
        price: bs.price,
      })) || [],
    };
  }
}

export default AdminBookingsService;