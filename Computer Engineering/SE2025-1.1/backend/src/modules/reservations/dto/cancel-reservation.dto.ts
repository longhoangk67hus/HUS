import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

/**
 * DTO for canceling a reservation
 */
export class CancelReservationDto {
  @ApiProperty({
    description: 'Reservation ID to cancel',
    example: 123,
    minimum: 1,
  })
  @IsInt({ message: 'ReservationId phải là số nguyên' })
  @Min(1, { message: 'ReservationId phải lớn hơn 0' })
  reservationId: number;
}
