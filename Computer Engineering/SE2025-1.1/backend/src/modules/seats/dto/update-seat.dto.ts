import { PartialType } from '@nestjs/swagger';
import { CreateSeatDto } from './create-seat.dto';

/**
 * DTO for updating a seat
 * All fields are optional
 */
export class UpdateSeatDto extends PartialType(CreateSeatDto) {}
