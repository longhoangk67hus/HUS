import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for user registration
 */
export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'newuser', maxLength: 100 })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MaxLength(100)
  userName!: string;

  @ApiProperty({ description: 'Password', example: 'SecurePassword123', minLength: 6, maxLength: 100 })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password!: string;

  @ApiProperty({ description: 'Full name', example: 'Nguyễn Văn B', maxLength: 100 })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ description: 'Email address', example: 'newuser@example.com', maxLength: 255 })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255)
  email!: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '0987654321', maxLength: 12 })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  phoneNumber?: string;
}
