import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../../movies/movie.entity';
import { Room } from '../../rooms/entities/room.entity';

/**
 * Showtime Entity
 * Represents a movie screening schedule
 * Migrated from CinemaSystem.Common.Entities.Showtime
 * @author HNLong
 * @date 2025-11-06
 */
@Entity('showtime')
export class Showtime {
  @ApiProperty({ description: 'Showtime ID', example: 1 })
  @PrimaryGeneratedColumn({ name: 'ShowtimeId' })
  showtimeId: number;

  @ApiProperty({ description: 'Movie ID', example: 1 })
  @Column({ name: 'MovieId' })
  movieId: number;

  @ApiProperty({ description: 'Room ID', example: 1 })
  @Column({ name: 'RoomId' })
  roomId: number;

  @ApiProperty({ description: 'Show date', example: '2025-11-10' })
  @Column({ name: 'ShowDate', type: 'date' })
  showDate: Date;

  @ApiProperty({ description: 'Show time', example: '19:30:00' })
  @Column({ name: 'ShowTime', type: 'time' })
  showTime: string;

  @ApiProperty({ description: 'Base ticket price', example: 80000 })
  @Column({ name: 'BasePrice', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @ApiProperty({ description: 'Showtime status', example: 'Scheduled' })
  @Column({ name: 'Status', type: 'varchar', length: 50, default: 'Scheduled' })
  status: string; // Scheduled, Cancelled, Completed

  // Relations
  @ManyToOne(() => Movie, { eager: false })
  @JoinColumn({ name: 'MovieId' })
  movie: Movie;

  @ManyToOne(() => Room, { eager: false })
  @JoinColumn({ name: 'RoomId' })
  room: Room;
}
