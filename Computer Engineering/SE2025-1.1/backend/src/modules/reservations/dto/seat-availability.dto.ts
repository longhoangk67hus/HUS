import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for seat availability check
 */
export class SeatAvailabilityDto {
  @ApiProperty({ description: 'Seat ID', example: 12 })
  seatId: number;

  @ApiProperty({ description: 'Whether seat is available', example: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Whether seat is locked in Redis', example: false })
  isLocked: boolean;

  @ApiProperty({ description: 'Remaining lock time in seconds', example: 0 })
  remainingSeconds: number;

  @ApiProperty({ description: 'Who locked the seat', example: 'user_12345', required: false })
  lockedBy?: string;
}

/**
 * Response for checking multiple seats availability
 */
export class SeatsAvailabilityResponseDto {
  @ApiProperty({ description: 'Showtime ID', example: 1 })
  showtimeId: number;

  @ApiProperty({ description: 'Seat availability details', type: [SeatAvailabilityDto] })
  seats: SeatAvailabilityDto[];

  @ApiProperty({ description: 'Total seats checked', example: 10 })
  totalSeats: number;

  @ApiProperty({ description: 'Number of available seats', example: 8 })
  availableCount: number;

  @ApiProperty({ description: 'Number of locked seats', example: 2 })
  lockedCount: number;
}
