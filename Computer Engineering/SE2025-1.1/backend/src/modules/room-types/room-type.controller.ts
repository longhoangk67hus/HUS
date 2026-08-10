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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto';
import { RoomType } from './entities/room-type.entity';

/**
 * RoomType Controller
 * Handles HTTP requests for room type management
 * Migrated from CinemaSystem.API.Controllers (if existed)
 */
@ApiTags('room-types')
@Controller('api/room-types')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  /**
   * GET /api/room-types
   * Get all room types
   */
  @Get()
  @ApiOperation({ summary: 'Get all room types', description: 'Retrieve all available room types' })
  @ApiResponse({ status: 200, description: 'List of room types', type: [RoomType] })
  async findAll() {
    const roomTypes = await this.roomTypeService.findAll();
    return {
      isSuccess: true,
      data: roomTypes,
    };
  }

  /**
   * GET /api/room-types/statistics
   * Get room type statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get room type statistics', description: 'Get statistics about room types' })
  @ApiResponse({ status: 200, description: 'Room type statistics' })
  async getStatistics() {
    const stats = await this.roomTypeService.getStatistics();
    return {
      isSuccess: true,
      data: stats,
    };
  }

  /**
   * GET /api/room-types/:id
   * Get room type by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get room type by ID', description: 'Retrieve a single room type by its ID' })
  @ApiParam({ name: 'id', description: 'Room type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room type details', type: RoomType })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const roomType = await this.roomTypeService.findById(id);
    return {
      isSuccess: true,
      data: roomType,
    };
  }

  /**
   * POST /api/room-types
   * Create new room type
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new room type', description: 'Add a new room type to the system' })
  @ApiResponse({ status: 201, description: 'Room type created successfully', type: RoomType })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Room type name already exists' })
  async create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    const roomType = await this.roomTypeService.create(createRoomTypeDto);
    return {
      isSuccess: true,
      data: roomType,
      message: 'Room type created successfully',
    };
  }

  /**
   * PUT /api/room-types/:id
   * Update room type
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update room type', description: 'Update an existing room type' })
  @ApiParam({ name: 'id', description: 'Room type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room type updated successfully', type: RoomType })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  @ApiResponse({ status: 409, description: 'Room type name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ) {
    const roomType = await this.roomTypeService.update(id, updateRoomTypeDto);
    return {
      isSuccess: true,
      data: roomType,
      message: 'Room type updated successfully',
    };
  }

  /**
   * DELETE /api/room-types/:id
   * Delete room type
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete room type', description: 'Remove a room type from the system' })
  @ApiParam({ name: 'id', description: 'Room type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room type not found' })
  @ApiResponse({ status: 409, description: 'Room type is being used by rooms' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.roomTypeService.delete(id);
    return {
      isSuccess: true,
      message: 'Room type deleted successfully',
    };
  }
}
