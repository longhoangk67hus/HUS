import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsInt, IsDate, IsOptional, Min, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieStatus } from './movie-status.enum';

/**
 * Movie Entity
 * Migrated from CinemaSystem.Common.Entities.Movie.cs
 * Note: Không extends BaseEntity vì Movie có MovieId riêng
 */
@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn({ name: 'MovieId' })
  @ApiProperty({ description: 'Movie ID', example: 1 })
  @IsInt()
  movieId!: number;

  @Column({ name: 'Title', length: 255 })
  @ApiProperty({ description: 'Movie title', example: 'Avatar: The Way of Water', maxLength: 255 })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @Column({ name: 'Slug', length: 255, nullable: true, unique: true })
  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'avatar-the-way-of-water', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Movie description', example: 'Set more than a decade after the events of the first film...' })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ name: 'Duration' })
  @ApiProperty({ description: 'Movie duration in minutes', example: 192, minimum: 1 })
  @IsNotEmpty({ message: 'Duration is required' })
  @IsInt()
  @Min(1)
  duration!: number;

  @Column({ name: 'ReleaseDate', type: 'date' })
  @ApiProperty({ description: 'Release date', example: '2024-12-16', type: 'string', format: 'date' })
  @IsNotEmpty({ message: 'Release date is required' })
  @IsDate()
  releaseDate!: Date;

  @Column({ name: 'PosterUrl', length: 500, nullable: true })
  @ApiPropertyOptional({ description: 'Poster image URL', example: 'https://example.com/posters/avatar2.jpg', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  posterUrl?: string;

  @Column({ name: 'TrailerUrl', length: 500, nullable: true })
  @ApiPropertyOptional({ description: 'Trailer video URL', example: 'https://youtube.com/watch?v=xyz', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  trailerUrl?: string;

  @Column({ name: 'Director', length: 255, nullable: true })
  @ApiPropertyOptional({ description: 'Director name', example: 'James Cameron', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  director?: string;

  @Column({ name: 'Cast', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Cast members', example: 'Sam Worthington, Zoe Saldana, Sigourney Weaver' })
  @IsOptional()
  @IsString()
  cast?: string;

  @Column({ name: 'Language', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Movie language', example: 'English', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @Column({ name: 'AgeRating', length: 10, nullable: true })
  @ApiPropertyOptional({ description: 'Age rating', example: 'PG-13', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ageRating?: string;

  @Column({ name: 'Status', type: 'enum', enum: MovieStatus, nullable: true })
  @ApiPropertyOptional({ 
    description: 'Movie status', 
    example: MovieStatus.NowShowing, 
    enum: MovieStatus 
  })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @Column({ name: 'AverageRating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Average rating', example: 4.5, minimum: 0, maximum: 5 })
  @IsOptional()
  averageRating?: number;

  // Audit fields (from BaseEntity pattern)
  @Column({ name: 'CreatedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Created date' })
  createdDate?: Date;

  @Column({ name: 'CreatedBy', length: 255, nullable: true })
  @ApiPropertyOptional({ description: 'Created by user' })
  createdBy?: string;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Last modified date' })
  modifiedDate?: Date;

  @Column({ name: 'ModifiedBy', length: 255, nullable: true })
  @ApiPropertyOptional({ description: 'Last modified by user' })
  modifiedBy?: string;
}
