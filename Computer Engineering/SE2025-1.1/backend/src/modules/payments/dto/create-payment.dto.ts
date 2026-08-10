import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating payment intent
 * Used to initiate payment flow with gateway
 */
export class CreatePaymentDto {
  @ApiProperty({
    description: 'Booking ID to pay for',
    example: 456,
  })
  @IsNumber()
  @IsNotEmpty()
  bookingId: number;

  @ApiProperty({
    description: 'Payment method',
    enum: ['CreditCard', 'DebitCard', 'EWallet', 'Cash', 'Points'],
    example: 'EWallet',
  })
  @IsEnum(['CreditCard', 'DebitCard', 'EWallet', 'Cash', 'Points'])
  @IsNotEmpty()
  paymentMethod: 'CreditCard' | 'DebitCard' | 'EWallet' | 'Cash' | 'Points';

  @ApiPropertyOptional({
    description: 'Payment gateway (VNPay, Stripe, etc.)',
    example: 'VNPay',
  })
  @IsString()
  @IsOptional()
  paymentGateway?: string;

  @ApiProperty({
    description: 'Idempotency key to prevent double charge',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiPropertyOptional({
    description: 'Return URL after payment (for redirect gateways)',
    example: 'https://cinema.com/booking/result',
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}
