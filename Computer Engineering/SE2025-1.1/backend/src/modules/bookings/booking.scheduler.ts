import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingSeat } from './entities/booking-seat.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

/**
 * Booking Scheduler
 * - Cancels expired pending bookings and removes their booking_seat records
 * - Releases linked reservations (marks them Cancelled)
 */
@Injectable()
export class BookingScheduler {
  private readonly logger = new Logger(BookingScheduler.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPendingBookings() {
    try {
      const now = new Date();
      const expired = await this.bookingRepository.find({
        where: {
          status: 'Pending',
          expiryDate: LessThan(now),
        },
      });

      if (!expired || expired.length === 0) return;

      for (const b of expired) {
        try {
          // delete booking seats
          await this.bookingSeatRepository.delete({ bookingId: b.bookingId });

          // mark booking cancelled
          await this.bookingRepository.update({ bookingId: b.bookingId }, { status: 'Cancelled', modifiedDate: new Date() });

          // if linked reservation exists, cancel it to release holds
          if (b.reservationId) {
            await this.reservationRepository.update({ reservationId: b.reservationId }, { status: 'Cancelled', completedAt: new Date() });
          }

          this.logger.log(`⏰ Cancelled expired booking ${b.bookingId} and removed its seats`);
        } catch (err) {
          this.logger.error(`Error processing expired booking ${b.bookingId}:`, (err as any)?.message || err);
        }
      }
    } catch (error) {
      this.logger.error('Error in handleExpiredPendingBookings:', (error as any)?.message || error);
    }
  }
}
