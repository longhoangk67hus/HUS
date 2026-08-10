import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new room type
 * Migrated from CinemaSystem.API CreateRoomType validation
 */
export class CreateRoomTypeDto {
  @ApiProperty({
    description: 'Type name of the room',
    example: 'VIP',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'Type name is required' })
  @MaxLength(50, { message: 'Type name must not exceed 50 characters' })
  typeName: string;

  @ApiProperty({
    description: 'Price multiplier for this room type',
    example: 1.5,
    minimum: 0
  })
  @IsNumber({}, { message: 'Price multiplier must be a number' })
  @IsNotEmpty({ message: 'Price multiplier is required' })
  @Min(0, { message: 'Price multiplier must be greater than or equal to 0' })
  priceMultiplier: number;

  @ApiProperty({
    description: 'Description of the room type features',
    example: 'Premium seats with extra legroom and reclining features',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}
