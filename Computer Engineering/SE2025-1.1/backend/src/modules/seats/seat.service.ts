import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
import { CreateSeatDto, UpdateSeatDto, UpdateSeatStatusDto } from './dto';
import { RoomService } from '../rooms/room.service';
import { SeatTypeService } from '../seat-types/seat-type.service';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingSeat } from '../bookings/entities/booking-seat.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

/**
 * Seat Service
 * Business logic for seat management
 * Migrated from CinemaSystem.BL.Seat.SeatBL and CinemaSystem.DL.Seat.SeatDL
 */
@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private readonly bookingSeatRepository: Repository<BookingSeat>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly roomService: RoomService,
    private readonly seatTypeService: SeatTypeService,
  ) {}

  /**
   * Get all seats with room and seat type details
   */
  async findAll(): Promise<Seat[]> {
    return this.seatRepository.find({
      relations: ['room', 'seatType'],
      order: { roomId: 'ASC', row: 'ASC', col: 'ASC' },
    });
  }

  /**
   * Get seat by ID with details
   */
  async findById(id: number): Promise<Seat> {
    const seat = await this.seatRepository.findOne({
      where: { seatId: id },
      relations: ['room', 'seatType'],
    });

    if (!seat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }

    return seat;
  }

  /**
   * Get all seats in a room (room layout)
   */
  async findByRoomId(roomId: number): Promise<Seat[]> {
    // Validate room exists
    await this.roomService.findById(roomId);

    return this.seatRepository.find({
      where: { roomId },
      relations: ['seatType'],
      order: { row: 'ASC', col: 'ASC' },
    });
  }

  /**
   * Get all seats in a room with booking status for a specific showtime
   * Returns seats with isBooked flag based on confirmed bookings for this showtime
   */
  async findByRoomAndShowtime(roomId: number, showtimeId: number): Promise<any[]> {
    // Validate room exists
    await this.roomService.findById(roomId);

    // Get all seats in the room with seatType relations
    const seats = await this.seatRepository.find({
      where: { roomId },
      relations: ['seatType'],
      order: { row: 'ASC', col: 'ASC' },
    });

    console.log(`[Seat] findByRoomAndShowtime - loaded ${seats.length} seats with seatType relations`);
    console.log(`[Seat] First seat seatType:`, seats[0]?.seatType);

    // Get all confirmed bookings for this showtime with their seats
    const confirmedBookings = await this.bookingRepository.find({
      where: { 
        showtimeId,
        status: 'Confirmed',
      },
      relations: ['bookingSeats'],
    });

    // Collect all booked seat IDs for this showtime
    const bookedSeatIds = new Set<number>();
    confirmedBookings.forEach(booking => {
      booking.bookingSeats?.forEach(bs => {
        bookedSeatIds.add(bs.seatId);
      });
    });

    // Map seats with isBooked flag
    // Additionally, find Pending reservations for this showtime to mark held seats
    const pendingReservations = await this.reservationRepository.find({
      where: { showtimeId, status: 'Pending' },
    });

    const heldSeatIds = new Set<number>();
    pendingReservations.forEach(r => {
      const ids = (r.seatIds || '').split(',').map(s => parseInt(s.trim(), 10)).filter(id => id > 0);
      ids.forEach(id => heldSeatIds.add(id));
    });

    const result = seats.map(seat => ({
      seatId: seat.seatId,
      row: seat.row,
      col: seat.col,
      seatNumber: `${seat.row}${seat.col}`,
      // if seat is held by a reservation, mark status as Held for frontend normalization
      status: heldSeatIds.has(seat.seatId) ? 'Held' : seat.status,
      seatTypeId: seat.seatTypeId,
      seatTypeName: seat.seatType?.typeName || 'Regular',
      priceMultiplier: seat.seatType?.priceMultiplier,
      // isBooked is true if seat is booked (Confirmed) for THIS showtime
      isBooked: bookedSeatIds.has(seat.seatId),
      // isHeld flag for quicker frontend checks
      isHeld: heldSeatIds.has(seat.seatId),
    }));

    console.log(`[Seat] findByRoomAndShowtime - returning:`, result[0]);
    return result;
  }

  /**
   * Get room layout with statistics
   * Migrated from SeatDL.GetRoomLayoutAsync
   */
  async getRoomLayout(roomId: number): Promise<any> {
    const room = await this.roomService.findById(roomId);
    const seats = await this.findByRoomId(roomId);

    if (seats.length === 0) {
      return {
        roomId: room.roomId,
        roomName: room.roomName,
        roomTypeName: room.roomType?.typeName,
        roomPriceMultiplier: room.roomType?.priceMultiplier,
        totalSeats: room.totalSeats,
        seats: [],
        rows: [],
        maxRow: 0,
        maxCol: 0,
        availableSeats: 0,
        bookedSeats: 0,
        brokenSeats: 0,
      };
    }

    // Get unique rows
    const rows = [...new Set(seats.map(s => s.row))].sort();
    const maxCol = Math.max(...seats.map(s => s.col));

    // Calculate statistics
    const availableSeats = seats.filter(s => s.status === 'Available').length;
    const brokenSeats = seats.filter(s => s.status === 'Broken').length;
    const reservedSeats = seats.filter(s => s.status === 'Reserved').length;

    return {
      roomId: room.roomId,
      roomName: room.roomName,
      roomTypeName: room.roomType?.typeName,
      roomPriceMultiplier: room.roomType?.priceMultiplier,
      totalSeats: room.totalSeats,
      seats: seats.map(seat => ({
        seatId: seat.seatId,
        row: seat.row,
        col: seat.col,
        seatNumber: `${seat.row}${seat.col}`,
        status: seat.status,
        seatTypeId: seat.seatTypeId,
        seatTypeName: seat.seatType?.typeName,
        priceMultiplier: seat.seatType?.priceMultiplier,
        isBooked: seat.status === 'Reserved',
        isSelected: false,
      })),
      rows,
      maxRow: rows.length,
      maxCol,
      availableSeats,
      bookedSeats: reservedSeats,
      brokenSeats,
    };
  }

  /**
   * Get seats by status
   */
  async findByStatus(status: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { status },
      relations: ['room', 'seatType'],
      order: { roomId: 'ASC', row: 'ASC', col: 'ASC' },
    });
  }

  /**
   * Get seats by seat type
   */
  async findBySeatTypeId(seatTypeId: number): Promise<Seat[]> {
    // Validate seat type exists
    await this.seatTypeService.findById(seatTypeId);

    return this.seatRepository.find({
      where: { seatTypeId },
      relations: ['room', 'seatType'],
      order: { roomId: 'ASC', row: 'ASC', col: 'ASC' },
    });
  }

  /**
   * Create new seat
   */
  async create(createSeatDto: CreateSeatDto): Promise<Seat> {
    // Validate room exists
    await this.roomService.findById(createSeatDto.roomId);

    // Validate seat type exists
    await this.seatTypeService.findById(createSeatDto.seatTypeId);

    // Check if seat already exists at this position
    const existing = await this.seatRepository.findOne({
      where: {
        roomId: createSeatDto.roomId,
        row: createSeatDto.row,
        col: createSeatDto.col,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Seat at row ${createSeatDto.row}, column ${createSeatDto.col} already exists in this room`,
      );
    }

    const seat = this.seatRepository.create({
      ...createSeatDto,
      status: createSeatDto.status || 'Available',
    });

    return this.seatRepository.save(seat);
  }

  /**
   * Create multiple seats for a room (bulk creation)
   */
  async createBulk(roomId: number, rows: string[], cols: number, seatTypeId: number): Promise<Seat[]> {
    // Validate room exists
    await this.roomService.findById(roomId);

    // Validate seat type exists
    await this.seatTypeService.findById(seatTypeId);

    const seats: Seat[] = [];

    for (const row of rows) {
      for (let col = 1; col <= cols; col++) {
        // Check if seat already exists
        const existing = await this.seatRepository.findOne({
          where: { roomId, row, col },
        });

        if (!existing) {
          const seat = this.seatRepository.create({
            roomId,
            row,
            col,
            seatTypeId,
            status: 'Available',
          });
          seats.push(seat);
        }
      }
    }

    if (seats.length === 0) {
      throw new ConflictException('All seats already exist in this room');
    }

    return this.seatRepository.save(seats);
  }

  /**
   * Update seat
   */
  async update(id: number, updateSeatDto: UpdateSeatDto): Promise<Seat> {
    const seat = await this.findById(id);

    // Validate room if changed
    if (updateSeatDto.roomId && updateSeatDto.roomId !== seat.roomId) {
      await this.roomService.findById(updateSeatDto.roomId);
    }

    // Validate seat type if changed
    if (updateSeatDto.seatTypeId && updateSeatDto.seatTypeId !== seat.seatTypeId) {
      await this.seatTypeService.findById(updateSeatDto.seatTypeId);
    }

    // Check if new position conflicts with existing seat
    if (
      (updateSeatDto.roomId && updateSeatDto.roomId !== seat.roomId) ||
      (updateSeatDto.row && updateSeatDto.row !== seat.row) ||
      (updateSeatDto.col && updateSeatDto.col !== seat.col)
    ) {
      const existing = await this.seatRepository.findOne({
        where: {
          roomId: updateSeatDto.roomId || seat.roomId,
          row: updateSeatDto.row || seat.row,
          col: updateSeatDto.col || seat.col,
        },
      });

      if (existing && existing.seatId !== id) {
        throw new ConflictException(
          `Seat at row ${updateSeatDto.row || seat.row}, column ${updateSeatDto.col || seat.col} already exists in this room`,
        );
      }
    }

    Object.assign(seat, updateSeatDto);
    return this.seatRepository.save(seat);
  }

  /**
   * Update seat status
   */
  async updateStatus(id: number, status: string): Promise<Seat> {
    const seat = await this.findById(id);
    seat.status = status;
    return this.seatRepository.save(seat);
  }

  /**
   * Delete seat
   */
  async delete(id: number): Promise<void> {
    const seat = await this.findById(id);

    // TODO: Check if seat is being used in reservations
    // const reservationCount = await this.reservationRepository.count({ where: { seatId: id } });
    // if (reservationCount > 0) {
    //   throw new ConflictException(`Cannot delete seat. It has ${reservationCount} reservation(s)`);
    // }

    await this.seatRepository.remove(seat);
  }

  /**
   * Delete all seats in a room
   */
  async deleteByRoomId(roomId: number): Promise<void> {
    const seats = await this.findByRoomId(roomId);
    
    if (seats.length > 0) {
      await this.seatRepository.remove(seats);
    }
  }

  /**
   * Get statistics about seats
   */
  async getStatistics(): Promise<any> {
    const seats = await this.findAll();

    const totalSeats = seats.length;
    const availableSeats = seats.filter((s: Seat) => s.status === 'Available').length;
    const brokenSeats = seats.filter((s: Seat) => s.status === 'Broken').length;
    const reservedSeats = seats.filter((s: Seat) => s.status === 'Reserved').length;

    // Group by room
    const byRoom = seats.reduce((acc: Record<number, { roomName: string; count: number }>, seat: Seat) => {
      const roomId = seat.roomId;
      if (!acc[roomId]) {
        acc[roomId] = { roomName: seat.room?.roomName || 'Unknown', count: 0 };
      }
      acc[roomId].count++;
      return acc;
    }, {} as Record<number, { roomName: string; count: number }>);

    // Group by seat type
    const bySeatType = seats.reduce((acc: Record<string, number>, seat: Seat) => {
      const typeName = seat.seatType?.typeName || 'Unknown';
      if (!acc[typeName]) {
        acc[typeName] = 0;
      }
      acc[typeName]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSeats,
      byStatus: {
        available: availableSeats,
        broken: brokenSeats,
        reserved: reservedSeats,
      },
      byRoom,
      bySeatType,
    };
  }
}
