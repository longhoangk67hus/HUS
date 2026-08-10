import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ReservationService } from './reservation.service';
import {
  CreateReservationDto,
  ReservationResponseDto,
  SeatsAvailabilityResponseDto,
} from './dto';
import { ReservationRateLimitGuard } from './guards/reservation-rate-limit.guard';

/**
 * Reservation Controller
 * Handles seat reservation with Redis-based atomic locking
 * 
 * @author HNLong
 * @since 2025-11-06
 */
@ApiTags('reservations')
@Controller('api/reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Create a new seat reservation
   * POST /api/reservations
   */
  @Post()
  @UseGuards(ReservationRateLimitGuard) // Rate limit: 3 requests/minute
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create seat reservation',
    description:
      'Reserve seats for a showtime. Uses atomic Redis locks to prevent race conditions. Reservation expires in 10 minutes.',
  })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    type: ReservationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Showtime or seats not found' })
  @ApiResponse({ status: 409, description: 'Seats already locked by another user' })
  async createReservation(
    @Body() dto: CreateReservationDto,
    @Req() request: Request,
  ): Promise<ReservationResponseDto> {
    const ipAddress = request.ip || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return this.reservationService.createReservation(dto, ipAddress, userAgent);
  }

  /**
   * Cancel a reservation
   * PUT /api/reservations/:id/cancel
   */
  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel reservation',
    description: 'Cancel a pending reservation and release seat locks',
  })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 123 })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'User ID (for logged-in users)',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID (for anonymous users)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel this reservation' })
  @ApiResponse({ status: 400, description: 'Reservation already processed' })
  async cancelReservation(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<{ message: string; reservationId: number }> {
    return this.reservationService.cancelReservation(id, userId, sessionId);
  }

  /**
   * Get reservation details
   * GET /api/reservations/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get reservation details',
    description: 'Get reservation details including remaining time',
  })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Reservation details',
    type: ReservationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async getReservation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReservationResponseDto> {
    return this.reservationService.getReservation(id);
  }

  /**
   * Get user's active reservations
   * GET /api/reservations/user/:userId
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user reservations',
    description: 'Get all active reservations for a user',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user_12345' })
  @ApiResponse({
    status: 200,
    description: 'List of user reservations',
  })
  async getUserReservations(@Param('userId') userId: string) {
    return this.reservationService.getUserReservations(userId);
  }

  /**
   * Get session's active reservations
   * GET /api/reservations/session/:sessionId
   */
  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get session reservations',
    description: 'Get all active reservations for an anonymous session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'sess_abcd1234',
  })
  @ApiResponse({
    status: 200,
    description: 'List of session reservations',
  })
  async getSessionReservations(@Param('sessionId') sessionId: string) {
    return this.reservationService.getSessionReservations(sessionId);
  }

  /**
   * Check seats availability for a showtime
   * GET /api/reservations/showtime/:showtimeId/availability
   */
  @Get('showtime/:showtimeId/availability')
  @ApiOperation({
    summary: 'Check seats availability',
    description:
      'Check which seats are available/locked for a showtime. Returns real-time lock status from Redis.',
  })
  @ApiParam({ name: 'showtimeId', description: 'Showtime ID', example: 1 })
  @ApiQuery({
    name: 'seatIds',
    required: false,
    description: 'Comma-separated seat IDs to check (e.g., "12,13,14"). If omitted, checks all seats in room.',
    example: '12,13,14',
  })
  @ApiResponse({
    status: 200,
    description: 'Seat availability details',
    type: SeatsAvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  async checkSeatsAvailability(
    @Param('showtimeId', ParseIntPipe) showtimeId: number,
    @Query('seatIds') seatIdsQuery?: string,
  ): Promise<SeatsAvailabilityResponseDto> {
    const seatIds = seatIdsQuery
      ? seatIdsQuery.split(',').map((id) => parseInt(id.trim(), 10))
      : undefined;

    return this.reservationService.checkSeatsAvailability(showtimeId, seatIds);
  }
}
