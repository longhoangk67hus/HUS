import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingSeat } from '../../bookings/entities/booking-seat.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

/**
 * Statistics Module
 * Admin revenue analytics
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingSeat])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
