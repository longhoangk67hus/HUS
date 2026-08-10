import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatType } from './entities/seat-type.entity';
import { CreateSeatTypeDto, UpdateSeatTypeDto } from './dto';

/**
 * SeatType Service
 * Business logic for seat type management
 * Migrated from CinemaSystem.BL (if existed)
 */
@Injectable()
export class SeatTypeService {
  constructor(
    @InjectRepository(SeatType)
    private readonly seatTypeRepository: Repository<SeatType>,
  ) {}

  /**
   * Get all seat types
   */
  async findAll(): Promise<SeatType[]> {
    return this.seatTypeRepository.find({
      order: { typeName: 'ASC' },
    });
  }

  /**
   * Get seat type by ID
   */
  async findById(id: number): Promise<SeatType> {
    const seatType = await this.seatTypeRepository.findOne({
      where: { seatTypeId: id },
    });

    if (!seatType) {
      throw new NotFoundException(`Seat type with ID ${id} not found`);
    }

    return seatType;
  }

  /**
   * Create new seat type
   */
  async create(createSeatTypeDto: CreateSeatTypeDto): Promise<SeatType> {
    // Check if type name already exists
    const existing = await this.seatTypeRepository.findOne({
      where: { typeName: createSeatTypeDto.typeName },
    });

    if (existing) {
      throw new ConflictException(`Seat type "${createSeatTypeDto.typeName}" already exists`);
    }

    const seatType = this.seatTypeRepository.create(createSeatTypeDto);
    return this.seatTypeRepository.save(seatType);
  }

  /**
   * Update seat type
   */
  async update(id: number, updateSeatTypeDto: UpdateSeatTypeDto): Promise<SeatType> {
    const seatType = await this.findById(id);

    // Check if new type name conflicts with existing
    if (updateSeatTypeDto.typeName && updateSeatTypeDto.typeName !== seatType.typeName) {
      const existing = await this.seatTypeRepository.findOne({
        where: { typeName: updateSeatTypeDto.typeName },
      });

      if (existing) {
        throw new ConflictException(`Seat type "${updateSeatTypeDto.typeName}" already exists`);
      }
    }

    Object.assign(seatType, updateSeatTypeDto);
    return this.seatTypeRepository.save(seatType);
  }

  /**
   * Delete seat type
   */
  async delete(id: number): Promise<void> {
    const seatType = await this.findById(id);

    // TODO: Check if seat type is being used by any seats
    // const seatCount = await this.seatRepository.count({ where: { seatTypeId: id } });
    // if (seatCount > 0) {
    //   throw new ConflictException(`Cannot delete seat type. It is being used by ${seatCount} seat(s)`);
    // }

    await this.seatTypeRepository.remove(seatType);
  }

  /**
   * Get statistics about seat types
   */
  async getStatistics(): Promise<any> {
    const seatTypes = await this.findAll();

    return {
      totalSeatTypes: seatTypes.length,
      seatTypes: seatTypes.map(st => ({
        seatTypeId: st.seatTypeId,
        typeName: st.typeName,
        priceMultiplier: st.priceMultiplier,
        // TODO: Add seat count when Seat module is implemented
        // seatCount: 0,
      })),
    };
  }
}
