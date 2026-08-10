import { PartialType } from '@nestjs/swagger';
import { CreateTheaterDto } from './create-theater.dto';

/**
 * DTO for updating an existing theater
 * All fields are optional
 */
export class UpdateTheaterDto extends PartialType(CreateTheaterDto) {}
