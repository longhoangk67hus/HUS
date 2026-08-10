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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto, UpdateShowtimeDto, UpdateShowtimeStatusDto, ShowtimeFilterDto } from './dto';
import { Showtime } from './entities/showtime.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Showtime Controller
 * Handles HTTP requests for showtime management
 * @author HNLong
 * @date 2025-11-06
 */
@ApiTags('showtimes')
@Controller('api/showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  /**
   * GET /api/showtimes
   * Get all showtimes or filter by criteria
   */
  @Get()
  @ApiOperation({ summary: 'Get showtimes', description: 'Get all showtimes or filter by criteria' })
  @ApiQuery({ name: 'movieId', required: false, type: Number })
  @ApiQuery({ name: 'theaterId', required: false, type: Number })
  @ApiQuery({ name: 'roomId', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['Scheduled', 'Cancelled', 'Completed'] })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of showtimes', type: [Showtime] })
  async findAll(@Query() filter: ShowtimeFilterDto) {
    // NOTE: `filter` is a DTO instance; its fields may exist as `undefined`.
    // Using `Object.keys(filter)` can be non-empty even when the client passed no query params,
    // causing us to incorrectly fall back to paginated filtering (default pageSize=10).
    const hasAnyFilterValue = Object.entries(filter as Record<string, unknown>).some(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    });

    // If no filter values provided, return all
    if (!hasAnyFilterValue) {
      const showtimes = await this.showtimeService.findAll();
      return {
        isSuccess: true,
        data: showtimes,
        totalCount: showtimes.length,
      };
    }

    // Otherwise, use filter
    const { showtimes, totalCount } = await this.showtimeService.findByFilter(filter);

    return {
      isSuccess: true,
      data: showtimes,
      totalCount,
      pageNumber: filter.pageNumber || 1,
      pageSize: filter.pageSize || 10,
    };
  }

  /**
   * GET /api/showtimes/statistics
   * Get showtime statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get showtime statistics', description: 'Get statistics about showtimes' })
  @ApiResponse({ status: 200, description: 'Showtime statistics' })
  async getStatistics() {
    const stats = await this.showtimeService.getStatistics();

    return {
      isSuccess: true,
      data: stats,
    };
  }

  /**
   * GET /api/showtimes/movie/:movieId
   * Get showtimes by movie
   */
  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get showtimes by movie', description: 'Retrieve all showtimes for a specific movie' })
  @ApiParam({ name: 'movieId', description: 'Movie ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of showtimes for movie', type: [Showtime] })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async findByMovie(@Param('movieId', ParseIntPipe) movieId: number) {
    const showtimes = await this.showtimeService.findByMovieId(movieId);

    return {
      isSuccess: true,
      data: showtimes,
    };
  }

  /**
   * GET /api/showtimes/room/:roomId
   * Get showtimes by room
   */
  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get showtimes by room', description: 'Retrieve all showtimes in a specific room' })
  @ApiParam({ name: 'roomId', description: 'Room ID', example: 1 })
  @ApiResponse({ status: 200, description: 'List of showtimes in room', type: [Showtime] })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    const showtimes = await this.showtimeService.findByRoomId(roomId);

    return {
      isSuccess: true,
      data: showtimes,
    };
  }

  /**
   * GET /api/showtimes/status/:status
   * Get showtimes by status
   */
  @Get('status/:status')
  @ApiOperation({ summary: 'Get showtimes by status', description: 'Retrieve showtimes by status' })
  @ApiParam({ name: 'status', description: 'Showtime status', example: 'Scheduled', enum: ['Scheduled', 'Cancelled', 'Completed'] })
  @ApiResponse({ status: 200, description: 'List of showtimes by status', type: [Showtime] })
  async findByStatus(@Param('status') status: string) {
    const showtimes = await this.showtimeService.findByStatus(status);

    return {
      isSuccess: true,
      data: showtimes,
    };
  }

  /**
   * GET /api/showtimes/:id
   * Get showtime by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get showtime by ID', description: 'Retrieve a specific showtime with details' })
  @ApiParam({ name: 'id', description: 'Showtime ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Showtime details', type: Showtime })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const showtime = await this.showtimeService.findById(id);

    return {
      isSuccess: true,
      data: showtime,
    };
  }

  /**
   * POST /api/showtimes
   * Create new showtime
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new showtime (Admin only)', description: 'Add a new showtime to the schedule' })
  @ApiResponse({ status: 201, description: 'Showtime created successfully', type: Showtime })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Movie or Room not found' })
  @ApiResponse({ status: 409, description: 'Time conflict in room' })
  async create(@Body() createShowtimeDto: CreateShowtimeDto) {
    const showtime = await this.showtimeService.create(createShowtimeDto);

    return {
      isSuccess: true,
      data: showtime,
      message: 'Showtime created successfully',
    };
  }

  /**
   * PUT /api/showtimes/:id
   * Update showtime
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update showtime (Admin only)', description: 'Update showtime details' })
  @ApiParam({ name: 'id', description: 'Showtime ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Showtime updated successfully', type: Showtime })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    const showtime = await this.showtimeService.update(id, updateShowtimeDto);

    return {
      isSuccess: true,
      data: showtime,
      message: 'Showtime updated successfully',
    };
  }

  /**
   * PUT /api/showtimes/:id/status
   * Update showtime status
   */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update showtime status (Admin only)', description: 'Change showtime status (Scheduled, Cancelled, Completed)' })
  @ApiParam({ name: 'id', description: 'Showtime ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Showtime status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateShowtimeStatusDto,
  ) {
    const showtime = await this.showtimeService.updateStatus(id, updateStatusDto.status);

    return {
      isSuccess: true,
      data: showtime,
      message: `Showtime status updated to ${updateStatusDto.status}`,
    };
  }

  /**
   * DELETE /api/showtimes/:id
   * Delete showtime
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete showtime (Admin only)', description: 'Remove a showtime from the schedule' })
  @ApiParam({ name: 'id', description: 'Showtime ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Showtime deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  @ApiResponse({ status: 409, description: 'Showtime has reservations' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.showtimeService.delete(id);

    return {
      isSuccess: true,
      message: 'Showtime deleted successfully',
    };
  }
}
