import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationService } from './reservation.service';

/**
 * Reservation Scheduler
 * Background tasks for reservation management
 * 
 * @author HNLong
 * @since 2025-11-06
 */
@Injectable()
export class ReservationScheduler {
  private readonly logger = new Logger(ReservationScheduler.name);

  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Release expired reservations
   * Runs every 1 minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredReservations() {
    try {
      const count = await this.reservationService.releaseExpiredReservations();
      
      if (count > 0) {
        this.logger.log(`✅ Released ${count} expired reservations`);
      }
    } catch (error) {
      this.logger.error('❌ Error in handleExpiredReservations:', error);
    }
  }

  /**
   * Log reservation statistics (optional - runs every 5 minutes)
   */
  @Cron('*/5 * * * *') // Every 5 minutes
  async logReservationStats() {
    // This can be used for monitoring/analytics
    this.logger.debug('📊 Reservation scheduler is running');
  }
}
