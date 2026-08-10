import { PartialType } from '@nestjs/swagger';
import { CreateMovieDto } from './create-movie.dto';

/**
 * DTO for updating a movie
 * All fields are optional (partial update)
 */
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
