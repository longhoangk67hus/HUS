# Hướng dẫn bảo mật - SE2025 Cinema System

## 🔒 Tổng quan về bảo mật

Tài liệu này hướng dẫn cách bảo vệ thông tin nhạy cảm và đảm bảo **GitHub không thể quét được email, mật khẩu, secrets** của bạn.

---

## ⚠️ Các thông tin TUYỆT ĐỐI KHÔNG được commit lên Git

### 1. File `.env` - Biến môi trường
❌ **KHÔNG BAO GIỜ** commit file này!

File `.env` chứa:
- Database passwords
- JWT secrets
- API keys
- Email credentials
- Redis passwords

### 2. Credentials và keys
- Private keys (`.pem`, `.key`)
- SSL certificates
- OAuth client secrets
- Third-party API keys

### 3. Configuration files với thông tin nhạy cảm
- `config.json` (nếu chứa passwords)
- `secrets.yaml`
- Backup files (`.bak`, `.old`)

---

## 🛡️ Cấu hình .gitignore

### File `.gitignore` cho SE2025_Cinema_Node

```gitignore
# ================================
# Environment Variables
# ================================
.env
.env.local
.env.*.local
.env.development
.env.production
*.env

# ================================
# Secrets & Credentials
# ================================
secrets/
*.pem
*.key
*.p12
*.pfx
credentials.json
serviceAccountKey.json

# ================================
# Node.js
# ================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# ================================
# Build & Distribution
# ================================
dist/
build/
*.tsbuildinfo
*.log

# ================================
# IDE & Editors
# ================================
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# ================================
# Testing & Coverage
# ================================
coverage/
*.lcov
.nyc_output/

# ================================
# Database
# ================================
*.sql.backup
*.db
*.sqlite
*.sqlite3

# ================================
# OS Files
# ================================
.DS_Store
Thumbs.db
desktop.ini

# ================================
# Temporary Files
# ================================
tmp/
temp/
*.tmp
*.temp
.cache/
```

### Cách tạo `.gitignore`

```bash
# Di chuyển vào thư mục backend
cd SE2025_Cinema_Node/backend

# Tạo file .gitignore (nếu chưa có)
# Windows PowerShell:
New-Item -Path .gitignore -ItemType File

# Linux/Mac:
touch .gitignore

# Copy nội dung bên trên vào file .gitignore
```

---

## 🔐 Quản lý biến môi trường

### Cấu trúc file `.env.example`

**File này CÓ THỂ commit lên Git** (template cho team):

```env
# ================================
# Environment
# ================================
NODE_ENV=development
PORT=5000

# ================================
# Database Configuration
# ================================
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username_here
DB_PASSWORD=your_db_password_here
DB_DATABASE=cinema_system

# ================================
# Redis Configuration
# ================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_or_leave_empty

# ================================
# JWT Authentication
# ================================
JWT_SECRET=your_jwt_secret_min_32_characters_long
JWT_EXPIRES_IN=1d

# ================================
# Session
# ================================
SESSION_SECRET=your_session_secret_min_32_characters

# ================================
# Email Configuration (Optional)
# ================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@cinemagsystem.com

# ================================
# CORS
# ================================
CORS_ORIGIN=http://localhost:3000

# ================================
# Reservation Settings
# ================================
RESERVATION_TIMEOUT_MINUTES=15

# ================================
# Bull Queue
# ================================
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
```

### File `.env` thực tế (KHÔNG commit)

```env
# Ví dụ file .env thực tế với thông tin nhạy cảm
NODE_ENV=development
PORT=5000

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=MyS3cur3P@ssw0rd!2024
DB_DATABASE=cinema_system

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=super_secret_jwt_key_x7j9k2m5n8q1r4t6w3z0a8b5c2d9e7f4
JWT_EXPIRES_IN=1d

SESSION_SECRET=session_key_p3l6m9n2q5r8t1v4x7z0b3c6e9h2k5m8

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myemail@gmail.com
SMTP_PASSWORD=xyzw abcd efgh ijkl
EMAIL_FROM=noreply@cinemasystem.com

CORS_ORIGIN=http://localhost:3000
RESERVATION_TIMEOUT_MINUTES=15
```

---

## 🚫 Cách xử lý khi đã vô tình commit secrets

### Trường hợp 1: Vừa mới commit (chưa push)

```bash
# Xóa commit cuối cùng nhưng giữ lại changes
git reset --soft HEAD~1

# Hoặc xóa commit và changes
git reset --hard HEAD~1

# Thêm .env vào .gitignore
echo ".env" >> .gitignore

# Commit lại
git add .gitignore
git commit -m "Add .gitignore to protect secrets"
```

### Trường hợp 2: Đã push lên GitHub

**⚠️ NGUY HIỂM**: Secrets đã bị expose công khai!

#### Bước 1: Thay đổi TẤT CẢ secrets ngay lập tức

```bash
# Đổi database password
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';

# Thay JWT_SECRET, SESSION_SECRET trong .env
# Revoke API keys nếu có
```

#### Bước 2: Xóa file khỏi Git history

```bash
# Cài đặt BFG Repo-Cleaner
# Download: https://rtyley.github.io/bfg-repo-cleaner/

# Hoặc dùng git filter-repo
pip install git-filter-repo

# Xóa file .env khỏi toàn bộ history
git filter-repo --invert-paths --path .env

# Force push (NGUY HIỂM - chỉ làm khi chắc chắn)
git push origin --force --all
```

#### Bước 3: Thông báo team

Nếu làm việc team:
```
⚠️ URGENT: Secrets đã bị expose. 
- Đã thay đổi tất cả passwords/keys
- Đã force push để xóa history
- Mọi người vui lòng: git pull --rebase
```

### Trường hợp 3: Phát hiện muộn (sau nhiều commits)

Sử dụng **GitHub Secret Scanning** sẽ tự động phát hiện và cảnh báo.

**Các bước xử lý**:
1. Rotate tất cả secrets ngay lập tức
2. Xóa khỏi Git history bằng `git filter-repo` hoặc BFG
3. Kiểm tra logs xem có ai truy cập trái phép không
4. Enable 2FA cho tất cả services

---

## 🔑 Best Practices cho Secrets Management

### 1. Sử dụng Strong Secrets

```bash
# Generate JWT secret mạnh (Linux/Mac)
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Yêu cầu**:
- **Độ dài tối thiểu**: 32 ký tự
- **Chứa**: chữ hoa, chữ thường, số, ký tự đặc biệt
- **KHÔNG sử dụng**: từ điển, thông tin cá nhân, dễ đoán

### 2. Tách môi trường

```
.env.development   # Cho development (local)
.env.staging       # Cho staging server
.env.production    # Cho production server
```

Tất cả đều phải có trong `.gitignore`!

### 3. Sử dụng Environment Variables trong CI/CD

**GitHub Actions**:
```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
        run: npm run deploy
```

**GitHub Repository Settings** → **Secrets and variables** → **Actions** → Add secrets

### 4. Encrypt sensitive files

Nếu **bắt buộc** phải commit config:

```bash
# Cài đặt git-crypt
# Windows: choco install git-crypt
# Linux: sudo apt-get install git-crypt
# Mac: brew install git-crypt

# Init git-crypt
git-crypt init

# Thêm vào .gitattributes
echo "secrets/** filter=git-crypt diff=git-crypt" >> .gitattributes

# Lock/unlock
git-crypt lock
git-crypt unlock
```

---

## 📧 Bảo vệ Email khỏi GitHub Scanners

### 1. Không hardcode email trong code

❌ **SAI**:
```typescript
const adminEmail = 'admin@company.com'; // Sẽ bị scan
```

✅ **ĐÚNG**:
```typescript
const adminEmail = process.env.ADMIN_EMAIL;
```

### 2. Sử dụng Email trong .env

```env
# .env (KHÔNG commit)
ADMIN_EMAIL=admin@company.com
SUPPORT_EMAIL=support@company.com
SMTP_USER=noreply@company.com
SMTP_PASSWORD=app_specific_password_here
```

### 3. Template emails

```typescript
// src/config/email.config.ts
export const emailConfig = {
  from: process.env.EMAIL_FROM,
  admin: process.env.ADMIN_EMAIL,
  support: process.env.SUPPORT_EMAIL,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
};
```

### 4. Gmail App Passwords

**KHÔNG dùng mật khẩu Gmail thực**!

Tạo App Password:
1. Google Account → Security
2. 2-Step Verification (bật lên)
3. App passwords → Generate
4. Dùng password đó trong `SMTP_PASSWORD`

---

## 🔍 Kiểm tra trước khi commit

### Pre-commit hook

Tạo file `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Kiểm tra xem có file .env được add không
if git diff --cached --name-only | grep -E "^\.env$"; then
    echo "❌ ERROR: Bạn đang cố commit file .env!"
    echo "File .env chứa thông tin nhạy cảm và KHÔNG được commit."
    exit 1
fi

# Kiểm tra secrets trong code
if git diff --cached | grep -E "(password|secret|api_key|token)\s*=\s*['\"][^'\"]+['\"]"; then
    echo "⚠️  WARNING: Phát hiện có thể có secrets trong code!"
    echo "Vui lòng kiểm tra lại trước khi commit."
    read -p "Bạn có chắc muốn tiếp tục? (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

exit 0
```

### Manual check

```bash
# Xem những gì sẽ được commit
git status

# Xem diff chi tiết
git diff --cached

# Kiểm tra .gitignore có hoạt động không
git check-ignore -v .env
```

---

## 🛠️ Tools hữu ích

### 1. git-secrets (AWS)
```bash
# Cài đặt
git clone https://github.com/awslabs/git-secrets
cd git-secrets
make install

# Setup cho repo
cd /path/to/SE2025_Cinema_Node
git secrets --install
git secrets --register-aws
```

### 2. detect-secrets (Yelp)
```bash
pip install detect-secrets

# Scan repository
detect-secrets scan > .secrets.baseline

# Check
detect-secrets audit .secrets.baseline
```

### 3. GitHub Secret Scanning

Tự động bật cho public repos. Cho private repos:
- Repository Settings → Security → Secret scanning → Enable

---

## ✅ Checklist bảo mật

Trước mỗi lần commit:

- [ ] `.env` có trong `.gitignore`
- [ ] Không có passwords/secrets trong code
- [ ] Email được load từ environment variables
- [ ] API keys không hardcode
- [ ] `.env.example` chỉ có placeholders
- [ ] Pre-commit hooks đã setup
- [ ] Đã chạy `git status` để kiểm tra
- [ ] Đã review `git diff --cached`

Định kỳ:
- [ ] Rotate JWT secrets (3-6 tháng)
- [ ] Đổi database passwords (6-12 tháng)
- [ ] Review access logs
- [ ] Update dependencies với `npm audit`

---

## 🆘 Tài nguyên hữu ích

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [git-secrets](https://github.com/awslabs/git-secrets)
- [How to remove sensitive data from Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## 📞 Báo cáo sự cố bảo mật

Nếu phát hiện secrets bị leak:
1. **Ngay lập tức** thay đổi tất cả credentials
2. Thông báo cho team lead/admin
3. Xóa khỏi Git history
4. Kiểm tra logs để phát hiện truy cập bất thường
5. Document incident để tránh lặp lại

---

**Remember**: Bảo mật là trách nhiệm của tất cả mọi người! 🔒
