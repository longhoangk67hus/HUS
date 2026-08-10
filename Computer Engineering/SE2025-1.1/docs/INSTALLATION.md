# Hướng dẫn cài đặt và chạy SE2025 Cinema System

## 📋 Yêu cầu hệ thống

### Phần mềm cần thiết

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org/))
- **npm**: >= 9.0.0 (đi kèm với Node.js)
- **MySQL**: >= 8.0 ([Download](https://dev.mysql.com/downloads/mysql/))
- **Redis**: >= 6.0 ([Download](https://redis.io/download))
  - Windows: Sử dụng [Memurai](https://www.memurai.com/) hoặc WSL
- **Git**: Để clone repository

### IDE khuyến nghị

- **Visual Studio Code** với extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Thunder Client (hoặc Postman)

---

## 🚀 Các bước cài đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/longmvd/CinemaSystem.git
cd SE2025_Cinema_Node/backend
```

### Bước 2: Cài đặt Dependencies

```bash
# Cài đặt tất cả packages
npm install --legacy-peer-deps
```

**Lưu ý**: Sử dụng `--legacy-peer-deps` để tránh xung đột peer dependencies.

**Các package chính được cài đặt**:
- `@nestjs/core`, `@nestjs/common` - NestJS framework
- `@nestjs/typeorm`, `typeorm`, `mysql2` - Database ORM
- `@nestjs/jwt`, `passport-jwt` - Authentication
- `@nestjs/bull`, `bull`, `ioredis` - Job queues & Redis
- `@nestjs/cache-manager`, `cache-manager-ioredis-yet` - Redis caching
- `bcrypt` - Password hashing
- `class-validator`, `class-transformer` - Validation
- **`qrcode`** - QR code generation cho vé (NEW - Nov 2025)
- **`crypto-js`** - HMAC signing cho security (NEW - Nov 2025)

### Bước 3: Cấu hình Database

#### 3.1. Tạo Database MySQL

```sql
-- Đăng nhập vào MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE cinema_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (tùy chọn, cho production)
CREATE USER 'cinema_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON cinema_system.* TO 'cinema_user'@'localhost';
FLUSH PRIVILEGES;

-- Thoát
EXIT;
```

#### 3.2. Import dữ liệu mẫu (nếu có)

```bash
# Nếu có file SQL trong thư mục db/
mysql -u root -p cinema_system < ../db/cinema_system.sql
```

### Bước 4: Cấu hình Redis

#### Trên Windows:
```bash
# Download và cài đặt Memurai (Redis for Windows)
# Hoặc sử dụng Docker:
docker run -d -p 6379:6379 redis:latest
```

#### Trên Linux/Mac:
```bash
# Cài đặt Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                  # macOS

# Khởi động Redis
redis-server
```

### Bước 5: Cấu hình Environment Variables

```bash
# Copy file .env.example thành .env
cp .env.example .env
```

**Chỉnh sửa file `.env`**:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_DATABASE=cinema_system

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=cinema_system_secret_key_2024_change_in_production
JWT_EXPIRES_IN=1d

# Session
SESSION_SECRET=session_secret_key_change_in_production

# CORS
CORS_ORIGIN=http://localhost:3000

# Reservation Settings
RESERVATION_TIMEOUT_MINUTES=15

# Bull Queue (Redis for background jobs)
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379

# Email Configuration (SMTP) - Required for booking confirmations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=your-email@gmail.com

# VNPay Payment Gateway (NEW - Nov 2025)
VNPAY_TMN_CODE=YOUR_VNPAY_MERCHANT_CODE
VNPAY_HASH_SECRET=YOUR_VNPAY_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback
VNPAY_WEBHOOK_URL=http://localhost:5000/api/payments/vnpay/webhook

# Booking Configuration (NEW - Nov 2025)
BOOKING_EXPIRY_MINUTES=15
POINTS_EARN_RATE=0.1

# QR Code Configuration (NEW - Nov 2025)
QR_CODE_SIZE=300
QR_CODE_ERROR_CORRECTION=H
```

**⚠️ QUAN TRỌNG**: 
- **KHÔNG BAO GIỜ** commit file `.env` lên Git (đã có trong `.gitignore`)
- Thay đổi `JWT_SECRET` và `SESSION_SECRET` trong production (dùng 256-bit random string)
- Sử dụng mật khẩu mạnh cho database
- **VNPay credentials**: Đăng ký tại [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn) để test
- **Gmail App Password**: Tạo tại [Google Account Security](https://myaccount.google.com/security) → 2-Step Verification → App passwords

**📖 Xem thêm**: [SECRETS_MANAGEMENT_GUIDE.md](./SECRETS_MANAGEMENT_GUIDE.md) - Quản lý secrets an toàn cho production

---

## ▶️ Chạy ứng dụng

### Development Mode (với hot-reload)

```bash
npm run start:dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5000**

### Production Mode

```bash
# Build TypeScript
npm run build

# Chạy production
npm run start:prod
```

### Các lệnh khác

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

---

## ✅ Kiểm tra cài đặt

### 1. Kiểm tra Backend đã chạy

Mở trình duyệt: **http://localhost:5000**

Bạn sẽ thấy: `Cinema System API is running`

### 2. Kiểm tra Swagger Documentation

Mở: **http://localhost:5000/api**

Bạn sẽ thấy giao diện Swagger với tất cả endpoints.

### 3. Test API đơn giản

```bash
# Lấy danh sách phim
curl http://localhost:5000/api/movies

# Hoặc sử dụng Thunder Client trong VS Code
GET http://localhost:5000/api/movies
```

### 4. Kiểm tra kết nối Database

Trong log terminal, bạn sẽ thấy:
```
[TypeORM] Connection to database established
[NestJS] Application started successfully
```

### 5. Kiểm tra Redis

```bash
# Kết nối Redis CLI
redis-cli

# Test ping
127.0.0.1:6379> ping
PONG
```

---

## 🔧 Cấu hình TypeORM Synchronize

**Trong development**:
File `src/config/database.config.ts` có `synchronize: true` để tự động tạo tables.

**⚠️ CẢNH BÁO**: Trong **production**, đổi `synchronize: false` và sử dụng migrations.

```typescript
// src/config/database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  // ...
  synchronize: process.env.NODE_ENV === 'development', // Chỉ true khi dev
  // ...
};
```

---

## 📁 Cấu trúc thư mục sau khi cài đặt

```
SE2025_Cinema_Node/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis configs
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── movies/     # Movies management
│   │   │   ├── theaters/   # Theaters management
│   │   │   ├── showtimes/  # Showtimes
│   │   │   └── ...
│   │   └── main.ts         # Entry point
│   ├── .env                 # Environment variables (GIT IGNORED)
│   ├── .env.example         # Template for .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend (nếu có)
├── db/                      # Database scripts
└── docs/                    # Documentation (folder này)
```

---

## 🐛 Xử lý sự cố

Xem [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) để biết cách xử lý các lỗi thường gặp chi tiết.

### Lỗi thường gặp nhanh

**1. Lỗi kết nối MySQL**
```
Error: ER_ACCESS_DENIED_ERROR
```
➡️ Kiểm tra lại `DB_USERNAME`, `DB_PASSWORD` trong `.env`

**2. Redis connection refused**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
➡️ Chắc chắn Redis đã chạy: `redis-server`

**3. Port 5000 đã được sử dụng**
```
Error: listen EADDRINUSE: address already in use :::5000
```
➡️ Đổi `PORT` trong `.env` hoặc kill process đang dùng port 5000

**4. npm install lỗi peer dependencies**
```
npm ERR! ERESOLVE could not resolve
```
➡️ Dùng: `npm install --legacy-peer-deps`

**5. Lỗi TypeScript compilation**
```
error TS2307: Cannot find module 'qrcode'
```
➡️ Cài packages thiếu:
```bash
npm install qrcode @types/qrcode crypto-js @types/crypto-js --save
```

**6. VNPay webhook không hoạt động (Development)**
```
VNPay không gọi được webhook localhost
```
➡️ Dùng [ngrok](https://ngrok.com/) để expose localhost:
```bash
ngrok http 5000
# Update VNPAY_WEBHOOK_URL trong .env với URL ngrok
```

---

## 🚀 Bước tiếp theo

Sau khi cài đặt thành công:

1. 📖 Đọc [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Tìm hiểu các endpoints
2. 🔐 Đọc [SECRETS_MANAGEMENT_GUIDE.md](./SECRETS_MANAGEMENT_GUIDE.md) - Bảo mật cho production
3. 🌐 Đọc [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy lên server
4. 🧪 Test APIs với Swagger: http://localhost:5000/api

**Happy Coding! 🎉**
Error: listen EADDRINUSE: address already in use :::5000
```
➡️ Đổi `PORT=5001` trong `.env` hoặc kill process:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:5000 | xargs kill
```

**4. Peer dependency conflicts**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```
➡️ Sử dụng `npm install --legacy-peer-deps`

---

## 🎉 Hoàn thành!

Bạn đã cài đặt thành công SE2025 Cinema System!

**Bước tiếp theo**:
1. Đọc [API Documentation](./API_DOCUMENTATION.md)
2. Tìm hiểu [Security Best Practices](./SECURITY.md)
3. Xem [Project Structure](./PROJECT_STRUCTURE.md)

Happy coding! 🚀
