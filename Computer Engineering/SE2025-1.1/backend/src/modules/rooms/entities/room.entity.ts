import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Theater } from '../../theaters/entities/theater.entity';
import { RoomType } from '../../room-types/entities/room-type.entity';

/**
 * Room Entity
 * Represents a cinema screening room in a theater
 * Migrated from CinemaSystem.Common.Entities.Room
 */
@Entity('room')
export class Room {
  @PrimaryGeneratedColumn({ name: 'RoomId' })
  @ApiProperty({ example: 1, description: 'Room ID' })
  roomId: number;

  @Column({ name: 'RoomName', type: 'varchar', length: 100, nullable: false })
  @ApiProperty({ 
    example: 'Room 1A', 
    description: 'Room name/number',
    maxLength: 100
  })
  roomName: string;

  @Column({ name: 'RoomTypeId', type: 'int', nullable: false, default: 1 })
  @ApiProperty({ 
    example: 1, 
    description: 'Room type ID (Default: 1 for Standard room)' 
  })
  roomTypeId: number;

  @Column({ name: 'TheaterId', type: 'int', nullable: true })
  @ApiProperty({ 
    example: 1, 
    description: 'Theater ID where this room is located',
    required: false
  })
  theaterId?: number;

  @Column({ name: 'TotalSeats', type: 'int', nullable: false })
  @ApiProperty({ 
    example: 150, 
    description: 'Total number of seats in this room' 
  })
  totalSeats: number;

  @Column({ name: 'Status', type: 'varchar', length: 50, nullable: true, default: 'Active' })
  @ApiProperty({ 
    example: 'Active', 
    description: 'Room status: Active, Maintenance, Inactive',
    enum: ['Active', 'Maintenance', 'Inactive'],
    default: 'Active'
  })
  status?: string;

  // Relationships

  @ManyToOne(() => Theater, { eager: false })
  @JoinColumn({ name: 'TheaterId' })
  theater?: Theater;

  @ManyToOne(() => RoomType, { eager: false })
  @JoinColumn({ name: 'RoomTypeId' })
  roomType?: RoomType;

  // One room has many seats
  // @OneToMany(() => Seat, seat => seat.room)
  // seats?: Seat[];

  // One room has many showtimes
  // @OneToMany(() => Showtime, showtime => showtime.room)
  // showtimes?: Showtime[];
}
