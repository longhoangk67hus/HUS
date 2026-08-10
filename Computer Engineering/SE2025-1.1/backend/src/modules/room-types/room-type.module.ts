import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomType } from './entities/room-type.entity';
import { RoomTypeService } from './room-type.service';
import { RoomTypeController } from './room-type.controller';

/**
 * RoomType Module
 * Manages cinema room types (Standard, VIP, IMAX, 4DX, etc.)
 * Migrated from CinemaSystem.BL.RoomType
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RoomType]),
  ],
  controllers: [RoomTypeController],
  providers: [RoomTypeService],
  exports: [RoomTypeService], // Export for use in Room module
})
export class RoomTypeModule {}
