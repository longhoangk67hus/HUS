import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomTypeModule } from '../room-types/room-type.module';
import { TheaterModule } from '../theaters/theater.module';

/**
 * Room Module
 * Manages cinema screening rooms
 * Migrated from CinemaSystem.BL.Room
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    RoomTypeModule, // Import để dùng RoomTypeService
    TheaterModule,  // Import để dùng TheaterService
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService], // Export for use in Seat, Showtime modules
})
export class RoomModule {}
