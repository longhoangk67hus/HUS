import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { BookingSeat } from './booking-seat.entity';

/**
 * Booking Entity - Permanent seat booking after payment
 * Links to Reservation (temporary hold) and Payment records
 * 
 * @author HNLong
 * @since 2025-11-08
 */
@Entity('booking')
export class Booking {
  @PrimaryGeneratedColumn({ name: 'BookingId' })
  bookingId: number;

  @Column({ name: 'UserId', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'ShowtimeId', type: 'int' })
  showtimeId: number;

  @Column({ name: 'ReservationId', type: 'int', nullable: true })
  reservationId: number | null;

  @Column({ name: 'BookingCode', type: 'varchar', length: 50, unique: true })
  bookingCode: string;

  @Column({ name: 'TotalAmount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'DiscountAmount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'FinalAmount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ name: 'PointsEarned', type: 'int', default: 0 })
  pointsEarned: number;

  @Column({ name: 'PointsUsed', type: 'int', default: 0 })
  pointsUsed: number;

  @Column({ name: 'DiscountCodeId', type: 'int', nullable: true })
  discountCodeId: number | null;

  @Column({ name: 'IdempotencyKey', type: 'varchar', length: 255, nullable: true })
  idempotencyKey: string | null;

  @Column({ name: 'QRCode', type: 'text', nullable: true })
  qrCode: string | null;

  @Column({ name: 'TicketPDF', type: 'varchar', length: 500, nullable: true })
  ticketPDF: string | null;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  })
  status: 'Pending' | 'Confirmed' | 'Cancelled';

  @CreateDateColumn({ name: 'BookingDate', type: 'datetime' })
  bookingDate: Date;

  @Column({ name: 'CreatedBy', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  modifiedDate: Date | null;

  @Column({ name: 'ModifiedBy', type: 'varchar', length: 100, nullable: true })
  modifiedBy: string | null;

  @Column({ name: 'ExpiryDate', type: 'datetime' })
  expiryDate: Date;

  // Manual booking fields
  @Column({ name: 'IsManualBooking', type: 'boolean', default: false })
  isManualBooking: boolean;

  @Column({ name: 'PaymentMethod', type: 'enum', enum: ['VNPay', 'Cash', 'Card'], nullable: true })
  paymentMethod: 'VNPay' | 'Cash' | 'Card' | null;

  @Column({ name: 'CustomerName', type: 'varchar', length: 255, nullable: true })
  customerName: string | null;

  @Column({ name: 'CustomerPhone', type: 'varchar', length: 20, nullable: true })
  customerPhone: string | null;

  @Column({ name: 'AdminNote', type: 'text', nullable: true })
  adminNote: string | null;

  // Relations
  @ManyToOne(() => Showtime, { eager: false })
  @JoinColumn({ name: 'ShowtimeId' })
  showtime?: Showtime;

  @ManyToOne(() => Reservation, { eager: false })
  @JoinColumn({ name: 'ReservationId' })
  reservation?: Reservation;

  @OneToMany(() => BookingSeat, bookingSeat => bookingSeat.booking, { cascade: true })
  bookingSeats?: BookingSeat[];
}
