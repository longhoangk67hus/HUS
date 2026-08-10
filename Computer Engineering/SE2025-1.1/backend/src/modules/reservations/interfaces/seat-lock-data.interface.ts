/**
 * Data structure stored in Redis for seat locks
 */
export interface SeatLockData {
  seatId: number;
  showtimeId: number;
  lockedBy: string; // userId or sessionId
  lockedAt: Date;
  expiresAt: Date;
  reservationId?: number; // Set after reservation is created in DB
}
