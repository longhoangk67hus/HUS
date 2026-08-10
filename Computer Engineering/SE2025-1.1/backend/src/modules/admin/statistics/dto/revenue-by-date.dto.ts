import { ApiProperty } from '@nestjs/swagger';

/**
 * Revenue by Date DTO
 * Daily revenue time-series data
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class DailyRevenueDto {
  @ApiProperty({ description: 'Date', example: '2025-11-01' })
  date: string;

  @ApiProperty({ description: 'Revenue for the day', example: 4200000 })
  revenue: number;

  @ApiProperty({ description: 'Tickets sold', example: 30 })
  tickets: number;

  @ApiProperty({ description: 'Bookings count', example: 18 })
  bookings: number;
}

export class RevenueByDateDto {
  @ApiProperty({ description: 'Daily revenue data', type: [DailyRevenueDto] })
  dailyRevenue: DailyRevenueDto[];

  @ApiProperty({ description: 'Date with highest revenue', example: '2025-11-15' })
  peakDate: string;

  @ApiProperty({ description: 'Peak day revenue', example: 8900000 })
  peakRevenue: number;

  @ApiProperty({ description: 'Total revenue in period', example: 125000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Start date of period', example: '2025-11-01' })
  startDate: string;

  @ApiProperty({ description: 'End date of period', example: '2025-11-30' })
  endDate: string;
}
