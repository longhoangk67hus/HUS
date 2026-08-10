import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsString, IsOptional, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for creating a manual booking at the counter
 * Admin can book tickets for walk-in customers without online payment
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class CreateManualBookingDto {
  @ApiProperty({
    description: 'ID of the showtime',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  showtimeId: number;

  @ApiProperty({
    description: 'Array of seat IDs to book',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  seatIds: number[];

  @ApiProperty({
    description: 'Customer name (optional for walk-in)',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  customerName?: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '0912345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Phone number must be 10-11 digits',
  })
  customerPhone: string;

  @ApiProperty({
    description: 'Payment method at counter',
    enum: ['Cash', 'Card'],
    example: 'Cash',
  })
  @IsNotEmpty()
  @IsEnum(['Cash', 'Card'])
  paymentMethod: 'Cash' | 'Card';

  @ApiProperty({
    description: 'Optional admin note',
    example: 'Customer requested seats near exit',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;

  @ApiProperty({
    description: 'Optional reservationId to link an existing reservation',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  reservationId?: number;
}
