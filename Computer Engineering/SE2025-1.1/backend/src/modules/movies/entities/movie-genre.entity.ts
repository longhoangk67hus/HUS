import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Movie } from '../movie.entity';
import { Genre } from './genre.entity';

/**
 * MovieGenre Entity (Junction Table)
 * Many-to-Many relationship between Movies and Genres
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Entity('movie_genre')
export class MovieGenre {
  @PrimaryGeneratedColumn({ name: 'MovieGenreId' })
  @ApiProperty({ description: 'Movie-Genre mapping ID', example: 1 })
  movieGenreId: number;

  @Column({ name: 'MovieId' })
  @ApiProperty({ description: 'Movie ID', example: 1 })
  movieId: number;

  @Column({ name: 'GenreId' })
  @ApiProperty({ description: 'Genre ID', example: 3 })
  genreId: number;

  @Column({ name: 'CreatedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Created date' })
  createdDate?: Date;

  @Column({ name: 'CreatedBy', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Created by user' })
  createdBy?: string;

  @Column({ name: 'ModifiedDate', type: 'datetime', nullable: true })
  @ApiPropertyOptional({ description: 'Last modified date' })
  modifiedDate?: Date;

  @Column({ name: 'ModifiedBy', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Last modified by user' })
  modifiedBy?: string;

  // Relations
  @ManyToOne(() => Movie, { eager: false })
  @JoinColumn({ name: 'MovieId' })
  movie?: Movie;

  @ManyToOne(() => Genre, genre => genre.movieGenres, { eager: false })
  @JoinColumn({ name: 'GenreId' })
  genre?: Genre;
}
