import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';

/**
 * DTO for updating an existing room
 * All fields are optional (partial)
 */
export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
