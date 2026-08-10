import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { Booking, BookingSeat } from './entities';
import { CreateBookingDto, BookingResponseDto, BookingSeatInfo } from './dto';
import { ReservationService } from '../reservations/reservation.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { SeatService } from '../seats/seat.service';
import { ShowtimeService } from '../showtimes/showtime.service';
import { RedisService } from '../../common/services/redis.service';
import { PaymentService } from '../payments/payment.service';
import { BookingEmailService } from '../email/services';
import { User } from '../auth/entities';

/**
 * Booking Service - Convert reservations to permanent bookings
 * Handles payment integration and seat confirmation
 * 
 * @author HNLong
 * @since 2025-11-08
 */
@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  // Constants
  private readonly BOOKING_EXPIRY_MINUTES = 15; // Time to complete payment
  private readonly IDEMPOTENCY_TTL = 86400; // 24 hours
  private readonly POINTS_EARN_RATE = 0.1; // 10% of finalAmount

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private bookingSeatRepository: Repository<BookingSeat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private reservationService: ReservationService,
    private seatService: SeatService,
    private showtimeService: ShowtimeService,
    private redisService: RedisService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    private bookingEmailService: BookingEmailService,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  /**
   * Create booking from confirmed reservation
   * Uses database transaction for atomicity
   * 
   * @param dto - Booking creation data
   * @param userId - User ID from JWT token
   * @returns Created booking with payment URL
   */
  async createBooking(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    // 1. Check idempotency - prevent double booking
    const idempotencyKey = `booking:${userId}:${dto.idempotencyKey}`;
    const cached = await this.redisService.get(idempotencyKey);
    
    if (cached) {
      this.logger.log(`♻️ Returning cached booking for key ${dto.idempotencyKey}`);
      return JSON.parse(cached);
    }

    // 2. Validate reservation
    const validation = await this.reservationService.validateReservationForBooking(
      dto.reservationId,
    );

    if (!validation.isValid) {
      throw new BadRequestException(
        `Reservation không hợp lệ: ${validation.error}`,
      );
    }

    const { reservation, locks } = validation;

    if (!reservation || !locks) {
      throw new BadRequestException('Dữ liệu reservation không đầy đủ');
    }

    // Verify ownership
    if (reservation.userId !== userId) {
      throw new BadRequestException('Bạn không sở hữu reservation này');
    }

    // Check if reservation already linked to booking
    if (reservation.bookingId) {
      throw new ConflictException(
        `Reservation đã được tạo booking #${reservation.bookingId}`,
      );
    }

    // 3. Get seat details and calculate amounts
    const seatIds = reservation.seatIds.split(',').map(Number);
    const seats = await Promise.all(
      seatIds.map(seatId => this.seatService.findById(seatId)),
    );

    // Get showtime for room multiplier
    const showtime = await this.showtimeService.findById(reservation.showtimeId);
    const roomMultiplier = showtime.room?.roomType?.priceMultiplier || 1;

    // Calculate seat prices with room multiplier
    const seatPrices = seats.map(seat => {
      const seatNumber = `${seat.row}${seat.col}`;
      const seatTypeName = seat.seatType?.typeName || 'Unknown';
      const seatTypeMultiplier = Number(seat.seatType?.priceMultiplier || 1);
      
      // Use actual base price from showtime instead of hardcoded value
      const basePrice = Number(showtime.basePrice);
      const finalPrice = basePrice * seatTypeMultiplier * roomMultiplier;

      return {
        seatId: seat.seatId,
        seatNumber,
        seatTypeName,
        basePrice,
        finalPrice,
      };
    });

    const totalAmount = seatPrices.reduce((sum, s) => sum + s.finalPrice, 0);
    const finalAmount = totalAmount; // No discounts for now

    // 4. Generate unique booking code
    const bookingCode = await this.generateBookingCode();

    // 5. Create booking with transaction and lock reservation to prevent races
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Re-load reservation with FOR UPDATE lock to prevent concurrent booking creation
      const lockedReservation = await queryRunner.manager
        .createQueryBuilder(Reservation, 'r')
        .setLock('pessimistic_write')
        .where('r.ReservationId = :id', { id: reservation.reservationId })
        .getOne();

      if (!lockedReservation) {
        throw new BadRequestException('Reservation không tồn tại');
      }

      // If another request already linked this reservation to a booking, return that booking instead
      if (lockedReservation.bookingId) {
        const existingBooking = await this.findById(lockedReservation.bookingId);
        const existingSeatInfos: BookingSeatInfo[] = (existingBooking.bookingSeats || []).map(bs => ({
          seatId: bs.seat?.seatId || 0,
          seatNumber: bs.seat ? `${bs.seat.row}${bs.seat.col}` : 'N/A',
          seatType: bs.seat?.seatType?.typeName || 'Unknown',
          price: bs.price,
        }));

        const existingResponse = new BookingResponseDto(existingBooking, existingSeatInfos, undefined);
        // cache for idempotency
        await this.redisService.set(idempotencyKey, JSON.stringify(existingResponse), this.IDEMPOTENCY_TTL);
        await queryRunner.commitTransaction();
        await queryRunner.release();
        return existingResponse;
      }

      // proceed using lockedReservation (fields are on lockedReservation)

      // Create booking record
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + this.BOOKING_EXPIRY_MINUTES);
      const booking = queryRunner.manager.create(Booking, {
        userId,
        showtimeId: lockedReservation.showtimeId,
        reservationId: lockedReservation.reservationId,
        bookingCode,
        totalAmount,
        discountAmount: 0,
        finalAmount,
        pointsEarned: 0,
        pointsUsed: 0,
        discountCodeId: null,
        idempotencyKey: dto.idempotencyKey,
        status: 'Pending',
        expiryDate,
        createdBy: userId,
      });

      const savedBooking = await queryRunner.manager.save(Booking, booking);

      // Create booking_seat records
      const bookingSeats = seatPrices.map(seatPrice =>
        queryRunner.manager.create(BookingSeat, {
          bookingId: savedBooking.bookingId,
          seatId: seatPrice.seatId,
          price: seatPrice.finalPrice,
          createdBy: userId,
        }),
      );

      await queryRunner.manager.save(BookingSeat, bookingSeats);

      // Link reservation to booking
      await queryRunner.manager.update(
        'reservation',
        { reservationId: reservation.reservationId },
        { bookingId: savedBooking.bookingId },
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `✅ Created booking ${bookingCode} (ID: ${savedBooking.bookingId}) for user ${userId}`,
      );

      // 6. Build response
      const seatInfos: BookingSeatInfo[] = seatPrices.map(sp => ({
        seatId: sp.seatId,
        seatNumber: sp.seatNumber,
        seatType: sp.seatTypeName,
        price: sp.finalPrice,
      }));

      // TODO: Generate payment URL from PaymentService
      const paymentUrl = `https://payment.vnpay.vn/checkout/${bookingCode}`;

      const response = new BookingResponseDto(savedBooking, seatInfos, paymentUrl);

      // 7. Cache response for idempotency (24h TTL)
      await this.redisService.set(
        idempotencyKey,
        JSON.stringify(response),
        this.IDEMPOTENCY_TTL,
      );

      return response;

    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating booking:', error);
      throw new BadRequestException(
        `Không thể tạo booking: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get booking by ID with full details
   */
  async findById(bookingId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ['bookingSeats', 'bookingSeats.seat', 'showtime', 'reservation'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} không tồn tại`);
    }

    return booking;
  }

  /**
   * Get all bookings (Admin endpoint)
   * Returns all bookings from all users with full details for admin dashboard
   * Gets: user info, movie title, theater name, room name, seat info
   */
  async findAll(): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      relations: [
        'bookingSeats',
        'bookingSeats.seat',
        'bookingSeats.seat.room',
        'bookingSeats.seat.room.theater',
        'bookingSeats.seat.seatType',
        'showtime',
        'showtime.movie',
        'showtime.room',
      ],
      order: { bookingDate: 'DESC' },
    });

    // Get user info separately (userId is not a relation, it's a foreign key)
    const userIds = [...new Set(bookings.map(b => b.userId))];
    const users = await this.userRepository.find({
      where: userIds.map(id => ({ userId: id })),
    });

    const userMap = new Map(users.map(u => [u.userId, u]));

    // Transform bookings to include user info
    return bookings.map(booking => {
      const user = userMap.get(booking.userId);
      return {
        ...booking,
        user: {
          userId: booking.userId,
          userName: user?.userName || 'Unknown',
          fullName: user?.fullName || 'Unknown',
          email: user?.email || 'N/A',
          phoneNumber: user?.phoneNumber || null,
        },
      };
    });
  }

  /**
   * Get booking by code
   */
  async findByCode(bookingCode: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingCode },
      relations: ['bookingSeats', 'bookingSeats.seat', 'showtime'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking code ${bookingCode} không tồn tại`);
    }

    return booking;
  }

  /**
   * Get user's bookings
   */
  async findByUser(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: [
        'bookingSeats',
        'bookingSeats.seat',
        'bookingSeats.seat.room',
        'bookingSeats.seat.room.theater',
        'showtime',
        'showtime.movie',
        'showtime.room',
      ],
      
      order: { bookingDate: 'DESC' },
    });
  }

  /**
   * Get booking by reservation ID
   * Used to check if booking was already created from this reservation
   * Prevents duplicate booking attempts
   */
  async findByReservation(reservationId: number, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { 
        reservationId,
        userId, // Security: only owner can access
      },
      relations: ['bookingSeats', 'bookingSeats.seat', 'bookingSeats.seat.seatType', 'showtime', 'reservation'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Chưa có booking nào được tạo từ reservation ${reservationId}. Bạn có thể tạo booking mới.`,
      );
    }

    // Build seat info from booking_seat records (matching DTO structure)
    const seatInfos: BookingSeatInfo[] = (booking.bookingSeats || []).map(bs => ({
      seatId: bs.seat?.seatId || 0,
      seatNumber: bs.seat ? `${bs.seat.row}${bs.seat.col}` : 'N/A',
      seatType: bs.seat?.seatType?.typeName || 'Unknown',
      price: bs.price, // Use actual price stored in booking_seat
    }));

    // Generate real VNPay payment URL (if still pending)
    let paymentUrl: string | undefined;
    if (booking.status === 'Pending') {
      try {
        const payment = await this.paymentService.createPayment(
          {
            bookingId: booking.bookingId,
            idempotencyKey: `payment-${booking.bookingId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            paymentMethod: 'CreditCard', // Default, user can change on VNPay page
          },
          userId,
        );
        paymentUrl = payment.paymentUrl ?? undefined;
        this.logger.log(`✅ Generated VNPay URL for booking ${booking.bookingId}`);
      } catch (error: any) {
        this.logger.error(`❌ Failed to create payment for booking ${booking.bookingId}:`, (error as any)?.message || error);
        // Continue without payment URL - admin can create payment manually later
        paymentUrl = undefined;
      }
    }

    return new BookingResponseDto(booking, seatInfos, paymentUrl);
  }

  /**
   * Update booking status after payment
   * Called by PaymentService webhook handler
   */
  async confirmBooking(bookingId: number): Promise<Booking> {
    const booking = await this.findById(bookingId);

    if (booking.status === 'Confirmed') {
      this.logger.warn(`Booking ${bookingId} already confirmed`);
      return booking;
    }

    if (booking.status !== 'Pending') {
      throw new BadRequestException(
        `Booking có trạng thái ${booking.status}, không thể confirm`,
      );
    }

    // Generate QR Code data
    const qrData = {
      bookingCode: booking.bookingCode,
      bookingId: booking.bookingId,
      userId: booking.userId,
      showtimeId: booking.showtimeId,
      timestamp: Date.now(),
      // HMAC signature for verification
      signature: crypto
        .createHmac('sha256', this.configService.get('JWT_SECRET') || 'default-secret')
        .update(`${booking.bookingCode}-${booking.bookingId}-${booking.userId}`)
        .digest('hex'),
    };

    // Update status (mark confirmed) and save now so user sees booking immediately.
    booking.status = 'Confirmed';
    booking.qrCode = null; // will be generated asynchronously
    booking.modifiedDate = new Date();
    const confirmed = await this.bookingRepository.save(booking);

    // Release Redis locks (seats now permanently booked)
    if (booking.reservationId) {
      await this.reservationService.releaseLocksForConfirmedBooking(
        booking.reservationId,
      );
    }

    this.logger.log(`✅ Confirmed booking ${bookingId} - locks released`);

    // Generate QR code and send confirmation email in background so webhook
    // handling stays fast and doesn't block the payment gateway callback.
    this.logger.log(`🔄 Starting QR generation and email for booking ${bookingId}...`);
    
    void (async () => {
      try {
        this.logger.log(`📝 QR Data for booking ${bookingId}: ${JSON.stringify(qrData)}`);
        
        // Generate QR Code as Base64 data URL (smaller width for speed)
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 200,
          margin: 1,
        });

        this.logger.log(`✅ QR code generated for booking ${bookingId}, length: ${qrCodeDataURL.length}`);

        // Persist QR code to booking record
        await this.bookingRepository.update({ bookingId }, { qrCode: qrCodeDataURL });
        this.logger.log(`✅ QR code saved to database for booking ${bookingId}`);

        // Reload updated booking to include relations when sending email
        const updatedBooking = await this.findById(bookingId);
        this.logger.log(`✅ Reloaded booking ${bookingId} with relations`);

        // Send booking confirmation email (include QR code) - don't block
        this.logger.log(`📧 Attempting to send email for booking ${bookingId}...`);
        await this.sendBookingConfirmationEmail(updatedBooking);
        this.logger.log(`✅ Email process completed for booking ${bookingId}`);
      } catch (error) {
        this.logger.error(`❌ Failed to generate QR or send email for booking ${bookingId}:`, error instanceof Error ? error.stack : String(error));
      }
    })();

    return confirmed;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: number, userId: string): Promise<Booking> {
    const booking = await this.findById(bookingId);

    // Verify ownership
    if (booking.userId !== userId) {
      throw new BadRequestException('Bạn không sở hữu booking này');
    }

    if (booking.status === 'Confirmed') {
      throw new BadRequestException('Booking đã confirmed, không thể hủy');
    }

    booking.status = 'Cancelled';
    booking.modifiedDate = new Date();
    const cancelled = await this.bookingRepository.save(booking);

    // Release locks if exists
    if (booking.reservationId) {
      await this.reservationService.releaseLocksForConfirmedBooking(
        booking.reservationId,
      );
    }

    this.logger.log(`❌ Cancelled booking ${bookingId}`);

    return cancelled;
  }

  // ==================== Private Helper Methods ====================

  /**
   * Generate unique booking code
   * Format: BK{YYYYMMDD}{Random4Chars}
   * Example: BK20251108A1B2
   */
  private async generateBookingCode(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Generate random 4-character suffix
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let randomStr = '';
      for (let i = 0; i < 4; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const code = `BK${dateStr}${randomStr}`;

      // Check uniqueness
      const exists = await this.bookingRepository.findOne({
        where: { bookingCode: code },
      });

      if (!exists) {
        return code;
      }

      attempts++;
    }

    // Fallback: use timestamp
    return `BK${dateStr}${Date.now().toString().slice(-4)}`;
  }

  /**
   * Send booking confirmation email with QR code
   * Private helper method called after booking confirmation
   */
  private async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    try {
      this.logger.log(`📧 Preparing to send confirmation email for booking ${booking.bookingId}`);

      // Get full booking details with relations
      const fullBooking = await this.bookingRepository.findOne({
        where: { bookingId: booking.bookingId },
        relations: [
          'bookingSeats',
          'bookingSeats.seat',
          'bookingSeats.seat.room',
          'bookingSeats.seat.room.theater',
          'reservation',
          'reservation.showtime',
          'reservation.showtime.movie',
        ],
      });

      if (!fullBooking) {
        throw new Error(`Booking ${booking.bookingId} not found`);
      }

      // Extract booking information
      const movieTitle = fullBooking.reservation?.showtime?.movie?.title || 'Unknown Movie';
      const theaterName = fullBooking.bookingSeats?.[0]?.seat?.room?.theater?.name || 'Unknown Theater';
      const roomName = fullBooking.bookingSeats?.[0]?.seat?.room?.roomName || 'Unknown Room';
      
      // Format showtime - combine showDate and showTime
      const showDate = fullBooking.reservation?.showtime?.showDate;
      const showTime = fullBooking.reservation?.showtime?.showTime;
      let showtime = 'Unknown showtime';
      
      if (showDate && showTime) {
        const dateStr = new Date(showDate).toLocaleDateString('vi-VN');
        showtime = `${dateStr} ${showTime}`;
      }

      // Get seat numbers - combine row + col
      const seats = fullBooking.bookingSeats?.map((bs) => {
        const row = bs.seat?.row || '?';
        const col = bs.seat?.col || 0;
        return `${row}${col}`;
      }) || [];

      // Get user info from database
      const user = await this.userRepository.findOne({
        where: { userId: fullBooking.userId },
      });

      if (!user) {
        this.logger.warn(`User ${fullBooking.userId} not found for booking ${booking.bookingId}, skipping email`);
        return;
      }

      if (!user.email) {
        this.logger.warn(`User ${fullBooking.userId} has no email, skipping email for booking ${booking.bookingId}`);
        return;
      }

      const userName = user.fullName || user.userName || 'Khách hàng';
      const userEmail = user.email;

      // Send email
      const emailSent = await this.bookingEmailService.sendBookingConfirmation(
        userEmail,
        {
          bookingCode: fullBooking.bookingCode,
          userName,
          movieTitle,
          theaterName,
          roomName,
          showtime,
          seats,
          totalAmount: fullBooking.finalAmount || 0,
          qrCodeDataUrl: fullBooking.qrCode || '',
        },
      );

      if (emailSent) {
        this.logger.log(`✅ Booking confirmation email sent successfully for booking ${booking.bookingId}`);
      } else {
        this.logger.warn(`⚠️ Failed to send booking confirmation email for booking ${booking.bookingId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error in sendBookingConfirmationEmail for booking ${booking.bookingId}: ${errorMessage}`,
        errorStack,
      );
      // Don't throw - email failure shouldn't break booking
    }
  }
}
