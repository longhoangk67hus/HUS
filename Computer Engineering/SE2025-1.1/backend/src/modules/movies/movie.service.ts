import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '@base-core/dto/service-response.dto';
import { Movie } from './movie.entity';
import { MovieRepository } from './movie.repository';
import { GenreRepository } from './genre.repository';
import { CreateMovieDto, UpdateMovieDto, MovieWithGenresDto, SearchByGenreResponseDto, GenreDto } from './dto';
import { generateSlug } from './utils/slug.utils';
import { Genre } from './entities/genre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieGenre } from './entities/movie-genre.entity';

/**
 * Movie Service
 * Migrated from CinemaSystem.BL.MovieBL.cs
 */
@Injectable()
export class MovieService {
  constructor(
    private movieRepository: MovieRepository,
    private genreRepository: GenreRepository,
    @InjectRepository(MovieGenre)
    private movieGenreRepository: Repository<MovieGenre>,
  ) {}

  private async replaceMovieGenres(movieId: number, genreIds: number[]): Promise<void> {
    const distinctGenreIds = Array.from(
      new Set((genreIds || []).filter((id) => typeof id === 'number' && Number.isFinite(id) && id > 0)),
    );

    await this.movieGenreRepository.delete({ movieId });

    if (distinctGenreIds.length === 0) return;

    const now = new Date();
    const mappings = distinctGenreIds.map((genreId) =>
      this.movieGenreRepository.create({
        movieId,
        genreId,
        createdDate: now,
        modifiedDate: now,
      }),
    );

    await this.movieGenreRepository.save(mappings);
  }

  /**
   * Get all movies
   */
  async getAllMovies(): Promise<ServiceResponse<Movie[]>> {
    try {
      const movies = await this.movieRepository.findAll();
      return ServiceResponse.success(movies);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get movie by ID
   */
  async getMovieById(id: number): Promise<ServiceResponse<Movie>> {
    try {
      const movie = await this.movieRepository.findById(id);
      if (!movie) {
        return ServiceResponse.error('Movie not found', 404);
      }
      return ServiceResponse.success(movie);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get movie by slug
   */
  async getMovieBySlug(slug: string): Promise<ServiceResponse<Movie>> {
    try {
      const movie = await this.movieRepository.findBySlug(slug);
      if (!movie) {
        return ServiceResponse.error('Movie not found', 404);
      }
      return ServiceResponse.success(movie);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get now showing movies
   */
  async getNowShowingMovies(): Promise<ServiceResponse<Movie[]>> {
    try {
      const movies = await this.movieRepository.findNowShowing();
      return ServiceResponse.success(movies);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get coming soon movies
   */
  async getComingSoonMovies(): Promise<ServiceResponse<Movie[]>> {
    try {
      const movies = await this.movieRepository.findComingSoon();
      return ServiceResponse.success(movies);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Search movies
   */
  async searchMovies(keyword: string): Promise<ServiceResponse<Movie[]>> {
    try {
      const movies = await this.movieRepository.searchByTitle(keyword);
      return ServiceResponse.success(movies);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Create movie
   */
  async createMovie(movieData: CreateMovieDto): Promise<ServiceResponse<Movie>> {
    try {
      // Auto-generate slug if not provided
      const slug = movieData.slug || generateSlug(movieData.title);

      const { genreIds, ...movieFields } = movieData as any;
      
      // Convert DTO to Entity (handle Date conversion)
      const movieEntity: Partial<Movie> = {
        ...movieFields,
        slug,
        releaseDate: new Date(movieFields.releaseDate),
      };
      
      const movie = this.movieRepository.create(movieEntity);
      const saved = await this.movieRepository.save(movie);

      if (Array.isArray(genreIds)) {
        try {
          await this.replaceMovieGenres(saved.movieId, genreIds);
        } catch (e: any) {
          return ServiceResponse.error(e?.message || 'Failed to set movie genres', 400);
        }
      }

      return ServiceResponse.success(saved);
    } catch (error: any) {
      // Handle duplicate slug error
      if (error.code === 'ER_DUP_ENTRY') {
        return ServiceResponse.error('Slug already exists. Please use a different slug.', 409);
      }
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Update movie
   */
  async updateMovie(id: number, movieData: UpdateMovieDto): Promise<ServiceResponse<Movie>> {
    try {
      const existingMovie = await this.movieRepository.findById(id);
      if (!existingMovie) {
        return ServiceResponse.error('Movie not found', 404);
      }

      // Auto-regenerate slug if title is updated but slug is not provided
      let slug = movieData.slug;
      if (movieData.title && !movieData.slug) {
        slug = generateSlug(movieData.title);
      }

      // Convert DTO to Entity (handle Date conversion if releaseDate is provided)
      const { releaseDate, genreIds, ...restData } = movieData as any;
      const updateData: Partial<Movie> = {
        ...restData,
        ...(slug && { slug }),
        ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      };

      Object.assign(existingMovie, updateData);
      const updated = await this.movieRepository.save(existingMovie);

      if (Array.isArray(genreIds)) {
        try {
          await this.replaceMovieGenres(updated.movieId, genreIds);
        } catch (e: any) {
          return ServiceResponse.error(e?.message || 'Failed to set movie genres', 400);
        }
      }

      return ServiceResponse.success(updated);
    } catch (error: any) {
      // Handle duplicate slug error
      if (error.code === 'ER_DUP_ENTRY') {
        return ServiceResponse.error('Slug already exists. Please use a different slug.', 409);
      }
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Delete movie
   */
  async deleteMovie(id: number): Promise<ServiceResponse<boolean>> {
    try {
      // Clean up many-to-many mappings first to avoid FK constraint issues
      await this.movieGenreRepository.delete({ movieId: id });

      const result = await this.movieRepository.delete(id);
      if (!result || (typeof result.affected === 'number' && result.affected === 0)) {
        return ServiceResponse.error('Movie not found', 404);
      }

      return ServiceResponse.success(true);
    } catch (error: any) {
      // Common MySQL FK constraint codes when the movie is referenced by showtimes/bookings/etc.
      const code = error?.code;
      if (code === 'ER_ROW_IS_REFERENCED_2' || code === 'ER_ROW_IS_REFERENCED') {
        return ServiceResponse.error('Cannot delete movie because it is referenced by other records (e.g., showtimes).', 409);
      }

      return ServiceResponse.error(error?.message || 'Failed to delete movie');
    }
  }

  /**
   * Get all genres
   */
  async getAllGenres(): Promise<ServiceResponse<Genre[]>> {
    try {
      const genres = await this.genreRepository.findAll();
      return ServiceResponse.success(genres);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Search movies by genre ID
   * Returns genre info + all movies in that genre with their complete genre lists
   */
  async searchByGenreId(genreId: number): Promise<ServiceResponse<SearchByGenreResponseDto>> {
    try {
      // Get genre info
      const genre = await this.genreRepository.findById(genreId);
      if (!genre) {
        return ServiceResponse.error('Genre not found', 404);
      }

      // Get movies in this genre
      const movies = await this.movieRepository.findByGenreId(genreId);
      
      // Get genres for each movie (for complete response)
      const moviesWithGenres: MovieWithGenresDto[] = await Promise.all(
        movies.map(async (movie) => {
          const genres = await this.genreRepository.findByMovieId(movie.movieId);
          return {
            ...movie,
            genres: genres.map(g => ({
              genreId: g.genreId,
              genreName: g.genreName
            }))
          };
        })
      );

      const response: SearchByGenreResponseDto = {
        genre: {
          genreId: genre.genreId,
          genreName: genre.genreName
        },
        movies: moviesWithGenres,
        totalCount: moviesWithGenres.length
      };

      return ServiceResponse.success(response);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get genres by movie ID
   */
  async getGenresByMovieId(movieId: number): Promise<ServiceResponse<Genre[]>> {
    try {
      const movie = await this.movieRepository.findById(movieId);
      if (!movie) {
        return ServiceResponse.error('Movie not found', 404);
      }

      const genres = await this.genreRepository.findByMovieId(movieId);
      return ServiceResponse.success(genres);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }
}

