import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from './entities/room-type.entity';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto';

/**
 * RoomType Service
 * Business logic for room type management
 * Migrated from CinemaSystem.BL.RoomType.RoomTypeBL
 */
@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
  ) {}

  /**
   * Get all room types
   */
  async findAll(): Promise<RoomType[]> {
    return this.roomTypeRepository.find({
      order: { typeName: 'ASC' },
    });
  }

  /**
   * Get room type by ID
   */
  async findById(id: number): Promise<RoomType> {
    const roomType = await this.roomTypeRepository.findOne({
      where: { roomTypeId: id },
    });

    if (!roomType) {
      throw new NotFoundException(`Room type with ID ${id} not found`);
    }

    return roomType;
  }

  /**
   * Get room type by type name
   */
  async findByTypeName(typeName: string): Promise<RoomType | null> {
    return this.roomTypeRepository.findOne({
      where: { typeName },
    });
  }

  /**
   * Create new room type
   */
  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    // Check if type name already exists
    const existing = await this.findByTypeName(createRoomTypeDto.typeName);
    if (existing) {
      throw new ConflictException(
        `Room type with name "${createRoomTypeDto.typeName}" already exists`,
      );
    }

    const roomType = this.roomTypeRepository.create(createRoomTypeDto);
    return this.roomTypeRepository.save(roomType);
  }

  /**
   * Update room type
   */
  async update(id: number, updateRoomTypeDto: UpdateRoomTypeDto): Promise<RoomType> {
    const roomType = await this.findById(id);

    // Check if new type name conflicts with existing
    if (updateRoomTypeDto.typeName && updateRoomTypeDto.typeName !== roomType.typeName) {
      const existing = await this.findByTypeName(updateRoomTypeDto.typeName);
      if (existing) {
        throw new ConflictException(
          `Room type with name "${updateRoomTypeDto.typeName}" already exists`,
        );
      }
    }

    Object.assign(roomType, updateRoomTypeDto);
    return this.roomTypeRepository.save(roomType);
  }

  /**
   * Delete room type
   */
  async delete(id: number): Promise<void> {
    const roomType = await this.findById(id);
    
    // TODO: Check if room type is being used by any rooms
    // const roomCount = await this.roomRepository.count({ where: { roomTypeId: id } });
    // if (roomCount > 0) {
    //   throw new ConflictException(`Cannot delete room type. It is used by ${roomCount} room(s)`);
    // }

    await this.roomTypeRepository.remove(roomType);
  }

  /**
   * Get statistics about room types
   */
  async getStatistics(): Promise<any> {
    const roomTypes = await this.findAll();
    
    return {
      total: roomTypes.length,
      roomTypes: roomTypes.map(rt => ({
        roomTypeId: rt.roomTypeId,
        typeName: rt.typeName,
        priceMultiplier: rt.priceMultiplier,
        // roomCount: 0, // TODO: Count rooms when Room entity is ready
      })),
    };
  }
}
