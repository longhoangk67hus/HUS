import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a booking from a reservation
 * Used after user confirms payment intent
 */
export class CreateBookingDto {
  @ApiProperty({
    description: 'Reservation ID to convert to booking',
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;

  @ApiProperty({
    description: 'Idempotency key to prevent double booking (UUID recommended)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
