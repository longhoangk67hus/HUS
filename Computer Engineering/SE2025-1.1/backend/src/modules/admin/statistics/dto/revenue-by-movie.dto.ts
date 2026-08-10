import { ApiProperty } from '@nestjs/swagger';

/**
 * Revenue by Movie DTO
 * Statistics per movie
 * 
 * @author HNLong
 * @since 2025-11-27
 */
export class MovieRevenueDto {
  @ApiProperty({ description: 'Movie ID', example: 1 })
  movieId: number;

  @ApiProperty({ description: 'Movie title', example: 'Avatar: The Way of Water' })
  title: string;

  @ApiProperty({ description: 'Poster URL', example: 'https://...' })
  posterUrl: string;

  @ApiProperty({ description: 'Total revenue in VND', example: 35000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Total tickets sold', example: 250 })
  totalTickets: number;

  @ApiProperty({ description: 'Total showtimes', example: 45 })
  totalShowtimes: number;

  @ApiProperty({ description: 'Average ticket price', example: 140000 })
  avgTicketPrice: number;

  @ApiProperty({ description: 'Average occupancy rate (%)', example: 78.5 })
  avgOccupancyRate: number;
}

export class RevenueByMovieDto {
  @ApiProperty({ description: 'Movies with revenue data', type: [MovieRevenueDto] })
  movies: MovieRevenueDto[];

  @ApiProperty({ description: 'Total revenue across all movies', example: 125000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Start date of period', example: '2025-11-01' })
  startDate: string;

  @ApiProperty({ description: 'End date of period', example: '2025-11-30' })
  endDate: string;
}
