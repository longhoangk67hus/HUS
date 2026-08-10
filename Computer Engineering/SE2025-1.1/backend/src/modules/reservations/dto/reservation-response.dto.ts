import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for reservation operations
 */
export class ReservationResponseDto {
  @ApiProperty({ description: 'Reservation ID', example: 123 })
  reservationId: number;

  @ApiProperty({ description: 'Showtime ID', example: 1 })
  showtimeId: number;

  @ApiProperty({ description: 'Reserved seat IDs', example: [12, 13, 14] })
  seatIds: number[];

  @ApiProperty({
    description: 'Reservation status',
    enum: ['Pending', 'Confirmed', 'Expired', 'Cancelled'],
    example: 'Pending',
  })
  status: string;

  @ApiProperty({ description: 'When reservation was created', example: '2025-11-06T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'When reservation expires', example: '2025-11-06T10:10:00Z' })
  expiresAt: Date;

  @ApiProperty({ description: 'Remaining seconds before expiry', example: 580 })
  remainingSeconds: number;
}
