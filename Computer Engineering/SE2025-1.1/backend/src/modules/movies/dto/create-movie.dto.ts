import { IsNotEmpty, IsString, IsInt, IsOptional, Min, MaxLength, IsEnum, IsDateString, IsArray, ArrayUnique } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieStatus } from '../movie-status.enum';

/**
 * DTO for creating a new movie
 */
export class CreateMovieDto {
  @ApiProperty({ description: 'Movie title', example: 'Avatar: The Way of Water', maxLength: 255 })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'avatar-the-way-of-water', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Movie description', example: 'Set more than a decade after the events of the first film...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Movie duration in minutes', example: 192, minimum: 1 })
  @IsNotEmpty({ message: 'Duration is required' })
  @IsInt()
  @Min(1)
  duration!: number;

  @ApiProperty({ description: 'Release date', example: '2024-12-16', type: 'string', format: 'date' })
  @IsNotEmpty({ message: 'Release date is required' })
  @IsDateString()
  releaseDate!: string;

  @ApiPropertyOptional({ description: 'Poster image URL', example: 'https://example.com/posters/avatar2.jpg', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  posterUrl?: string;

  @ApiPropertyOptional({ description: 'Trailer video URL', example: 'https://youtube.com/watch?v=xyz', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  trailerUrl?: string;

  @ApiPropertyOptional({ description: 'Director name', example: 'James Cameron', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  director?: string;

  @ApiPropertyOptional({ description: 'Cast members', example: 'Sam Worthington, Zoe Saldana, Sigourney Weaver' })
  @IsOptional()
  @IsString()
  cast?: string;

  @ApiPropertyOptional({ description: 'Movie language', example: 'English', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @ApiPropertyOptional({ description: 'Age rating', example: 'PG-13', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ageRating?: string;

  @ApiPropertyOptional({ 
    description: 'Movie status', 
    example: MovieStatus.NowShowing, 
    enum: MovieStatus 
  })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @ApiPropertyOptional({
    description: 'Genre IDs to assign to this movie',
    example: [1, 3, 7],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  genreIds?: number[];
}
