# VNPay Payment Gateway Setup Guide

Hướng dẫn setup VNPay payment gateway cho Cinema System với ngrok tunnel.

## 📋 Prerequisites

- Node.js (v16+)
- MySQL database đang chạy
- Redis server đang chạy
- VNPay Sandbox account
- ngrok account (free)

## 🔧 1. Cài đặt và Cấu hình ngrok

### 1.1 Download ngrok
```bash
# Tại thư mục root của project
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "ngrok.zip"
Expand-Archive -Path "ngrok.zip" -DestinationPath "." -Force
```

### 1.2 Đăng ký ngrok account
1. Truy cập: https://ngrok.com/signup
2. Đăng ký miễn phí với email hoặc GitHub
3. Lấy authtoken từ dashboard: https://dashboard.ngrok.com/get-started/your-authtoken

### 1.3 Cấu hình ngrok
```bash
# Thay YOUR_AUTH_TOKEN bằng token thực tế
.\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN
```

## 🛠️ 2. Cấu hình Backend

### 2.1 Copy environment file
```bash
cp backend/.env.example backend/.env
```

### 2.2 Cấu hình VNPay trong .env
```env
# VNPay Payment Gateway (Sandbox)
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=secret.VNPAY_TMN_CODE
VNPAY_HASH_SECRET=secret.VNPAY_HASH_SECRET

# VNPay Callback URLs (sẽ được cập nhật với ngrok URL)
VNPAY_IPN_URL=https://YOUR_NGROK_URL/api/payments/vnpay/callback
VNPAY_RETURN_URL=https://YOUR_NGROK_URL/api/payments/vnpay/return
```

## 🔐 2.3 Production Deployment với GitHub Secrets

### Setup GitHub Secrets:
1. Vào **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** 
3. Thêm các secrets:

```
# VNPay Configuration
VNPAY_URL = https://vnpay.vn/paymentv2/vpcpay.html (production)
VNPAY_TMN_CODE = your_production_terminal_id
VNPAY_HASH_SECRET = your_production_secret
VNPAY_IPN_URL = https://yourdomain.com/api/payments/vnpay/callback
VNPAY_RETURN_URL = https://yourdomain.com/api/payments/vnpay/return

# Database & Other Secrets
DB_HOST = your_production_db_host
DB_PASSWORD = your_production_db_password
JWT_SECRET = your_strong_jwt_secret
# ... other secrets
```

### Automatic .env Generation:
- GitHub Actions sẽ tự động tạo `.env` từ secrets khi deploy
- File `scripts/generate-env.sh` để generate .env locally từ environment variables

## 🚀 3. Khởi động System (Step by Step)

### 3.1 Start Backend
```bash
cd backend
npm install
npm run dev
```
✅ **Verify**: Backend chạy trên http://localhost:5000

### 3.2 Start ngrok Tunnel
```bash
# Tại terminal mới, ở thư mục root
.\ngrok.exe http 5000
```

✅ **Verify**: Ngrok hiển thị URL dạng `https://abc-def-ghi.ngrok-free.dev`

### 3.3 Cập nhật Callback URLs trong .env

**🔥 QUAN TRỌNG**: Mỗi khi restart ngrok, URL sẽ thay đổi!

```bash
# Ví dụ URL mới: https://convulsible-camellike-yun.ngrok-free.dev
# Cập nhật trong backend/.env:
VNPAY_IPN_URL=https://convulsible-camellike-yun.ngrok-free.dev/api/payments/vnpay/callback
VNPAY_RETURN_URL=https://convulsible-camellike-yun.ngrok-free.dev/api/payments/vnpay/return
```

### 3.4 Restart Backend (để load .env mới)
```bash
# Trong terminal backend: Ctrl+C rồi
npm run dev
```

## 🏦 4. Cấu hình VNPay Portal

### 4.1 Đăng nhập VNPay Sandbox
- URL: https://sandbox.vnpayment.vn/merchantv2/
- Đăng nhập bằng: ngoclong7204@gmail.com
- Terminal ID: `secret.VNPAY_TMN_CODE`
- Mật khẩu: // hỏi ngoclong :)))

### 4.2 Cấu hình IPN URL
1. Vào **Cấu hình** → **Thông tin cấu hình**
2. Tìm mục **IPN Url**
3. Điền: `https://YOUR_NGROK_URL/api/payments/vnpay/callback`
4. Giao thức IPN: **GET**
5. Kiểu mã hóa: **HMACSHA512**
6. Click **Test call IPN** để kiểm tra
7. Click **Hoàn thành** để lưu

## 🧪 5. Test Payment Flow

### 5.1 Login và lấy token
```bash
$loginResult = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"userName": "long", "password": "123456"}'
$token = $loginResult.data.token
```

### 5.2 Tạo VNPay payment
```bash
$paymentData = @{
    bookingId = 3
    paymentMethod = "EWallet" 
    paymentGateway = "VNPay"
    idempotencyKey = "test-$(Get-Date -Format 'yyyyMMddHHmmssff')"
} | ConvertTo-Json

$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
$result = Invoke-RestMethod -Uri "http://localhost:5000/api/payments" -Method POST -Headers $headers -Body $paymentData -ContentType "application/json"

Write-Host "Payment URL: $($result.paymentUrl)"
```

### 5.3 Test thanh toán
1. Copy `paymentUrl` từ kết quả
2. Mở trong browser
3. Chọn phương thức thanh toán (ATM/Ví điện tử)
4. Hoàn tất thanh toán
5. Kiểm tra callback trong backend logs

## 🔄 6. Daily Workflow

### Mỗi lần khởi động development:

1. **Start Backend**:
   ```bash
   cd backend && npm run dev
   ```

2. **Start ngrok**:
   ```bash
   .\ngrok.exe http 5000
   ```

3. **Copy ngrok URL** (từ terminal ngrok)

4. **Update .env** với URL mới:
   ```env
   VNPAY_IPN_URL=https://NEW_NGROK_URL/api/payments/vnpay/callback
   VNPAY_RETURN_URL=https://NEW_NGROK_URL/api/payments/vnpay/return
   ```

5. **Restart Backend** (để load .env mới)

6. **Update VNPay Portal** với IPN URL mới

## ⚠️ Troubleshooting

### Lỗi "Ngân hàng thanh toán không được hỗ trợ"
- **Nguyên nhân**: Force sử dụng `vnp_BankCode=VNPAYQR`
- **Giải pháp**: Đã được fix - không force BankCode nữa

### Lỗi 502 Bad Gateway trên ngrok
- **Nguyên nhân**: Backend chưa chạy hoặc chạy sai port
- **Giải pháp**: Kiểm tra backend chạy trên localhost:5000

### Token expired (401 Unauthorized)
- **Nguyên nhân**: JWT token hết hạn
- **Giải pháp**: Login lại để lấy token mới

### ngrok URL thay đổi
- **Nguyên nhân**: Đang dùng free plan, URL random mỗi session
- **Giải pháp**: Update .env và VNPay portal với URL mới

## 📝 Notes

- **Free ngrok**: URL thay đổi mỗi restart
- **Paid ngrok**: Có thể có subdomain cố định
- **VNPay Sandbox**: Chỉ cho test, không charge tiền thật
- **Production**: Cần domain thật và VNPay production account

## 🔗 Useful Links

- **ngrok Dashboard**: http://127.0.0.1:4040 (khi ngrok đang chạy)
- **VNPay Sandbox Portal**: https://sandbox.vnpayment.vn/merchantv2/
- **Backend API Docs**: http://localhost:5000/api (Swagger)
- **VNPay Documentation**: https://sandbox.vnpayment.vn/apis/

## 👥 Team Collaboration

Khi share với teammate:
1. Share VNPay credentials (Terminal ID, Secret)
2. Mỗi người dùng ngrok riêng (URL khác nhau)
3. Update VNPay portal khi switch developer
4. Hoặc dùng shared development server với fixed domain

---

**Last Updated**: December 11, 2025
**Author**: Development Team
**Version**: 1.0
