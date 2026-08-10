import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, Min, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new room
 * Migrated from CinemaSystem.API CreateRoom validation
 */
export class CreateRoomDto {
  @ApiProperty({
    description: 'Room name or number',
    example: 'Room 1A',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  @MaxLength(100, { message: 'Room name must not exceed 100 characters' })
  roomName: string;

  @ApiProperty({
    description: 'Room type ID (Default: 1 for Standard room)',
    example: 1,
    default: 1
  })
  @IsInt({ message: 'Room type ID must be an integer' })
  @IsOptional()
  @Min(1, { message: 'Room type ID must be greater than 0' })
  roomTypeId?: number = 1;

  @ApiProperty({
    description: 'Theater ID where this room is located',
    example: 1,
    required: false
  })
  @IsInt({ message: 'Theater ID must be an integer' })
  @IsOptional()
  @Min(1, { message: 'Theater ID must be greater than 0' })
  theaterId?: number;

  @ApiProperty({
    description: 'Total number of seats in the room',
    example: 150,
    minimum: 1
  })
  @IsInt({ message: 'Total seats must be an integer' })
  @IsNotEmpty({ message: 'Total seats is required' })
  @Min(1, { message: 'Total seats must be at least 1' })
  totalSeats: number;

  @ApiProperty({
    description: 'Room status',
    example: 'Active',
    enum: ['Active', 'Maintenance', 'Inactive'],
    required: false,
    default: 'Active'
  })
  @IsString()
  @IsOptional()
  @IsIn(['Active', 'Maintenance', 'Inactive'], { 
    message: 'Status must be Active, Maintenance, or Inactive' 
  })
  status?: string;
}
