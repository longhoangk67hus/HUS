# Reservation Module - Atomic Seat Locking with Redis

## 📖 Overview

Reservation module quản lý việc giữ ghế tạm thời với Redis-based atomic locking để ngăn chặn race conditions và double booking.

**Author**: HNLong  
**Since**: 2025-11-06

---

## 🎯 Features

### ✅ Core Features
- **Atomic Seat Locking**: Dùng Redis SETNX để lock ghế atomic, tránh race condition
- **Auto-Expiration**: Reservation tự động expire sau 10 phút
- **Rollback Mechanism**: Tự động release locks khi fail
- **Rate Limiting**: Giới hạn 3 reservation attempts/minute/IP
- **Background Job**: Cron job tự động giải phóng expired reservations mỗi 1 phút
- **Anonymous Support**: Hỗ trợ cả logged-in users (userId) và anonymous (sessionId)

### 🔐 Race Condition Prevention
```typescript
// Atomic lock with SETNX
for (const seatId of seatIds) {
  const acquired = await redis.SETNX(lockKey, lockData, TTL);
  if (!acquired) {
    // ROLLBACK: Release all previously acquired locks
    await rollbackLocks(lockedSeats);
    throw new ConflictException('Ghế đang được giữ');
  }
  lockedSeats.push(seatId);
}
// All locks acquired → Create reservation in DB
```

---

## 📋 Database Schema

```sql
CREATE TABLE `reservation` (
  `ReservationId` INT AUTO_INCREMENT PRIMARY KEY,
  `ShowtimeId` INT NOT NULL,
  `UserId` VARCHAR(255) NULL,
  `SessionId` VARCHAR(255) NULL,
  `SeatIds` TEXT NOT NULL, -- "12,13,14"
  `Status` ENUM('Pending', 'Confirmed', 'Expired', 'Cancelled'),
  `CreatedAt` DATETIME DEFAULT NOW(),
  `ExpiresAt` DATETIME NOT NULL, -- CreatedAt + 10 mins
  `CompletedAt` DATETIME NULL,
  `IpAddress` VARCHAR(45) NULL,
  `UserAgent` TEXT NULL,
  INDEX idx_showtime (ShowtimeId),
  INDEX idx_user (UserId),
  INDEX idx_status_expires (Status, ExpiresAt)
);
```

---

## 🚀 API Endpoints

### 1. Create Reservation
**POST** `/api/reservations`

**Request Body:**
```json
{
  "showtimeId": 1,
  "seatIds": [12, 13, 14],
  "userId": "user_12345",  // Optional (for logged-in)
  "sessionId": "sess_abc"  // Optional (for anonymous)
}
```

**Response:**
```json
{
  "reservationId": 123,
  "showtimeId": 1,
  "seatIds": [12, 13, 14],
  "status": "Pending",
  "createdAt": "2025-11-06T10:00:00Z",
  "expiresAt": "2025-11-06T10:10:00Z",
  "remainingSeconds": 600,
  "lockKeys": ["seat_lock:1:12", "seat_lock:1:13", "seat_lock:1:14"]
}
```

**Errors:**
- `400`: Invalid data, showtime started, max seats exceeded
- `404`: Showtime/seats not found
- `409`: Seats already locked, duplicate reservation
- `429`: Rate limit exceeded (3 requests/minute)

---

### 2. Cancel Reservation
**PUT** `/api/reservations/:id/cancel?userId=xxx&sessionId=yyy`

**Response:**
```json
{
  "message": "Hủy giữ ghế thành công",
  "reservationId": 123
}
```

**Errors:**
- `404`: Reservation not found
- `403`: Not authorized (wrong userId/sessionId)
- `400`: Already processed

---

### 3. Get Reservation Details
**GET** `/api/reservations/:id`

**Response:**
```json
{
  "reservationId": 123,
  "showtimeId": 1,
  "seatIds": [12, 13, 14],
  "status": "Pending",
  "createdAt": "2025-11-06T10:00:00Z",
  "expiresAt": "2025-11-06T10:10:00Z",
  "remainingSeconds": 480
}
```

---

### 4. Check Seats Availability
**GET** `/api/reservations/showtime/:showtimeId/availability?seatIds=12,13,14`

**Response:**
```json
{
  "showtimeId": 1,
  "seats": [
    {
      "seatId": 12,
      "isAvailable": true,
      "isLocked": false,
      "remainingSeconds": 0
    },
    {
      "seatId": 13,
      "isAvailable": false,
      "isLocked": true,
      "remainingSeconds": 580,
      "lockedBy": "user_12345"
    }
  ],
  "totalSeats": 2,
  "availableCount": 1,
  "lockedCount": 1
}
```

---

### 5. Get User Reservations
**GET** `/api/reservations/user/:userId`

Returns all active (Pending) reservations for user.

---

### 6. Get Session Reservations
**GET** `/api/reservations/session/:sessionId`

Returns all active (Pending) reservations for anonymous session.

---

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Reservation TTL (10 minutes)
RESERVATION_EXPIRY_SECONDS=600
```

### Constants (reservation.service.ts)
```typescript
private readonly RESERVATION_EXPIRY_SECONDS = 600; // 10 minutes
private readonly REDIS_KEY_PREFIX = 'seat_lock';
private readonly RESERVATION_KEY_PREFIX = 'reservation';
```

---

## 🔧 Redis Key Structure

### Seat Lock
```
seat_lock:{showtimeId}:{seatId}
```

**Value (JSON):**
```json
{
  "seatId": 12,
  "showtimeId": 1,
  "lockedBy": "user_12345",
  "lockedAt": "2025-11-06T10:00:00Z",
  "expiresAt": "2025-11-06T10:10:00Z",
  "reservationId": 123
}
```

**TTL:** 600 seconds (10 minutes)

---

### Reservation Summary
```
reservation:{reservationId}
```

**Value (JSON):**
```json
{
  "reservationId": 123,
  "showtimeId": 1,
  "seatIds": [12, 13, 14],
  "expiresAt": "2025-11-06T10:10:00Z"
}
```

**TTL:** 660 seconds (11 minutes - buffer)

---

### Rate Limit
```
rate_limit:reservation:create:{ipAddress}
```

**Value:** Integer count (1, 2, 3...)  
**TTL:** 60 seconds

---

## ⏰ Background Jobs

### Expired Reservation Cleanup
**Cron:** Every 1 minute

**Logic:**
1. Query DB: `WHERE status = 'Pending' AND expiresAt < NOW()`
2. For each expired reservation:
   - Delete Redis locks: `seat_lock:{showtimeId}:{seatId}`
   - Update DB: `status = 'Expired'`, `completedAt = NOW()`
   - Delete reservation key: `reservation:{reservationId}`
3. Log count of released reservations

---

## 🛡️ Validation & Security

### Max Seats Validation
```typescript
@ArrayMaxSize(10, { message: 'Chỉ được chọn tối đa 10 ghế' })
seatIds: number[];
```

### Rate Limiting
- **Limit**: 3 requests/minute per IP
- **Guard**: `ReservationRateLimitGuard`
- **Response**: `429 Too Many Requests`

### Duplicate Prevention
```typescript
// Check if user already has pending reservation for showtime
const existingReservation = await reservationRepository.findOne({
  where: { showtimeId, userId, status: 'Pending' }
});
```

### Showtime Validation
```typescript
// Prevent booking for started/past showtimes
if (showtimeDateTime <= new Date()) {
  throw new BadRequestException('Suất chiếu đã bắt đầu');
}
```

---

## 🧪 Testing Scenarios

### Race Condition Test
```bash
# Terminal 1
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"showtimeId":1,"seatIds":[12,13],"userId":"user1"}'

# Terminal 2 (same time)
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"showtimeId":1,"seatIds":[12,13],"userId":"user2"}'

# Expected: One succeeds, one gets 409 Conflict
```

### Rate Limit Test
```bash
# Send 4 requests quickly
for i in {1..4}; do
  curl -X POST http://localhost:5000/api/reservations \
    -H "Content-Type: application/json" \
    -d '{"showtimeId":1,"seatIds":[12],"sessionId":"sess'$i'"}'
done

# Expected: First 3 succeed, 4th gets 429 Too Many Requests
```

---

## 📊 Monitoring

### Redis Monitoring
```bash
# Check active locks
redis-cli KEYS "seat_lock:*"

# Check lock details
redis-cli GET "seat_lock:1:12"

# Check TTL
redis-cli TTL "seat_lock:1:12"

# Count reservations
redis-cli KEYS "reservation:*" | wc -l
```

### Database Monitoring
```sql
-- Active reservations
SELECT COUNT(*) FROM reservation WHERE status = 'Pending';

-- Expired reservations (should be 0 if cron working)
SELECT COUNT(*) FROM reservation 
WHERE status = 'Pending' AND expiresAt < NOW();

-- Reservation statistics
SELECT status, COUNT(*) 
FROM reservation 
GROUP BY status;
```

---

## 🔍 Troubleshooting

### Issue: Locks not releasing
**Cause**: Redis TTL expired but DB not updated  
**Solution**: Check cron job logs, manually run `releaseExpiredReservations()`

### Issue: Race condition still occurs
**Cause**: SETNX not working properly  
**Solution**: Verify Redis version (requires 2.6.12+), check connection

### Issue: Rate limit too strict
**Cause**: Testing from same IP  
**Solution**: Adjust `MAX_REQUESTS_PER_MINUTE` or use different IPs

---

## 📚 Dependencies

- `ioredis`: ^5.3.2 - Redis client
- `@nestjs/schedule`: ^4.0.0 - Cron jobs
- `@nestjs/typeorm`: ^10.0.1 - Database ORM
- `class-validator`: ^0.14.0 - DTO validation

---

## 🎓 Migration Notes

**Migrated from**: `CinemaSystem.BL.Reservation.ReservationBL` (C#)

**Key Changes**:
- C# `SETNX` → TypeScript `redis.set('key', value, 'EX', ttl, 'NX')`
- C# `Task<>` → TypeScript `async/await Promise<>`
- C# `ServiceResponse` → TypeScript direct return or throw exceptions
- Added rate limiting guard (not in original)
- Added TypeScript type safety

---

## 📝 TODO

- [ ] Add Booking integration (confirm reservation → create booking)
- [ ] Add payment timeout handling
- [ ] Add WebSocket real-time seat updates
- [ ] Add reservation analytics dashboard
- [ ] Add Redis cluster support for high availability
- [ ] Add comprehensive unit tests for atomic locking

---

**Last Updated**: 2025-11-06  
**Status**: ✅ Production Ready
