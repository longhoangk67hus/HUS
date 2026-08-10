import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { MovieStatus } from './movie-status.enum';

/**
 * Movie Repository
 * Migrated from CinemaSystem.DL.MovieDL.cs
 * Note: Không extends BaseRepository vì Movie có cấu trúc riêng
 */
@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private repository: Repository<Movie>,
  ) {}

  /**
   * Get all movies
   */
  async findAll(): Promise<Movie[]> {
    return this.repository.find();
  }

  /**
   * Get movie by ID
   */
  async findById(id: number): Promise<Movie | null> {
    return this.repository.findOne({ where: { movieId: id } });
  }

  /**
   * Create movie entity (not saved yet)
   */
  create(data: Partial<Movie>): Movie {
    return this.repository.create(data);
  }

  /**
   * Save movie
   */
  async save(movie: Movie): Promise<Movie> {
    return this.repository.save(movie);
  }

  /**
   * Delete movie
   */
  async delete(id: number): Promise<DeleteResult> {
    return this.repository.delete({ movieId: id });
  }

  /**
   * Get movie by slug
   * Searches flexibly: exact match prioritized, then partial match
   */
  async findBySlug(slug: string): Promise<Movie | null> {
    return this.repository
      .createQueryBuilder('movie')
      .where('movie.Slug = :slug OR movie.Slug LIKE :partialSlug', { 
        slug, 
        partialSlug: `%${slug}%` 
      })
      // Prioritize exact match: ORDER BY checks if slug equals exactly
      .orderBy('CASE WHEN movie.Slug = :slug THEN 0 ELSE 1 END', 'ASC')
      .setParameter('slug', slug)
      .getOne();
  }

  /**
   * Get movies by status
   */
  async findByStatus(status: MovieStatus): Promise<Movie[]> {
    return this.repository.find({ where: { status } });
  }

  /**
   * Get now showing movies
   */
  async findNowShowing(): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder('movie')
      .where('movie.Status = :status', { status: MovieStatus.NowShowing })
      .orderBy('movie.ReleaseDate', 'DESC')
      .getMany();
  }

  /**
   * Get coming soon movies
   */
  async findComingSoon(): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder('movie')
      .where('movie.Status = :status', { status: MovieStatus.ComingSoon })
      .orderBy('movie.ReleaseDate', 'ASC')
      .getMany();
  }

  /**
   * Search movies by title
   */
  async searchByTitle(keyword: string): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder('movie')
      .where('movie.Title LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  /**
   * Search movies by genre ID
   * Join with movie_genre and genre tables
   */
  async findByGenreId(genreId: number): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder('movie')
      .innerJoin('movie_genre', 'mg', 'mg.MovieId = movie.MovieId')
      .where('mg.GenreId = :genreId', { genreId })
      .orderBy('movie.ReleaseDate', 'DESC')
      .getMany();
  }

  /**
   * Search movies by genre name
   * Join with movie_genre and genre tables
   */
  async findByGenreName(genreName: string): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder('movie')
      .innerJoin('movie_genre', 'mg', 'mg.MovieId = movie.MovieId')
      .innerJoin('genre', 'g', 'g.GenreId = mg.GenreId')
      .where('g.GenreName LIKE :genreName', { genreName: `%${genreName}%` })
      .orderBy('movie.ReleaseDate', 'DESC')
      .getMany();
  }

  /**
   * Get movies with their genres (full data with join)
   * Used for detailed genre search responses
   */
  async findWithGenres(movieIds?: number[]): Promise<any[]> {
    const query = this.repository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie_genre', 'mg', 'mg.MovieId = movie.MovieId')
      .leftJoinAndSelect('genre', 'g', 'g.GenreId = mg.GenreId')
      .select([
        'movie.*',
        'GROUP_CONCAT(DISTINCT g.GenreId) as genreIds',
        'GROUP_CONCAT(DISTINCT g.GenreName) as genreNames'
      ])
      .groupBy('movie.MovieId');

    if (movieIds && movieIds.length > 0) {
      query.where('movie.MovieId IN (:...movieIds)', { movieIds });
    }

    return query.getRawMany();
  }
}

