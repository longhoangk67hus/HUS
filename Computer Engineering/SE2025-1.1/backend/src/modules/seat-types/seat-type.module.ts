import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatType } from './entities/seat-type.entity';
import { SeatTypeService } from './seat-type.service';
import { SeatTypeController } from './seat-type.controller'

/**
 * SeatType Module
 * Manages seat type related functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([SeatType])],
  controllers: [SeatTypeController],
  providers: [SeatTypeService],
  exports: [SeatTypeService], // Export for use in Seat module
})
export class SeatTypeModule {}
