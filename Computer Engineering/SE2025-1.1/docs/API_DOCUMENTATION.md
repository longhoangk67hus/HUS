# API Documentation - SE2025 Cinema System (Multi-Theater)

## 📖 Tổng quan

SE2025 Cinema System cung cấp RESTful API được xây dựng với NestJS, TypeORM và MySQL, hỗ trợ quản lý **4 rạp chiếu phim** tại 3 thành phố lớn.

**Base URL**: `http://localhost:5000`  
**API Documentation (Swagger)**: `http://localhost:5000/api`

## 🏬 System Architecture

### Theater Locations:
1. **Theater 1**: SE2025-HN01 - Cinema Hai Ba Trung (Hà Nội)
2. **Theater 2**: SE2025-HN02 - Cinema Royal City (Hà Nội)
3. **Theater 3**: SE2025-HCM01 - Cinema Saigon (TP. HCM)
4. **Theater 4**: SE2025-DN01 - Cinema Da Nang (Đà Nẵng)

### Unified Structure:
- **1 Standard Room** per theater (114 seats each)
- **3 Seat Types**: Regular (1.0x), VIP (1.5x), Couple (1.3x)
- **Base Price**: 120,000 VND uniform across all locations
- **Multi-theater showtime distribution**

---

## 🔑 Authentication

### JWT Authentication với Role-Based Access

API sử dụng **JWT (JSON Web Token)** với 2 roles: `USER` và `ADMIN`.

#### Admin Account (Default):
```yaml
Username: admin
Email: admin@se2025.com  
Password: admin123
Role: ADMIN
Access: Full system + Statistics dashboard
```

#### Flow đăng nhập:

```
1. POST /api/auth/login → Nhận JWT token
2. Gửi token trong header: Authorization: Bearer <token>
3. Token hết hạn sau 1 ngày (có thể config trong .env)
```

#### Cấu trúc Token Response:

```json
{
  "isSuccess": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "8fcff9db-103a-46fb-9292-33437d166035",
      "userName": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "roles": ["USER"]
    }
  }
}
```

#### Sử dụng Token trong Requests:

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🎬 Endpoints

### API Summary

| Module | Endpoint Base | Status | Description |
|--------|--------------|--------|-------------|
| Authentication | `/api/auth` | ✅ Complete | Register, Login, Profile |
| Movies | `/api/movies` | ✅ Complete | CRUD movies with genres |
| **Theaters** | `/api/theaters` | ✅ **Multi-Location** | 4 theaters management |
| **Rooms** | `/api/rooms` | ✅ **Simplified** | Standard rooms only |
| **Seats** | `/api/seats` | ✅ **3 Types** | Regular/VIP/Couple seats |
| **Showtimes** | `/api/showtimes` | ✅ **Distributed** | Multi-theater scheduling |
| **Reservations** | `/api/reservations` | ✅ **Redis-Based** | Real-time seat locking |
| **Bookings** | `/api/bookings` | ✅ **Complete** | QR codes + payment integration |
| **Payments** | `/api/payments` | ✅ **VNPay** | Vietnam payment gateway |
| **🆕 Admin Statistics** | `/api/admin/statistics` | ✅ **NEW!** | Revenue analytics dashboard |

**Latest Updates (Dec 2025)**:
- ✅ **Multi-theater expansion**: 1 → 4 theaters across Vietnam
- ✅ **Admin statistics dashboard** with timezone-safe calculations
- ✅ **Monthly revenue API** với growth rate tracking
- ✅ **Simplified room architecture**: Single Standard type
- ✅ **Uniform pricing system**: 120k VND base price
- ✅ **Database optimization**: Cleaned duplicates và foreign keys
- ✅ **Theater controller updates**: Support for theaters 1-4

---

### 1. Authentication (`/api/auth`)

#### 1.1. Đăng ký tài khoản

```http
POST /api/auth/register
Content-Type: application/json

{
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phoneNumber": "0123456789"
}
```

**Response 201 Created**:
```json
{
  "isSuccess": true,
  "data": {
    "userId": "8fcff9db-103a-46fb-9292-33437d166035",
    "userName": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

**Response 409 Conflict**:
```json
{
  "isSuccess": false,
  "errorMessage": "Username or email already exists"
}
```

---

#### 1.2. Đăng nhập

```http
POST /api/auth/login
Content-Type: application/json

{
  "userName": "johndoe",
  "password": "SecurePass123!"
}
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZmNmZjlkYi0xMDNhLTQ2ZmItOTI5Mi0zMzQzN2QxNjYwMzUiLCJ1c2VyTmFtZSI6ImpvaG5kb2UiLCJpYXQiOjE3MzA5MDAwMDAsImV4cCI6MTczMDk4NjQwMH0.abc123xyz",
    "user": {
      "userId": "8fcff9db-103a-46fb-9292-33437d166035",
      "userName": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "roles": ["USER"]
    }
  }
}
```

**Response 401 Unauthorized**:
```json
{
  "isSuccess": false,
  "errorMessage": "Invalid username or password"
}
```

---

#### 1.3. Lấy thông tin profile (Protected)

```http
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "userId": "8fcff9db-103a-46fb-9292-33437d166035",
    "userName": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "0123456789",
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

---

### 2. Movies (`/api/movies`)

#### 2.1. Lấy tất cả phim

```http
GET /api/movies
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "movieId": 1,
      "title": "Avatar 4",
      "slug": "avatar-4",
      "description": "The journey continues...",
      "duration": 180,
      "releaseDate": "2024-12-20",
      "posterUrl": "https://example.com/posters/avatar4.jpg",
      "trailerUrl": "https://youtube.com/watch?v=...",
      "rating": 8.5,
      "genres": ["Action", "Sci-Fi", "Adventure"],
      "director": "James Cameron",
      "cast": ["Sam Worthington", "Zoe Saldana"],
      "status": "NOW_SHOWING"
    }
  ]
}
```

---

#### 2.2. Lấy phim đang chiếu

```http
GET /api/movies/now-showing
```

**Response**: Danh sách phim có `status = "NOW_SHOWING"`

---

#### 2.3. Lấy phim sắp chiếu

```http
GET /api/movies/coming-soon
```

**Response**: Danh sách phim có `status = "COMING_SOON"`

---

#### 2.4. Tìm kiếm phim theo từ khóa

```http
GET /api/movies/search?keyword=avatar
```

**Query Parameters**:
- `keyword` (required): Từ khóa tìm kiếm

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "movieId": 1,
      "title": "Avatar 4",
      "slug": "avatar-4",
      "description": "..."
    }
  ]
}
```

---

#### 2.5. Lấy phim theo ID

```http
GET /api/movies/1
```

**Path Parameters**:
- `id`: Movie ID (number)

**Response 200 OK**: Chi tiết 1 phim

**Response 404 Not Found**:
```json
{
  "isSuccess": false,
  "errorMessage": "Movie not found"
}
```

---

#### 2.6. Lấy phim theo slug (hỗ trợ tìm kiếm partial)

```http
GET /api/movies/slug/avatar
```

**Path Parameters**:
- `slug`: Slug của phim (hỗ trợ tìm kiếm 1 phần)

**Examples**:
- `/api/movies/slug/avatar` → Tìm phim có slug chứa "avatar"
- `/api/movies/slug/dark-knight` → Tìm "the-dark-knight"
- `/api/movies/slug/2024` → Tìm phim có slug chứa "2024"

**Response 200 OK**: Chi tiết phim đầu tiên match

---

#### 2.7. Tạo phim mới (Admin)

```http
POST /api/movies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "The Dark Knight Returns",
  "description": "Batman returns to save Gotham",
  "duration": 165,
  "releaseDate": "2024-12-25",
  "posterUrl": "https://example.com/posters/batman.jpg",
  "trailerUrl": "https://youtube.com/watch?v=...",
  "genres": ["Action", "Drama", "Crime"],
  "director": "Christopher Nolan",
  "cast": ["Christian Bale", "Michael Caine"],
  "status": "COMING_SOON"
}
```

**Response 201 Created**: Phim vừa tạo

---

#### 2.8. Cập nhật phim (Admin)

```http
PUT /api/movies/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "rating": 9.0,
  "status": "NOW_SHOWING"
}
```

**Response 200 OK**: Phim sau khi cập nhật

---

#### 2.9. Xóa phim (Admin)

```http
DELETE /api/movies/1
Authorization: Bearer <admin_token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "message": "Movie deleted successfully"
}
```

---

### 3. Theaters (`/api/theaters`)

#### 3.1. Lấy tất cả rạp

```http
GET /api/theaters
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "theaterId": 1,
      "theaterCode": "CGV_HN",
      "theaterName": "CGV Vincom Center",
      "address": "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
      "city": "Hanoi",
      "phoneNumber": "1900 6017",
      "isActive": true
    }
  ]
}
```

---

#### 3.2. Lấy rạp đang hoạt động

```http
GET /api/theaters/active
```

**Response**: Chỉ các rạp có `isActive = true`

---

#### 3.3. Lấy rạp theo thành phố

```http
GET /api/theaters/city?name=Hanoi
```

**Query Parameters**:
- `name`: Tên thành phố

---

#### 3.4. Lấy rạp theo ID

```http
GET /api/theaters/1
```

---

#### 3.5. Tạo rạp mới (Admin)

```http
POST /api/theaters
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "theaterCode": "CGV_HCM",
  "theaterName": "CGV Crescent Mall",
  "address": "101 Tôn Dật Tiên, Quận 7, TP.HCM",
  "city": "Ho Chi Minh",
  "phoneNumber": "1900 6017",
  "isActive": true
}
```

---

#### 3.6. Cập nhật rạp (Admin)

```http
PUT /api/theaters/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "theaterName": "CGV Vincom Mega Mall",
  "isActive": false
}
```

---

#### 3.7. Xóa rạp (Admin)

```http
DELETE /api/theaters/1
Authorization: Bearer <admin_token>
```

---

### 4. Showtimes (Lịch chiếu)

> **Note**: Module này có thể đang được phát triển. Kiểm tra Swagger để biết endpoints mới nhất.

#### Ví dụ endpoints dự kiến:

```http
# Lấy lịch chiếu theo phim
GET /api/showtimes/movie/1

# Lấy lịch chiếu theo rạp
GET /api/showtimes/theater/1

# Lấy lịch chiếu theo ngày
GET /api/showtimes?date=2024-11-06

# Tạo lịch chiếu (Admin)
POST /api/showtimes
```

---

### 5. Reservations (`/api/reservations`) ✅

#### 5.1. Kiểm tra ghế trống

```http
POST /api/reservations/check-seats
Content-Type: application/json

{
  "showtimeId": 1,
  "seatIds": [1, 2, 3]
}
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "showtimeId": 1,
    "allAvailable": true,
    "seats": [
      {
        "seatId": 1,
        "isAvailable": true,
        "lockedBy": null,
        "expiresAt": null
      },
      {
        "seatId": 2,
        "isAvailable": false,
        "lockedBy": "other-user-id",
        "expiresAt": "2025-11-25T11:15:00.000Z"
      }
    ]
  }
}
```

#### 5.2. Tạo reservation (giữ ghế 10 phút)

```http
POST /api/reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "showtimeId": 1,
  "seatIds": [1, 2, 3],
  "userId": "user-uuid-here"
}
```

**Response 201 Created**:
```json
{
  "isSuccess": true,
  "data": {
    "reservationId": 123,
    "showtimeId": 1,
    "userId": "user-uuid",
    "seatIds": "1,2,3",
    "status": "Pending",
    "expiresAt": "2025-11-25T11:15:00.000Z",
    "createdAt": "2025-11-25T11:05:00.000Z"
  }
}
```

#### 5.3. Lấy reservations của user

```http
GET /api/reservations/user/:userId
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "reservationId": 123,
      "showtimeId": 1,
      "seatIds": "1,2,3",
      "status": "Pending",
      "expiresAt": "2025-11-25T11:15:00.000Z"
    }
  ]
}
```

#### 5.4. Hủy reservation

```http
DELETE /api/reservations/:id
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "message": "Reservation cancelled successfully",
    "releasedSeats": [1, 2, 3]
  }
}
```

---

### 6. Bookings (`/api/bookings`) ✅ NEW!

#### 6.1. Tạo booking từ reservation

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "reservationId": 123,
  "idempotencyKey": "unique-uuid-v4-here"
}
```

**Response 201 Created**:
```json
{
  "isSuccess": true,
  "data": {
    "bookingId": 456,
    "userId": "user-uuid",
    "showtimeId": 1,
    "reservationId": 123,
    "bookingCode": "BK20251125A1B2",
    "totalAmount": 300000,
    "discountAmount": 0,
    "finalAmount": 300000,
    "pointsEarned": 30,
    "pointsUsed": 0,
    "status": "Pending",
    "bookingDate": "2025-11-25T11:10:00.000Z",
    "expiryDate": "2025-11-25T11:25:00.000Z",
    "seats": [
      {
        "seatId": 1,
        "seatNumber": "A1",
        "roomName": "Room 1",
        "price": 100000
      }
    ],
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_..."
  }
}
```

**Response 409 Conflict** (nếu dùng lại idempotencyKey):
```json
{
  "isSuccess": false,
  "errorMessage": "Duplicate booking request. Booking already exists.",
  "existingBooking": {
    "bookingId": 456,
    "bookingCode": "BK20251125A1B2"
  }
}
```

#### 6.2. Lấy thông tin booking

```http
GET /api/bookings/:id
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "bookingId": 456,
    "bookingCode": "BK20251125A1B2",
    "status": "Confirmed",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "finalAmount": 300000,
    "seats": [...],
    "showtime": {
      "showtimeId": 1,
      "startTime": "2025-11-26T19:30:00.000Z",
      "movie": {
        "title": "Avatar 3"
      }
    }
  }
}
```

#### 6.3. Lấy lịch sử booking của user

```http
GET /api/bookings/user/:userId
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "bookingId": 456,
      "bookingCode": "BK20251125A1B2",
      "status": "Confirmed",
      "finalAmount": 300000,
      "bookingDate": "2025-11-25T11:10:00.000Z",
      "qrCode": "data:image/png;base64,...",
      "movie": "Avatar 3",
      "showtime": "2025-11-26 19:30",
      "seats": ["A1", "A2", "A3"]
    }
  ]
}
```

#### 6.4. Kiểm tra booking từ reservation

```http
GET /api/bookings/reservation/:reservationId
Authorization: Bearer <token>
```

**Response 200 OK** (nếu đã tạo booking):
```json
{
  "isSuccess": true,
  "data": {
    "exists": true,
    "booking": {
      "bookingId": 456,
      "bookingCode": "BK20251125A1B2",
      "status": "Confirmed"
    }
  }
}
```

**Response 404 Not Found** (nếu chưa tạo booking):
```json
{
  "isSuccess": false,
  "errorMessage": "No booking found for this reservation"
}
```

---

### 7. Payments (`/api/payments`) ✅ NEW!

#### 7.1. Tạo payment (VNPay)

```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": 456,
  "paymentMethod": "EWallet",
  "idempotencyKey": "unique-uuid-v4-here"
}
```

**Response 201 Created**:
```json
{
  "isSuccess": true,
  "data": {
    "paymentId": 789,
    "bookingId": 456,
    "amount": 300000,
    "currency": "VND",
    "status": "Pending",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=30000000&vnp_Command=pay&vnp_CreateDate=20251125111000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+ve+xem+phim+BK20251125A1B2&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fpayment%2Fcallback&vnp_TmnCode=YOUR_TMN_CODE&vnp_TxnRef=789&vnp_Version=2.1.0&vnp_SecureHash=..."
  }
}
```

**Luồng thanh toán**:
1. User click vào `paymentUrl` → Redirect đến VNPay
2. User nhập thông tin thẻ và xác nhận thanh toán
3. VNPay gọi webhook → `/api/payments/vnpay/webhook`
4. Backend xác thực webhook → Cập nhật payment status → Confirm booking
5. VNPay redirect user về `VNPAY_RETURN_URL`

#### 7.2. VNPay Webhook (Internal - VNPay calls this)

```http
POST /api/payments/vnpay/webhook
Content-Type: application/json

{
  "vnp_TmnCode": "YOUR_TMN_CODE",
  "vnp_Amount": "30000000",
  "vnp_BankCode": "NCB",
  "vnp_TransactionNo": "14350528",
  "vnp_ResponseCode": "00",
  "vnp_TxnRef": "789",
  "vnp_SecureHash": "..."
}
```

**Response 200 OK**:
```json
{
  "RspCode": "00",
  "Message": "Confirm Success"
}
```

**Xử lý tự động**:
- ✅ Verify HMAC signature
- ✅ Update payment status: `Pending` → `Success`
- ✅ Confirm booking: `Pending` → `Confirmed`
- ✅ Generate QR code cho vé
- ✅ Gửi email xác nhận (nếu có)
- ✅ Log webhook vào `webhook_log` table

#### 7.3. Lấy thông tin payment

```http
GET /api/payments/:id
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "paymentId": 789,
    "bookingId": 456,
    "amount": 300000,
    "currency": "VND",
    "status": "Success",
    "paymentMethod": "EWallet",
    "transactionId": "14350528",
    "paymentDate": "2025-11-25T11:12:00.000Z",
    "booking": {
      "bookingCode": "BK20251125A1B2",
      "status": "Confirmed",
      "qrCode": "data:image/png;base64,..."
    }
  }
}
```

#### 7.4. Lấy payment của booking

```http
GET /api/payments/booking/:bookingId
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "isSuccess": true,
  "data": {
    "paymentId": 789,
    "amount": 300000,
    "status": "Success",
    "transactionId": "14350528",
    "paymentDate": "2025-11-25T11:12:00.000Z"
  }
}
```

---

## 🧪 Testing APIs

### Sử dụng Swagger UI

1. Mở trình duyệt: `http://localhost:5000/api`
2. Click **Authorize** (icon ổ khóa)
3. Nhập: `Bearer <your_token>`
4. Click **Authorize** → **Close**
5. Test các endpoints trực tiếp

---

### Sử dụng Thunder Client (VS Code)

1. Cài extension **Thunder Client** trong VS Code
2. Tạo New Request
3. Chọn method (GET, POST, PUT, DELETE)
4. Nhập URL: `http://localhost:5000/api/movies`
5. Với protected routes:
   - Tab **Headers** → Add:
     - `Authorization`: `Bearer <token>`
     - `Content-Type`: `application/json`
6. Tab **Body** (cho POST/PUT) → **JSON** → nhập data
7. Click **Send**

---

### Sử dụng cURL

#### Đăng ký:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User"
  }'
```

#### Đăng nhập:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "password": "Test123!"
  }'
```

#### Lấy profile (với token):
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Sử dụng Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import Collection (nếu có file `.postman_collection.json`)
3. Hoặc tạo requests thủ công:
   - New Request → Đặt tên
   - Chọn method + URL
   - Headers → Add Authorization
   - Body → raw → JSON
   - Send

---

## 📦 Response Format

### Success Response

```json
{
  "isSuccess": true,
  "data": { /* ... */ }
}
```

hoặc

```json
{
  "isSuccess": true,
  "data": [ /* ... */ ]
}
```

### Error Response

```json
{
  "isSuccess": false,
  "errorMessage": "Description of error"
}
```

hoặc (validation errors)

```json
{
  "statusCode": 400,
  "message": [
    "userName should not be empty",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

---

## 🚦 HTTP Status Codes

| Code | Meaning | Khi nào xảy ra |
|------|---------|----------------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo mới thành công |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token không hợp lệ |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Không tìm thấy resource |
| 409 | Conflict | Dữ liệu bị trùng (ví dụ: username đã tồn tại) |
| 500 | Internal Server Error | Lỗi server |

---

## 🔐 Authorization Levels

### Public Endpoints (Không cần token)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/movies` (và tất cả GET movies)
- `GET /api/theaters` (và tất cả GET theaters)

### User Endpoints (Cần token)
- `GET /api/auth/profile`
- `POST /api/reservations` (khi implement)
- `GET /api/reservations/user` (khi implement)

### Admin Endpoints (Cần token + role ADMIN)
- `POST /api/movies`
- `PUT /api/movies/:id`
- `DELETE /api/movies/:id`
- `POST /api/theaters`
- `PUT /api/theaters/:id`
- `DELETE /api/theaters/:id`

---

## 📝 Validation Rules

### User Registration
- `userName`: 
  - Required, 3-50 ký tự
  - Chỉ chữ, số, underscore, gạch ngang
- `email`:
  - Required, format email hợp lệ
- `password`:
  - Required, tối thiểu 6 ký tự
  - Khuyến nghị: chữ hoa + chữ thường + số + ký tự đặc biệt
- `fullName`:
  - Required, 1-100 ký tự
- `phoneNumber`:
  - Optional, 10-11 số

### Movie Creation
- `title`: Required, tối đa 200 ký tự
- `duration`: Required, số nguyên dương (phút)
- `releaseDate`: Required, format ISO date
- `genres`: Array of strings
- `status`: Enum: "NOW_SHOWING", "COMING_SOON", "ENDED"

---

## 🌐 CORS Configuration

Trong `.env`, cấu hình:

```env
CORS_ORIGIN=http://localhost:3000
```

Cho phép frontend tại `localhost:3000` gọi API.

Nếu muốn cho phép nhiều origins:

```typescript
// src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```

---

## 🔄 Pagination (Kế hoạch tương lai)

Khi có nhiều dữ liệu, API sẽ hỗ trợ pagination:

```http
GET /api/movies?page=1&limit=10
```

Response:
```json
{
  "isSuccess": true,
  "data": {
    "items": [ /* movies */ ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

## 📊 Rate Limiting (Kế hoạch tương lai)

Để tránh spam, API sẽ giới hạn:
- 100 requests/phút cho public endpoints
- 1000 requests/phút cho authenticated users

Response khi vượt limit:
```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

---

## 🐛 Troubleshooting API

### Lỗi: 401 Unauthorized

**Nguyên nhân**:
- Token không hợp lệ
- Token đã hết hạn
- Thiếu header Authorization

**Giải pháp**:
- Đăng nhập lại để lấy token mới
- Kiểm tra header: `Authorization: Bearer <token>`

---

### Lỗi: 400 Bad Request

**Nguyên nhân**:
- Dữ liệu gửi lên không đúng format
- Thiếu field bắt buộc
- Validation failed

**Giải pháp**:
- Kiểm tra `message` trong response
- So sánh với ví dụ trong docs
- Đảm bảo `Content-Type: application/json`

---

### Lỗi: CORS Error

```
Access to fetch at 'http://localhost:5000/api/movies' from origin 
'http://localhost:3001' has been blocked by CORS policy
```

**Giải pháp**:
- Thêm origin vào `CORS_ORIGIN` trong `.env`
- Hoặc cập nhật `main.ts` để cho phép nhiều origins

---

## 📚 Tài liệu bổ sung

- **Swagger UI**: `http://localhost:5000/api` - Interactive API docs
- **Postman Collection**: Có thể export từ Swagger
- **Source Code**: Xem các file `*.controller.ts` trong `src/modules/`

---

## 🎯 Ví dụ Complete Flow

### User Registration → Login → Get Movies

```bash
# 1. Đăng ký
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "alice",
    "email": "alice@example.com",
    "password": "Alice123!",
    "fullName": "Alice Wonderland"
  }'

# 2. Đăng nhập
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "alice",
    "password": "Alice123!"
  }' | jq -r '.data.token')

# 3. Lấy profile
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Lấy danh sách phim
curl -X GET http://localhost:5000/api/movies \
  -H "Authorization: Bearer $TOKEN"
```

---


