import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SeatService } from './seat.service';
import { CreateSeatDto, UpdateSeatDto, UpdateSeatStatusDto } from './dto';
import { Seat } from './entities/seat.entity';

/**
 * Seat Controller
 * Handles HTTP requests for seat management
 */
@ApiTags('seats')
@Controller('api/seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  /**
   * GET /api/seats
   * Get all seats
   */
  @Get()
  @ApiOperation({ summary: 'Get all seats', description: 'Retrieve all seats with room and seat type details' })
  @ApiResponse({ status: 200, description: 'List of seats', type: [Seat] })
  async findAll() {
    const seats = await this.seatService.findAll();

    return {
      isSuccess: true,
      data: seats,
    };
  }

  /**
   * GET /api/seats/statistics
   * Get seat statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get seat statistics', description: 'Get statistics about seats' })
  @ApiResponse({ status: 200, description: 'Seat statistics' })
  async getStatistics() {
    const stats = await this.seatService.getStatistics();

    return {
      isSuccess: true,
      data: stats,
    };
  }

  /**
   * GET /api/seats/room/:roomId
   * Get all seats in a room
   */
  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get seats by room', description: 'Retrieve all seats in a specific room' })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of seats in room', type: [Seat] })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    const seats = await this.seatService.findByRoomId(roomId);

    return {
      isSuccess: true,
      data: seats,
    };
  }

  /**
   * GET /api/seats/room/:roomId/showtime/:showtimeId
   * Get seats for a specific room and showtime (with booked seats highlighted)
   */
  @Get('room/:roomId/showtime/:showtimeId')
  @ApiOperation({ 
    summary: 'Get seats by room and showtime', 
    description: 'Retrieve all seats in a room with booking status for a specific showtime' 
  })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  @ApiParam({ name: 'showtimeId', description: 'Showtime ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of seats with booking status' })
  @ApiResponse({ status: 404, description: 'Room or Showtime not found' })
  async findByRoomAndShowtime(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
  ) {
    const seats = await this.seatService.findByRoomAndShowtime(roomId, showtimeId);

    return {
      isSuccess: true,
      data: seats,
    };
  }

  /**
   * GET /api/seats/room/:roomId/layout
   * Get room layout with seat map
   */
  @Get('room/:roomId/layout')
  @ApiOperation({ 
    summary: 'Get room layout', 
    description: 'Retrieve room layout with seat map and statistics' 
  })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Room layout with seat map' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoomLayout(@Param('roomId', ParseIntPipe) roomId: number) {
    const layout = await this.seatService.getRoomLayout(roomId);

    return {
      isSuccess: true,
      data: layout,
    };
  }

  /**
   * GET /api/seats/type/:seatTypeId
   * Get seats by seat type
   */
  @Get('type/:seatTypeId')
  @ApiOperation({ summary: 'Get seats by seat type', description: 'Retrieve all seats of a specific type' })
  @ApiParam({ name: 'seatTypeId', description: 'Seat type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of seats by type', type: [Seat] })
  @ApiResponse({ status: 404, description: 'Seat type not found' })
  async findBySeatType(@Param('seatTypeId', ParseIntPipe) seatTypeId: number) {
    const seats = await this.seatService.findBySeatTypeId(seatTypeId);

    return {
      isSuccess: true,
      data: seats,
    };
  }

  /**
   * GET /api/seats/status/:status
   * Get seats by status
   */
  @Get('status/:status')
  @ApiOperation({ summary: 'Get seats by status', description: 'Retrieve seats by status (Available, Broken, Reserved)' })
  @ApiParam({ name: 'status', description: 'Seat status', example: 'Available', enum: ['Available', 'Broken', 'Reserved'] })
  @ApiResponse({ status: 200, description: 'List of seats by status', type: [Seat] })
  async findByStatus(@Param('status') status: string) {
    const seats = await this.seatService.findByStatus(status);

    return {
      isSuccess: true,
      data: seats,
    };
  }

  /**
   * GET /api/seats/:id
   * Get seat by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get seat by ID', description: 'Retrieve a specific seat with details' })
  @ApiParam({ name: 'id', description: 'Seat ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat details', type: Seat })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const seat = await this.seatService.findById(id);

    return {
      isSuccess: true,
      data: seat,
    };
  }

  /**
   * POST /api/seats
   * Create new seat
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new seat', description: 'Add a new seat to a room' })
  @ApiResponse({ status: 201, description: 'Seat created successfully', type: Seat })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Room or Seat Type not found' })
  @ApiResponse({ status: 409, description: 'Seat already exists at this position' })
  async create(@Body() createSeatDto: CreateSeatDto) {
    const seat = await this.seatService.create(createSeatDto);

    return {
      isSuccess: true,
      data: seat,
      message: 'Seat created successfully',
    };
  }

  /**
   * POST /api/seats/bulk
   * Create multiple seats for a room
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create multiple seats', 
    description: 'Bulk create seats for a room (e.g., rows A-J, 10 columns)' 
  })
  @ApiResponse({ status: 201, description: 'Seats created successfully', type: [Seat] })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Room or Seat Type not found' })
  async createBulk(
    @Body('roomId', ParseIntPipe) roomId: number,
    @Body('rows') rows: string[],
    @Body('cols', ParseIntPipe) cols: number,
    @Body('seatTypeId', ParseIntPipe) seatTypeId: number,
  ) {
    const seats = await this.seatService.createBulk(roomId, rows, cols, seatTypeId);

    return {
      isSuccess: true,
      data: seats,
      message: `${seats.length} seat(s) created successfully`,
    };
  }

  /**
   * PUT /api/seats/:id
   * Update seat
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update seat', description: 'Update seat details' })
  @ApiParam({ name: 'id', description: 'Seat ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat updated successfully', type: Seat })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  @ApiResponse({ status: 409, description: 'Seat already exists at this position' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeatDto: UpdateSeatDto,
  ) {
    const seat = await this.seatService.update(id, updateSeatDto);

    return {
      isSuccess: true,
      data: seat,
      message: 'Seat updated successfully',
    };
  }

  /**
   * PUT /api/seats/:id/status
   * Update seat status
   */
  @Put(':id/status')
  @ApiOperation({ summary: 'Update seat status', description: 'Change seat status (Available, Broken, Reserved)' })
  @ApiParam({ name: 'id', description: 'Seat ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateSeatStatusDto,
  ) {
    const seat = await this.seatService.updateStatus(id, updateStatusDto.status);

    return {
      isSuccess: true,
      data: seat,
      message: `Seat status updated to ${updateStatusDto.status}`,
    };
  }

  /**
   * DELETE /api/seats/:id
   * Delete seat
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete seat', description: 'Remove a seat from the system' })
  @ApiParam({ name: 'id', description: 'Seat ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Seat not found' })
  @ApiResponse({ status: 409, description: 'Seat is being used in reservations' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.seatService.delete(id);

    return {
      isSuccess: true,
      message: 'Seat deleted successfully',
    };
  }

  /**
   * DELETE /api/seats/room/:roomId
   * Delete all seats in a room
   */
  @Delete('room/:roomId')
  @ApiOperation({ summary: 'Delete all seats in room', description: 'Remove all seats from a specific room' })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'All seats deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async deleteByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    await this.seatService.deleteByRoomId(roomId);

    return {
      isSuccess: true,
      message: 'All seats in room deleted successfully',
    };
  }
}
