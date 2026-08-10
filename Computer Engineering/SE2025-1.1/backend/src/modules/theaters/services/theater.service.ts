import { Injectable } from '@nestjs/common';
import { TheaterRepository } from '../repositories/theater.repository';
import { CreateTheaterDto, UpdateTheaterDto } from '../dto';
import { Theater } from '../entities/theater.entity';
import { TheaterStatus } from '../entities/theater-status.enum';
import { ServiceResponse } from '@base-core/dto/service-response.dto';

/**
 * Theater Service
 * Business logic for theater management
 */
@Injectable()
export class TheaterService {
  constructor(private readonly theaterRepository: TheaterRepository) {}

  /**
   * Get all theaters
   */
  async findAll(): Promise<ServiceResponse<Theater[]>> {
    try {
      const theaters = await this.theaterRepository.findAll();
      return ServiceResponse.success(theaters);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get active theaters only
   */
  async findActive(): Promise<ServiceResponse<Theater[]>> {
    try {
      const theaters = await this.theaterRepository.findByStatus(TheaterStatus.Active);
      return ServiceResponse.success(theaters);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get theaters by city
   */
  async findByCity(city: string): Promise<ServiceResponse<Theater[]>> {
    try {
      const theaters = await this.theaterRepository.findByCity(city);
      return ServiceResponse.success(theaters);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Get theater by ID
   */
  async findById(id: number): Promise<ServiceResponse<Theater>> {
    try {
      const theater = await this.theaterRepository.findById(id);
      
      if (!theater) {
        return ServiceResponse.error('Theater not found', 404);
      }
      
      return ServiceResponse.success(theater);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Create a new theater
   */
  async create(createTheaterDto: CreateTheaterDto): Promise<ServiceResponse<Theater>> {
    try {
      // Check if theater code already exists
      const codeExists = await this.theaterRepository.codeExists(createTheaterDto.theaterCode);
      if (codeExists) {
        return ServiceResponse.error('Theater code already exists', 409);
      }

      const theater = await this.theaterRepository.create({
        ...createTheaterDto,
        status: createTheaterDto.status || TheaterStatus.Active,
        createdDate: new Date(),
      });

      return ServiceResponse.success(theater);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Update a theater
   */
  async update(id: number, updateTheaterDto: UpdateTheaterDto): Promise<ServiceResponse<Theater>> {
    try {
      // Check if theater exists
      const existingTheater = await this.theaterRepository.findById(id);
      if (!existingTheater) {
        return ServiceResponse.error('Theater not found', 404);
      }

      // Check if theater code is being changed and if it already exists
      if (updateTheaterDto.theaterCode) {
        const codeExists = await this.theaterRepository.codeExists(updateTheaterDto.theaterCode, id);
        if (codeExists) {
          return ServiceResponse.error('Theater code already exists', 409);
        }
      }

      const updatedTheater = await this.theaterRepository.update(id, {
        ...updateTheaterDto,
        modifiedDate: new Date(),
      });

      if (!updatedTheater) {
        return ServiceResponse.error('Failed to update theater', 500);
      }

      return ServiceResponse.success(updatedTheater);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }

  /**
   * Delete a theater
   */
  async delete(id: number): Promise<ServiceResponse<boolean>> {
    try {
      // Check if theater exists
      const existingTheater = await this.theaterRepository.findById(id);
      if (!existingTheater) {
        return ServiceResponse.error('Theater not found', 404);
      }

      const deleted = await this.theaterRepository.delete(id);
      
      if (!deleted) {
        return ServiceResponse.error('Failed to delete theater', 500);
      }

      return ServiceResponse.success(true);
    } catch (error: any) {
      return ServiceResponse.error(error.message);
    }
  }
}
