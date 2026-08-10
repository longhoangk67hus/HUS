import { IsNotEmpty, IsString, IsEmail, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TheaterStatus } from '../entities/theater-status.enum';

/**
 * DTO for creating a new theater
 */
export class CreateTheaterDto {
  @ApiProperty({ description: 'Theater code', example: 'CGV-HN01', maxLength: 50 })
  @IsNotEmpty({ message: 'Theater code is required' })
  @IsString()
  @MaxLength(50)
  theaterCode!: string;

  @ApiProperty({ description: 'Theater name', example: 'CGV Vincom Center', maxLength: 200 })
  @IsNotEmpty({ message: 'Theater name is required' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: 'Theater address', example: '191 Ba Trieu, Hai Ba Trung', maxLength: 500 })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString()
  @MaxLength(500)
  address!: string;

  @ApiProperty({ description: 'City', example: 'Hanoi', maxLength: 100 })
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ description: 'State/Province', example: 'Hanoi', maxLength: 100 })
  @IsNotEmpty({ message: 'State is required' })
  @IsString()
  @MaxLength(100)
  state!: string;

  @ApiProperty({ description: 'Postal code', example: '100000', maxLength: 20 })
  @IsNotEmpty({ message: 'Postal code is required' })
  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({ description: 'Contact phone', example: '1900-6017', maxLength: 20 })
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ description: 'Contact email', example: 'info@cgv.vn', maxLength: 100 })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100)
  email!: string;

  @ApiPropertyOptional({
    description: 'Theater status',
    enum: TheaterStatus,
    example: TheaterStatus.Active,
    default: TheaterStatus.Active,
  })
  @IsOptional()
  @IsEnum(TheaterStatus, { message: 'Invalid theater status' })
  status?: TheaterStatus;
}
