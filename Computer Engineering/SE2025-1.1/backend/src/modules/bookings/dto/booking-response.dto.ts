import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../entities/booking.entity';

/**
 * Seat info in booking response
 */
export class BookingSeatInfo {
  @ApiProperty({ example: 12 })
  seatId: number;

  @ApiProperty({ example: 'A1' })
  seatNumber: string;

  @ApiProperty({ example: 'VIP' })
  seatType: string;

  @ApiProperty({ example: 150000 })
  price: number;
}

/**
 * Response DTO for booking operations
 * Contains full booking details with relations
 */
export class BookingResponseDto {
  @ApiProperty({ example: 456 })
  bookingId: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: 10 })
  showtimeId: number;

  @ApiProperty({ example: 123 })
  reservationId: number;

  @ApiProperty({ example: 'BK20251108A1B2' })
  bookingCode: string;

  @ApiProperty({ example: 300000 })
  totalAmount: number;

  @ApiProperty({ example: 0 })
  discountAmount: number;

  @ApiProperty({ example: 300000 })
  finalAmount: number;

  @ApiProperty({ example: 30 })
  pointsEarned: number;

  @ApiProperty({ example: 0 })
  pointsUsed: number;

  @ApiProperty({ example: 'Pending' })
  status: string;

  @ApiProperty({ example: '2025-11-08T10:00:00Z' })
  bookingDate: Date;

  @ApiProperty({ example: '2025-11-08T10:15:00Z' })
  expiryDate: Date;

  @ApiProperty({ type: [BookingSeatInfo] })
  seats: BookingSeatInfo[];

  @ApiProperty({ example: 'https://payment.vnpay.vn/...' })
  paymentUrl?: string;

  constructor(booking: Booking, seats: BookingSeatInfo[], paymentUrl?: string) {
    this.bookingId = booking.bookingId;
    this.userId = booking.userId;
    this.showtimeId = booking.showtimeId;
    this.reservationId = booking.reservationId!;
    this.bookingCode = booking.bookingCode;
    this.totalAmount = Number(booking.totalAmount);
    this.discountAmount = Number(booking.discountAmount);
    this.finalAmount = Number(booking.finalAmount);
    this.pointsEarned = booking.pointsEarned;
    this.pointsUsed = booking.pointsUsed;
    this.status = booking.status;
    this.bookingDate = booking.bookingDate;
    this.expiryDate = booking.expiryDate;
    this.seats = seats;
    this.paymentUrl = paymentUrl;
  }
}
