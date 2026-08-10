import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto, UpdateShowtimeDto, ShowtimeFilterDto } from './dto';
import { MovieService } from '../movies/movie.service';
import { RoomService } from '../rooms/room.service';

/**
 * Showtime Service
 * Business logic for showtime management
 * Migrated from CinemaSystem.BL.Showtime.ShowtimeBL
 * @author HNLong
 * @date 2025-11-06
 */
@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    private readonly movieService: MovieService,
    private readonly roomService: RoomService,
  ) {}

  /**
   * Get all showtimes with movie and room details
   */
  async findAll(): Promise<Showtime[]> {
    return this.showtimeRepository.find({
      relations: ['movie', 'room', 'room.theater', 'room.roomType'],
      order: { showDate: 'ASC', showTime: 'ASC' },
    });
  }

  /**
   * Get showtime by ID with details
   */
  async findById(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({
      where: { showtimeId: id },
      relations: ['movie', 'room', 'room.theater', 'room.roomType'],
    });

    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    return showtime;
  }

  /**
   * Get showtimes by filter
   * Migrated from ShowtimeBL.GetShowtimesByFilterAsync
   */
  async findByFilter(filter: ShowtimeFilterDto): Promise<{ showtimes: Showtime[]; totalCount: number }> {
    // Validate and set defaults
    const pageNumber = filter.pageNumber || 1;
    const pageSize = Math.min(filter.pageSize || 10, 100); // Max 100 items per page

    // Validate date range
    if (filter.fromDate && filter.toDate) {
      const fromDate = new Date(filter.fromDate);
      const toDate = new Date(filter.toDate);
      
      if (fromDate > toDate) {
        throw new BadRequestException('FromDate cannot be greater than ToDate');
      }
    }

    // Build WHERE conditions dynamically
    const buildWhereConditions = (qb: any) => {
      if (filter.movieId) {
        qb.andWhere('showtime.MovieId = :movieId', { movieId: filter.movieId });
      }
      if (filter.roomId) {
        qb.andWhere('showtime.RoomId = :roomId', { roomId: filter.roomId });
      }
      if (filter.theaterId) {
        qb.andWhere('room.TheaterId = :theaterId', { theaterId: filter.theaterId });
      }
      if (filter.status) {
        qb.andWhere('showtime.Status = :status', { status: filter.status });
      }
      if (filter.fromDate && filter.toDate) {
        qb.andWhere('showtime.ShowDate BETWEEN :fromDate AND :toDate', {
          fromDate: filter.fromDate,
          toDate: filter.toDate,
        });
      } else if (filter.fromDate) {
        qb.andWhere('showtime.ShowDate >= :fromDate', { fromDate: filter.fromDate });
      } else if (filter.toDate) {
        qb.andWhere('showtime.ShowDate <= :toDate', { toDate: filter.toDate });
      }
      return qb;
    };

    // Count query
    let countQuery = this.showtimeRepository
      .createQueryBuilder('showtime')
      .leftJoin('showtime.room', 'room');
    countQuery = buildWhereConditions(countQuery);
    const totalCount = await countQuery.getCount();

    // Data query with relations - Load room and theater
    let dataQuery = this.showtimeRepository
      .createQueryBuilder('showtime')
      .leftJoinAndSelect('showtime.movie', 'movie')
      .leftJoinAndSelect('showtime.room', 'room')
      .leftJoinAndSelect('room.theater', 'theater')
      .leftJoinAndSelect('room.roomType', 'roomType');
    
    dataQuery = buildWhereConditions(dataQuery);
    
    // Get showtimes without ORDER BY to avoid TypeORM bug with date/time columns
    const showtimes = await dataQuery
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    // Sort in memory
    showtimes.sort((a, b) => {
      const dateCompare = new Date(a.showDate).getTime() - new Date(b.showDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.showTime.localeCompare(b.showTime);
    });

    return { showtimes, totalCount };
  }

  /**
   * Get showtimes by movie
   */
  async findByMovieId(movieId: number): Promise<Showtime[]> {
    // Validate movie exists
    const movieResponse = await this.movieService.getMovieById(movieId);
    if (!movieResponse.isSuccess) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    return this.showtimeRepository.find({
      where: { movieId },
      relations: ['movie', 'room', 'room.theater', 'room.roomType'],
      order: { showDate: 'ASC', showTime: 'ASC' },
    });
  }

  /**
   * Get showtimes by room
   */
  async findByRoomId(roomId: number): Promise<Showtime[]> {
    // Validate room exists
    await this.roomService.findById(roomId);

    return this.showtimeRepository.find({
      where: { roomId },
      relations: ['movie', 'room', 'room.theater', 'room.roomType'],
      order: { showDate: 'ASC', showTime: 'ASC' },
    });
  }

  /**
   * Get showtimes by date range
   */
  async findByDateRange(fromDate: string, toDate: string): Promise<Showtime[]> {
    return this.showtimeRepository.find({
      where: {
        showDate: Between(new Date(fromDate), new Date(toDate)),
      },
      relations: ['movie', 'room', 'room.theater', 'room.roomType'],
      order: { showDate: 'ASC', showTime: 'ASC' },
    });
  }

  /**
   * Get showtimes by status
   */
  async findByStatus(status: string): Promise<Showtime[]> {
    return this.showtimeRepository.find({
      where: { status },
      relations: ['movie', 'room', 'room.theater', 'room.roomType'],
      order: { showDate: 'ASC', showTime: 'ASC' },
    });
  }

  /**
   * Create new showtime
   */
  async create(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    // Validate movie exists
    const movieResponse = await this.movieService.getMovieById(createShowtimeDto.movieId);
    if (!movieResponse.isSuccess) {
      throw new NotFoundException(`Movie with ID ${createShowtimeDto.movieId} not found`);
    }

    // Validate room exists
    await this.roomService.findById(createShowtimeDto.roomId);

    // Check for time conflicts in the same room
    const conflicts = await this.showtimeRepository
      .createQueryBuilder('showtime')
      .where('showtime.RoomId = :roomId', { roomId: createShowtimeDto.roomId })
      .andWhere('showtime.ShowDate = :showDate', { showDate: createShowtimeDto.showDate })
      .andWhere('showtime.Status != :cancelledStatus', { cancelledStatus: 'Cancelled' })
      .getMany();

    if (conflicts.length > 0) {
      // Check time overlap (assuming 3 hours buffer for movie + cleanup)
      const newShowTime = createShowtimeDto.showTime;
      
      for (const conflict of conflicts) {
        const conflictTime = conflict.showTime;
        
        // Simple time conflict check (you may want to add movie duration)
        if (this.isTimeConflict(newShowTime, conflictTime)) {
          throw new ConflictException(
            `Time conflict: Room already has a showtime at ${conflictTime} on ${createShowtimeDto.showDate}`,
          );
        }
      }
    }

    const showtime = this.showtimeRepository.create({
      ...createShowtimeDto,
      status: createShowtimeDto.status || 'Scheduled',
    });

    return this.showtimeRepository.save(showtime);
  }

  /**
   * Check if two show times conflict (within 3 hours)
   */
  private isTimeConflict(time1: string, time2: string): boolean {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    
    const diff = Math.abs(minutes1 - minutes2);
    
    // 3 hours buffer = 180 minutes
    return diff < 180;
  }

  /**
   * Update showtime
   */
  async update(id: number, updateShowtimeDto: UpdateShowtimeDto): Promise<Showtime> {
    const showtime = await this.findById(id);

    // Validate movie if changed
    if (updateShowtimeDto.movieId && updateShowtimeDto.movieId !== showtime.movieId) {
      const movieResponse = await this.movieService.getMovieById(updateShowtimeDto.movieId);
      if (!movieResponse.isSuccess) {
        throw new NotFoundException(`Movie with ID ${updateShowtimeDto.movieId} not found`);
      }
    }

    // Validate room if changed
    if (updateShowtimeDto.roomId && updateShowtimeDto.roomId !== showtime.roomId) {
      await this.roomService.findById(updateShowtimeDto.roomId);
    }

    Object.assign(showtime, updateShowtimeDto);
    return this.showtimeRepository.save(showtime);
  }

  /**
   * Update showtime status
   */
  async updateStatus(id: number, status: string): Promise<Showtime> {
    const showtime = await this.findById(id);
    showtime.status = status;
    return this.showtimeRepository.save(showtime);
  }

  /**
   * Delete showtime
   */
  async delete(id: number): Promise<void> {
    const showtime = await this.findById(id);

    // TODO: Check if showtime has reservations
    // const reservationCount = await this.reservationRepository.count({ where: { showtimeId: id } });
    // if (reservationCount > 0) {
    //   throw new ConflictException(`Cannot delete showtime. It has ${reservationCount} reservation(s)`);
    // }

    await this.showtimeRepository.remove(showtime);
  }

  /**
   * Get statistics about showtimes
   */
  async getStatistics(): Promise<any> {
    const showtimes = await this.findAll();

    const totalShowtimes = showtimes.length;
    const scheduledShowtimes = showtimes.filter((s: Showtime) => s.status === 'Scheduled').length;
    const cancelledShowtimes = showtimes.filter((s: Showtime) => s.status === 'Cancelled').length;
    const completedShowtimes = showtimes.filter((s: Showtime) => s.status === 'Completed').length;

    // Group by movie
    const byMovie = showtimes.reduce((acc: Record<string, number>, showtime: Showtime) => {
      const movieTitle = showtime.movie?.title || 'Unknown';
      if (!acc[movieTitle]) {
        acc[movieTitle] = 0;
      }
      acc[movieTitle]++;
      return acc;
    }, {} as Record<string, number>);

    // Group by theater
    const byTheater = showtimes.reduce((acc: Record<string, number>, showtime: Showtime) => {
      const theaterName = showtime.room?.theater?.name || 'Unknown';
      if (!acc[theaterName]) {
        acc[theaterName] = 0;
      }
      acc[theaterName]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalShowtimes,
      byStatus: {
        scheduled: scheduledShowtimes,
        cancelled: cancelledShowtimes,
        completed: completedShowtimes,
      },
      byMovie,
      byTheater,
    };
  }

  /**
   * Auto-complete started showtimes.
   * A showtime is considered completed as soon as it starts when: (showDate + showTime) <= now.
   * Only updates showtimes currently in 'Scheduled' status.
   */
  async autoCompleteStartedShowtimes(): Promise<number> {
    const now = new Date();

    // Only scheduled showtimes up to today can possibly be completed.
    // (Future dates can't be completed.)
    const candidates = await this.showtimeRepository.find({
      where: {
        status: 'Scheduled',
        showDate: LessThanOrEqual(new Date(now.getFullYear(), now.getMonth(), now.getDate())),
      },
      relations: ['movie'],
    });

    if (!candidates.length) return 0;

    const toCompleteIds: number[] = [];
    for (const showtime of candidates) {
      // Combine date + time using local date components (avoids timezone parsing pitfalls)
      // Normalize showDate to Y/M/D parts to avoid timezone parsing issues
      // showtime.showDate may be a Date or a string like 'YYYY-MM-DD'
      let year: number;
      let month: number;
      let day: number;

      if (showtime.showDate instanceof Date) {
        year = showtime.showDate.getFullYear();
        month = showtime.showDate.getMonth() + 1;
        day = showtime.showDate.getDate();
      } else {
        const ds = String(showtime.showDate || '').trim();
        // Expecting 'YYYY-MM-DD' (SQL DATE). Fallback to Date parse only if format unknown.
        const parts = ds.split('-').map((v) => parseInt(v, 10));
        if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
          year = parts[0];
          month = parts[1];
          day = parts[2];
        } else {
          const parsed = new Date(ds);
          year = parsed.getFullYear();
          month = parsed.getMonth() + 1;
          day = parsed.getDate();
        }
      }

      const [hhRaw, mmRaw, ssRaw] = String(showtime.showTime || '00:00:00')
        .split(':')
        .map((p) => parseInt(p, 10));
      const hh = Number.isFinite(hhRaw) ? hhRaw : 0;
      const mm = Number.isFinite(mmRaw) ? mmRaw : 0;
      const ss = Number.isFinite(ssRaw) ? ssRaw : 0;

      // Construct start as local Date using year/month/day and time parts (month - 1)
      const start = new Date(year, month - 1, day, hh, mm, ss, 0);

      if (start <= now) {
        toCompleteIds.push(showtime.showtimeId);
      }
    }

    if (!toCompleteIds.length) return 0;

    const result = await this.showtimeRepository
      .createQueryBuilder()
      .update(Showtime)
      .set({ status: 'Completed' })
      .whereInIds(toCompleteIds)
      .andWhere('status = :scheduled', { scheduled: 'Scheduled' })
      .execute();

    return result.affected || 0;
  }
}
