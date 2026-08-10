import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeScheduler } from './showtime.scheduler';
import { MovieModule } from '../movies/movie.module';
import { RoomModule } from '../rooms/room.module';

/**
 * Showtime Module
 * Manages showtime scheduling
 * @author HNLong
 * @date 2025-11-06
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime]),
    MovieModule, // Import to access MovieService
    RoomModule, // Import to access RoomService
  ],
  controllers: [ShowtimeController],
  providers: [ShowtimeService, ShowtimeScheduler],
  exports: [ShowtimeService], // Export for use in Reservation module
})
export class ShowtimeModule {}
