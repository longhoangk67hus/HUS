import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Theater } from '../entities/theater.entity';
import { TheaterStatus } from '../entities/theater-status.enum';

/**
 * Theater Repository
 * Handles database operations for theaters
 */
@Injectable()
export class TheaterRepository {
  constructor(
    @InjectRepository(Theater)
    private theaterRepository: Repository<Theater>,
  ) {}

  /**
   * Find all theaters
   */
  async findAll(): Promise<Theater[]> {
    return this.theaterRepository.find({
      order: { theaterId: 'ASC' },
    });
  }

  /**
   * Find theaters by status
   */
  async findByStatus(status: TheaterStatus): Promise<Theater[]> {
    return this.theaterRepository.find({
      where: { status },
      order: { theaterId: 'ASC' },
    });
  }

  /**
   * Find theaters by city
   */
  async findByCity(city: string): Promise<Theater[]> {
    return this.theaterRepository.find({
      where: { city },
      order: { theaterId: 'ASC' },
    });
  }

  /**
   * Find a theater by ID
   */
  async findById(id: number): Promise<Theater | null> {
    return this.theaterRepository.findOne({
      where: { theaterId: id },
    });
  }

  /**
   * Find a theater by code
   */
  async findByCode(code: string): Promise<Theater | null> {
    return this.theaterRepository.findOne({
      where: { theaterCode: code },
    });
  }

  /**
   * Create a new theater
   */
  async create(theaterData: Partial<Theater>): Promise<Theater> {
    const theater = this.theaterRepository.create(theaterData);
    return this.theaterRepository.save(theater);
  }

  /**
   * Update a theater
   */
  async update(id: number, theaterData: Partial<Theater>): Promise<Theater | null> {
    await this.theaterRepository.update(id, theaterData);
    return this.findById(id);
  }

  /**
   * Delete a theater
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.theaterRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if theater code exists
   */
  async codeExists(code: string, excludeId?: number): Promise<boolean> {
    const where: FindOptionsWhere<Theater> = { theaterCode: code };
    
    if (excludeId) {
      // For updates, exclude the current theater
      const theater = await this.theaterRepository.findOne({ where });
      return theater !== null && theater.theaterId !== excludeId;
    }
    
    const count = await this.theaterRepository.count({ where });
    return count > 0;
  }
}
