import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto';
import { RoomTypeService } from '../room-types/room-type.service';
import { TheaterService } from '../theaters/services/theater.service';

/**
 * Room Service
 * Business logic for room management
 * Migrated from CinemaSystem.BL.Room.RoomBL
 */
@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly roomTypeService: RoomTypeService,
    private readonly theaterService: TheaterService,
  ) {}

  /**
   * Get all rooms with theater and room type details
   */
  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['theater', 'roomType'],
      order: { roomName: 'ASC' },
    });
  }

  /**
   * Get room by ID with theater and room type details
   */
  async findById(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { roomId: id },
      relations: ['theater', 'roomType'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  /**
   * Get rooms by theater ID with details
   */
  async findByTheaterId(theaterId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { theaterId },
      relations: ['theater', 'roomType'],
      order: { roomName: 'ASC' },
    });
  }

  /**
   * Get rooms by room type ID with details
   */
  async findByRoomTypeId(roomTypeId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { roomTypeId },
      relations: ['theater', 'roomType'],
      order: { roomName: 'ASC' },
    });
  }

  /**
   * Get rooms by status with details
   */
  async findByStatus(status: string): Promise<Room[]> {
    return this.roomRepository.find({
      where: { status },
      relations: ['theater', 'roomType'],
      order: { roomName: 'ASC' },
    });
  }

  /**
   * Get active rooms only
   */
  async findActive(): Promise<Room[]> {
    return this.findByStatus('Active');
  }

  /**
   * Create new room with Standard type as default
   */
  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // Default to Standard room type if not specified
    const roomTypeId = createRoomDto.roomTypeId || 1;
    
    // Validate room type exists
    await this.roomTypeService.findById(roomTypeId);

    // Validate theater exists (if provided)
    if (createRoomDto.theaterId) {
      await this.theaterService.findById(createRoomDto.theaterId);
    }

    // Check if room name already exists in the same theater
    if (createRoomDto.theaterId) {
      const existing = await this.roomRepository.findOne({
        where: {
          roomName: createRoomDto.roomName,
          theaterId: createRoomDto.theaterId,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Room "${createRoomDto.roomName}" already exists in this theater`,
        );
      }
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      roomTypeId: roomTypeId,
      status: createRoomDto.status || 'Active',
    });

    return this.roomRepository.save(room);
  }

  /**
   * Update room
   */
  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findById(id);

    // Validate room type exists (if changed)
    if (updateRoomDto.roomTypeId) {
      await this.roomTypeService.findById(updateRoomDto.roomTypeId);
    }

    // Validate theater exists (if changed)
    if (updateRoomDto.theaterId) {
      await this.theaterService.findById(updateRoomDto.theaterId);
    }

    // Check room name conflict (if changed)
    if (updateRoomDto.roomName || updateRoomDto.theaterId) {
      const newRoomName = updateRoomDto.roomName || room.roomName;
      const newTheaterId = updateRoomDto.theaterId || room.theaterId;

      if (newTheaterId) {
        const existing = await this.roomRepository.findOne({
          where: {
            roomName: newRoomName,
            theaterId: newTheaterId,
          },
        });

        if (existing && existing.roomId !== id) {
          throw new ConflictException(
            `Room "${newRoomName}" already exists in this theater`,
          );
        }
      }
    }

    Object.assign(room, updateRoomDto);
    return this.roomRepository.save(room);
  }

  /**
   * Delete room
   */
  async delete(id: number): Promise<void> {
    const room = await this.findById(id);

    // TODO: Check if room is being used by any showtimes
    // const showtimeCount = await this.showtimeRepository.count({ where: { roomId: id } });
    // if (showtimeCount > 0) {
    //   throw new ConflictException(`Cannot delete room. It has ${showtimeCount} showtime(s)`);
    // }

    await this.roomRepository.remove(room);
  }

  /**
   * Get statistics about rooms
   */
  async getStatistics(): Promise<any> {
    const rooms = await this.findAll();
    
    const totalRooms = rooms.length;
    const activeRooms = rooms.filter((r: Room) => r.status === 'Active').length;
    const maintenanceRooms = rooms.filter((r: Room) => r.status === 'Maintenance').length;
    const inactiveRooms = rooms.filter((r: Room) => r.status === 'Inactive').length;
    const totalSeats = rooms.reduce((sum: number, r: Room) => sum + r.totalSeats, 0);

    // Group by theater
    const byTheater = rooms.reduce((acc: Record<string, { count: number; totalSeats: number }>, room: Room) => {
      const theaterName = room.theater?.name || 'No Theater';
      if (!acc[theaterName]) {
        acc[theaterName] = { count: 0, totalSeats: 0 };
      }
      acc[theaterName].count++;
      acc[theaterName].totalSeats += room.totalSeats;
      return acc;
    }, {} as Record<string, { count: number; totalSeats: number }>);

    // Group by room type
    const byRoomType = rooms.reduce((acc: Record<string, { count: number; totalSeats: number }>, room: Room) => {
      const typeName = room.roomType?.typeName || 'Unknown';
      if (!acc[typeName]) {
        acc[typeName] = { count: 0, totalSeats: 0 };
      }
      acc[typeName].count++;
      acc[typeName].totalSeats += room.totalSeats;
      return acc;
    }, {} as Record<string, { count: number; totalSeats: number }>);

    return {
      totalRooms,
      totalSeats,
      byStatus: {
        active: activeRooms,
        maintenance: maintenanceRooms,
        inactive: inactiveRooms,
      },
      byTheater,
      byRoomType,
      averageSeatsPerRoom: totalRooms > 0 ? Math.round(totalSeats / totalRooms) : 0,
    };
  }

  /**
   * Update room status
   */
  async updateStatus(id: number, status: string): Promise<Room> {
    const validStatuses = ['Active', 'Maintenance', 'Inactive'];
    
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    const room = await this.findById(id);
    room.status = status;
    
    return this.roomRepository.save(room);
  }
}
