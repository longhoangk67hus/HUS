import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

/**
 * Payment Entity - Payment transactions and gateway integration
 * Stores payment details and webhook data
 * 
 * @author HNLong
 * @since 2025-11-24
 */
@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'PaymentId' })
  paymentId: number;

  @Column({ name: 'BookingId', type: 'int' })
  bookingId: number;

  @Column({
    name: 'PaymentMethod',
    type: 'enum',
    enum: ['CreditCard', 'DebitCard', 'EWallet', 'Cash', 'Points'],
  })
  paymentMethod: 'CreditCard' | 'DebitCard' | 'EWallet' | 'Cash' | 'Points';

  @Column({ name: 'PaymentGateway', type: 'varchar', length: 50, nullable: true })
  paymentGateway: string | null;

  @Column({ name: 'TransactionId', type: 'varchar', length: 255, nullable: true })
  transactionId: string | null;

  @Column({ name: 'IdempotencyKey', type: 'varchar', length: 255, nullable: true })
  idempotencyKey: string | null;

  @Column({ name: 'Amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'Currency', type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: ['Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Pending',
  })
  status: 'Pending' | 'Success' | 'Failed' | 'Refunded';

  @CreateDateColumn({ name: 'PaymentDate', type: 'datetime' })
  paymentDate: Date;

  @Column({ name: 'CreatedBy', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  modifiedDate: Date | null;

  @Column({ name: 'ModifiedBy', type: 'varchar', length: 100, nullable: true })
  modifiedBy: string | null;

  @Column({ name: 'RefundDate', type: 'datetime', nullable: true })
  refundDate: Date | null;

  @Column({ name: 'WebhookData', type: 'json', nullable: true })
  webhookData: any;

  @Column({ name: 'HMACSignature', type: 'varchar', length: 512, nullable: true })
  hmacSignature: string | null;

  @Column({ name: 'RetryCount', type: 'int', default: 0 })
  retryCount: number;

  // Relations
  @ManyToOne(() => Booking, { eager: false })
  @JoinColumn({ name: 'BookingId' })
  booking?: Booking;
}
