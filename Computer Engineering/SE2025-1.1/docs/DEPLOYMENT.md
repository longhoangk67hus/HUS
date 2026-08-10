# Hướng dẫn triển khai Production - SE2025 Cinema System

## 🚀 Deployment Guide

Tài liệu này hướng dẫn cách deploy SE2025 Cinema System lên môi trường production.

**⚠️ LƯU Ý BẢO MẬT:**
- Thông tin server production (IP, credentials, SSH keys) được lưu riêng biệt
- KHÔNG bao giờ commit thông tin server vào Git
- Liên hệ team lead để lấy thông tin deploy

**Kết nối SSH (ví dụ):**
```bash
ssh -i "path/to/your_private_key" username@your-server-ip
```

---

## 📋 Checklist trước khi deploy

- [ ] Tất cả tests đã pass
- [ ] Code đã được review
- [ ] Database migrations đã sẵn sàng
- [ ] Environment variables production đã chuẩn bị
- [ ] SSL certificates đã có
- [ ] Domain và DNS đã config
- [ ] Backup strategy đã có
- [ ] Monitoring/logging đã setup

---

## 🔧 Chuẩn bị môi trường Production

### 1. Server Requirements

**Tối thiểu**:
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2

**Khuyến nghị**:
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD
- Load balancer (nếu có nhiều instances)

### 2. Software Stack

```bash
# Node.js 18+ LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (Process Manager)
sudo npm install -g pm2

# MySQL 8.0+
sudo apt-get install mysql-server

# Redis
sudo apt-get install redis-server

# Nginx (Reverse Proxy)
sudo apt-get install nginx
```

---

## 🔐 Cấu hình bảo mật

### 1. Tạo `.env.production`

```env
# Environment
NODE_ENV=production
PORT=5000

# Database
DB_TYPE=mysql
DB_HOST=your-db-host.com
DB_PORT=3306
DB_USERNAME=production_user
DB_PASSWORD=super_strong_password_here_min_32_chars
DB_DATABASE=cinema_system_prod

# Redis
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=redis_strong_password

# JWT - Generate new secrets for production!
JWT_SECRET=super_secret_production_jwt_key_min_64_characters_random_string
JWT_EXPIRES_IN=1d

# Session
SESSION_SECRET=session_secret_production_min_64_chars

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=production@yourdomain.com
SMTP_PASSWORD=app_specific_password
EMAIL_FROM=noreply@yourdomain.com

# CORS - Your frontend domain
CORS_ORIGIN=https://yourdomain.com

# Other
RESERVATION_TIMEOUT_MINUTES=15
```

**⚠️ QUAN TRỌNG**:
- **KHÔNG BAO GIỜ** commit file này lên Git
- Sử dụng secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate secrets định kỳ

### 2. Generate Strong Secrets

```bash
# Generate JWT_SECRET (Linux/Mac)
openssl rand -base64 64

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

---

## 🗄️ Database Setup

### 1. Tạo Production Database

```sql
-- Đăng nhập MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE cinema_system_prod 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Tạo user riêng cho app
CREATE USER 'cinema_prod'@'localhost' 
  IDENTIFIED BY 'your_strong_password';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON cinema_system_prod.* 
  TO 'cinema_prod'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

### 2. Run Migrations (Không dùng synchronize!)

```typescript
// src/config/database.config.ts
export const databaseConfig: TypeOrmModuleOptions = {
  // ...
  synchronize: false,  // NEVER true in production!
  migrationsRun: true,
  migrations: ['dist/migrations/*.js'],
};
```

```bash
# Generate migration
npm run typeorm migration:generate -- -n InitialSchema

# Run migrations
npm run typeorm migration:run
```

### 3. Backup Database

```bash
# Backup script
mysqldump -u cinema_prod -p cinema_system_prod > backup_$(date +%Y%m%d).sql

# Cron job cho daily backup
0 2 * * * /path/to/backup_script.sh
```

---

## 📦 Build Application

### 1. Build TypeScript

```bash
# Clone repository
git clone https://github.com/your-repo/SE2025_Cinema_Node.git
cd SE2025_Cinema_Node/backend

# Install dependencies (production only)
npm ci --only=production

# Build
npm run build

# Kết quả: dist/ folder chứa compiled JavaScript
```

### 2. Optimize package.json

```json
{
  "scripts": {
    "start:prod": "NODE_ENV=production node dist/main.js"
  }
}
```

---

## 🔄 Process Management với PM2

### 1. Cài đặt PM2

```bash
sudo npm install -g pm2
```

### 2. Tạo `ecosystem.config.js`

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cinema-api',
    script: './dist/main.js',
    instances: 'max',  // Cluster mode với tất cả CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
  }]
};
```

### 3. Chạy với PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Xem logs
pm2 logs cinema-api

# Xem monitoring
pm2 monit

# Restart
pm2 restart cinema-api

# Stop
pm2 stop cinema-api

# Auto start khi server reboot
pm2 startup
pm2 save
```

---

## 🌐 Nginx Reverse Proxy

### 1. Cài đặt Nginx

```bash
sudo apt-get update
sudo apt-get install nginx
```

### 2. Cấu hình Nginx

```nginx
# /etc/nginx/sites-available/cinema-api

upstream cinema_backend {
  least_conn;
  server localhost:5000;
  # Nếu có nhiều instances:
  # server localhost:5001;
  # server localhost:5002;
}

server {
  listen 80;
  server_name api.yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.yourdomain.com;

  # SSL certificates
  ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
  
  # SSL settings
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Logging
  access_log /var/log/nginx/cinema_access.log;
  error_log /var/log/nginx/cinema_error.log;

  # Proxy settings
  location / {
    proxy_pass http://cinema_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
  limit_req zone=api_limit burst=20 nodelay;
}
```

### 3. Enable site và restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cinema-api /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 SSL Certificate với Let's Encrypt

```bash
# Cài đặt Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run

# Cron job cho renewal
0 0 * * * /usr/bin/certbot renew --quiet
```

---

## 🔥 Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Không mở port 5000 ra ngoài (chỉ Nginx proxy)
```

---

## 📊 Monitoring & Logging

### 1. PM2 Monitoring

```bash
# Install PM2 Plus (optional)
pm2 link <secret> <public>

# Web dashboard
pm2 web
```

### 2. Application Logging

```typescript
// src/main.ts
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  await app.listen(process.env.PORT || 5000);
  logger.log(`Application running on port ${process.env.PORT || 5000}`);
}
```

### 3. Winston Logger (Advanced)

```bash
npm install winston nest-winston
```

```typescript
// src/main.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const app = await NestFactory.create(AppModule, {
  logger: WinstonModule.createLogger({
    transports: [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      }),
    ],
  }),
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run tests
        run: npm test
        working-directory: ./backend
      
      - name: Build
        run: npm run build
        working-directory: ./backend
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/cinema-api
            git pull origin main
            cd backend
            npm ci --only=production
            npm run build
            pm2 restart cinema-api
```

---

## 📈 Performance Optimization

### 1. Enable Compression

```bash
npm install compression
```

```typescript
// src/main.ts
import * as compression from 'compression';

app.use(compression());
```

### 2. Redis Caching

```typescript
// Cache frequently accessed data
@Injectable()
export class MovieService {
  async getNowShowingMovies() {
    const cacheKey = 'movies:now-showing';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const movies = await this.movieRepository.find(/* ... */);
    await this.redis.setex(cacheKey, 300, JSON.stringify(movies)); // 5 min TTL
    
    return movies;
  }
}
```

### 3. Database Indexing

```typescript
@Entity('movies')
@Index(['title'])
@Index(['releaseDate'])
@Index(['status'])
export class Movie { /* ... */ }
```

---

## 🛡️ Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Strong passwords & secrets
- [ ] JWT secrets rotated
- [ ] Database user với least privileges
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Dependencies updated (npm audit)
- [ ] SQL injection prevention (TypeORM parameterized queries)
- [ ] XSS prevention (helmet package)
- [ ] CSRF protection (if needed)
- [ ] Input validation (class-validator)

### Install Helmet

```bash
npm install helmet
```

```typescript
// src/main.ts
import helmet from 'helmet';

app.use(helmet());
```

---

## 📞 Rollback Strategy

### Nếu deployment thất bại:

```bash
# 1. Quay về commit trước
git revert HEAD

# 2. Rebuild
npm run build

# 3. Restart PM2
pm2 restart cinema-api

# 4. Restore database backup (nếu cần)
mysql -u cinema_prod -p cinema_system_prod < backup_20241106.sql
```

---

## 📚 Post-Deployment

### 1. Health Check

```bash
# Test API
curl https://api.yourdomain.com/

# Test Swagger
curl https://api.yourdomain.com/api
```

### 2. Monitor Logs

```bash
# PM2 logs
pm2 logs cinema-api

# Nginx logs
tail -f /var/log/nginx/cinema_access.log
tail -f /var/log/nginx/cinema_error.log
```

### 3. Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test
ab -n 1000 -c 10 https://api.yourdomain.com/api/movies
```

---

## 🎯 Scaling Strategies

### Horizontal Scaling
- Load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Session store in Redis (không dùng in-memory)

### Vertical Scaling
- Tăng CPU/RAM
- Optimize database queries
- Add indexes

### Database Scaling
- Read replicas
- Sharding
- Connection pooling

---

Chúc bạn deploy thành công! 🚀
