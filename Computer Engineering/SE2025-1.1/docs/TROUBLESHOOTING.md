# Xử lý sự cố - SE2025 Cinema System

## 🐛 Các lỗi thường gặp và cách xử lý

---

## 1. 🔴 Lỗi kết nối Database

### Lỗi: `ER_ACCESS_DENIED_ERROR`

```
Error: Access denied for user 'root'@'localhost' (using password: YES)
```

**Nguyên nhân**:
- Username hoặc password MySQL sai trong file `.env`
- User chưa được tạo trong MySQL

**Giải pháp**:

```bash
# 1. Kiểm tra lại thông tin trong .env
DB_USERNAME=root
DB_PASSWORD=your_correct_password

# 2. Đăng nhập MySQL để kiểm tra
mysql -u root -p

# 3. Nếu không đăng nhập được, reset password MySQL (Windows)
# Dừng MySQL service → Khởi động lại với --skip-grant-tables → Reset password

# 4. Tạo user mới (nếu cần)
CREATE USER 'cinema_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON cinema_system.* TO 'cinema_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Lỗi: `ECONNREFUSED` (MySQL)

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Nguyên nhân**:
- MySQL server chưa chạy

**Giải pháp**:

```bash
# Windows - Kiểm tra MySQL service
services.msc
# Tìm MySQL → Start

# Hoặc PowerShell
Start-Service MySQL80

# Linux/Mac
sudo systemctl start mysql    # systemd
sudo service mysql start      # sysvinit
brew services start mysql     # macOS Homebrew
```

---

### Lỗi: `ER_BAD_DB_ERROR: Unknown database`

```
Error: Unknown database 'cinema_system'
```

**Nguyên nhân**:
- Database chưa được tạo

**Giải pháp**:

```sql
-- Đăng nhập MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE cinema_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiểm tra
SHOW DATABASES;

-- Thoát
EXIT;
```

---

## 2. 🔴 Lỗi Redis

### Lỗi: `ECONNREFUSED 127.0.0.1:6379`

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Nguyên nhân**:
- Redis server chưa chạy

**Giải pháp**:

**Windows**:
```bash
# Nếu dùng Memurai (Redis for Windows)
# Start từ Services hoặc:
memurai.exe

# Hoặc dùng Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

**Linux/Mac**:
```bash
# Khởi động Redis
redis-server

# Hoặc dùng systemd (Linux)
sudo systemctl start redis

# Mac với Homebrew
brew services start redis

# Kiểm tra Redis đã chạy
redis-cli ping
# Response: PONG
```

---

### Lỗi: Redis authentication failed

```
Error: NOAUTH Authentication required
```

**Nguyên nhân**:
- Redis yêu cầu password nhưng chưa cấu hình

**Giải pháp**:

```env
# Trong .env, thêm password
REDIS_PASSWORD=your_redis_password
```

Hoặc tắt authentication trong Redis config:
```bash
# redis.conf
# requirepass your_password  # Comment dòng này
```

---

## 3. 🔴 Lỗi Dependencies

### Lỗi: `npm ERR! ERESOLVE unable to resolve dependency tree`

```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Could not resolve dependency:
npm ERR! peer dependency...
```

**Nguyên nhân**:
- Xung đột peer dependencies

**Giải pháp**:

```bash
# Sử dụng --legacy-peer-deps
npm install --legacy-peer-deps

# Hoặc xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### Lỗi: `Cannot find module '@nestjs/...'`

```
Error: Cannot find module '@nestjs/core'
```

**Nguyên nhân**:
- Dependencies chưa được cài đặt

**Giải pháp**:

```bash
# Cài đặt dependencies
npm install --legacy-peer-deps

# Hoặc cài package cụ thể
npm install @nestjs/core @nestjs/common --legacy-peer-deps
```

---

## 4. 🔴 Lỗi Port

### Lỗi: `EADDRINUSE: address already in use :::5000`

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Nguyên nhân**:
- Port 5000 đã được process khác sử dụng

**Giải pháp 1: Đổi port**

```env
# .env
PORT=5001
```

**Giải pháp 2: Kill process đang dùng port 5000**

**Windows PowerShell**:
```powershell
# Tìm process
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill process
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**Linux/Mac**:
```bash
# Tìm process
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)

# Hoặc
sudo lsof -ti:5000 | xargs kill -9
```

---

## 5. 🔴 Lỗi TypeScript

### Lỗi: `TS2307: Cannot find module '...' or its corresponding type declarations`

```
TS2307: Cannot find module '@nestjs/jwt' or its corresponding type declarations
```

**Nguyên nhân**:
- Thiếu type definitions

**Giải pháp**:

```bash
# Cài type definitions
npm install --save-dev @types/node @types/passport-jwt @types/bcrypt

# Rebuild
npm run build
```

---

### Lỗi: Path aliases không hoạt động

```
Error: Cannot find module '@config/database.config'
```

**Nguyên nhân**:
- `tsconfig-paths` chưa được cấu hình

**Giải pháp**:

```bash
# Cài tsconfig-paths
npm install tsconfig-paths --legacy-peer-deps

# Thêm vào package.json scripts
"start": "node -r tsconfig-paths/register dist/main.js"
```

---

## 6. 🔴 Lỗi JWT/Authentication

### Lỗi: `401 Unauthorized` khi gọi protected routes

**Nguyên nhân**:
- Token không hợp lệ hoặc đã hết hạn
- Thiếu header Authorization

**Giải pháp**:

```bash
# Kiểm tra header
Authorization: Bearer <your_token_here>

# Đăng nhập lại để lấy token mới
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"user","password":"pass"}'
```

---

### Lỗi: `JsonWebTokenError: invalid signature`

**Nguyên nhân**:
- JWT_SECRET trong `.env` đã thay đổi
- Token được tạo với secret khác

**Giải pháp**:

```bash
# 1. Đảm bảo JWT_SECRET trong .env không đổi
JWT_SECRET=your_fixed_secret_key

# 2. Đăng nhập lại để lấy token mới
# 3. Clear cache/localStorage nếu dùng frontend
```

---

## 7. 🔴 Lỗi Validation

### Lỗi: `400 Bad Request` - Validation failed

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

**Nguyên nhân**:
- Dữ liệu gửi lên không đúng format

**Giải pháp**:

```bash
# Kiểm tra lại DTO trong docs
# Đảm bảo gửi đúng fields và đúng type

# Ví dụ đúng:
{
  "userName": "johndoe",          # string, không rỗng
  "email": "john@example.com",    # email hợp lệ
  "password": "Pass123!",         # string, min 6 ký tự
  "fullName": "John Doe"          # string
}
```

---

## 8. 🔴 Lỗi khi chạy `npm run start:dev`

### Lỗi: `ts-node-dev: command not found`

**Nguyên nhân**:
- Dev dependencies chưa được cài

**Giải pháp**:

```bash
# Cài đặt ts-node-dev
npm install --save-dev ts-node-dev --legacy-peer-deps

# Hoặc cài tất cả dev dependencies
npm install --legacy-peer-deps
```

---

### Lỗi: Hot reload không hoạt động

**Nguyên nhân**:
- File watcher không phát hiện thay đổi

**Giải pháp**:

```bash
# Thêm vào package.json
"dev": "ts-node-dev --respawn --transpile-only --watch src src/main.ts"

# Hoặc dùng nodemon
npm install --save-dev nodemon
```

---

## 9. 🔴 Lỗi CORS

### Lỗi: CORS policy blocked

```
Access to fetch at 'http://localhost:5000/api/movies' from origin 
'http://localhost:3001' has been blocked by CORS policy
```

**Nguyên nhân**:
- Origin không được phép

**Giải pháp**:

**Cách 1: Thêm vào `.env`**
```env
CORS_ORIGIN=http://localhost:3001
```

**Cách 2: Sửa `main.ts`**
```typescript
// src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```

---

## 10. 🔴 Lỗi Build

### Lỗi: TypeScript compilation errors

```
src/modules/movies/movie.service.ts(45,12): error TS2322: 
Type 'Movie | undefined' is not assignable to type 'Movie'
```

**Nguyên nhân**:
- Type mismatch hoặc null safety

**Giải pháp**:

```typescript
// Thêm null check
const movie = await this.movieRepository.findOne({ where: { id } });
if (!movie) {
  throw new NotFoundException('Movie not found');
}
return movie; // Bây giờ TypeScript biết movie không null
```

---

## 11. 🔴 Lỗi Environment Variables

### Lỗi: Environment variables undefined

```
TypeError: Cannot read property 'DB_HOST' of undefined
```

**Nguyên nhân**:
- File `.env` không tồn tại hoặc không được load

**Giải pháp**:

```bash
# 1. Đảm bảo file .env tồn tại
cp .env.example .env

# 2. Kiểm tra ConfigModule trong app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ...
  ],
})

# 3. Restart server
npm run start:dev
```

---

## 12. 🔴 Lỗi Email/SMTP

### Lỗi: SMTP authentication failed

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Nguyên nhân**:
- Gmail blocking "less secure apps"
- Cần dùng App Password

**Giải pháp**:

```bash
# 1. Enable 2-Step Verification trên Google Account
# 2. Tạo App Password:
#    Google Account → Security → 2-Step Verification → App passwords
# 3. Generate password cho "Mail" app
# 4. Dùng password đó trong .env

SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App password từ Google
```

---

## 13. 🔧 Debugging Tips

### Enable debug logs

```env
# .env
NODE_ENV=development
LOG_LEVEL=debug
```

### Xem SQL queries (TypeORM)

```typescript
// database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  // ...
  logging: true,  // Log tất cả queries
  logger: 'advanced-console',
};
```

### Chrome DevTools cho Node.js

```bash
# Chạy với inspect
node --inspect dist/main.js

# Mở Chrome: chrome://inspect
```

---

## 14. 📊 Performance Issues

### Slow API responses

**Kiểm tra**:
1. Database indexes
2. N+1 query problem
3. Redis cache

**Giải pháp**:

```typescript
// Sử dụng eager loading
const movies = await this.movieRepository.find({
  relations: ['showtimes', 'genres'],  // Load relations 1 lần
});

// Thêm indexes
@Index(['title'])
@Index(['releaseDate'])
@Entity('movies')
export class Movie { }
```

---

## 15. 🛑 Xóa cache và restart clean

```bash
# Xóa tất cả build artifacts và dependencies
rm -rf node_modules dist package-lock.json

# Cài lại
npm install --legacy-peer-deps

# Build lại
npm run build

# Chạy
npm run start:dev
```

**Windows PowerShell**:
```powershell
Remove-Item -Recurse -Force node_modules, dist, package-lock.json
npm install --legacy-peer-deps
npm run build
npm run start:dev
```

---

## 🆘 Khi tất cả đều thất bại

### Checklist cuối cùng:

- [ ] MySQL đang chạy? (`mysql -u root -p`)
- [ ] Redis đang chạy? (`redis-cli ping`)
- [ ] File `.env` tồn tại và đúng?
- [ ] Dependencies đã cài đầy đủ? (`npm install --legacy-peer-deps`)
- [ ] Port 5000 có bị chiếm không?
- [ ] Node.js version >= 18? (`node -v`)
- [ ] Đã restart terminal sau khi sửa `.env`?

### Kiểm tra logs

```bash
# Xem logs chi tiết
npm run start:dev 2>&1 | tee debug.log

# Hoặc
DEBUG=* npm run start:dev
```

### Báo cáo lỗi

Khi báo lỗi cho team, bao gồm:
1. **Error message** đầy đủ
2. **Stack trace**
3. **Steps to reproduce**
4. **Environment info**: OS, Node version, npm version
5. **Relevant code** (nếu có)

---

## 📞 Tài nguyên hỗ trợ

- **NestJS Docs**: https://docs.nestjs.com/
- **TypeORM Troubleshooting**: https://typeorm.io/
- **Stack Overflow**: Tag `nestjs`, `typeorm`
- **GitHub Issues**: Kiểm tra issues của packages

---

Chúc bạn debug thành công! 🚀 Nếu vẫn gặp vấn đề, hãy kiểm tra lại từng bước trong [INSTALLATION.md](./INSTALLATION.md).
