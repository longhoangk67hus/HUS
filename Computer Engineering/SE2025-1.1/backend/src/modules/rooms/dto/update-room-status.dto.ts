import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating room status
 * @author HNLong
 * @date 2025-11-06
 */
export class UpdateRoomStatusDto {
  @ApiProperty({
    description: 'Room status',
    example: 'Active',
    enum: ['Active', 'Inactive', 'Maintenance'],
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['Active', 'Inactive', 'Maintenance'], {
    message: 'Status must be Active, Inactive, or Maintenance',
  })
  status: string;
}
