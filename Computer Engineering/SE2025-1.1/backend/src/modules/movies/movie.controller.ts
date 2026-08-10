import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';
import { Genre } from './entities/genre.entity';
import { CreateMovieDto, UpdateMovieDto, SearchByGenreResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Movies Controller
 * Migrated from CinemaSystem.API.Controllers.MoviesController.cs
 */
@ApiTags('movies')
@Controller('api/movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  /**
   * GET /api/movies
   * Get all movies
   */
  @Get()
  @ApiOperation({ summary: 'Get all movies', description: 'Retrieve all movies in the database' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved movies', type: [Movie] })
  async getAllMovies() {
    return this.movieService.getAllMovies();
  }

  /**
   * GET /api/movies/now-showing
   * Get now showing movies
   */
  @Get('now-showing')
  @ApiOperation({ summary: 'Get now showing movies', description: 'Get movies currently showing in theaters' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved now showing movies' })
  async getNowShowing() {
    return this.movieService.getNowShowingMovies();
  }

  /**
   * GET /api/movies/coming-soon
   * Get coming soon movies
   */
  @Get('coming-soon')
  @ApiOperation({ summary: 'Get coming soon movies', description: 'Get movies that will be released soon' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved coming soon movies' })
  async getComingSoon() {
    return this.movieService.getComingSoonMovies();
  }

  /**
   * GET /api/movies/search?keyword=avatar
   * Search movies by title
   */
  @Get('search')
  @ApiOperation({ summary: 'Search movies', description: 'Search movies by title keyword' })
  @ApiQuery({ name: 'keyword', required: true, description: 'Search keyword', example: 'avatar' })
  @ApiResponse({ status: 200, description: 'Successfully found movies' })
  async search(@Query('keyword') keyword: string) {
    return this.movieService.searchMovies(keyword);
  }

  /**
   * GET /api/movies/:id
   * Get movie by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get movie by ID', description: 'Retrieve a single movie by its ID' })
  @ApiParam({ name: 'id', description: 'Movie ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async getById(@Param('id') id: number) {
    return this.movieService.getMovieById(id);
  }

  /**
   * GET /api/movies/slug/:slug
   * Get movie by slug (supports partial matching)
   */
  @Get('slug/:slug')
  @ApiOperation({ 
    summary: 'Get movie by slug', 
    description: 'Retrieve a movie by its URL slug. Supports partial matching - you can search with any part of the slug (e.g., "avatar", "dark-knight", "2024")'
  })
  @ApiParam({ 
    name: 'slug', 
    description: 'Movie slug or partial slug to search', 
    example: 'avatar',
    examples: {
      exact: { value: 'the-dark-knight', description: 'Exact slug match' },
      partial: { value: 'avatar', description: 'Partial match - finds "avatar-4"' },
      keyword: { value: 'knight', description: 'Keyword match - finds "the-dark-knight"' }
    }
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async getBySlug(@Param('slug') slug: string) {
    return this.movieService.getMovieBySlug(slug);
  }

  /**
   * POST /api/movies
   * Create new movie (ADMIN only)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new movie', description: 'Add a new movie to the database (Admin only)' })
  @ApiBody({ type: CreateMovieDto })
  @ApiResponse({ status: 201, description: 'Movie created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() movieData: CreateMovieDto) {
    return this.movieService.createMovie(movieData);
  }

  /**
   * PUT /api/movies/:id
   * Update movie (ADMIN only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update movie', description: 'Update an existing movie (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID', example: 1 })
  @ApiBody({ type: UpdateMovieDto })
  @ApiResponse({ status: 200, description: 'Movie updated successfully' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async update(@Param('id') id: number, @Body() movieData: UpdateMovieDto) {
    return this.movieService.updateMovie(id, movieData);
  }

  /**
   * DELETE /api/movies/:id
   * Delete movie (ADMIN only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete movie', description: 'Remove a movie from the database (Admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Movie deleted successfully' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(id);
  }

  /**
   * GET /api/movies/genres
   * Get all genres for filter/dropdown
   * Frontend should load this once and cache for genre selection UI
   */
  @Get('genres/all')
  @ApiOperation({ 
    summary: 'Get all genres', 
    description: 'Load complete genre list for dropdown/scroll menu. Frontend caches this for filtering.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all genres sorted alphabetically', 
    type: [Genre] 
  })
  async getAllGenres() {
    return this.movieService.getAllGenres();
  }

  /**
   * GET /api/movies/genre/:genreId
   * Search movies by genre ID
   * Frontend workflow: 
   * 1. Load all genres with GET /api/movies/genres/all
   * 2. User selects genre from dropdown/scroll list
   * 3. Call this endpoint with selected genreId
   */
  @Get('genre/:genreId')
  @ApiOperation({ 
    summary: 'Get movies by genre', 
    description: 'Get all movies in a specific genre. User selects genre from list loaded by /genres/all endpoint.' 
  })
  @ApiParam({ name: 'genreId', description: 'Genre ID', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved movies',
    type: SearchByGenreResponseDto
  })
  @ApiResponse({ status: 404, description: 'Genre not found' })
  async searchByGenreId(@Param('genreId', ParseIntPipe) genreId: number) {
    return this.movieService.searchByGenreId(genreId);
  }

  /**
   * GET /api/movies/:id/genres
   * Get genres of a specific movie
   */
  @Get(':id/genres')
  @ApiOperation({ 
    summary: 'Get genres by movie ID', 
    description: 'Retrieve all genres associated with a specific movie' 
  })
  @ApiParam({ name: 'id', description: 'Movie ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Successfully retrieved genres', type: [Genre] })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async getGenresByMovieId(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.getGenresByMovieId(id);
  }
}

