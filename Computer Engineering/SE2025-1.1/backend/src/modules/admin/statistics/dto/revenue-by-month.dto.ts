import { ApiProperty } from '@nestjs/swagger';

/**
 * Monthly revenue DTO
 */
export class MonthlyRevenueDto {
  @ApiProperty({ example: '2025-11', description: 'Month in YYYY-MM format' })
  month: string;

  @ApiProperty({ example: 1500000, description: 'Total revenue for the month' })
  revenue: number;

  @ApiProperty({ example: 450, description: 'Total tickets sold in the month' })
  tickets: number;

  @ApiProperty({ example: 125, description: 'Total bookings in the month' })
  bookings: number;

  @ApiProperty({ example: 15.5, description: 'Growth percentage compared to previous month' })
  growthRate?: number;
}

/**
 * Revenue by month response DTO
 */
export class RevenueByMonthDto {
  @ApiProperty({ 
    type: [MonthlyRevenueDto], 
    description: 'Monthly revenue breakdown'
  })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({ example: '2025-11', description: 'Peak month with highest revenue' })
  peakMonth: string;

  @ApiProperty({ example: 2500000, description: 'Highest monthly revenue' })
  peakRevenue: number;

  @ApiProperty({ example: 15000000, description: 'Total revenue for the period' })
  totalRevenue: number;

  @ApiProperty({ example: 1750000, description: 'Average monthly revenue' })
  averageMonthlyRevenue: number;

  @ApiProperty({ example: '2025-01', description: 'Start month of the period' })
  startMonth: string;

  @ApiProperty({ example: '2025-12', description: 'End month of the period' })
  endMonth: string;

  @ApiProperty({ example: 12.5, description: 'Overall growth rate for the period' })
  overallGrowthRate: number;
}