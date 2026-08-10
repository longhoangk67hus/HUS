import { PartialType } from '@nestjs/swagger';
import { CreateSeatTypeDto } from './create-seat-type.dto';

/**
 * DTO for updating a seat type
 * All fields are optional
 */
export class UpdateSeatTypeDto extends PartialType(CreateSeatTypeDto) {}
