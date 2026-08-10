# Cấu trúc dự án - SE2025 Cinema System (Multi-Theater)

## 📁 Tổng quan cấu trúc

```
SE2025-1.1/
├── backend/                    # NestJS Backend với TypeScript
│   ├── src/
│   │   ├── config/            # Database & Redis configuration
│   │   ├── modules/           # Feature modules (by domain)
│   │   │   ├── auth/         # JWT Authentication
│   │   │   ├── theaters/     # 4-theater management
│   │   │   ├── movies/       # Movie catalog
│   │   │   ├── showtimes/    # Multi-theater scheduling
│   │   │   ├── reservations/ # Redis-based seat locking
│   │   │   ├── bookings/     # Payment integration
│   │   │   └── admin/        # Statistics dashboard
│   │   ├── common/           # Shared utilities & guards
│   │   └── main.ts          # Application entry point
│   ├── db.sql                # Complete database schema + data
│   ├── .env                  # Environment variables (IGNORED)
│   ├── .env.example          # Environment template
│   ├── package.json          # Dependencies & scripts
│   └── tsconfig.json         # TypeScript configuration
├── docs/                      # Complete documentation
│   ├── README.md             # System overview
│   ├── API_DOCUMENTATION.md  # API endpoints guide
│   ├── ADMIN_STATISTICS_API.md # Admin analytics guide
│   ├── INSTALLATION.md       # Setup instructions
│   └── DEPLOYMENT.md         # Production deployment
├── frontend/                  # Frontend application (if applicable)
└── README.md                 # Project overview
```

---

## 🏗️ Architecture Overview

### Multi-Theater Cinema System

**4 Theater Locations:**
1. **Theater 1**: SE2025-HN01 (Hai Ba Trung, Hanoi)
2. **Theater 2**: SE2025-HN02 (Royal City, Hanoi)  
3. **Theater 3**: SE2025-HCM01 (Saigon, Ho Chi Minh)
4. **Theater 4**: SE2025-DN01 (Da Nang, Da Nang)

**Unified Architecture:**
- **1 Standard room** per theater (114 seats each)
- **3 Seat types**: Regular (1.0x), VIP (1.5x), Couple (1.3x)
- **Base pricing**: 120,000 VND uniform across all locations
- **Distributed showtimes** across 4 theaters

---

## 🗂️ Backend Structure (Detailed)

### 1. Thư mục `src/modules/`

```
src/modules/
├── auth/                       # Authentication & Authorization
│   ├── dto/                   # Login, Register DTOs
│   ├── guards/                # JWT & Role-based guards
│   │   ├── jwt-auth.guard.ts  # JWT token validation
│   │   └── roles.guard.ts     # ADMIN/USER role checking
│   ├── decorators/            # Custom decorators
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── strategies/            # Passport JWT strategy
│   ├── services/              # Auth business logic
│   ├── entities/              # User, Role entities
│   ├── auth.controller.ts     # Login, Register, Profile
│   └── auth.module.ts
│
├── theaters/                   # Multi-Theater Management
│   ├── dto/                   # Create/Update theater DTOs
│   ├── entities/              # Theater entity
│   │   └── theater.entity.ts  # 4 theaters definition
│   ├── services/              # Theater business logic
│   │   └── theater.service.ts # CRUD + multi-city filtering
│   ├── theater.controller.ts  # API endpoints (supports ID 1-4)
│   └── theater.module.ts
│
├── movies/                     # Movie Catalog Management
│   ├── dto/                   # Movie DTOs
│   ├── entities/              # Movie, Genre entities
│   ├── services/              # Movie business logic
│   ├── movie.controller.ts    # CRUD + search + genre filtering
│   └── movie.module.ts
│
├── rooms/                      # Simplified Room Management
│   ├── dto/                   # Room DTOs
│   ├── entities/              # Room, RoomType entities
│   │   ├── room.entity.ts     # 4 rooms (1 per theater)
│   │   └── room-type.entity.ts # Single "Standard" type only
│   ├── services/              # Room business logic
│   ├── room.controller.ts     # CRUD + theater filtering
│   └── room.module.ts
│
├── seats/                      # 3-Type Seat Management
│   ├── dto/                   # Seat DTOs
│   ├── entities/              # Seat, SeatType entities
│   │   ├── seat.entity.ts     # 456 seats total (114x4 rooms)
│   │   └── seat-type.entity.ts # Regular/VIP/Couple types
│   ├── services/              # Seat layout business logic
│   ├── seat.controller.ts     # CRUD + room filtering + bulk operations
│   └── seat.module.ts
│
├── showtimes/                  # Multi-Theater Scheduling
│   ├── dto/                   # Showtime DTOs
│   ├── entities/              # Showtime entity
│   │   └── showtime.entity.ts # Distributed across 4 rooms
│   ├── services/              # Scheduling business logic
│   ├── showtime.controller.ts # CRUD + movie/room filtering
│   └── showtime.module.ts
│
├── reservations/               # Redis-Based Seat Locking
│   ├── dto/                   # Reservation DTOs
│   ├── entities/              # Reservation entity
│   ├── services/              # Redis seat locking logic
│   │   └── reservation.service.ts # Atomic operations + TTL
│   ├── reservation.controller.ts # Create/Cancel reservations
│   └── reservation.module.ts
│
├── bookings/                   # Payment Integration
│   ├── dto/                   # Booking DTOs
│   ├── entities/              # Booking, BookingSeat entities
│   ├── services/              # Booking business logic
│   │   └── booking.service.ts # QR codes + payment processing
│   ├── booking.controller.ts  # Create bookings + user history
│   └── booking.module.ts
│
├── payments/                   # VNPay Gateway
│   ├── dto/                   # Payment DTOs
│   ├── entities/              # Payment entity
│   ├── services/              # VNPay integration
│   │   └── payment.service.ts # Webhook handling + verification
│   ├── payment.controller.ts  # Create payments + callbacks
│   └── payment.module.ts
│
└── admin/                      # 🆕 Admin-Only Features
    ├── statistics/             # Revenue Analytics Dashboard
    │   ├── dto/               # Statistics response DTOs
    │   │   ├── revenue-summary.dto.ts    # Dashboard overview
    │   │   ├── revenue-by-movie.dto.ts   # Movie performance
    │   │   ├── revenue-by-theater.dto.ts # Theater comparison
    │   │   ├── revenue-by-date.dto.ts    # Daily trends
    │   │   └── revenue-by-month.dto.ts   # Monthly analytics
    │   ├── statistics.service.ts         # Analytics business logic
    │   ├── statistics.controller.ts      # @Roles('ADMIN') endpoints
    │   └── statistics.module.ts
    │
    └── manual-booking/         # Counter Sales Management
        ├── dto/               # Manual booking DTOs
        ├── manual-booking.service.ts # Walk-in customer processing
        ├── manual-booking.controller.ts # Admin-only booking creation
        └── manual-booking.module.ts
```

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Controllers Layer           │  ← HTTP requests/responses
│      (*.controller.ts)              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Services Layer              │  ← Business logic
│      (*.service.ts)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Repository Layer               │  ← Data access
│      (TypeORM Repositories)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database Layer              │  ← MySQL Database
│      (Entities, Migrations)         │
└─────────────────────────────────────┘
```

---

## 📦 Module Pattern

Mỗi feature được tổ chức thành 1 **NestJS Module** độc lập:

### Ví dụ: Movie Module

```typescript
// movie.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]), // Import entity
  ],
  controllers: [MovieController],      // HTTP handlers
  providers: [MovieService],           // Business logic
  exports: [MovieService],             // Export để module khác dùng
})
export class MovieModule {}
```

### Các thành phần:

#### 1. **Entity** (`movie.entity.ts`)
- Định nghĩa cấu trúc bảng database
- Sử dụng TypeORM decorators

```typescript
@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  movieId: number;

  @Column()
  title: string;

  @Column()
  duration: number;

  // ... relations, computed properties, etc.
}
```

#### 2. **DTO** (Data Transfer Objects)
- Định nghĩa shape của data cho requests/responses
- Validation với `class-validator`

```typescript
// create-movie.dto.ts
export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1)
  duration: number;

  // ...
}
```

#### 3. **Service** (`movie.service.ts`)
- Business logic
- Tương tác với database qua Repository

```typescript
@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepository.find();
  }

  // ... other methods
}
```

#### 4. **Controller** (`movie.controller.ts`)
- HTTP endpoints
- Validation, Guards, Interceptors
- Swagger documentation

```typescript
@Controller('api/movies')
@ApiTags('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ summary: 'Get all movies' })
  async getAllMovies() {
    return this.movieService.getAllMovies();
  }
}
```

---

## 🔌 Dependency Flow

```
AppModule (root)
├── ConfigModule (global)
├── TypeOrmModule (database)
├── AuthModule
│   └── Provides: AuthService, JwtStrategy
├── MovieModule
│   └── Provides: MovieService
│   └── Imports: TypeOrmModule.forFeature([Movie])
├── TheaterModule
│   └── Similar structure
└── ... other modules
```

---

## 🗄️ Database Schema

### Entities và Relations

```
User (users)
├── userId: UUID (PK)
├── userName: string
├── email: string
├── password: string (hashed)
└── roles: string[]

Movie (movies)
├── movieId: number (PK)
├── title: string
├── slug: string
├── duration: number
├── releaseDate: Date
└── status: enum (NOW_SHOWING, COMING_SOON, ENDED)

Theater (theaters)
├── theaterId: number (PK)
├── theaterCode: string (unique)
├── theaterName: string
├── city: string
└── isActive: boolean

Room (rooms)
├── roomId: number (PK)
├── theaterId: number (FK → Theater)
├── roomName: string
└── capacity: number

Showtime (showtimes)
├── showtimeId: number (PK)
├── movieId: number (FK → Movie)
├── roomId: number (FK → Room)
├── startTime: DateTime
└── endTime: DateTime

Seat (seats)
├── seatId: number (PK)
├── roomId: number (FK → Room)
├── seatNumber: string
└── seatType: enum

Reservation (reservations)
├── reservationId: UUID (PK)
├── userId: UUID (FK → User)
├── showtimeId: number (FK → Showtime)
├── seats: Seat[] (relation)
├── totalPrice: decimal
├── status: enum (PENDING, CONFIRMED, CANCELLED)
└── expiresAt: DateTime
```

---

## 🔧 Configuration Files

### `tsconfig.json`
- TypeScript compiler options
- Path mappings (aliases)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@modules/*": ["src/modules/*"]
    }
  }
}
```

### `package.json`
- Dependencies
- Scripts (build, dev, start, test)

### `.env` (GIT IGNORED!)
- Environment variables
- Secrets (passwords, JWT keys)

### `.env.example`
- Template cho `.env`
- CÓ THỂ commit lên Git

---

## 🚀 Scripts trong package.json

```json
{
  "scripts": {
    "build": "tsc",                          // Compile TypeScript → dist/
    "dev": "ts-node-dev --respawn ...",     // Dev mode với hot-reload
    "start": "node dist/main.js",           // Chạy production build
    "start:prod": "node dist/main.js",      // Alias cho production
    "lint": "eslint ...",                    // Lint code
    "format": "prettier --write ...",        // Format code
    "test": "jest",                          // Run tests
    "test:cov": "jest --coverage"            // Test với coverage
  }
}
```

---

## 📊 Data Flow Example

### User đăng nhập:

```
1. Client → POST /api/auth/login
            { userName: "alice", password: "Alice123!" }
   ↓
2. AuthController.login()
   ↓
3. AuthService.login(loginDto)
   ↓
4. UserRepository.findOne({ where: { userName } })
   ↓
5. bcrypt.compare(password, user.password)
   ↓
6. JwtService.sign({ userId, userName })
   ↓
7. Return { token, user }
   ↓
8. Client ← { isSuccess: true, data: { token, user } }
```

---

## 🔐 Authentication Flow

```
1. User login → JWT token
2. Store token in client (localStorage/cookie)
3. Subsequent requests:
   Headers: { Authorization: "Bearer <token>" }
4. JwtAuthGuard extracts & validates token
5. JwtStrategy decodes payload
6. @CurrentUser() decorator injects user info
7. Controller method executes
```

---

## 📚 Naming Conventions

### Files
- Entities: `user.entity.ts`, `movie.entity.ts`
- DTOs: `create-user.dto.ts`, `update-movie.dto.ts`
- Services: `auth.service.ts`, `movie.service.ts`
- Controllers: `auth.controller.ts`, `movie.controller.ts`
- Modules: `auth.module.ts`, `movie.module.ts`

### Classes
- Entities: `User`, `Movie`, `Theater`
- DTOs: `CreateMovieDto`, `LoginDto`
- Services: `AuthService`, `MovieService`
- Controllers: `AuthController`, `MovieController`
- Modules: `AuthModule`, `MovieModule`

### Variables
- camelCase: `userName`, `movieId`
- Constants: `UPPER_SNAKE_CASE`

---

## 🧪 Testing Structure (Kế hoạch)

```
src/
├── modules/
│   └── movies/
│       ├── movie.service.ts
│       ├── movie.service.spec.ts      # Unit tests
│       ├── movie.controller.ts
│       └── movie.controller.spec.ts   # Integration tests
```

---

## 🔄 Migration Strategy (Production)

Khi deploy production, **TẮT** `synchronize` và dùng migrations:

```bash
# Generate migration
npm run typeorm migration:generate -- -n CreateMoviesTable

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

---

## 🌳 Git Workflow

```
main (production)
  ↑
  └── develop (staging)
        ↑
        ├── feature/auth
        ├── feature/movies
        └── bugfix/movie-slug
```

---

## 📦 Dependencies chính

### Core Framework
- `@nestjs/core`, `@nestjs/common` - NestJS framework
- `@nestjs/platform-express` - HTTP server

### Database
- `typeorm` - ORM
- `@nestjs/typeorm` - NestJS integration
- `mysql2` - MySQL driver

### Authentication
- `@nestjs/jwt` - JWT utilities
- `@nestjs/passport`, `passport-jwt` - Authentication
- `bcrypt` - Password hashing

### Validation
- `class-validator` - DTO validation
- `class-transformer` - Object transformation

### Documentation
- `@nestjs/swagger` - API docs generation
- `swagger-ui-express` - Swagger UI

### Background Jobs (nếu dùng)
- `@nestjs/bull`, `bull` - Job queues
- `ioredis` - Redis client

### Email (nếu dùng)
- `@nestjs-modules/mailer` - Email service
- `nodemailer` - Email sending

---

## 🎯 Best Practices trong cấu trúc

### 1. Separation of Concerns
- Controller: Chỉ xử lý HTTP, không có business logic
- Service: Business logic, không biết về HTTP
- Repository: Chỉ truy vấn database

### 2. DRY (Don't Repeat Yourself)
- Tái sử dụng code qua `common/`
- Shared DTOs, decorators, guards

### 3. Single Responsibility
- Mỗi class chỉ làm 1 việc
- Service methods ngắn gọn, rõ ràng

### 4. Dependency Injection
- NestJS tự động inject dependencies
- Dễ test, dễ maintain

### 5. Type Safety
- Sử dụng TypeScript đầy đủ
- Định nghĩa interfaces, types

---

## 🔍 Tìm kiếm code

### Tìm entity:
```
src/modules/*/entities/*.entity.ts
```

### Tìm DTOs:
```
src/modules/*/dto/*.dto.ts
```

### Tìm controllers:
```
src/modules/*/*.controller.ts
```

### Tìm services:
```
src/modules/*/*.service.ts
```

---

## 📖 Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Project Structure Best Practices](https://docs.nestjs.com/first-steps)

---

Hy vọng tài liệu này giúp bạn hiểu rõ cấu trúc dự án! 🚀
