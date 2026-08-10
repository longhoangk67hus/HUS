import { ApiProperty } from '@nestjs/swagger';

/**
 * Seat information in manual booking response
 */
export class ManualBookingSeatDto {
  @ApiProperty({ description: 'Seat ID', example: 1 })
  seatId: number;

  @ApiProperty({ description: 'Seat row', example: 'A' })
  rowNumber: string;

  @ApiProperty({ description: 'Seat column', example: 5 })
  columnNumber: number;

  @ApiProperty({ description: 'Seat price', example: 80000 })
  price: number;
}

/**
 * Response DTO for manual booking creation
 * Returns booking details with QR code for immediate printing
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class ManualBookingResponseDto {
  @ApiProperty({ description: 'Booking ID', example: 123 })
  bookingId: number;

  @ApiProperty({ description: 'Unique booking code', example: 'BK20251127123456' })
  bookingCode: string;

  @ApiProperty({ description: 'Showtime ID', example: 1 })
  showtimeId: number;

  @ApiProperty({ description: 'Movie title', example: 'Avengers: Endgame' })
  movieTitle: string;

  @ApiProperty({ description: 'Theater name', example: 'CGV Vincom Center' })
  theaterName: string;

  @ApiProperty({ description: 'Room name', example: 'Room 1' })
  roomName: string;

  @ApiProperty({ description: 'Showtime start', example: '2025-11-27T19:00:00.000Z' })
  showtimeStart: Date;

  @ApiProperty({ description: 'Booked seats', type: [ManualBookingSeatDto] })
  seats: ManualBookingSeatDto[];

  @ApiProperty({ description: 'Total amount', example: 240000 })
  totalAmount: number;

  @ApiProperty({ description: 'Final amount after discount', example: 240000 })
  finalAmount: number;

  @ApiProperty({ description: 'Customer name', example: 'Nguyễn Văn A' })
  customerName: string;

  @ApiProperty({ description: 'Customer phone', example: '0912345678' })
  customerPhone: string;

  @ApiProperty({ description: 'Payment method', example: 'Cash' })
  paymentMethod: string;

  @ApiProperty({ description: 'QR code for ticket scanning (Base64)', example: 'data:image/png;base64,...' })
  qrCode: string;

  @ApiProperty({ description: 'Booking status', example: 'Confirmed' })
  status: string;

  @ApiProperty({ description: 'Booking creation date', example: '2025-11-27T10:30:00.000Z' })
  bookingDate: Date;

  @ApiProperty({ description: 'Admin note', example: 'Customer requested seats near exit', required: false })
  adminNote?: string;
}

/**
 * Wrapper for manual booking response
 */
export class CreateManualBookingResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Manual booking created successfully' })
  message: string;

  @ApiProperty({ description: 'Booking data', type: ManualBookingResponseDto })
  data: ManualBookingResponseDto;
}
