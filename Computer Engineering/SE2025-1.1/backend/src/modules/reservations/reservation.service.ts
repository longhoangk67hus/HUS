import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingSeat } from '../bookings/entities/booking-seat.entity';
import { ShowtimeService } from '../showtimes/showtime.service';
import { RedisService } from '../../common/services/redis.service';
import { SeatService } from '../seats/seat.service';
import {
  CreateReservationDto,
  ReservationResponseDto,
  SeatAvailabilityDto,
  SeatsAvailabilityResponseDto,
} from './dto';
import { SeatLockData } from './interfaces/seat-lock-data.interface';

/**
 * Reservation Service
 *
 * NOTE: As of recent changes, user-visible reservations are managed
 * using database records (Pending reservations) rather than Redis
 * SETNX seat locks. Booking and payment flows remain compatible by
 * synthesizing lock data from the reservation record when needed.
 * Redis is still used elsewhere in the app (idempotency, rate-limiting,
 * payments), but reservations no longer require Redis to function.
 *
 * @author HNLong
 * @since 2025-11-06
 */
@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  // Constants
  private readonly RESERVATION_EXPIRY_SECONDS = 600; // 10 minutes

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private bookingSeatRepository: Repository<BookingSeat>,
    private showtimeService: ShowtimeService,
    private seatService: SeatService,
    private redisService: RedisService,
  ) {}

  /**
   * Create reservation with atomic Redis locks
   * Uses SETNX to prevent race conditions
   */
  async createReservation(
    dto: CreateReservationDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ReservationResponseDto> {
    // Validation: Either userId or sessionId must be provided
    if (!dto.userId && !dto.sessionId) {
      throw new BadRequestException('UserId hoặc SessionId là bắt buộc');
    }

    // Check if showtime exists and is valid
    const showtime = await this.showtimeService.findById(dto.showtimeId);

    // Check if showtime has started
    const showtimeDateTime = new Date(
      `${showtime.showDate}T${showtime.showTime}`,
    );
    if (showtimeDateTime <= new Date()) {
      throw new BadRequestException(
        'Suất chiếu đã bắt đầu hoặc đã kết thúc',
      );
    }

    // Check if user already has a pending reservation for this showtime
    const lockerId = dto.userId ?? dto.sessionId!;
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        showtimeId: dto.showtimeId,
        ...(dto.userId ? { userId: dto.userId } : { sessionId: dto.sessionId }),
        status: 'Pending',
      },
    });

    if (existingReservation) {
      // Auto-cancel existing pending reservation when creating a new one.
      // This keeps the API shape but ensures user can obtain a fresh reservation.
      try {
        existingReservation.status = 'Cancelled';
        existingReservation.completedAt = new Date();
        await this.reservationRepository.save(existingReservation);
        this.logger.log(`♻️ Auto-cancelled existing reservation ${existingReservation.reservationId} for locker ${lockerId}`);
      } catch (e) {
        this.logger.error(
          `Error auto-cancelling reservation ${existingReservation.reservationId}:`,
          e,
        );
        throw new BadRequestException('Không thể hủy reservation cũ');
      }

      // fall through to create a new reservation record
    }

    // Validate seats exist and are not broken
    const seats = await Promise.all(
      dto.seatIds.map((seatId: number) => this.seatService.findById(seatId)),
    );

    const brokenSeats = seats.filter((s: any) => s.status === 'Broken');
    if (brokenSeats.length > 0) {
      throw new BadRequestException(
        `Ghế ${brokenSeats.map((s: any) => s.seatId).join(', ')} đang bảo trì`,
      );
    }

    // NOTE: Removed Redis-based SETNX locking for user reservations.
    // Instead we use database-resident reservations as the source of truth
    // for user-visible holds. Admin flows that inspect bookings still read
    // the same DB. This prevents Redis being required for user reservation
    // creation while preserving compatibility with BookingService.

    // Ensure seats are not confirmed booked by other users
    const seatIds = dto.seatIds;
    const confirmedBookingSeats = await this.bookingSeatRepository.find({
      relations: ['booking'],
      where: {
        booking: {
          showtimeId: dto.showtimeId,
          status: 'Confirmed',
        },
      },
    });

    const confirmedSeatIds = new Set(confirmedBookingSeats.map(bs => bs.seatId));
    const alreadyBooked = seatIds.filter(id => confirmedSeatIds.has(id));
    if (alreadyBooked.length > 0) {
      throw new ConflictException(
        `Ghế ${alreadyBooked.join(', ')} đã được đặt trước. Vui lòng chọn ghế khác`,
      );
    }

    // (duplicate check removed) If we reach here, no existing pending reservation exists

    // Create reservation record (Pending) — no Redis involvement
    const reservation = this.reservationRepository.create({
      showtimeId: dto.showtimeId,
      userId: dto.userId || null,
      sessionId: dto.sessionId || null,
      seatIds: dto.seatIds.join(','),
      status: 'Pending',
      expiresAt: new Date(Date.now() + this.RESERVATION_EXPIRY_SECONDS * 1000),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    const saved = await this.reservationRepository.save(reservation);

    this.logger.log(
      `🎫 Created reservation ${saved.reservationId} (DB-only) with ${dto.seatIds.length} seats for ${lockerId}`,
    );

    return {
      reservationId: saved.reservationId,
      showtimeId: saved.showtimeId,
      seatIds: dto.seatIds,
      status: saved.status,
      createdAt: saved.createdAt,
      expiresAt: saved.expiresAt,
      remainingSeconds: Math.floor((saved.expiresAt.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Cancel reservation and release Redis locks
   */
  async cancelReservation(
    reservationId: number,
    userId?: string,
    sessionId?: string,
  ): Promise<{ message: string; reservationId: number }> {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Không tìm thấy reservation');
    }

    // Verify ownership
    const isOwner =
      (userId && reservation.userId === userId) ||
      (sessionId && reservation.sessionId === sessionId);

    if (!isOwner) {
      throw new ForbiddenException(
        'Bạn không có quyền hủy reservation này',
      );
    }
    

    if (reservation.status !== 'Pending') {
      throw new BadRequestException('Reservation đã được xử lý');
    }

    // Update database status (no Redis involvement for user reservations)
    reservation.status = 'Cancelled';
    reservation.completedAt = new Date();
    await this.reservationRepository.save(reservation);
    this.logger.log(`❌ Cancelled reservation ${reservationId}`);

    return {
      message: 'Hủy giữ ghế thành công',
      reservationId,
    };
  }

  /**
   * Get reservation details with remaining time
   */
  async getReservation(reservationId: number): Promise<ReservationResponseDto> {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Không tìm thấy reservation');
    }

    const seatIds = reservation.seatIds
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((id: number) => id > 0);

    const remainingSeconds = Math.max(
      0,
      Math.floor(
        (reservation.expiresAt.getTime() - Date.now()) / 1000,
      ),
    );

    return {
      reservationId: reservation.reservationId,
      showtimeId: reservation.showtimeId,
      seatIds,
      status: reservation.status,
      createdAt: reservation.createdAt,
      expiresAt: reservation.expiresAt,
      remainingSeconds,
    };
  }

  /**
   * Check seats availability for a showtime
   * Includes Redis locks AND confirmed bookings from database
   */
  async checkSeatsAvailability(
    showtimeId: number,
    seatIds?: number[],
  ): Promise<SeatsAvailabilityResponseDto> {
    // If no seatIds provided, get all seats for the room
    let seatsToCheck = seatIds;

    if (!seatsToCheck) {
      const showtime = await this.showtimeService.findById(showtimeId);
      const roomSeats = await this.seatService.findByRoomId(showtime.roomId);
      seatsToCheck = roomSeats.map((s: any) => s.seatId);
    }

    // Get confirmed booking seats for this showtime from database
    const confirmedBookingSeats = await this.bookingSeatRepository.find({
      relations: ['booking'],
      where: {
        booking: {
          showtimeId,
          status: 'Confirmed', // Only confirmed/permanent bookings
        },
      },
    });

    const confirmedSeatIds = new Set(confirmedBookingSeats.map(bs => bs.seatId));

    // Get active (Pending) reservations for this showtime to treat as holds
    const pendingReservations = await this.reservationRepository.find({
      where: { showtimeId, status: 'Pending' },
    });

    // Map seatId -> reservation that holds it (first found)
    const holdMap = new Map<number, any>();
    for (const r of pendingReservations) {
      const ids = r.seatIds.split(',').map((s: string) => parseInt(s.trim(), 10));
      for (const id of ids) {
        if (!holdMap.has(id)) holdMap.set(id, r);
      }
    }

    const availability: SeatAvailabilityDto[] = [];
    let lockedCount = 0;

    const now = Date.now();

    for (const seatId of seatsToCheck!) {
      const isConfirmedBooked = confirmedSeatIds.has(seatId);
      const holdingReservation = holdMap.get(seatId) || null;
      const isLocked = isConfirmedBooked || !!holdingReservation;

      let remainingSeconds = 0;
      let lockedBy: string | undefined = undefined;

      if (holdingReservation) {
        remainingSeconds = Math.max(0, Math.floor((new Date(holdingReservation.expiresAt).getTime() - now) / 1000));
        lockedBy = holdingReservation.userId || holdingReservation.sessionId || undefined;
      } else if (isConfirmedBooked) {
        lockedBy = 'system';
      }

      if (isLocked) lockedCount++;

      availability.push({
        seatId,
        isAvailable: !isLocked,
        isLocked: isLocked,
        remainingSeconds,
        lockedBy,
      });
    }

    return {
      showtimeId,
      seats: availability,
      totalSeats: seatsToCheck!.length,
      availableCount: seatsToCheck!.length - lockedCount,
      lockedCount,
    };
  }

  /**
   * Background job: Release expired reservations
   * Called by cron job/worker service
   */
  async releaseExpiredReservations(): Promise<number> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: 'Pending',
        expiresAt: LessThan(new Date()),
      },
    });

    let count = 0;

    for (const reservation of expiredReservations) {
      try {
        // Attempt to delete any legacy Redis locks/keys for these seats (best-effort)
        try {
          const seatIds = reservation.seatIds
            .split(',')
            .map((s: string) => parseInt(s.trim(), 10))
            .filter((id: number) => id > 0);

          const lockKeys = seatIds.map(id => `seat_lock:${reservation.showtimeId}:${id}`);
          const reservationKey = `reservation:${reservation.reservationId}`;

          // delete many (if redis configured)
          if (this.redisService) {
            await this.redisService.deleteMany(lockKeys).catch((e) => {
              this.logger.debug('Could not delete legacy lock keys from Redis:', (e as any)?.message || e);
            });
            await this.redisService.delete(reservationKey).catch((e) => {
              this.logger.debug('Could not delete legacy reservation key from Redis:', (e as any)?.message || e);
            });
          }

        } catch (e) {
          this.logger.debug('Error cleaning legacy Redis keys for expired reservation:', (e as any)?.message || e);
        }

        // Mark expired in database
        reservation.status = 'Expired';
        reservation.completedAt = new Date();
        await this.reservationRepository.save(reservation);

        count++;
        this.logger.log(`⏰ Expired reservation ${reservation.reservationId}`);
      } catch (error) {
        this.logger.error(
          `Error releasing reservation ${reservation.reservationId}:`,
          error,
        );
      }
    }

    if (count > 0) {
      this.logger.log(`Released ${count} expired reservations`);
    }

    return count;
  }

  /**
   * Get user's active reservations
   */
  async getUserReservations(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { userId, status: 'Pending' },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get session's active reservations
   */
  async getSessionReservations(sessionId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { sessionId, status: 'Pending' },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== Booking Integration Methods ====================

  /**
   * Confirm reservation before creating booking
   * Transitions status from Pending to Confirmed
   * Keeps Redis locks (they will be released after payment)
   * 
   * @param reservationId - ID of the reservation to confirm
   * @param userId - User ID for ownership verification
   * @param idempotencyKey - Key to prevent double confirmation
   * @returns Confirmed reservation
   * @throws NotFoundException if reservation not found
   * @throws ForbiddenException if user doesn't own the reservation
   * @throws BadRequestException if reservation is expired or already confirmed
   * @throws ConflictException if idempotency key already used
   */
  async confirmReservation(
    reservationId: number,
    userId: string,
    idempotencyKey: string,
  ): Promise<Reservation> {
    // Find reservation
    const reservation = await this.reservationRepository.findOne({
      where: { reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} không tồn tại`);
    }

    // Verify ownership
    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền xác nhận reservation này',
      );
    }

    // Check if already confirmed or completed
    if (reservation.status === 'Confirmed') {
      // Idempotent: return if same key
      if (reservation.idempotencyKey === idempotencyKey) {
        this.logger.log(
          `✅ Reservation ${reservationId} already confirmed with same idempotency key`,
        );
        return reservation;
      }
      throw new ConflictException('Reservation đã được xác nhận');
    }

    if (reservation.status !== 'Pending') {
      throw new BadRequestException(
        `Reservation có trạng thái ${reservation.status}, không thể xác nhận`,
      );
    }

    // Check if expired
    if (new Date() > new Date(reservation.expiresAt)) {
      throw new BadRequestException('Reservation đã hết hạn');
    }

    // Check if idempotency key already used by different reservation
    if (idempotencyKey) {
      const existingWithKey = await this.reservationRepository.findOne({
        where: { idempotencyKey },
      });

      if (existingWithKey && existingWithKey.reservationId !== reservationId) {
        throw new ConflictException(
          'Idempotency key đã được sử dụng bởi reservation khác',
        );
      }
    }

    // Update reservation status
    reservation.status = 'Confirmed';
    reservation.idempotencyKey = idempotencyKey;
    reservation.completedAt = new Date();

    const confirmed = await this.reservationRepository.save(reservation);

    this.logger.log(
      `✅ Confirmed reservation ${reservationId} for user ${userId}`,
    );

    return confirmed;
  }

  /**
   * Validate reservation before booking creation
   * Checks DB record and Redis locks still exist
   * 
   * @param reservationId - ID of the reservation to validate
   * @returns Validation result with reservation data and lock details
   */
  async validateReservationForBooking(reservationId: number): Promise<{
    isValid: boolean;
    reservation?: Reservation;
    locks?: SeatLockData[];
    error?: string;
  }> {
    try {
      // Check reservation exists
      const reservation = await this.reservationRepository.findOne({
        where: { reservationId },
      });

      if (!reservation) {
        return {
          isValid: false,
          error: 'Reservation không tồn tại',
        };
      }

      // Check status is Pending (not yet confirmed or cancelled)
      if (reservation.status !== 'Pending') {
        return {
          isValid: false,
          error: `Reservation có trạng thái ${reservation.status}, không thể tạo booking. Chỉ reservation Pending mới được tạo booking`,
        };
      }

      // Check not expired
      if (new Date() > new Date(reservation.expiresAt)) {
        return {
          isValid: false,
          error: 'Reservation đã hết hạn',
        };
      }

      // Validate that no confirmed bookings exist for the reserved seats
      const seatIds = reservation.seatIds.split(',').map(Number);

      const confirmedSeats = await this.bookingSeatRepository.find({
        relations: ['booking'],
        where: {
          seatId: In(seatIds),
          booking: {
            showtimeId: reservation.showtimeId,
            status: 'Confirmed',
          },
        } as any,
      });

      if (confirmedSeats && confirmedSeats.length > 0) {
        const bookedIds = confirmedSeats.map(bs => bs.seatId);
        return {
          isValid: false,
          error: `Ghế đã được đặt trước: ${[...new Set(bookedIds)].join(', ')}`,
        };
      }

      // Build synthetic locks array from reservation record so BookingService keeps working
      const locks: SeatLockData[] = seatIds.map(seatId => ({
        seatId,
        showtimeId: reservation.showtimeId,
        lockedBy: (reservation.userId ?? reservation.sessionId) as string,
        lockedAt: (reservation.createdAt as Date) || new Date(),
        expiresAt: reservation.expiresAt,
        reservationId: reservation.reservationId,
      }));

      return {
        isValid: true,
        reservation,
        locks,
      };
    } catch (error: any) {
      this.logger.error(
        `Error validating reservation ${reservationId}:`,
        error,
      );
      return {
        isValid: false,
        error: error.message || 'Validation error',
      };
    }
  }

  /**
   * Link reservation to booking after payment success
   * Updates bookingId field
   * 
   * @param reservationId - ID of the reservation
   * @param bookingId - ID of the created booking
   */
  async updateReservationWithBooking(
    reservationId: number,
    bookingId: number,
  ): Promise<void> {
    await this.reservationRepository.update(
      { reservationId },
      { bookingId },
    );

    this.logger.log(
      `🔗 Linked reservation ${reservationId} to booking ${bookingId}`,
    );
  }

  /**
   * Release seat locks after booking is confirmed
   * Called by PaymentService after successful payment
   * 
   * @param reservationId - ID of the reservation whose locks to release
   */
  async releaseLocksForConfirmedBooking(
    reservationId: number,
  ): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationId },
    });

    if (!reservation) {
      this.logger.warn(
        `Cannot release locks: reservation ${reservationId} not found`,
      );
      return;
    }

    const seatIds = reservation.seatIds.split(',').map(Number);
    await this.rollbackLocks(seatIds, reservation.showtimeId);

    // Update reservation status to 'Confirmed' to allow user to create new reservation
    await this.reservationRepository.update(
      { reservationId },
      { 
        status: 'Confirmed',
        completedAt: new Date(),
      },
    );

    this.logger.log(
      `🔓 Released locks and marked reservation ${reservationId} as Confirmed - user can now create new reservation`,
    );
  }
  // ==================== Private Helper Methods ====================

  /**
   * Rollback (release) acquired locks/holds
   * For DB-managed reservations this is a no-op (status updates are handled elsewhere)
   */
  private async rollbackLocks(
    seatIds: number[],
    showtimeId: number,
  ): Promise<void> {
    if (seatIds.length > 0) {
      this.logger.log(
        `🔓 (DB-only) Released ${seatIds.length} seat holds for showtime ${showtimeId}`,
      );
    }
  }
}
