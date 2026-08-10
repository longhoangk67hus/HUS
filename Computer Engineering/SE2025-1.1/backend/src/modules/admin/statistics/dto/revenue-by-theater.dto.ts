import { ApiProperty } from '@nestjs/swagger';

/**
 * Revenue by Theater DTO
 * Statistics per theater/cinema
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class TheaterRevenueDto {
  @ApiProperty({ description: 'Theater ID', example: 1 })
  theaterId: number;

  @ApiProperty({ description: 'Theater name', example: 'CGV Vincom Bà Triệu' })
  theaterName: string;

  @ApiProperty({ description: 'City', example: 'Hanoi' })
  city: string;

  @ApiProperty({ description: 'Total revenue in VND', example: 45000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total tickets sold', example: 320 })
  totalTickets: number;

  @ApiProperty({ description: 'Total showtimes', example: 65 })
  totalShowtimes: number;

  @ApiProperty({ description: 'Average occupancy rate (%)', example: 72.3 })
  avgOccupancyRate: number;

  @ApiProperty({ description: 'Total rooms in theater', example: 8 })
  totalRooms: number;
}

export class RevenueByTheaterDto {
  @ApiProperty({ description: 'Theaters with revenue data', type: [TheaterRevenueDto] })
  theaters: TheaterRevenueDto[];

  @ApiProperty({ description: 'Total revenue across all theaters', example: 125000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Start date of period', example: '2025-11-01' })
  startDate: string;

  @ApiProperty({ description: 'End date of period', example: '2025-11-30' })
  endDate: string;
}
