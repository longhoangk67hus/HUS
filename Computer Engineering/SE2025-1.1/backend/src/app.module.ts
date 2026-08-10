import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { databaseConfig } from './config/database.config';
import { MovieModule } from './modules/movies/movie.module';
import { AuthModule } from './modules/auth/auth.module';
import { TheaterModule } from './modules/theaters/theater.module';
import { RoomTypeModule } from './modules/room-types/room-type.module';
import { RoomModule } from './modules/rooms/room.module';
import { SeatTypeModule } from './modules/seat-types/seat-type.module';
import { SeatModule } from './modules/seats/seat.module';
import { ShowtimeModule } from './modules/showtimes/showtime.module';
import { ReservationModule } from './modules/reservations/reservation.module';
import { BookingModule } from './modules/bookings/booking.module';
import { PaymentModule } from './modules/payments/payment.module';
import { AdminModule } from './modules/admin/admin.module';

/**
 * Main App Module
 * Root module for the Cinema System application
 * Includes: Movie, Auth, Theater, RoomType, Room, SeatType, Seat, Showtime, Reservation, Booking, Payment, Admin modules
 */
@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection
    TypeOrmModule.forRoot(databaseConfig),

    // Schedule configuration (for cron jobs)
    ScheduleModule.forRoot(),

    // Feature modules
    MovieModule,
    AuthModule,
    TheaterModule,
    RoomTypeModule,
    RoomModule,
    SeatTypeModule,
    SeatModule,
    ShowtimeModule,
    ReservationModule,
    BookingModule,
    PaymentModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
