import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualBookingController } from './manual-booking.controller';
import { ManualBookingService } from './manual-booking.service';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingSeat } from '../../bookings/entities/booking-seat.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { Seat } from '../../seats/entities/seat.entity';
import { BookingModule } from '../../bookings/booking.module';
import { ReservationModule } from '../../reservations/reservation.module';

/**
 * Manual Booking Module
 * Handles counter bookings for walk-in customers
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingSeat,
      Showtime,
      Seat,
    ]),
    // Bring in Booking and Reservation services so ManualBookingService
    // can delegate booking creation and reservation management.
    forwardRef(() => BookingModule),
    ReservationModule,
  ],
  controllers: [ManualBookingController],
  providers: [ManualBookingService],
  exports: [ManualBookingService],
})
export class ManualBookingModule {}
