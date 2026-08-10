import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingSeat } from '../bookings/entities/booking-seat.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ReservationScheduler } from './reservation.scheduler';
import { ReservationRateLimitGuard } from './guards/reservation-rate-limit.guard';
import { RedisService } from '../../common/services/redis.service';
import { ShowtimeModule } from '../showtimes/showtime.module';
import { SeatModule } from '../seats/seat.module';

/**
 * Reservation Module
 * Manages seat reservations with Redis-based atomic locking
 * 
 * @author HNLong
 * @since 2025-11-06
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Booking, BookingSeat]),
    ShowtimeModule,
    SeatModule,
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    ReservationScheduler,
    ReservationRateLimitGuard,
    RedisService,
  ],
  exports: [ReservationService, TypeOrmModule],
})
export class ReservationModule {}
