import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieStatus } from '../movie-status.enum';

/**
 * DTO for Movie with Genres
 * Used in search by genre responses
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class GenreDto {
  @ApiProperty({ description: 'Genre ID', example: 1 })
  genreId: number;

  @ApiProperty({ description: 'Genre name', example: 'Action' })
  genreName: string;
}

export class MovieWithGenresDto {
  @ApiProperty({ description: 'Movie ID', example: 1 })
  movieId: number;

  @ApiProperty({ description: 'Movie title', example: 'Avatar: The Way of Water' })
  title: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'avatar-the-way-of-water' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Movie description' })
  description?: string;

  @ApiProperty({ description: 'Duration in minutes', example: 192 })
  duration: number;

  @ApiProperty({ description: 'Release date', example: '2024-12-16' })
  releaseDate: Date;

  @ApiPropertyOptional({ description: 'Poster URL', example: 'https://example.com/posters/avatar2.jpg' })
  posterUrl?: string;

  @ApiPropertyOptional({ description: 'Trailer URL', example: 'https://youtube.com/watch?v=xyz' })
  trailerUrl?: string;

  @ApiPropertyOptional({ description: 'Director name', example: 'James Cameron' })
  director?: string;

  @ApiPropertyOptional({ description: 'Cast members', example: 'Sam Worthington, Zoe Saldana' })
  cast?: string;

  @ApiPropertyOptional({ description: 'Language', example: 'English' })
  language?: string;

  @ApiPropertyOptional({ description: 'Age rating', example: 'PG-13' })
  ageRating?: string;

  @ApiPropertyOptional({ description: 'Movie status', enum: MovieStatus })
  status?: MovieStatus;

  @ApiPropertyOptional({ description: 'Average rating', example: 4.5 })
  averageRating?: number;

  @ApiProperty({ description: 'Genres of this movie', type: [GenreDto] })
  genres: GenreDto[];
}

export class SearchByGenreResponseDto {
  @ApiProperty({ description: 'Genre information' })
  genre: GenreDto;

  @ApiProperty({ description: 'Movies in this genre', type: [MovieWithGenresDto] })
  movies: MovieWithGenresDto[];

  @ApiProperty({ description: 'Total count', example: 15 })
  totalCount: number;
}
