import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSeat } from './entities';
import { Reservation } from '../reservations/entities/reservation.entity';
import { BookingScheduler } from './booking.scheduler';
import { ReservationModule } from '../reservations/reservation.module';
import { SeatModule } from '../seats/seat.module';
import { ShowtimeModule } from '../showtimes/showtime.module';
import { PaymentModule } from '../payments/payment.module';
import { EmailModule } from '../email/email.module';
import { User } from '../auth/entities';
import { RedisService } from '../../common/services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingSeat, User, Reservation]),
    ReservationModule,
    SeatModule,
    ShowtimeModule,
    EmailModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [BookingController],
  providers: [BookingService, RedisService, BookingScheduler],
  exports: [BookingService],
})
export class BookingModule {}
