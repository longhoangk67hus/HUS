import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Showtime } from '../../showtimes/entities/showtime.entity';

/**
 * Reservation Entity - Temporary seat holding
 * Manages seat locks with TTL to prevent double booking
 * 
 * @author HNLong
 * @since 2025-11-06
 */
@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn({ name: 'ReservationId' })
  reservationId: number;

  @Column({ name: 'ShowtimeId', type: 'int' })
  showtimeId: number;

  @Column({ name: 'UserId', type: 'varchar', length: 255, nullable: true })
  userId: string | null;

  @Column({ name: 'SessionId', type: 'varchar', length: 255, nullable: true })
  sessionId: string | null;

  @Column({ name: 'SeatIds', type: 'text', comment: 'Comma-separated seat IDs (e.g., "12,13,14")' })
  seatIds: string;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: ['Pending', 'Confirmed', 'Expired', 'Cancelled'],
    default: 'Pending',
  })
  status: 'Pending' | 'Confirmed' | 'Expired' | 'Cancelled';

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'ExpiresAt', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'CompletedAt', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'IpAddress', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'UserAgent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'BookingId', type: 'int', nullable: true, comment: 'Link to final booking after payment' })
  bookingId: number | null;

  @Column({ name: 'IdempotencyKey', type: 'varchar', length: 255, nullable: true, comment: 'For confirm operation to prevent double processing' })
  idempotencyKey: string | null;

  // Relations
  @ManyToOne(() => Showtime, { eager: false })
  @JoinColumn({ name: 'ShowtimeId' })
  showtime?: Showtime;
}
