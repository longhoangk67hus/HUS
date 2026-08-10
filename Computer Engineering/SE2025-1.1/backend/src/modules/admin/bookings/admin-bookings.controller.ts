import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminBookingsService } from './admin-bookings.service';
import { AdminBookingDto } from './dto/admin-booking.dto';

/**
 * Admin Bookings Controller
 * Provides admin endpoints for managing and viewing all bookings
 * 
 * @author HNLong
 * @since 2025-12-13
 */
@ApiTags('Admin - Bookings')
@Controller('api/admin/bookings')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminBookingsController {
  private readonly logger = new Logger(AdminBookingsController.name);

  constructor(private readonly adminBookingsService: AdminBookingsService) {}

  /**
   * Get all bookings with filters and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get all bookings (Admin)',
    description: 'Retrieve all bookings with optional filters for status, date range, user, etc.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'status', required: false, enum: ['Pending', 'Confirmed', 'Cancelled'], description: 'Filter by booking status' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by booking code or user email' })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    type: [AdminBookingDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllBookings(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: 'Pending' | 'Confirmed' | 'Cancelled',
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new BadRequestException('Invalid startDate format (use YYYY-MM-DD)');
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new BadRequestException('Invalid endDate format (use YYYY-MM-DD)');
    }

    this.logger.log(`🔍 Admin fetching bookings - Page: ${pageNumber}, Limit: ${limitNumber}, Status: ${status || 'all'}`);

    return this.adminBookingsService.getAllBookings({
      page: pageNumber,
      limit: limitNumber,
      status,
      userId: userId ? parseInt(userId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    });
  }

  /**
   * Get booking statistics summary
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get booking statistics (Admin)',
    description: 'Get summary statistics for bookings (total, by status, revenue, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getBookingStats() {
    this.logger.log(`📊 Admin fetching booking statistics`);
    return this.adminBookingsService.getBookingStatistics();
  }
}