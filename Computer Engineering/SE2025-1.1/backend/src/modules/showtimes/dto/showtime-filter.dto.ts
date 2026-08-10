import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for filtering showtimes
 * Migrated from CinemaSystem.Common.DTOs.ShowtimeFilterRequest
 * @author HNLong
 * @date 2025-11-06
 */
export class ShowtimeFilterDto {
  @ApiProperty({ description: 'Movie ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Movie ID must be a number' })
  @Min(1, { message: 'Movie ID must be at least 1' })
  movieId?: number;

  @ApiProperty({ description: 'Theater ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Theater ID must be a number' })
  @Min(1, { message: 'Theater ID must be at least 1' })
  theaterId?: number;

  @ApiProperty({ description: 'Room ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Room ID must be a number' })
  @Min(1, { message: 'Room ID must be at least 1' })
  roomId?: number;

  @ApiProperty({ description: 'From date (YYYY-MM-DD)', example: '2025-11-01', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'From date must be a valid date string' })
  fromDate?: string;

  @ApiProperty({ description: 'To date (YYYY-MM-DD)', example: '2025-11-30', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'To date must be a valid date string' })
  toDate?: string;

  @ApiProperty({
    description: 'Showtime status',
    example: 'Scheduled',
    enum: ['Scheduled', 'Cancelled', 'Completed'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['Scheduled', 'Cancelled', 'Completed'], {
    message: 'Status must be Scheduled, Cancelled, or Completed',
  })
  status?: string;

  @ApiProperty({ description: 'Page number', example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page number must be a number' })
  @Min(1, { message: 'Page number must be at least 1' })
  pageNumber?: number;

  @ApiProperty({ description: 'Page size', example: 10, required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page size must be a number' })
  @Min(1, { message: 'Page size must be at least 1' })
  pageSize?: number;
}
