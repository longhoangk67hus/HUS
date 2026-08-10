# Manual Booking API Documentation

## Overview
Counter booking system for walk-in customers. Admin staff can create immediate bookings without online payment flow.

**Base Path**: `/api/admin/manual-booking`

**Authentication**: Requires admin JWT token (currently bypassed with temp ID)

---

## Features

### ✅ What's Different from Online Booking?

| Feature | Online Booking | Manual Booking |
|---------|---------------|----------------|
| **Reservation Lock** | Required (Redis) | Not needed |
| **Payment Flow** | VNPay online | Cash/Card at counter |
| **Status** | Pending → Confirmed | Immediately Confirmed |
| **Customer Auth** | Required | Not required |
| **QR Code** | After payment | Generated immediately |
| **Price Calculation** | BasePrice × Multiplier | Same |

### 🎯 Use Cases

1. **Walk-in Customer Booking**
   - Customer arrives at cinema counter
   - Staff selects showtime and seats
   - Staff enters customer info (name, phone)
   - Payment collected at counter (Cash/Card)
   - Ticket printed with QR code

2. **Refund at Counter**
   - Customer requests cancellation
   - Staff finds booking by ID/phone
   - Staff cancels booking
   - Seats released automatically
   - Refund processed at counter

3. **Reprint Ticket**
   - Customer lost ticket
   - Staff retrieves booking by phone
   - QR code displayed/reprinted

---

## API Endpoints

### 1. Create Manual Booking

**POST** `/api/admin/manual-booking`

Create immediate confirmed booking at counter.

#### Request Body

```json
{
  "showtimeId": 1,
  "seatIds": [1, 2, 3],
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "paymentMethod": "Cash",
  "adminNote": "Customer requested seats near exit"
}
```

#### Request Body Schema

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `showtimeId` | number | Yes | Must exist | ID of the showtime |
| `seatIds` | number[] | Yes | Must be valid | Array of seat IDs to book |
| `customerName` | string | Yes | 2-255 chars | Customer full name |
| `customerPhone` | string | Yes | 10-11 digits | Customer phone number |
| `paymentMethod` | enum | Yes | Cash \| Card | Payment method at counter |
| `adminNote` | string | No | Max 1000 chars | Optional staff note |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Manual booking created successfully",
  "data": {
    "bookingId": 123,
    "bookingCode": "BK20251127214530456",
    "showtimeId": 1,
    "movieTitle": "Avengers: Endgame",
    "theaterName": "CGV Vincom Center",
    "roomName": "Room 1",
    "showtimeStart": "2025-11-27T19:00:00.000Z",
    "seats": [
      {
        "seatId": 1,
        "rowNumber": "A",
        "columnNumber": 5,
        "price": 80000
      },
      {
        "seatId": 2,
        "rowNumber": "A",
        "columnNumber": 6,
        "price": 80000
      },
      {
        "seatId": 3,
        "rowNumber": "A",
        "columnNumber": 7,
        "price": 120000
      }
    ],
    "totalAmount": 280000,
    "finalAmount": 280000,
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0912345678",
    "paymentMethod": "Cash",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "Confirmed",
    "bookingDate": "2025-11-27T14:45:30.000Z",
    "adminNote": "Customer requested seats near exit"
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid input

```json
{
  "statusCode": 400,
  "message": "Cannot book for past or ongoing showtime",
  "error": "Bad Request"
}
```

**404 Not Found** - Showtime not found

```json
{
  "statusCode": 404,
  "message": "Showtime not found",
  "error": "Not Found"
}
```

**409 Conflict** - Seats already booked

```json
{
  "statusCode": 409,
  "message": "Seats are already booked: 1, 2",
  "error": "Conflict"
}
```

---

### 2. Get Manual Booking Details

**GET** `/api/admin/manual-booking/:bookingId`

Retrieve manual booking details for reprint or verification.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `bookingId` | number | Booking ID |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Manual booking retrieved successfully",
  "data": {
    "bookingId": 123,
    "bookingCode": "BK20251127214530456",
    "showtimeId": 1,
    "movieTitle": "Avengers: Endgame",
    "theaterName": "CGV Vincom Center",
    "roomName": "Room 1",
    "showtimeStart": "2025-11-27T19:00:00.000Z",
    "seats": [
      {
        "seatId": 1,
        "rowNumber": "A",
        "columnNumber": 5,
        "price": 80000
      }
    ],
    "totalAmount": 80000,
    "finalAmount": 80000,
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0912345678",
    "paymentMethod": "Cash",
    "qrCode": "data:image/png;base64,...",
    "status": "Confirmed",
    "bookingDate": "2025-11-27T14:45:30.000Z",
    "adminNote": "Customer requested seats near exit"
  }
}
```

#### Error Response

**404 Not Found** - Booking not found

```json
{
  "statusCode": 404,
  "message": "Manual booking not found",
  "error": "Not Found"
}
```

---

### 3. Cancel Manual Booking

**PATCH** `/api/admin/manual-booking/:bookingId/cancel`

Cancel manual booking and release seats (refund at counter).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `bookingId` | number | Booking ID to cancel |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Manual booking cancelled successfully"
}
```

#### Error Responses

**400 Bad Request** - Already cancelled or completed

```json
{
  "statusCode": 400,
  "message": "Booking is already cancelled",
  "error": "Bad Request"
}
```

**404 Not Found** - Booking not found

```json
{
  "statusCode": 404,
  "message": "Manual booking not found",
  "error": "Not Found"
}
```

---

## Business Logic

### Price Calculation

Seats have different prices based on type:

```typescript
seatPrice = showtimeBasePrice × seatTypePriceMultiplier
```

**Seat Type Multipliers:**
- Regular: 1.0
- VIP: 1.5
- Couple: 2.0

**Example:**
- Showtime BasePrice: 80,000 VND
- Regular Seat: 80,000 × 1.0 = 80,000 VND
- VIP Seat: 80,000 × 1.5 = 120,000 VND
- Couple Seat: 80,000 × 2.0 = 160,000 VND

### Booking Code Format

```
BK + YYYYMMDD + HHMMSS + Random3Digits
```

**Example:** `BK20251127214530456`

- `BK`: Prefix
- `20251127`: Date (November 27, 2025)
- `214530`: Time (21:45:30)
- `456`: Random 3 digits

### Transaction Handling

All operations wrapped in database transaction:

1. ✅ Validate showtime exists and not started
2. ✅ Validate seats exist and belong to room
3. ✅ Check seats not already booked
4. ✅ Calculate total amount
5. ✅ Create booking (status = Confirmed)
6. ✅ Create booking seats
7. ✅ Generate QR code
8. ✅ Return complete booking data

If any step fails, entire transaction rolls back.

### Validation Rules

#### Showtime Validation
- ✅ Must exist in database
- ✅ Must not have started (ShowDate + ShowTime > now)

#### Seat Validation
- ✅ All seats must exist
- ✅ All seats must belong to showtime's room
- ✅ No seats can be already booked (status Pending/Confirmed)

#### Customer Data Validation
- ✅ Name: 2-255 characters
- ✅ Phone: 10-11 digits (regex: `^[0-9]{10,11}$`)

#### Payment Method
- ✅ Only `Cash` or `Card` allowed
- ❌ No VNPay for manual bookings

---

## Database Schema

### New Columns in `booking` Table

```sql
ALTER TABLE booking
ADD COLUMN IsManualBooking BOOLEAN DEFAULT FALSE,
ADD COLUMN PaymentMethod ENUM('VNPay', 'Cash', 'Card') DEFAULT NULL,
ADD COLUMN CustomerName VARCHAR(255) DEFAULT NULL,
ADD COLUMN CustomerPhone VARCHAR(20) DEFAULT NULL,
ADD COLUMN AdminNote TEXT DEFAULT NULL;
```

### Booking Entity Fields

| Field | Type | Description |
|-------|------|-------------|
| `isManualBooking` | boolean | True for counter bookings |
| `paymentMethod` | enum | VNPay \| Cash \| Card |
| `customerName` | string | Walk-in customer name |
| `customerPhone` | string | Customer phone number |
| `adminNote` | text | Staff notes |

---

## QR Code

### Format

Base64-encoded PNG image containing:

```json
{
  "bookingId": 123,
  "bookingCode": "BK20251127214530456",
  "showtimeId": 1,
  "customerPhone": "0912345678"
}
```

### Specifications
- **Format**: PNG
- **Encoding**: Base64 data URL
- **Error Correction**: Medium (M)
- **Margin**: 1
- **Width**: 300px

### Usage
Can be directly embedded in HTML:

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." />
```

Or printed on ticket for entry scanning.

---

## Frontend Integration

### Counter Staff Workflow

```typescript
// 1. Create Booking
const createBooking = async (data) => {
  const response = await fetch('/api/admin/manual-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      showtimeId: 1,
      seatIds: [1, 2, 3],
      customerName: 'Nguyễn Văn A',
      customerPhone: '0912345678',
      paymentMethod: 'Cash',
      adminNote: 'VIP customer'
    })
  });
  
  const result = await response.json();
  
  // Display QR code
  displayQRCode(result.data.qrCode);
  
  // Print ticket
  printTicket(result.data);
};

// 2. Retrieve Booking (for reprint)
const getBooking = async (bookingId) => {
  const response = await fetch(`/api/admin/manual-booking/${bookingId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  const result = await response.json();
  return result.data;
};

// 3. Cancel Booking (for refund)
const cancelBooking = async (bookingId) => {
  const response = await fetch(`/api/admin/manual-booking/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  const result = await response.json();
  // Process refund at counter
  processRefund(result);
};
```

### UI Components Needed

1. **Booking Form**
   - Showtime selector
   - Seat map (interactive)
   - Customer name input
   - Customer phone input
   - Payment method dropdown (Cash/Card)
   - Admin note textarea

2. **Ticket Preview**
   - Movie poster
   - Movie title
   - Theater & room info
   - Showtime details
   - Seat list with prices
   - Total amount
   - QR code
   - Customer info
   - Print button

3. **Search/Reprint**
   - Search by booking ID or phone
   - Display booking details
   - Reprint button

4. **Refund Interface**
   - Booking lookup
   - Refund confirmation
   - Cancel booking button

---

## Testing

See `test_manual_booking.http` file for comprehensive test scenarios.

### Test Coverage

✅ **Create Booking**
- Valid booking with Cash
- Valid booking with Card
- Without admin note
- Error: Invalid showtime
- Error: Seats already booked
- Error: Invalid phone number
- Error: Past showtime

✅ **Get Booking**
- Retrieve existing booking
- Error: Non-existent booking

✅ **Cancel Booking**
- Successful cancellation
- Error: Booking not found
- Error: Already cancelled

---

## Security Notes

### Current Implementation
⚠️ **Admin authentication temporarily bypassed** with hardcoded `admin-temp-id`

### TODO: Add Authentication
```typescript
// In controller
@UseGuards(AdminAuthGuard)
export class ManualBookingController {
  @Post()
  async createManualBooking(
    @Body() dto: CreateManualBookingDto,
    @CurrentUser('userId') adminUserId: string, // From JWT
  ) {
    // Use real adminUserId from JWT token
  }
}
```

### Required Guards
- `AdminAuthGuard`: Verify JWT token
- Role check: Ensure user has admin/staff role
- Theater assignment: Limit to assigned theater

---

## Performance Considerations

### Database Queries
- Uses transaction for atomicity
- Single query for seat validation (IN clause)
- Efficient LEFT JOINs with proper indexes

### Optimization Tips
- Ensure indexes on:
  - `booking.ShowtimeId`
  - `booking_seat.SeatId`
  - `booking.IsManualBooking`
  - `booking.CustomerPhone` (for search)

### QR Code Generation
- Cached in database (no regeneration needed)
- Base64 encoding suitable for < 5KB
- Consider external storage for high volume

---

## Error Handling

All errors follow consistent format:

```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```

### Common Error Codes

| Code | Meaning | Typical Causes |
|------|---------|----------------|
| 400 | Bad Request | Invalid input, past showtime |
| 404 | Not Found | Showtime/booking not found |
| 409 | Conflict | Seats already booked |
| 500 | Internal Server Error | Database/QR generation error |

---

## Comparison: Online vs Manual Booking

| Aspect | Online Booking | Manual Booking |
|--------|----------------|----------------|
| **Flow** | Reserve → Payment → Confirm | Direct Confirm |
| **Redis Lock** | Required (10 min) | Not needed |
| **Payment Gateway** | VNPay (async) | Counter (sync) |
| **Customer Auth** | JWT required | Not required |
| **UserId** | From JWT | Admin ID |
| **Status Flow** | Pending → Confirmed | Confirmed immediately |
| **Expiry** | 10 minutes | At showtime |
| **QR Generation** | After payment success | Immediate |
| **Cancellation** | User self-cancel | Admin only |
| **Refund** | Auto via VNPay | Manual at counter |

---

## Next Steps

### Phase 1: Current (✅ Complete)
- ✅ Basic manual booking CRUD
- ✅ Price calculation
- ✅ QR code generation
- ✅ Transaction handling
- ✅ Validation

### Phase 2: Authentication
- [ ] Admin JWT authentication
- [ ] Role-based access control
- [ ] Theater-based permissions

### Phase 3: Advanced Features
- [ ] Search booking by phone
- [ ] Booking history for customer
- [ ] Print preview/template
- [ ] SMS confirmation (optional)
- [ ] Cash drawer integration

### Phase 4: Reporting
- [ ] Daily counter sales report
- [ ] Staff performance metrics
- [ ] Payment method breakdown
- [ ] Manual vs online booking stats

---

**Author**: HNLong  
**Date**: November 27, 2025  
**Version**: 1.0
