import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsArray,
  IsOptional,
  IsString,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
} from 'class-validator';

/**
 * DTO for creating a new seat reservation
 */
export class CreateReservationDto {
  @ApiProperty({
    description: 'Showtime ID',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'ShowtimeId phải là số nguyên' })
  @Min(1, { message: 'ShowtimeId phải lớn hơn 0' })
  showtimeId: number;

  @ApiProperty({
    description: 'Array of seat IDs to reserve',
    example: [12, 13, 14],
    type: [Number],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray({ message: 'SeatIds phải là mảng' })
  @ArrayMinSize(1, { message: 'Vui lòng chọn ít nhất 1 ghế' })
  @ArrayMaxSize(10, { message: 'Chỉ được chọn tối đa 10 ghế' })
  @IsInt({ each: true, message: 'Mỗi SeatId phải là số nguyên' })
  seatIds: number[];

  @ApiPropertyOptional({
    description: 'User ID (for logged-in users)',
    example: 'user_12345',
  })
  @IsOptional()
  @IsString({ message: 'UserId phải là chuỗi' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Session ID (for anonymous users)',
    example: 'sess_abcd1234',
  })
  @IsOptional()
  @IsString({ message: 'SessionId phải là chuỗi' })
  sessionId?: string;
}
