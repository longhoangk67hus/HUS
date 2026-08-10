import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingSeat } from '../../bookings/entities/booking-seat.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { Seat } from '../../seats/entities/seat.entity';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ManualBookingResponseDto } from './dto/manual-booking-response.dto';
import { ReservationService } from '../../reservations/reservation.service';
import { CreateReservationDto } from '../../reservations/dto/create-reservation.dto';
import { BookingService } from '../../bookings/booking.service';

/**
 * Service for manual booking operations at the counter
 * Bypasses reservation system and creates immediate bookings
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Injectable()
export class ManualBookingService {
  private readonly logger = new Logger(ManualBookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
    private readonly reservationService: ReservationService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {}

  /**
   * Create a manual booking at the counter
   * No reservation lock needed - direct booking with immediate confirmation
   */
  async createManualBooking(
    dto: CreateManualBookingDto,
    adminUserId: string,
  ): Promise<ManualBookingResponseDto> {
    try {
      this.logger.debug(`[createManualBooking] Started with DTO:`, JSON.stringify(dto));
      this.logger.debug(`[createManualBooking] adminUserId:`, adminUserId);

      const customerName = dto.customerName && dto.customerName.length >= 2 ? dto.customerName : 'Khách tại quầy';

      // For admin manual bookings we: 1) create a DB reservation (Pending),
      // 2) adjust its expiry to the booking timeout (15 minutes), and
      // 3) delegate booking creation to BookingService.createBooking so the
      //    normal booking lifecycle (Pending -> Confirmed on payment) is used.

      let res: any

      // 1. If frontend provided an existing reservationId, use it. Otherwise create a new reservation.
      if (dto.reservationId) {
        // Load reservation record and ensure it's valid
        const existing = await this.reservationRepository.findOne({ where: { reservationId: dto.reservationId } });
        if (!existing) {
          throw new NotFoundException('Reservation không tồn tại');
        }
        if (existing.status !== 'Pending') {
          throw new BadRequestException('Reservation không còn ở trạng thái Pending');
        }
        // Optional: ensure showtime and seats match
        if (existing.showtimeId !== dto.showtimeId) {
          throw new BadRequestException('Reservation không khớp với suất chiếu được cung cấp');
        }

        res = {
          reservationId: existing.reservationId,
          showtimeId: existing.showtimeId,
          seatIds: existing.seatIds.split(',').map((s: string) => Number(s)),
          status: existing.status,
          expiresAt: existing.expiresAt,
        };
      } else {
        const createResDto: CreateReservationDto = {
          showtimeId: dto.showtimeId,
          seatIds: dto.seatIds,
          userId: adminUserId,
        };

        res = await this.reservationService.createReservation(createResDto);
      }

      // 2. Extend reservation expiry to match booking expiry (15 minutes)
      const bookingExpiry = new Date();
      bookingExpiry.setMinutes(bookingExpiry.getMinutes() + 15);

      try {
        await this.reservationRepository.update({ reservationId: res.reservationId }, { expiresAt: bookingExpiry });
      } catch (e) {
        this.logger.error('[createManualBooking] Failed to update reservation expiry:', e);
      }

      // 3. Call BookingService.createBooking to create the booking from reservation
      const idempotencyKey = `manual-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

      let bookingResponse: any
      try {
        bookingResponse = await this.bookingService.createBooking({ reservationId: res.reservationId, idempotencyKey }, adminUserId);
      } catch (err: any) {
        // If booking creation failed because reservation already linked to a booking,
        // try to return the existing booking instead of bubbling the 409 to the client.
        const msg = (err && err.message) ? String(err.message) : '';
        if (err instanceof ConflictException || msg.includes('Reservation đã được tạo booking') || msg.includes('Reservation đã được tạo booking')) {
          this.logger.warn(`[createManualBooking] Reservation ${res.reservationId} already linked to booking - fetching existing booking`);
          try {
            bookingResponse = await this.bookingService.findByReservation(res.reservationId, adminUserId);
          } catch (innerErr) {
            this.logger.error('[createManualBooking] Failed to load existing booking for reservation:', innerErr);
            throw err; // rethrow original conflict if we can't fetch
          }
        } else {
          throw err;
        }
      }

      // 4. Update booking with manual booking fields (customer info, payment method)
      try {
        await this.bookingRepository.update(
          { bookingId: bookingResponse.bookingId },
          {
            isManualBooking: true,
            paymentMethod: dto.paymentMethod === 'Card' ? 'Card' : dto.paymentMethod === 'Cash' ? 'Cash' : 'VNPay',
            customerName,
            customerPhone: dto.customerPhone || null,
            adminNote: dto.adminNote || null,
            modifiedBy: adminUserId,
            modifiedDate: new Date(),
          },
        );
      } catch (e) {
        this.logger.error('[createManualBooking] Failed to update booking with manual fields:', e);
      }

      // 5. Do NOT auto-confirm here. Return booking in Pending state so
      // payment confirmation is explicit (webhook or admin confirm action).
      try {
        bookingResponse = await this.bookingService.findByReservation(res.reservationId, adminUserId);
      } catch (e) {
        this.logger.error('[createManualBooking] Failed to reload booking after update:', e);
      }

      // 5. Build manual response from bookingResponse
      return {
        bookingId: bookingResponse.bookingId,
        bookingCode: bookingResponse.bookingCode,
        showtimeId: bookingResponse.showtimeId,
        movieTitle: 'Unknown Movie',
        theaterName: 'Unknown Theater',
        roomName: 'Unknown Room',
        showtimeStart: bookingResponse.expiryDate,
        seats: bookingResponse.seats || [],
        totalAmount: Number(bookingResponse.totalAmount || 0),
        finalAmount: Number(bookingResponse.finalAmount || 0),
        customerName: bookingResponse.customerName || customerName,
        customerPhone: dto.customerPhone,
        paymentMethod: dto.paymentMethod,
        qrCode: bookingResponse.qrCode || '',
        status: bookingResponse.status,
        bookingDate: bookingResponse.bookingDate,
        adminNote: bookingResponse.adminNote || undefined,
      };
    } catch (error) {
      this.logger.error(`[createManualBooking] Error:`, error);
      throw error;
    }
  }

  /**
   * Generate unique booking code
   * Format: BK + YYYYMMDD + HHMMSS + Random3Digits
   */
  private generateBookingCode(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `BK${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }

  /**
   * Get manual booking details by booking ID
   */
  async getManualBookingById(bookingId: number): Promise<ManualBookingResponseDto> {
    const booking = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.showtime', 'showtime')
      .leftJoinAndSelect('showtime.movie', 'movie')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('booking.bookingSeats', 'bookingSeats')
      .leftJoinAndSelect('bookingSeats.seat', 'seat')
      .where('booking.bookingId = :bookingId', { bookingId })
      .andWhere('booking.isManualBooking = :isManual', { isManual: true })
      .getOne();

    if (!booking) {
      throw new NotFoundException('Manual booking not found');
    }

    if (!booking.showtime || !booking.bookingSeats) {
      throw new NotFoundException('Booking data incomplete');
    }

    // Combine showDate and showTime
    // showDate may be returned as a Date or a string depending on DB driver/settings.
    // Normalize to YYYY-MM-DD safely to avoid calling toISOString on a string.
    let showDateStr: string;
    try {
      if (booking.showtime.showDate instanceof Date) {
        showDateStr = booking.showtime.showDate.toISOString().split('T')[0];
      } else {
        // coerce and extract date portion if time is accidentally present
        showDateStr = String(booking.showtime.showDate).split('T')[0];
      }
    } catch (e) {
      this.logger.error('[getManualBookingById] Error normalizing showDate:', e);
      // fallback to empty date which will result in an invalid Date if showTime missing
      showDateStr = String(booking.showtime.showDate ?? '');
    }

    const showtimeStart = new Date(`${showDateStr}T${booking.showtime.showTime}`);

    return {
      bookingId: booking.bookingId,
      bookingCode: booking.bookingCode,
      showtimeId: booking.showtimeId,
      movieTitle: booking.showtime.movie.title,
      theaterName: booking.showtime.room.theater?.name || 'Unknown Theater',
      roomName: booking.showtime.room.roomName,
      showtimeStart: showtimeStart,
      seats: booking.bookingSeats.map(bs => ({
        seatId: bs.seat?.seatId || 0,
        rowNumber: bs.seat?.row || '',
        columnNumber: bs.seat?.col || 0,
        price: Number(bs.price),
      })),
      totalAmount: Number(booking.totalAmount),
      finalAmount: Number(booking.finalAmount),
      customerName: booking.customerName || '',
      customerPhone: booking.customerPhone || '',
      paymentMethod: booking.paymentMethod || 'Cash',
      qrCode: booking.qrCode || '',
      status: booking.status,
      bookingDate: booking.bookingDate,
      adminNote: booking.adminNote || undefined,
    };
  }

  /**
   * Cancel manual booking (refund at counter)
   */
  async cancelManualBooking(bookingId: number, adminUserId: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId, isManualBooking: true },
    });

    if (!booking) {
      throw new NotFoundException('Manual booking not found');
    }

    if (booking.status === 'Cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'Confirmed') {
      throw new BadRequestException('Cannot cancel confirmed booking');
    }

    // Update booking status
    booking.status = 'Cancelled';
    booking.modifiedBy = adminUserId;
    booking.modifiedDate = new Date();

    await this.bookingRepository.save(booking);
  }

  /**
   * Confirm manual booking after admin receives payment at counter
   * Returns updated booking with Confirmed status
   */
  async confirmManualBooking(bookingId: number, adminUserId: string): Promise<ManualBookingResponseDto> {
    // Use BookingService.confirmBooking to perform the confirm flow (QR, email, release locks)
    const confirmed = await this.bookingService.confirmBooking(bookingId);

    // Mark modifiedBy for audit
    try {
      await this.bookingRepository.update({ bookingId }, { modifiedBy: adminUserId, modifiedDate: new Date() });
    } catch (e) {
      this.logger.debug('[confirmManualBooking] Failed to set modifiedBy:', e);
    }

    // Fetch and return updated booking with all details
    return this.getManualBookingById(bookingId);
  }
}
