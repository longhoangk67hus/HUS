import { Module } from '@nestjs/common';
import { StatisticsModule } from './statistics/statistics.module';
import { ManualBookingModule } from './manual-booking/manual-booking.module';
import { AdminBookingsModule } from './bookings/admin-bookings.module';

/**
 * Admin Module
 * Groups all admin-related features
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Module({
  imports: [StatisticsModule, ManualBookingModule, AdminBookingsModule],
  exports: [StatisticsModule, ManualBookingModule, AdminBookingsModule],
})
export class AdminModule {}
