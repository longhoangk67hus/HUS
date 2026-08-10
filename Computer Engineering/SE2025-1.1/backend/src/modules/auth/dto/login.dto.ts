import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user login
 */
export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'meomaybe', maxLength: 100 })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MaxLength(100)   
  userName!: string;

  @ApiProperty({ description: 'Password', example: 'password123', minLength: 6, maxLength: 100 })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password!: string;
}
