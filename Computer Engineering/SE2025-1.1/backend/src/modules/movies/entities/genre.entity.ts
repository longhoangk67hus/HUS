import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieGenre } from './movie-genre.entity';

/**
 * Genre Entity
 * Represents movie genres/categories (Action, Drama, Comedy, etc.)
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Entity('genre')
export class Genre {
  @PrimaryGeneratedColumn({ name: 'GenreId' })
  @ApiProperty({ description: 'Genre ID', example: 1 })
  genreId: number;

  @Column({ name: 'GenreName', length: 50, unique: true })
  @ApiProperty({ description: 'Genre name', example: 'Action', maxLength: 50 })
  genreName: string;

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
  @OneToMany(() => MovieGenre, movieGenre => movieGenre.genre)
  movieGenres?: MovieGenre[];
}
