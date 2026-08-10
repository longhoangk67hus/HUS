# 🔐 Secure Environment Variables Setup Guide

## ❌ **KHÔNG LÀM**
- ❌ Commit file `.env` vào Git
- ❌ Lưu passwords trong GitHub repo (kể cả private)
- ❌ Hardcode secrets trong source code
- ❌ Share secrets qua email/chat

## ✅ **LÀM ĐÚNG**

### **Option 1: Lưu trực tiếp trên server (KHUYẾN NGHỊ)**

#### Bước 1: Upload script lên server
```powershell
# Từ Windows, upload script (thay YOUR_SERVER_IP và YOUR_USERNAME)
scp -i "path/to/your_private_key" setup-env-on-server.sh YOUR_USERNAME@YOUR_SERVER_IP:~/
```

#### Bước 2: SSH vào server và chạy
```bash
# SSH vào server (thay YOUR_SERVER_IP và YOUR_USERNAME)
ssh -i "path/to/your_private_key" YOUR_USERNAME@YOUR_SERVER_IP

# Trên server:
chmod +x setup-env-on-server.sh
sudo ./setup-env-on-server.sh

# Edit và thay YOUR_* placeholders
nano ~/Backend/.env
```

#### Bước 3: Deploy code KHÔNG BAO GỒM .env
```bash
# Trên server:
cd ~/Backend
git pull origin main
npm install --production
npm run build
pm2 restart backend
```

---

### **Option 2: Dùng GitHub Secrets (cho CI/CD)**

Nếu dùng GitHub Actions để auto-deploy:

#### Bước 1: Thêm secrets vào GitHub
1. Vào repo: `https://github.com/longhoangk67hus/SE2025`
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm từng biến:

```
DB_PASSWORD = your_production_password
JWT_SECRET = your_jwt_secret_256_bit
SMTP_PASSWORD = btyr jawb rqcw rlyn
VNPAY_HASH_SECRET = your_vnpay_secret
SESSION_SECRET = your_session_secret
```

#### Bước 2: Tạo workflow file
```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Create .env file
        run: |
          cat > backend/.env << EOF
          NODE_ENV=production
          PORT=5000
          DB_PASSWORD=${{ secrets.DB_PASSWORD }}
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          SMTP_PASSWORD=${{ secrets.SMTP_PASSWORD }}
          VNPAY_HASH_SECRET=${{ secrets.VNPAY_HASH_SECRET }}
          SESSION_SECRET=${{ secrets.SESSION_SECRET }}
          EOF
      
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rltgoDzvO --delete"
          SOURCE: "backend/"
          REMOTE_HOST: ${{ secrets.PRODUCTION_HOST }}
          REMOTE_USER: ${{ secrets.PRODUCTION_USER }}
          TARGET: "~/Backend"
```

**Lưu ý:** Phải thêm các secrets vào GitHub:
- `SSH_PRIVATE_KEY` - Nội dung private key
- `PRODUCTION_HOST` - IP server production
- `PRODUCTION_USER` - Username server

---

### **Option 3: Dùng .env.vault (Encrypted)**

#### Bước 1: Install dotenv-vault
```bash
npm install dotenv-vault --save-dev
```

#### Bước 2: Encrypt secrets
```bash
# Trên máy local
npx dotenv-vault new
npx dotenv-vault login
npx dotenv-vault push

# Lấy DOTENV_KEY
npx dotenv-vault keys production
```

#### Bước 3: Trên server chỉ cần DOTENV_KEY
```bash
# Trên server
export DOTENV_KEY="dotenv://:key_xxx@dotenv.org/vault/.env.vault?environment=production"
npm start
```

---

## 🎯 **KHUYẾN NGHỊ CHO DỰ ÁN CỦA BẠN**

### **Cho môi trường hiện tại (Development):**
✅ Giữ `.env` trên máy local  
✅ **KHÔNG** commit `.env` vào Git  
✅ Share `.env.example` với team (không có values)

### **Cho Production:**
✅ **OPTION 1** - Tạo `.env` trực tiếp trên server (đơn giản nhất)  
✅ Set permissions: `chmod 600 .env`  
✅ Deploy code từ Git (không bao gồm .env)
✅ Lưu thông tin server (IP, credentials) riêng biệt - KHÔNG commit vào Git

### **Cho Team Collaboration:**
✅ Dùng **1Password**, **Bitwarden**, hoặc **LastPass** để share secrets  
✅ Hoặc dùng **dotenv-vault** (encrypted)

---

## 📝 **CHECKLIST BẢO MẬT**

- [x] `.env` đã có trong `.gitignore`
- [x] SSH keys đã có trong `.gitignore`
- [ ] Tạo `.env` trực tiếp trên server
- [ ] Set `chmod 600` cho `.env` trên server
- [ ] Kiểm tra Git history không có secrets (chạy `git log -p | grep PASSWORD`)
- [ ] Thay đổi secrets nếu đã commit nhầm
- [ ] Dùng secrets manager cho team

---

## 🔥 **NẾU ĐÃ COMMIT SECRETS NHẦM**

```bash
# Xóa file khỏi Git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (CHÚ Ý: Thay đổi lịch sử!)
git push origin --force --all

# Thay đổi TẤT CẢ secrets đã lộ
# - Đổi DB password
# - Đổi JWT secret
# - Đổi SMTP password
# - Revoke VNPay credentials và tạo mới
```

---

## 💡 **TÓM TẮT**

| Phương pháp | Độ an toàn | Độ phức tạp | Khuyến nghị |
|-------------|-----------|-------------|-------------|
| ❌ Commit vào Git | Rất thấp | Rất dễ | KHÔNG BAO GIỜ |
| ✅ .env trên server | Cao | Dễ | **KHUYẾN NGHỊ** |
| ✅ GitHub Secrets | Cao | Trung bình | Tốt cho CI/CD |
| ✅ dotenv-vault | Rất cao | Trung bình | Tốt cho team |
| ✅ AWS Secrets Manager | Rất cao | Phức tạp | Enterprise |

**Cho dự án SE2025 của bạn → Dùng Option 1: .env trực tiếp trên server!**
