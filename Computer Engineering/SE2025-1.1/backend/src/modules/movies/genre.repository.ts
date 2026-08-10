import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';

/**
 * Genre Repository
 * Database operations for Genre entity
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@Injectable()
export class GenreRepository {
  constructor(
    @InjectRepository(Genre)
    private repository: Repository<Genre>,
  ) {}

  /**
   * Get all genres
   */
  async findAll(): Promise<Genre[]> {
    return this.repository.find({
      order: { genreName: 'ASC' }
    });
  }

  /**
   * Get genre by ID
   */
  async findById(id: number): Promise<Genre | null> {
    return this.repository.findOne({ where: { genreId: id } });
  }

  /**
   * Get genre by name (exact or partial match)
   */
  async findByName(name: string): Promise<Genre | null> {
    return this.repository
      .createQueryBuilder('genre')
      .where('genre.GenreName = :name OR genre.GenreName LIKE :partialName', { 
        name, 
        partialName: `%${name}%` 
      })
      .orderBy('CASE WHEN genre.GenreName = :name THEN 0 ELSE 1 END', 'ASC')
      .setParameter('name', name)
      .getOne();
  }

  /**
   * Search genres by name
   */
  async searchByName(keyword: string): Promise<Genre[]> {
    return this.repository
      .createQueryBuilder('genre')
      .where('genre.GenreName LIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('genre.GenreName', 'ASC')
      .getMany();
  }

  /**
   * Create genre
   */
  create(data: Partial<Genre>): Genre {
    return this.repository.create(data);
  }

  /**
   * Save genre
   */
  async save(genre: Genre): Promise<Genre> {
    return this.repository.save(genre);
  }

  /**
   * Delete genre
   */
  async delete(id: number): Promise<void> {
    await this.repository.delete({ genreId: id });
  }

  /**
   * Get genres by movie ID
   * Join with movie_genre table
   */
  async findByMovieId(movieId: number): Promise<Genre[]> {
    return this.repository
      .createQueryBuilder('genre')
      .innerJoin('movie_genre', 'mg', 'mg.GenreId = genre.GenreId')
      .where('mg.MovieId = :movieId', { movieId })
      .orderBy('genre.GenreName', 'ASC')
      .getMany();
  }

  /**
   * Count movies in genre
   */
  async countMoviesByGenreId(genreId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('genre')
      .innerJoin('movie_genre', 'mg', 'mg.GenreId = genre.GenreId')
      .where('genre.GenreId = :genreId', { genreId })
      .select('COUNT(DISTINCT mg.MovieId)', 'count')
      .getRawOne();
    
    return parseInt(result?.count || '0', 10);
  }
}
