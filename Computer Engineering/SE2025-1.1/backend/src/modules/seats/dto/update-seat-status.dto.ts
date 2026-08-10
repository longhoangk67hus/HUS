import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating seat status
 */
export class UpdateSeatStatusDto {
  @ApiProperty({
    description: 'Seat status',
    example: 'Available',
    enum: ['Available', 'Broken', 'Reserved'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['Available', 'Broken', 'Reserved'], {
    message: 'Status must be Available, Broken, or Reserved',
  })
  status: string;
}
