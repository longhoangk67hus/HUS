import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RegistrationEmailService, BookingEmailService } from './services';

/**
 * Email Module
 * Handles all email-related services
 */
@Module({
  imports: [ConfigModule],
  providers: [RegistrationEmailService, BookingEmailService],
  exports: [RegistrationEmailService, BookingEmailService],
})
export class EmailModule {}
