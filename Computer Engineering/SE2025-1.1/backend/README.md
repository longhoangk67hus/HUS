# Cinema System - Backend (Node.js/NestJS)

**Migrated from ASP.NET Core to Node.js/TypeScript/NestJS**

## 🎯 Overview

This is a complete rewrite of the CinemaSystem backend from .NET to Node.js, using:
- **NestJS** - Enterprise Node.js framework
- **TypeORM** - SQL ORM with decorators
- **MySQL** - Reuses existing `cinema_system` database
- **Redis** - Caching and distributed locks
- **BullMQ** - Background jobs (replaces Hangfire)
- **Passport JWT** - Authentication

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=your_secret_key
```

## 🚀 Running the Application

```bash
# Development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start
```

The API will be available at: **http://localhost:5000**

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.config.ts      # TypeORM configuration
│   ├── modules/
│   │   ├── movies/
│   │   │   ├── movie.entity.ts     # Movie entity (TypeORM)
│   │   │   ├── movie.repository.ts # Data access layer
│   │   │   ├── movie.service.ts    # Business logic
│   │   │   ├── movie.controller.ts # REST API endpoints
│   │   │   └── movie.module.ts     # NestJS module
│   │   ├── theaters/
│   │   ├── rooms/
│   │   ├── showtimes/
│   │   └── reservations/
│   ├── jobs/                        # Background jobs
│   ├── middleware/                  # Custom middleware
│   ├── app.module.ts               # Root module
│   └── main.ts                     # Application entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔄 Migration Status

### ✅ Completed
- [x] Project structure setup
- [x] Database configuration
- [x] Movies module (Entity, Repository, Service, Controller)
- [x] NestJS app bootstrap

### 🔄 In Progress
- [ ] Theaters module
- [ ] Rooms module
- [ ] Showtimes module
- [ ] Reservations module (with Redis locks)
- [ ] Authentication module
- [ ] Background jobs (auto-release seats)

### ⏳ Pending
- [ ] Unit tests
- [ ] API documentation (Swagger)
- [ ] Docker configuration
- [ ] Frontend integration

## 🛠️ API Endpoints

### Movies

```
GET    /api/movies              # Get all movies
GET    /api/movies/now-showing  # Get now showing movies
GET    /api/movies/coming-soon  # Get coming soon movies
GET    /api/movies/search?keyword=avatar
GET    /api/movies/:id          # Get by ID
GET    /api/movies/slug/:slug   # Get by slug
POST   /api/movies              # Create movie
PUT    /api/movies/:id          # Update movie
DELETE /api/movies/:id          # Delete movie
```

## 🔧 Development

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## 📊 Database

This backend uses the **existing cinema_system database** from the .NET version.

**No migration needed** - just configure your .env file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=cinema_system
```

## 🔐 Environment Variables

See `.env.example` for all available environment variables.

Required:
- `DB_PASSWORD` - MySQL password
- `JWT_SECRET` - Secret key for JWT tokens
- `REDIS_HOST` - Redis server host

## 🚧 Differences from .NET Version

| Feature | .NET | Node.js |
|---------|------|---------|
| **Framework** | ASP.NET Core | NestJS |
| **ORM** | Dapper | TypeORM |
| **DI** | Built-in | NestJS DI |
| **Validation** | Attributes | class-validator |
| **Background Jobs** | Hangfire | BullMQ |
| **Cache** | StackExchange.Redis | ioredis |
| **Base Library** | BaseCoreService (.NET) | SE2025_node |

## 📝 Notes

- This project reuses the base-core library from `SE2025_node`
- All entities, repositories, and services follow the same patterns as the .NET version
- API endpoints are compatible with the .NET version for easy migration

## 🤝 Contributing

This is a learning project to understand Node.js/TypeScript migration from .NET.

---

**Author**: HNLong  
**Status**: Work in Progress  
**Original**: CinemaSystem (.NET Core)
