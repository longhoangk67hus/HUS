import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * SeatType Entity
 * Represents different types of seats (Regular, VIP, Couple)
 * Migrated from CinemaSystem.Common.Entities.SeatType
 */
@Entity('seat_type')
export class SeatType {
  @ApiProperty({ description: 'Seat type ID', example: 1 })
  @PrimaryGeneratedColumn({ name: 'SeatTypeId' })
  seatTypeId: number;

  @ApiProperty({ description: 'Type name (Regular, VIP, Couple)', example: 'VIP' })
  @Column({ name: 'TypeName', type: 'varchar', length: 50 })
  typeName: string;

  @ApiProperty({ description: 'Price multiplier', example: 1.5 })
  @Column({ name: 'PriceMultiplier', type: 'decimal', precision: 10, scale: 2 })
  priceMultiplier: number;
}
