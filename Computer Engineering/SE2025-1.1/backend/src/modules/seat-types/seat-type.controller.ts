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
import { SeatTypeService } from './seat-type.service';
import { CreateSeatTypeDto, UpdateSeatTypeDto } from './dto';
import { SeatType } from './entities/seat-type.entity';

/**
 * SeatType Controller
 * Handles HTTP requests for seat type management
 */
@ApiTags('seat-types')
@Controller('api/seat-types')
export class SeatTypeController {
  constructor(private readonly seatTypeService: SeatTypeService) {}

  /**
   * GET /api/seat-types
   * Get all seat types
   */
  @Get()
  @ApiOperation({ summary: 'Get all seat types', description: 'Retrieve all seat types' })
  @ApiResponse({ status: 200, description: 'List of seat types', type: [SeatType] })
  async findAll() {
    const seatTypes = await this.seatTypeService.findAll();

    return {
      isSuccess: true,
      data: seatTypes,
    };
  }

  /**
   * GET /api/seat-types/statistics
   * Get seat type statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get seat type statistics', description: 'Get statistics about seat types' })
  @ApiResponse({ status: 200, description: 'Seat type statistics' })
  async getStatistics() {
    const stats = await this.seatTypeService.getStatistics();

    return {
      isSuccess: true,
      data: stats,
    };
  }

  /**
   * GET /api/seat-types/:id
   * Get seat type by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get seat type by ID', description: 'Retrieve a specific seat type' })
  @ApiParam({ name: 'id', description: 'Seat type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat type details', type: SeatType })
  @ApiResponse({ status: 404, description: 'Seat type not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const seatType = await this.seatTypeService.findById(id);

    return {
      isSuccess: true,
      data: seatType,
    };
  }

  /**
   * POST /api/seat-types
   * Create new seat type
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new seat type', description: 'Add a new seat type to the system' })
  @ApiResponse({ status: 201, description: 'Seat type created successfully', type: SeatType })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Seat type name already exists' })
  async create(@Body() createSeatTypeDto: CreateSeatTypeDto) {
    const seatType = await this.seatTypeService.create(createSeatTypeDto);

    return {
      isSuccess: true,
      data: seatType,
      message: 'Seat type created successfully',
    };
  }

  /**
   * PUT /api/seat-types/:id
   * Update seat type
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update seat type', description: 'Update an existing seat type' })
  @ApiParam({ name: 'id', description: 'Seat type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat type updated successfully', type: SeatType })
  @ApiResponse({ status: 404, description: 'Seat type not found' })
  @ApiResponse({ status: 409, description: 'Seat type name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeatTypeDto: UpdateSeatTypeDto,
  ) {
    const seatType = await this.seatTypeService.update(id, updateSeatTypeDto);

    return {
      isSuccess: true,
      data: seatType,
      message: 'Seat type updated successfully',
    };
  }

  /**
   * DELETE /api/seat-types/:id
   * Delete seat type
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete seat type', description: 'Remove a seat type from the system' })
  @ApiParam({ name: 'id', description: 'Seat type ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Seat type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Seat type not found' })
  @ApiResponse({ status: 409, description: 'Seat type is being used by seats' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.seatTypeService.delete(id);

    return {
      isSuccess: true,
      message: 'Seat type deleted successfully',
    };
  }
}
