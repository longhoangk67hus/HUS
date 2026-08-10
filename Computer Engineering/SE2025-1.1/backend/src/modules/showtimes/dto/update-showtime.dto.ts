import { PartialType } from '@nestjs/swagger';
import { CreateShowtimeDto } from './create-showtime.dto';

/**
 * DTO for updating a showtime
 * All fields are optional
 * @author HNLong
 * @date 2025-11-06
 */
export class UpdateShowtimeDto extends PartialType(CreateShowtimeDto) {}
