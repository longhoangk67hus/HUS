import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { RoomModule } from '../rooms/room.module';
import { SeatTypeModule } from '../seat-types/seat-type.module';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingSeat } from '../bookings/entities/booking-seat.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

/**
 * Seat Module
 * Manages seat related functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Seat, Booking, BookingSeat, Reservation]),
    RoomModule, // Import RoomModule to access RoomService
    SeatTypeModule, // Import SeatTypeModule to access SeatTypeService
  ],
  controllers: [SeatController],
  providers: [SeatService],
  exports: [SeatService], // Export for use in other modules (e.g., Reservation)
})
export class SeatModule {}
