import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  RevenueSummaryDto,
  RevenueByMovieDto,
  RevenueByTheaterDto,
  RevenueByDateDto,
  RevenueByMonthDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Statistics Controller
 * Admin revenue analytics endpoints
 * Requires ADMIN role
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@ApiTags('admin/statistics')
@Controller('api/admin/statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * GET /api/admin/statistics/dashboard
   * Revenue summary for dashboard
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard revenue summary',
    description: 'Overview statistics including total revenue, bookings, tickets, and growth',
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-11-01', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-11-30', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Dashboard summary', type: RevenueSummaryDto })
  async getDashboard(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<RevenueSummaryDto> {
    return this.statisticsService.getRevenueSummary(startDate, endDate);
  }

  /**
   * GET /api/admin/statistics/revenue/by-movie
   * Revenue breakdown by movie
   */
  @Get('revenue/by-movie')
  @ApiOperation({
    summary: 'Get revenue by movie',
    description: 'Revenue statistics per movie with tickets, showtimes, and occupancy rate',
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-11-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-11-30' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Top N movies (default: 10)' })
  @ApiResponse({ status: 200, description: 'Revenue by movie', type: RevenueByMovieDto })
  async getRevenueByMovie(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: number,
  ): Promise<RevenueByMovieDto> {
    return this.statisticsService.getRevenueByMovie(startDate, endDate, limit);
  }

  /**
   * GET /api/admin/statistics/revenue/by-theater
   * Revenue breakdown by theater
   */
  @Get('revenue/by-theater')
  @ApiOperation({
    summary: 'Get revenue by theater',
    description: 'Revenue statistics per theater/cinema with occupancy rate',
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-11-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-11-30' })
  @ApiResponse({ status: 200, description: 'Revenue by theater', type: RevenueByTheaterDto })
  async getRevenueByTheater(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<RevenueByTheaterDto> {
    return this.statisticsService.getRevenueByTheater(startDate, endDate);
  }

  /**
   * GET /api/admin/statistics/revenue/by-date
   * Daily revenue time-series
   */
  @Get('revenue/by-date')
  @ApiOperation({
    summary: 'Get daily revenue time-series',
    description: 'Revenue breakdown by date for charts and trend analysis',
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2025-11-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2025-11-30' })
  @ApiResponse({ status: 200, description: 'Daily revenue data', type: RevenueByDateDto })
  async getRevenueByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<RevenueByDateDto> {
    return this.statisticsService.getRevenueByDate(startDate, endDate);
  }

  /**
   * GET /api/admin/statistics/revenue/by-month
   * Monthly revenue time-series
   */
  @Get('revenue/by-month')
  @ApiOperation({
    summary: 'Get monthly revenue time-series',
    description: 'Revenue breakdown by month for long-term analysis with growth rates',
  })
  @ApiQuery({ name: 'startMonth', required: true, example: '2025-01', description: 'Start month in YYYY-MM format' })
  @ApiQuery({ name: 'endMonth', required: true, example: '2025-12', description: 'End month in YYYY-MM format' })
  @ApiResponse({ status: 200, description: 'Monthly revenue data with growth analysis', type: RevenueByMonthDto })
  async getRevenueByMonth(
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth: string,
  ): Promise<RevenueByMonthDto> {
    return this.statisticsService.getRevenueByMonth(startMonth, endMonth);
  }
}
