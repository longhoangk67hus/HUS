import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Revenue Summary DTO
 * Dashboard overview statistics
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class GrowthDto {
  @ApiProperty({ description: 'Revenue growth percentage', example: 15.5 })
  revenue: number;

  @ApiProperty({ description: 'Bookings growth percentage', example: 12.3 })
  bookings: number;

  @ApiProperty({ description: 'Tickets growth percentage', example: 18.7 })
  tickets: number;
}

export class BookingsByStatusDto {
  @ApiProperty({ description: 'Confirmed bookings count', example: 420 })
  confirmed: number;

  @ApiProperty({ description: 'Cancelled bookings count', example: 15 })
  cancelled: number;

  @ApiProperty({ description: 'Pending bookings count', example: 15 })
  pending: number;

  @ApiProperty({ description: 'Completed bookings count', example: 380 })
  completed: number;
}

export class RevenueSummaryDto {
  @ApiProperty({ description: 'Total revenue in VND', example: 125000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total bookings count', example: 450 })
  totalBookings: number;

  @ApiProperty({ description: 'Total tickets sold', example: 890 })
  totalTickets: number;

  @ApiProperty({ description: 'Average ticket price', example: 140449 })
  averageTicketPrice: number;

  @ApiPropertyOptional({ description: 'Growth compared to previous period', type: GrowthDto })
  growth?: GrowthDto;

  @ApiProperty({ description: 'Bookings by status breakdown', type: BookingsByStatusDto })
  bookingsByStatus: BookingsByStatusDto;

  @ApiProperty({ description: 'Start date of period', example: '2025-11-01' })
  startDate: string;

  @ApiProperty({ description: 'End date of period', example: '2025-11-30' })
  endDate: string;
}
