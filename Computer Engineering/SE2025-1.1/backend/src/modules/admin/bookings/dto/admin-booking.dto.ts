import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUserDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  phoneNumber?: string;
}

export class AdminMovieDto {
  @ApiProperty({ description: 'Movie ID' })
  movieId: number;

  @ApiProperty({ description: 'Movie title' })
  title: string;

  @ApiProperty({ description: 'Movie duration in minutes' })
  duration: number;
}

export class AdminTheaterDto {
  @ApiProperty({ description: 'Theater ID' })
  theaterId: number;

  @ApiProperty({ description: 'Theater name' })
  theaterName: string;

  @ApiPropertyOptional({ description: 'Theater location' })
  location?: string;
}

export class AdminRoomDto {
  @ApiProperty({ description: 'Room ID' })
  roomId: number;

  @ApiProperty({ description: 'Room name' })
  roomName: string;

  @ApiPropertyOptional({ description: 'Theater information' })
  theater?: AdminTheaterDto;
}

export class AdminShowtimeDto {
  @ApiProperty({ description: 'Showtime ID' })
  showtimeId: number;

  @ApiProperty({ description: 'Show date' })
  showDate: Date;

  @ApiProperty({ description: 'Show time' })
  showTime: string;

  @ApiProperty({ description: 'Showtime start time (combined date + time)' })
  startTime: Date;

  @ApiProperty({ description: 'Base price' })
  basePrice: number;

  @ApiPropertyOptional({ description: 'Showtime status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Movie information' })
  movie?: AdminMovieDto;

  @ApiPropertyOptional({ description: 'Room information' })
  room?: AdminRoomDto;
}

export class AdminSeatDto {
  @ApiPropertyOptional({ description: 'Seat ID' })
  seatId?: number;

  @ApiPropertyOptional({ description: 'Seat row' })
  seatRow?: string;

  @ApiPropertyOptional({ description: 'Seat column' })
  seatColumn?: number;

  @ApiPropertyOptional({ description: 'Seat type name' })
  seatType?: string;

  @ApiProperty({ description: 'Seat price' })
  price: number;
}

/**
 * Admin Booking DTO - Comprehensive booking information for admin panel
 */
export class AdminBookingDto {
  @ApiProperty({ description: 'Booking ID' })
  bookingId: number;

  @ApiProperty({ description: 'Booking code' })
  bookingCode: string;

  @ApiProperty({ description: 'Booking status', enum: ['Pending', 'Confirmed', 'Cancelled'] })
  status: 'Pending' | 'Confirmed' | 'Cancelled';

  @ApiProperty({ description: 'Total amount before discount' })
  totalAmount: number;

  @ApiProperty({ description: 'Discount amount' })
  discountAmount: number;

  @ApiProperty({ description: 'Final amount after discount' })
  finalAmount: number;

  @ApiProperty({ description: 'Booking creation date' })
  bookingDate: Date;

  @ApiPropertyOptional({ description: 'Booking expiry date' })
  expiryDate?: Date;

  @ApiPropertyOptional({ description: 'Last modified date' })
  modifiedDate?: Date;

  @ApiPropertyOptional({ description: 'QR code data URL' })
  qrCode?: string;

  @ApiPropertyOptional({ description: 'User information' })
  user?: AdminUserDto;

  @ApiPropertyOptional({ description: 'Showtime information' })
  showtime?: AdminShowtimeDto;

  @ApiProperty({ description: 'Booked seats', type: [AdminSeatDto] })
  seats: AdminSeatDto[];
}