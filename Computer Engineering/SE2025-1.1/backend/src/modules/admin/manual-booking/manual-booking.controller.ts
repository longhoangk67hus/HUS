import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ManualBookingService } from './manual-booking.service';
import { CreateManualBookingDto, CreateManualBookingResponseDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/dto';

/**
 * Manual Booking Controller
 * Handles counter bookings for walk-in customers
 * Requires ADMIN role
 * 
 * @author HNLong
 * @since 2025-11-27
 */
@ApiTags('admin/manual-booking')
@Controller('api/admin/manual-booking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ManualBookingController {
  constructor(private readonly manualBookingService: ManualBookingService) {}

  /**
   * Create a manual booking at the counter
   * Admin books tickets for walk-in customers with immediate confirmation
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create manual booking',
    description: 'Admin creates booking at counter for walk-in customer. No reservation needed, immediate confirmation with QR code.',
  })
  @ApiResponse({
    status: 201,
    description: 'Manual booking created successfully',
    type: CreateManualBookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or showtime has started' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  @ApiResponse({ status: 409, description: 'Seats already booked' })
  async createManualBooking(
    @Body() dto: CreateManualBookingDto,
    @CurrentUser() admin: JwtPayload,
  ): Promise<CreateManualBookingResponseDto> {
    const result = await this.manualBookingService.createManualBooking(dto, admin.userId);

    return {
      success: true,
      message: 'Manual booking created successfully',
      data: result,
    };
  }

  /**
   * Get manual booking details by ID
   */
  @Get(':bookingId')
  @ApiOperation({
    summary: 'Get manual booking details',
    description: 'Retrieve details of a manual booking by ID',
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Manual booking details',
    type: CreateManualBookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Manual booking not found' })
  async getManualBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<CreateManualBookingResponseDto> {
    const result = await this.manualBookingService.getManualBookingById(bookingId);

    return {
      success: true,
      message: 'Manual booking retrieved successfully',
      data: result,
    };
  }

  /**
   * Cancel manual booking (refund at counter)
   */
  @Patch(':bookingId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel manual booking',
    description: 'Cancel a manual booking and process refund at counter',
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Manual booking cancelled successfully',
  })
  @ApiResponse({ status: 400, description: 'Booking already cancelled or completed' })
  @ApiResponse({ status: 404, description: 'Manual booking not found' })
  async cancelManualBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @CurrentUser() admin: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    await this.manualBookingService.cancelManualBooking(bookingId, admin.userId);

    return {
      success: true,
      message: 'Manual booking cancelled successfully',
    };
  }

  /**
   * Confirm manual booking (admin marks payment received at counter)
   */
  @Post(':bookingId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm manual booking', description: 'Admin confirms a manual booking after receiving payment at counter' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 123 })
  @ApiResponse({ status: 200, description: 'Manual booking confirmed successfully' })
  async confirmManualBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @CurrentUser() admin: JwtPayload,
  ): Promise<any> {
    const updated = await this.manualBookingService.confirmManualBooking(bookingId, admin.userId);

    return {
      success: true,
      message: 'Manual booking confirmed successfully',
      data: updated,
    };
  }
}
