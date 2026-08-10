import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from './dto';
import { Room } from './entities/room.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Room Controller
 * Handles HTTP requests for room management
 * Migrated from CinemaSystem.API.Controllers (if existed)
 */
@ApiTags('rooms')
@Controller('api/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  /**
   * GET /api/rooms
   * Get all rooms
   */
  @Get()
  @ApiOperation({ summary: 'Get all rooms', description: 'Retrieve all standard cinema rooms with theater details' })
  @ApiResponse({ status: 200, description: 'List of standard rooms', type: [Room] })
  async findAll() {
    const rooms = await this.roomService.findAll();
    
    return {
      isSuccess: true,
      data: rooms,
    };
  }

  /**
   * GET /api/rooms/statistics
   * Get room statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get room statistics', description: 'Get statistics about rooms' })
  @ApiResponse({ status: 200, description: 'Room statistics' })
  async getStatistics() {
    const stats = await this.roomService.getStatistics();
    return {
      isSuccess: true,
      data: stats,
    };
  }

  /**
   * GET /api/rooms/active
   * Get active rooms only
   */
  @Get('active')
  @ApiOperation({ summary: 'Get active rooms', description: 'Retrieve only active rooms with details' })
  @ApiResponse({ status: 200, description: 'List of active rooms', type: [Room] })
  async findActive() {
    const rooms = await this.roomService.findActive();
    
    return {
      isSuccess: true,
      data: rooms,
    };
  }

  /**
   * GET /api/rooms/theater/:theaterId
   * Get rooms by theater
   */
  @Get('theater/:theaterId')
  @ApiOperation({ summary: 'Get rooms by theater', description: 'Retrieve all rooms in a specific theater' })
  @ApiParam({ name: 'theaterId', description: 'Theater ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of rooms in theater', type: [Room] })
  async findByTheater(@Param('theaterId', ParseIntPipe) theaterId: number) {
    const rooms = await this.roomService.findByTheaterId(theaterId);
    
    return {
      isSuccess: true,
      data: rooms,
    };
  }

  /**
   * GET /api/rooms/type/:roomTypeId
   * Get rooms by room type (Note: Only Standard rooms available)
   */
  @Get('type/:roomTypeId')
  @ApiOperation({ 
    summary: 'Get rooms by type', 
    description: 'Retrieve all rooms of a specific type (Only Standard type available)',
    deprecated: true
  })
  @ApiParam({ name: 'roomTypeId', description: 'Room type ID (Only 1=Standard supported)', example: 1 })
  @ApiResponse({ status: 200, description: 'List of standard rooms', type: [Room] })
  async findByRoomType(@Param('roomTypeId', ParseIntPipe) roomTypeId: number) {
    // Only Standard rooms (ID=1) are available
    if (roomTypeId !== 1) {
      return {
        isSuccess: false,
        message: 'Only Standard room type (ID=1) is available',
        data: [],
      };
    }
    
    const rooms = await this.roomService.findByRoomTypeId(roomTypeId);
    
    return {
      isSuccess: true,
      data: rooms,
    };
  }

  /**
   * GET /api/rooms/:id
   * Get room by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID', description: 'Retrieve a single room by its ID with full details' })
  @ApiParam({ name: 'id', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room details', type: Room })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomService.findById(id);
    
    return {
      isSuccess: true,
      data: room,
    };
  }

  /**
   * POST /api/rooms
   * Create new room
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new room (Admin only)', description: 'Add a new room to the system' })
  @ApiResponse({ status: 201, description: 'Room created successfully', type: Room })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Theater or Room Type not found' })
  @ApiResponse({ status: 409, description: 'Room name already exists in theater' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.roomService.create(createRoomDto);
    
    return {
      isSuccess: true,
      data: room,
      message: 'Room created successfully',
    };
  }

  /**
   * PUT /api/rooms/:id
   * Update room
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room (Admin only)', description: 'Update an existing room' })
  @ApiParam({ name: 'id', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room updated successfully', type: Room })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'Room name already exists in theater' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const room = await this.roomService.update(id, updateRoomDto);
    
    return {
      isSuccess: true,
      data: room,
      message: 'Room updated successfully',
    };
  }

  /**
   * PUT /api/rooms/:id/status
   * Update room status
   */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room status (Admin only)', description: 'Change room status (Active, Maintenance, Inactive)' })
  @ApiParam({ name: 'id', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateRoomStatusDto,
  ) {
    const room = await this.roomService.updateStatus(id, updateStatusDto.status);
    
    return {
      isSuccess: true,
      data: room,
      message: `Room status updated to ${updateStatusDto.status}`,
    };
  }

  /**
   * DELETE /api/rooms/:id
   * Delete room
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete room (Admin only)', description: 'Remove a room from the system' })
  @ApiParam({ name: 'id', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 409, description: 'Room is being used by showtimes' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.roomService.delete(id);
    
    return {
      isSuccess: true,
      message: 'Room deleted successfully',
    };
  }
}
