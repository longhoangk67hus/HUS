import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShowtimeService } from './showtime.service';

/**
 * Showtime Scheduler
 * Auto-updates showtime statuses based on time.
 */
@Injectable()
export class ShowtimeScheduler {
  private readonly logger = new Logger(ShowtimeScheduler.name);

  constructor(private readonly showtimeService: ShowtimeService) {}

  /**
   * Mark showtimes as Completed after the movie ends.
   * Runs every 1 minute.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoCompleteShowtimes() {
    try {
      const updated = await this.showtimeService.autoCompleteStartedShowtimes();
      if (updated > 0) {
        this.logger.log(`✅ Auto-completed ${updated} showtime(s)`);
      }
    } catch (error) {
      this.logger.error('❌ Error in handleAutoCompleteShowtimes:', error);
    }
  }
}
