# 📧 Email Service - Booking Confirmation with QR Code

## Tổng quan

Module email service cho phép gửi email xác nhận đặt vé với mã QR tự động sau khi thanh toán thành công qua VNPay.

## 🎯 Tính năng

✅ **Tự động gửi email khi booking confirmed**
- Kích hoạt sau khi thanh toán VNPay thành công
- Gửi async không block quá trình xác nhận booking
- Retry mechanism nếu gửi thất bại

✅ **Email template đẹp mắt**
- Responsive design cho mobile & desktop
- Gradient header với màu sắc chuyên nghiệp
- QR code hiển thị rõ ràng
- Thông tin booking đầy đủ

✅ **QR Code tích hợp**
- Tự động generate QR code khi confirm booking
- Chứa thông tin booking code, user ID, showtime
- HMAC signature để verify tính hợp lệ
- Base64 data URL nhúng trực tiếp trong email

## 📁 Cấu trúc files

```
backend/src/modules/
├── email/
│   ├── email.module.ts                        # Email module config
│   ├── services/
│   │   ├── base-email.service.ts              # Base email service (SMTP)
│   │   ├── registration-email.service.ts      # Registration emails
│   │   ├── booking-email.service.ts           # 🆕 Booking confirmation emails
│   │   └── index.ts
│   ├── interfaces/
│   │   └── email.interface.ts                 # Email interfaces
│   └── templates/                             # (Future: HTML templates)
│
└── bookings/
    ├── booking.service.ts                     # Updated with email sending
    └── booking.module.ts                      # Imports EmailModule
```

## 🔧 Cấu hình

### 1. Environment Variables (.env)

Thêm các biến sau vào file `.env`:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SENDER_EMAIL=noreply@cinemasystem.com
SENDER_NAME=Cinema System

# SMTP SSL
SMTP_ENABLE_SSL=true
```

### 2. Cách tạo Gmail App Password

1. Vào [Google Account Security](https://myaccount.google.com/security)
2. Bật **2-Step Verification** (bắt buộc)
3. Vào **App passwords** → Chọn **Mail** và **Other device**
4. Google sẽ generate password 16 ký tự
5. Copy và paste vào `SMTP_PASSWORD` trong `.env`

**⚠️ LƯU Ý**: 
- KHÔNG dùng mật khẩu Gmail thường
- KHÔNG commit `.env` vào Git
- App password chỉ hiển thị 1 lần, hãy lưu lại

## 🚀 Luồng hoạt động

```
1. User thanh toán qua VNPay
   ↓
2. VNPay gọi webhook → Payment confirmed
   ↓
3. PaymentService.processWebhook()
   → BookingService.confirmBooking(bookingId)
   ↓
4. Booking status: Pending → Confirmed
   ↓
5. Generate QR code (Base64)
   ↓
6. 📧 BookingService.sendBookingConfirmationEmail() [ASYNC]
   ↓
7. BookingEmailService.sendBookingConfirmation()
   ↓
8. Nodemailer sends email với QR code embedded
   ↓
9. ✅ User nhận email xác nhận với vé điện tử
```

## 📨 Email Template Preview

Email gửi đi sẽ có nội dung:

```
╔══════════════════════════════════════╗
║   🎬 Xác Nhận Đặt Vé Thành Công     ║
╚══════════════════════════════════════╝

Chào [Tên khách hàng],

Cảm ơn bạn đã đặt vé! Đơn đặt vé đã được xác nhận.

📋 THÔNG TIN ĐẶT VÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mã đặt vé:    BK20251127A1B2
🎥 Phim:       Avatar 3
🏢 Rạp:        CGV Vincom Center
🚪 Phòng:      Room 1
🕒 Suất chiếu: 26/11/2025 19:30
💺 Ghế:        A1, A2, A3

💰 Tổng thanh toán: 300,000 VND

🎫 MÃ QR VÉ CỦA BẠN
[QR CODE IMAGE]

📌 LƯU Ý:
• Đến rạp trước 15 phút
• Xuất trình mã QR tại quầy
• Giữ email hoặc lưu ảnh QR
```

## 🧪 Testing

### 1. Test gửi email thủ công

```typescript
// Trong BookingService hoặc test file
const testEmail = await this.bookingEmailService.sendBookingConfirmation(
  'your-test-email@gmail.com',
  {
    bookingCode: 'BK20251127TEST',
    userName: 'Test User',
    movieTitle: 'Avatar 3',
    theaterName: 'CGV Test',
    roomName: 'Room 1',
    showtime: '27/11/2025 19:30',
    seats: ['A1', 'A2'],
    totalAmount: 200000,
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgo...',
  },
);

console.log('Email sent:', testEmail);
```

### 2. Test flow hoàn chỉnh

```bash
# 1. Tạo reservation
POST /api/reservations
{
  "showtimeId": 1,
  "seatIds": [1, 2],
  "userId": "user-uuid"
}

# 2. Tạo booking
POST /api/bookings
{
  "reservationId": 123,
  "idempotencyKey": "unique-key"
}
# → Nhận paymentUrl

# 3. Thanh toán qua VNPay
# → Mở paymentUrl trong browser
# → Nhập thông tin test card (VNPay sandbox)

# 4. VNPay webhook tự động gọi
POST /api/payments/vnpay/webhook
# → Backend confirm booking
# → 📧 Email tự động gửi!

# 5. Kiểm tra email
# → Inbox của user sẽ có email với QR code
```

## 📊 Monitoring & Logs

### Log patterns để theo dõi

```typescript
// Success
✅ Generated QR code for booking 456
✅ Confirmed booking 456 - locks released
📧 Preparing to send confirmation email for booking 456
✅ Booking confirmation email sent successfully for booking 456

// Warnings
⚠️ User user-uuid-123 has no email, skipping email for booking 456

// Errors
❌ Failed to send booking confirmation email for booking 456
❌ Error in sendBookingConfirmationEmail for booking 456: SMTP connection failed
```

### Kiểm tra trong terminal

```bash
# Xem logs của NestJS
npm run start:dev

# Tìm logs về email
# Filter output với "Email" hoặc "📧"
```

## 🔥 Troubleshooting

### 1. Email không gửi được

**Lỗi: Authentication failed**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Giải pháp**:
- Kiểm tra `SMTP_USERNAME` và `SMTP_PASSWORD` trong `.env`
- Đảm bảo dùng Gmail App Password, không phải mật khẩu thường
- Bật 2-Step Verification trên Google Account

---

**Lỗi: Connection timeout**
```
Error: connect ETIMEDOUT smtp.gmail.com:587
```

**Giải pháp**:
- Kiểm tra firewall/antivirus có block port 587 không
- Thử đổi `SMTP_PORT=465` và `SMTP_ENABLE_SSL=true`
- Kiểm tra kết nối internet

---

### 2. QR Code không hiển thị

**Lỗi: QR code is empty**

**Giải pháp**:
- Kiểm tra QR code đã được generate trong `confirmBooking()`
- Verify `booking.qrCode` không null trong database
- Check logs: `✅ Generated QR code for booking X`

---

### 3. Email template bị vỡ layout

**Giải pháp**:
- Kiểm tra `isHtml: true` khi gửi email
- Test email trên nhiều email clients (Gmail, Outlook)
- Sử dụng inline CSS cho compatibility

---

### 4. User không nhận được email

**Kiểm tra**:
1. Email có trong database không? → Query `user` table
2. Log có thông báo "Email sent successfully"?
3. Kiểm tra spam folder
4. Verify email address hợp lệ

## 📝 Best Practices

### 1. Async Email Sending

```typescript
// ✅ GOOD - Async, không block
this.sendBookingConfirmationEmail(confirmed).catch((error) => {
  this.logger.error('Email failed', error);
  // Don't throw - email failure shouldn't break booking
});

// ❌ BAD - Sync, block booking confirmation
await this.sendBookingConfirmationEmail(confirmed);
```

### 2. Error Handling

```typescript
// ✅ GOOD - Graceful degradation
try {
  await emailService.send(...);
} catch (error) {
  logger.error('Email failed:', error);
  // Continue - booking already confirmed
  return;
}

// ❌ BAD - Throw error
if (!emailSent) {
  throw new Error('Email failed'); // Booking rollback!
}
```

### 3. Environment Variables

```typescript
// ✅ GOOD - Config với defaults
const smtpHost = configService.get('SMTP_HOST', 'smtp.gmail.com');

// ❌ BAD - Hardcode
const smtpHost = 'smtp.gmail.com';
```

## 🔮 Future Enhancements

- [ ] **Email queue với BullMQ** - Retry mechanism cho email thất bại
- [ ] **Template engine** (Handlebars/Pug) - Quản lý templates dễ dàng hơn
- [ ] **Multiple languages** - i18n support (EN, VI)
- [ ] **Email tracking** - Open rate, click rate
- [ ] **Attachment support** - PDF tickets
- [ ] **SMS notifications** - Twilio integration
- [ ] **Push notifications** - FCM/APNS

## 📚 References

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [QRCode.js](https://github.com/soldair/node-qrcode)
- [NestJS Email Module](https://docs.nestjs.com/techniques/queues)

## 👤 Author

- **HNLong**
- Date: 2025-11-27
- Module: Booking Email Service

---

