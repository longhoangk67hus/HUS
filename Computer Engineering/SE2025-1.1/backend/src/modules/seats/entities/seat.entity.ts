import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../../rooms/entities/room.entity';
import { SeatType } from '../../seat-types/entities/seat-type.entity';

/**
 * Seat Entity
 * Represents a seat in a cinema room
 * Migrated from CinemaSystem.Common.Entities.Seat
 */
@Entity('seat')
export class Seat {
  @ApiProperty({ description: 'Seat ID', example: 1 })
  @PrimaryGeneratedColumn({ name: 'SeatId' })
  seatId: number;

  @ApiProperty({ description: 'Room ID', example: 1 })
  @Column({ name: 'RoomId' })
  roomId: number;

  @ApiProperty({ description: 'Seat type ID (Default: 1 for Regular seat)', example: 1 })
  @Column({ name: 'SeatTypeId', default: 1 })
  seatTypeId: number;

  @ApiProperty({ description: 'Row letter', example: 'A' })
  @Column({ name: 'Row', type: 'varchar', length: 5 })
  row: string;

  @ApiProperty({ description: 'Column number', example: 1 })
  @Column({ name: 'Col', type: 'int' })
  col: number;

  @ApiProperty({ description: 'Seat status', example: 'Available' })
  @Column({ name: 'Status', type: 'varchar', length: 50, default: 'Available' })
  status: string; // Available, Broken, Reserved

  // Relations
  @ManyToOne(() => Room, { eager: false })
  @JoinColumn({ name: 'RoomId' })
  room: Room;

  @ManyToOne(() => SeatType, { eager: false })
  @JoinColumn({ name: 'SeatTypeId' })
  seatType: SeatType;
}
