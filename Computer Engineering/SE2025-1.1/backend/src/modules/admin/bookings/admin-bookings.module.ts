import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminBookingsService } from './admin-bookings.service';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../auth/entities/user.entity';

/**
 * Admin Bookings Module
 * Provides admin endpoints for booking management
 * 
 * @author HNLong
 * @since 2025-12-13
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User]),
  ],
  controllers: [AdminBookingsController],
  providers: [AdminBookingsService],
  exports: [AdminBookingsService],
})
export class AdminBookingsModule {}