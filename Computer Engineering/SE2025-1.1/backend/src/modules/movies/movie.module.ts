import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { Genre } from './entities/genre.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { MovieRepository } from './movie.repository';
import { GenreRepository } from './genre.repository';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';

/**
 * Movie Module
 * Groups all movie-related components
 */
@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre, MovieGenre])],
  controllers: [MovieController],
  providers: [MovieRepository, GenreRepository, MovieService],
  exports: [MovieService, MovieRepository, GenreRepository],
})
export class MovieModule {}
