import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * TypeORM Database Configuration
 * Uses existing cinema_system database from .NET version
 */
export const databaseConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'cinema_system',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  synchronize: false, // Don't auto-sync, use existing DB schema
  logging: process.env.NODE_ENV === 'development',
  timezone: '+07:00', // Vietnam timezone
  charset: 'utf8mb4',
};

export const AppDataSource = new DataSource(databaseConfig);

export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}
