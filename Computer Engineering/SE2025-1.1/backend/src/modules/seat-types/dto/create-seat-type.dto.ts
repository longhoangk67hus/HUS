import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max, Length } from 'class-validator';

/**
 * DTO for creating a new seat type
 */
export class CreateSeatTypeDto {
  @ApiProperty({
    description: 'Type name (Regular, VIP, Couple)',
    example: 'VIP',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Type name is required' })
  @IsString({ message: 'Type name must be a string' })
  @Length(1, 50, { message: 'Type name must be between 1 and 50 characters' })
  typeName: string;

  @ApiProperty({
    description: 'Price multiplier (1.0 = base price, 1.5 = 50% more expensive)',
    example: 1.5,
    minimum: 0.5,
    maximum: 10.0,
  })
  @IsNotEmpty({ message: 'Price multiplier is required' })
  @IsNumber({}, { message: 'Price multiplier must be a number' })
  @Min(0.5, { message: 'Price multiplier must be at least 0.5' })
  @Max(10.0, { message: 'Price multiplier must not exceed 10.0' })
  priceMultiplier: number;
}
