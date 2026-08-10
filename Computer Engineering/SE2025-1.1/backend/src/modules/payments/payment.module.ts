import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment, WebhookLog } from './entities';
import { BookingModule } from '../bookings/booking.module';
import { RedisService } from '../../common/services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, WebhookLog]),
    ConfigModule,
    forwardRef(() => BookingModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, RedisService],
  exports: [PaymentService],
})
export class PaymentModule {}
