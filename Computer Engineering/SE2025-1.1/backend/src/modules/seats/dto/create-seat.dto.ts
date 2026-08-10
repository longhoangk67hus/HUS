import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsIn, Length, Min } from 'class-validator';

/**
 * DTO for creating a new seat
 */
export class CreateSeatDto {
  @ApiProperty({ description: 'Room ID', example: 1 })
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsNumber({}, { message: 'Room ID must be a number' })
  @Min(1, { message: 'Room ID must be at least 1' })
  roomId: number;

  @ApiProperty({ description: 'Seat type ID', example: 1 })
  @IsNotEmpty({ message: 'Seat type ID is required' })
  @IsNumber({}, { message: 'Seat type ID must be a number' })
  @Min(1, { message: 'Seat type ID must be at least 1' })
  seatTypeId: number;

  @ApiProperty({ description: 'Row letter (A-Z)', example: 'A', maxLength: 5 })
  @IsNotEmpty({ message: 'Row is required' })
  @IsString({ message: 'Row must be a string' })
  @Length(1, 5, { message: 'Row must be between 1 and 5 characters' })
  row: string;

  @ApiProperty({ description: 'Column number', example: 1 })
  @IsNotEmpty({ message: 'Column is required' })
  @IsNumber({}, { message: 'Column must be a number' })
  @Min(1, { message: 'Column must be at least 1' })
  col: number;

  @ApiProperty({
    description: 'Seat status',
    example: 'Available',
    enum: ['Available', 'Broken', 'Reserved'],
    required: false,
  })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['Available', 'Broken', 'Reserved'], {
    message: 'Status must be Available, Broken, or Reserved',
  })
  status?: string;
}
