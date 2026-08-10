import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsString, IsIn, Min, Matches } from 'class-validator';

/**
 * DTO for creating a new showtime
 * @author HNLong
 * @date 2025-11-06
 */
export class CreateShowtimeDto {
  @ApiProperty({ description: 'Movie ID', example: 1 })
  @IsNotEmpty({ message: 'Movie ID is required' })
  @IsNumber({}, { message: 'Movie ID must be a number' })
  @Min(1, { message: 'Movie ID must be at least 1' })
  movieId: number;

  @ApiProperty({ description: 'Room ID', example: 1 })
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsNumber({}, { message: 'Room ID must be a number' })
  @Min(1, { message: 'Room ID must be at least 1' })
  roomId: number;

  @ApiProperty({ description: 'Show date (YYYY-MM-DD)', example: '2025-11-10' })
  @IsNotEmpty({ message: 'Show date is required' })
  @IsDateString({}, { message: 'Show date must be a valid date string (YYYY-MM-DD)' })
  showDate: string;

  @ApiProperty({ description: 'Show time (HH:mm:ss)', example: '19:30:00' })
  @IsNotEmpty({ message: 'Show time is required' })
  @IsString({ message: 'Show time must be a string' })
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/, {
    message: 'Show time must be in format HH:mm:ss',
  })
  showTime: string;

  @ApiProperty({ description: 'Base ticket price', example: 80000 })
  @IsNotEmpty({ message: 'Base price is required' })
  @IsNumber({}, { message: 'Base price must be a number' })
  @Min(0, { message: 'Base price must be at least 0' })
  basePrice: number;

  @ApiProperty({
    description: 'Showtime status',
    example: 'Scheduled',
    enum: ['Scheduled', 'Cancelled', 'Completed'],
    required: false,
  })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['Scheduled', 'Cancelled', 'Completed'], {
    message: 'Status must be Scheduled, Cancelled, or Completed',
  })
  status?: string;
}
