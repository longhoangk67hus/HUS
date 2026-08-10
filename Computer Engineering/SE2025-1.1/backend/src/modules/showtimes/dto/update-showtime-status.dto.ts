import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating showtime status
 * @author HNLong
 * @date 2025-11-06
 */
export class UpdateShowtimeStatusDto {
  @ApiProperty({
    description: 'Showtime status',
    example: 'Scheduled',
    enum: ['Scheduled', 'Cancelled', 'Completed'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['Scheduled', 'Cancelled', 'Completed'], {
    message: 'Status must be Scheduled, Cancelled, or Completed',
  })
  status: string;
}
