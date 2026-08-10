import { PartialType } from '@nestjs/swagger';
import { CreateRoomTypeDto } from './create-room-type.dto';

/**
 * DTO for updating an existing room type
 * All fields are optional (partial)
 */
export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {}
