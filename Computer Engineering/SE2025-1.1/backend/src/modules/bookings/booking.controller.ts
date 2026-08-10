import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto, BookingResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Booking Controller
 * Handles booking creation and manage>nt
 * 
 * @author HNLong
 * @since 2025-11-08
 */
@ApiTags('bookings')
@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create booking from confirmed reservation
   * Converts temporary reservation to permanent booking
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create booking from reservation',
    description: 'Convert confirmed reservation to booking and initiate payment flow',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully with payment URL',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid reservation or already booked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Idempotency key already used' })
  async createBooking(
    @Body() dto: CreateBookingDto,
    @Request() req: any,
  ): Promise<BookingResponseDto> {
    const userId = req.user.userId;
    return this.bookingService.createBooking(dto, userId);
  }

  /**
   * Get booking details by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Retrieve full booking details including seats and showtime',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 456 })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findById(id);
  }

  /**
   * Get booking by code
   */
  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get booking by code',
    description: 'Retrieve booking using unique booking code',
  })
  @ApiParam({ name: 'code', description: 'Booking code', example: 'BK20251108A1B2' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingByCode(@Param('code') code: string) {
    return this.bookingService.findByCode(code);
  }

  /**
   * Get booking by reservation ID
   * Used by frontend to check if booking already created from reservation
   */
  @Get('reservation/:reservationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get booking by reservation ID',
    description: 'Check if booking was already created from this reservation (prevents duplicate bookings)',
  })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID', example: 7 })
  @ApiResponse({ 
    status: 200, 
    description: 'Booking found (already created from this reservation)',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No booking found for this reservation yet' })
  async getBookingByReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    try {
      return await this.bookingService.findByReservation(reservationId, userId);
    } catch (err) {
      // If no booking exists for this reservation, return null (frontend treats null as "not found").
      // This avoids returning a 404 HTTP response which shows a network error in browser console
      // for an expected control-flow case.
      if (err instanceof NotFoundException) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Get all bookings (Admin only)
   * Returns all bookings from all users for admin dashboard
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all bookings (Admin)',
    description: 'Admin endpoint to retrieve all bookings from all users with full details',
  })
  @ApiResponse({ status: 200, description: 'All bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAllBookings() {
    return this.bookingService.findAll();
  }

  /**
   * Get current user's bookings
   */
  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my bookings',
    description: 'Get all bookings for authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async getMyBookings(@Request() req: any) {
    const userId = req.user.userId;
    return this.bookingService.findByUser(userId);
  }

  /**
   * Cancel booking
   */
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancel pending booking (only before payment confirmation)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 456 })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel confirmed booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.bookingService.cancelBooking(id, userId);
  }
}