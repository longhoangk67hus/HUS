import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

/**
 * WebhookLog Entity - Audit log for payment gateway webhooks
 * Records all webhook calls for debugging and compliance
 * 
 * @author HNLong
 * @since 2025-11-24
 */
@Entity('webhook_log')
export class WebhookLog {
  @PrimaryGeneratedColumn({ name: 'WebhookId' })
  webhookId: number;

  @Column({ name: 'PaymentId', type: 'int', nullable: true })
  paymentId: number | null;

  @Column({ name: 'Gateway', type: 'varchar', length: 50 })
  gateway: string;

  @Column({ name: 'Event', type: 'varchar', length: 100 })
  event: string;

  @Column({ name: 'Payload', type: 'json' })
  payload: any;

  @Column({ name: 'Headers', type: 'json', nullable: true })
  headers: any;

  @Column({ name: 'HMACVerified', type: 'tinyint', width: 1, default: 0 })
  hmacVerified: boolean;

  @Column({ name: 'ProcessedAt', type: 'datetime', nullable: true })
  processedAt: Date | null;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  })
  status: 'Pending' | 'Success' | 'Failed';

  @Column({ name: 'ErrorMessage', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Payment, { eager: false })
  @JoinColumn({ name: 'PaymentId' })
  payment?: Payment;
}
