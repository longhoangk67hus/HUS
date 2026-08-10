import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Seat } from '../../seats/entities/seat.entity';

/**
 * BookingSeat Entity - Junction table for Booking and Seat
 * Stores individual seat prices in booking
 * 
 * @author HNLong
 * @since 2025-11-08
 */
@Entity('booking_seat')
export class BookingSeat {
  @PrimaryGeneratedColumn({ name: 'BookingSeatId' })
  bookingSeatId: number;

  @Column({ name: 'BookingId', type: 'int' })
  bookingId: number;

  @Column({ name: 'SeatId', type: 'int' })
  seatId: number;

  @Column({ name: 'Price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ name: 'CreatedDate', type: 'datetime' })
  createdDate: Date;

  @Column({ name: 'CreatedBy', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  modifiedDate: Date | null;

  @Column({ name: 'ModifiedBy', type: 'varchar', length: 100, nullable: true })
  modifiedBy: string | null;

  // Relations
  @ManyToOne(() => Booking, booking => booking.bookingSeats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => Seat, { eager: false })
  @JoinColumn({ name: 'SeatId' })
  seat?: Seat;
}
