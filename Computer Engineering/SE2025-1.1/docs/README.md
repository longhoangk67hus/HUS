# SE2025 Cinema System - Hệ thống rạp chiếu phim đa cụm

Chào mừng đến với tài liệu của dự án **SE2025 Cinema System** - Hệ thống quản lý rạp chiếu phim hiện đại với NestJS.

## 🏬 Tổng quan hệ thống

**SE2025 Cinema** hiện tại vận hành **4 rạp chiếu phim** tại các thành phố lớn của Việt Nam:

1. **SE2025-HN01** - Cinema Hai Ba Trung (Hà Nội)
2. **SE2025-HN02** - Cinema Royal City (Hà Nội)  
3. **SE2025-HCM01** - Cinema Saigon (TP. Hồ Chí Minh)
4. **SE2025-DN01** - Cinema Da Nang (Đà Nẵng)

### 🎭 Thông số hệ thống:
- **4 theaters** tại 3 thành phố lớn
- **4 rooms** (1 Standard room/theater, 114 seats/room)
- **456 seats** tổng cộng (84 Regular + 24 VIP + 6 Couple/room)
- **3 seat types**: Regular (1.0x), VIP (1.5x), Couple (1.3x)
- **Uniform pricing**: 120,000 VND base price
- **Multi-theater showtime distribution**

## 👤 Tài khoản Admin mặc định

```yaml
Username: admin
Email: admin@se2025.com
Password: admin123
Role: ADMIN
Access: Full system management + Statistics dashboard
```

## 📚 Mục lục tài liệu

### 1. [Hướng dẫn cài đặt và chạy](./INSTALLATION.md)
- Yêu cầu hệ thống
- Cài đặt dependencies
- Cấu hình database
- Chạy ứng dụng
- Các lỗi thường gặp

### 2. [Hướng dẫn bảo mật](./SECURITY.md)
- Bảo vệ thông tin nhạy cảm
- Cấu hình .gitignore
- Quản lý biến môi trường
- Best practices cho bảo mật

### 3. [Quản lý Secrets & Environment Variables](./SECRETS_MANAGEMENT_GUIDE.md)
- ❌ Không lưu secrets trên GitHub
- ✅ Cách setup .env trên server production
- ✅ Sử dụng GitHub Secrets cho CI/CD
- ✅ Encrypted secrets với dotenv-vault
- Checklist bảo mật cho production

### 4. [Hướng dẫn Deploy lên Server](./DEPLOYMENT.md)
- Setup server Ubuntu/Debian
- Cài đặt Node.js, MySQL, Redis
- Deploy backend với PM2
- Configure Nginx reverse proxy
- SSL với Let's Encrypt

### 5. [Tài liệu API](./API_DOCUMENTATION.md)
- Danh sách endpoints cho tất cả modules
- Multi-theater API usage
- Authentication với JWT + Role-based access
- Ví dụ requests/responses cho 4 theaters
- Testing APIs với Postman/Thunder Client

### 6. [🆕 Admin Statistics API](./ADMIN_STATISTICS_API.md)
- Revenue dashboard analytics
- Multi-theater performance comparison  
- Daily và monthly trend analysis
- Admin-only endpoints with role protection
- Timezone-safe calculations với growth tracking

### 7. [Cấu trúc dự án](./PROJECT_STRUCTURE.md)
- Multi-theater architecture overview
- Module organization and dependencies
- Database schema với 4 theaters
- Simplified room/seat type structure

### 8. [Manual Booking API](./MANUAL_BOOKING_API.md)
- Walk-in customer booking system
- Admin counter sales management
- Cash payment processing

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>

# 2. Cài đặt dependencies
cd SE2025-1.1/backend
npm install --legacy-peer-deps

# 3. Cấu hình environment
cp .env.example .env
# Chỉnh sửa .env với thông tin database MySQL và Redis

# 4. Import database schema
mysql -u root cinema_system < db.sql

# 5. Chạy ứng dụng
npm run dev
```

## 🏗️ Kiến trúc hệ thống

### Backend Stack:
- **Framework**: NestJS 10.3 với TypeScript
- **Database**: MySQL 8.0.31 với TypeORM
- **Cache**: Redis cho session management  
- **Authentication**: JWT với role-based authorization
- **API Documentation**: Swagger/OpenAPI
- **Payment**: VNPay integration

### Database Schema:
- **Simplified architecture**: 1 room type (Standard) + 3 seat types
- **Multi-theater support**: 4 theaters với consistent room layout
- **Optimized relationships**: Clean foreign keys và indexes
- **Admin statistics**: Dashboard với timezone-safe calculations

### 7. [Troubleshooting](./TROUBLESHOOTING.md)
- Các lỗi thường gặp và cách fix
- Debug tips
- Performance optimization

## 🔐 Security & Production

**Quan trọng:** Đọc [SECRETS_MANAGEMENT_GUIDE.md](./SECRETS_MANAGEMENT_GUIDE.md) trước khi deploy!

### Checklist Production:
- [ ] Tất cả secrets đã được remove khỏi Git
- [ ] File .env đã được tạo trực tiếp trên server
- [ ] SSH keys được bảo mật (chmod 600)
- [ ] Database password đã thay đổi cho production
- [ ] JWT_SECRET đã generate mới (256-bit random)
- [ ] CORS_ORIGIN chỉ cho phép domain production
- [ ] Redis password đã được set (nếu có)
- [ ] VNPay credentials đã chuyển từ sandbox sang production

## 🔗 System URLs

- **Backend API**: http://localhost:5000
- **Swagger Documentation**: http://localhost:5000/api
- **Statistics Dashboard**: http://localhost:5000/api/admin/statistics/dashboard
- **Database**: MySQL (localhost:3306/cinema_system)
- **Redis Cache**: localhost:6379

## 🎯 Key Features

### For Customers:
- Movie browsing với filtering và search
- Multi-theater showtime selection
- Real-time seat selection với 3 seat types
- Secure booking với Redis-based reservation
- VNPay payment integration
- QR code tickets

### For Admins:
- Complete theater management (4 locations)
- Revenue statistics với daily/monthly breakdowns
- Manual booking system for walk-in customers
- Movie và showtime management
- User role management

## 🛡️ Security Features

- **JWT Authentication** với role-based access (USER/ADMIN)
- **Redis-based session management** 
- **SQL injection protection** với TypeORM
- **Environment-based configuration**
- **CORS protection** cho production deployment

## 📞 Hỗ trợ

Nếu bạn gặp vấn đề, vui lòng:
1. Kiểm tra [Hướng dẫn cài đặt](./INSTALLATION.md)
2. Xem [Các lỗi thường gặp](./TROUBLESHOOTING.md)
3. Liên hệ team development

## 📝 License

MIT License - See LICENSE file for details
