# 🎬 API Tìm Kiếm Phim Theo Thể Loại (Genre)

## 📋 Tổng Quan

API này cho phép tìm kiếm phim dựa trên thể loại (genre) với các tính năng:
- Lấy danh sách tất cả thể loại
- Tìm phim theo Genre ID hoặc tên
- Hỗ trợ partial matching cho tên genre
- Trả về thông tin phim đầy đủ kèm tất cả genres của phim đó

---

## 🗄️ Database Schema

### Tables Liên Quan:

```sql
-- Genre table (Thể loại)
CREATE TABLE genre (
  GenreId INT PRIMARY KEY AUTO_INCREMENT,
  GenreName VARCHAR(50) UNIQUE NOT NULL,
  CreatedDate DATETIME,
  CreatedBy VARCHAR(100),
  ModifiedDate DATETIME,
  ModifiedBy VARCHAR(100)
);

-- Movie_Genre table (Junction table - Many-to-Many)
CREATE TABLE movie_genre (
  MovieGenreId INT PRIMARY KEY AUTO_INCREMENT,
  MovieId INT NOT NULL,
  GenreId INT NOT NULL,
  CreatedDate DATETIME,
  UNIQUE KEY unique_movie_genre (MovieId, GenreId),
  FOREIGN KEY (MovieId) REFERENCES movie(MovieId) ON DELETE CASCADE,
  FOREIGN KEY (GenreId) REFERENCES genre(GenreId) ON DELETE CASCADE
);
```

### Sample Data:

```sql
-- Genres
INSERT INTO genre (GenreName) VALUES 
  ('Action'), ('Drama'), ('Comedy'), ('Sci-Fi'), 
  ('Horror'), ('Romance'), ('Thriller'), ('Adventure');

-- Movie-Genre mappings
-- Avatar có 3 thể loại: Action, Sci-Fi, Adventure
INSERT INTO movie_genre (MovieId, GenreId) VALUES 
  (1, 1), (1, 4), (1, 8);
```

---

## 🔌 API Endpoints

### 1️⃣ **GET /api/movies/genres/all**

Lấy danh sách tất cả thể loại phim.

**Request:**
```http
GET http://localhost:3000/api/movies/genres/all
```

**Response 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    {
      "genreId": 1,
      "genreName": "Action",
      "createdDate": "2025-01-01T00:00:00Z"
    },
    {
      "genreId": 2,
      "genreName": "Drama",
      "createdDate": "2025-01-01T00:00:00Z"
    },
    {
      "genreId": 3,
      "genreName": "Comedy",
      "createdDate": "2025-01-01T00:00:00Z"
    }
  ],
  "errorMessage": null
}
```

**Use Cases:**
- Hiển thị filter menu thể loại trên trang chủ
- Dropdown selector cho admin tạo phim
- Category navigation menu

---

### 2️⃣ **GET /api/movies/genre/:genreId**

Tìm tất cả phim theo Genre ID.

**Request:**
```http
GET http://localhost:3000/api/movies/genre/1
```

**Response 200 OK:**
```json
{
  "isSuccess": true,
  "data": {
    "genre": {
      "genreId": 1,
      "genreName": "Action"
    },
    "movies": [
      {
        "movieId": 1,
        "title": "Avatar: The Way of Water",
        "slug": "avatar-the-way-of-water",
        "description": "Set more than a decade after the events...",
        "duration": 192,
        "releaseDate": "2024-12-16T00:00:00Z",
        "posterUrl": "https://example.com/posters/avatar2.jpg",
        "trailerUrl": "https://youtube.com/watch?v=xyz",
        "director": "James Cameron",
        "cast": "Sam Worthington, Zoe Saldana, Sigourney Weaver",
        "language": "English",
        "ageRating": "PG-13",
        "status": "NowShowing",
        "averageRating": 4.5,
        "genres": [
          { "genreId": 1, "genreName": "Action" },
          { "genreId": 4, "genreName": "Sci-Fi" },
          { "genreId": 8, "genreName": "Adventure" }
        ]
      },
      {
        "movieId": 5,
        "title": "John Wick: Chapter 4",
        "slug": "john-wick-chapter-4",
        "duration": 169,
        "releaseDate": "2024-03-24T00:00:00Z",
        "genres": [
          { "genreId": 1, "genreName": "Action" },
          { "genreId": 7, "genreName": "Thriller" }
        ]
      }
    ],
    "totalCount": 15
  }
}
```

**Response 404 Not Found:**
```json
{
  "isSuccess": false,
  "data": null,
  "errorMessage": "Genre not found"
}
```

**Use Cases:**
- User clicks vào category "Action Movies"
- Filter movies by genre ID
- Genre-specific landing pages

---

### 3️⃣ **GET /api/movies/genre/name/:genreName**

Tìm phim theo tên thể loại (hỗ trợ partial matching).

**Request Examples:**

```http
# Exact match
GET http://localhost:3000/api/movies/genre/name/Action

# Partial match
GET http://localhost:3000/api/movies/genre/name/Sci

# Case-insensitive
GET http://localhost:3000/api/movies/genre/name/action
```

**Response:** Giống như endpoint `GET /api/movies/genre/:genreId`

**Partial Matching Logic:**
- Input: `"Sci"` → Tìm thấy: `"Sci-Fi"` ✅
- Input: `"Act"` → Tìm thấy: `"Action"` ✅
- Input: `"rom"` → Tìm thấy: `"Romance"` ✅
- Priority: Exact match > Partial match

**Use Cases:**
- Search bar: "Find movies in genre 'Sci'"
- User-friendly URLs: `/movies/genre/action`
- Flexible API for frontend

---

### 4️⃣ **GET /api/movies/:id/genres**

Lấy tất cả thể loại của 1 phim cụ thể.

**Request:**
```http
GET http://localhost:3000/api/movies/1/genres
```

**Response 200 OK:**
```json
{
  "isSuccess": true,
  "data": [
    { "genreId": 1, "genreName": "Action" },
    { "genreId": 4, "genreName": "Sci-Fi" },
    { "genreId": 8, "genreName": "Adventure" }
  ]
}
```

**Response 404 Not Found:**
```json
{
  "isSuccess": false,
  "data": null,
  "errorMessage": "Movie not found"
}
```

**Use Cases:**
- Movie detail page - hiển thị badges thể loại
- Related movies suggestion (cùng genre)
- Filter logic in frontend

---

## 🔍 Query Logic & Performance

### SQL Query cho Search by Genre:

```sql
-- Get movies by genre ID
SELECT movie.* 
FROM movie
INNER JOIN movie_genre mg ON mg.MovieId = movie.MovieId
WHERE mg.GenreId = ?
ORDER BY movie.ReleaseDate DESC;

-- Get movies by genre name (with partial match)
SELECT movie.* 
FROM movie
INNER JOIN movie_genre mg ON mg.MovieId = movie.MovieId
INNER JOIN genre g ON g.GenreId = mg.GenreId
WHERE g.GenreName LIKE '%?%'
ORDER BY movie.ReleaseDate DESC;

-- Get all genres of a movie
SELECT g.* 
FROM genre g
INNER JOIN movie_genre mg ON mg.GenreId = g.GenreId
WHERE mg.MovieId = ?
ORDER BY g.GenreName ASC;
```

### Indexes (đã có sẵn):
```sql
-- movie_genre indexes
CREATE INDEX idx_movie ON movie_genre(MovieId);
CREATE INDEX idx_genre ON movie_genre(GenreId);
CREATE UNIQUE INDEX unique_movie_genre ON movie_genre(MovieId, GenreId);

-- genre indexes
CREATE UNIQUE INDEX GenreName ON genre(GenreName);
CREATE INDEX idx_genre_name ON genre(GenreName);
```

### Performance:
- ✅ Index trên `MovieId`, `GenreId` → Fast JOIN
- ✅ Unique index trên `movie_genre` → Prevent duplicates
- ✅ Partial match sử dụng LIKE → Slower nhưng acceptable (ít records)

---

## 📊 Response Format

Tất cả endpoints sử dụng `ServiceResponse` format:

```typescript
interface ServiceResponse<T> {
  isSuccess: boolean;
  data: T | null;
  errorMessage?: string;
}
```

### Success Response:
```json
{
  "isSuccess": true,
  "data": { ... },
  "errorMessage": null
}
```

### Error Response:
```json
{
  "isSuccess": false,
  "data": null,
  "errorMessage": "Genre not found"
}
```

---

## 🎯 Frontend Integration Examples

### React Example - Genre Filter:

```tsx
// GenreFilter.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const GenreFilter = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);

  // Load all genres
  useEffect(() => {
    axios.get('/api/movies/genres/all')
      .then(res => setGenres(res.data.data))
      .catch(err => console.error(err));
  }, []);

  // Search movies by genre
  const handleGenreClick = async (genreId) => {
    setSelectedGenre(genreId);
    const res = await axios.get(`/api/movies/genre/${genreId}`);
    if (res.data.isSuccess) {
      setMovies(res.data.data.movies);
    }
  };

  return (
    <div>
      {/* Genre Pills */}
      <div className="genre-pills">
        {genres.map(g => (
          <button 
            key={g.genreId}
            onClick={() => handleGenreClick(g.genreId)}
            className={selectedGenre === g.genreId ? 'active' : ''}
          >
            {g.genreName}
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard key={movie.movieId} movie={movie} />
        ))}
      </div>
    </div>
  );
};
```

### Movie Detail Page - Show Genres:

```tsx
// MovieDetail.tsx
const MovieDetail = ({ movieId }) => {
  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    // Fetch movie
    axios.get(`/api/movies/${movieId}`)
      .then(res => setMovie(res.data.data));

    // Fetch genres
    axios.get(`/api/movies/${movieId}/genres`)
      .then(res => setGenres(res.data.data));
  }, [movieId]);

  return (
    <div className="movie-detail">
      <h1>{movie?.title}</h1>
      
      {/* Genre Badges */}
      <div className="genre-badges">
        {genres.map(g => (
          <span key={g.genreId} className="badge">
            {g.genreName}
          </span>
        ))}
      </div>

      {/* Other details */}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

### Manual Testing:

- [ ] GET /api/movies/genres/all → Returns all genres
- [ ] GET /api/movies/genre/1 → Returns Action movies
- [ ] GET /api/movies/genre/999 → Returns 404
- [ ] GET /api/movies/genre/name/Action → Returns Action movies
- [ ] GET /api/movies/genre/name/Sci → Finds "Sci-Fi" (partial match)
- [ ] GET /api/movies/genre/name/InvalidGenre → Returns 404
- [ ] GET /api/movies/1/genres → Returns genres of movie 1
- [ ] GET /api/movies/999/genres → Returns 404

### Integration Testing:

- [ ] Movie có nhiều genres → Response chứa tất cả genres
- [ ] Genre không có phim nào → `movies: []`, `totalCount: 0`
- [ ] Case-insensitive search → "action" = "Action"
- [ ] Partial match priority → Exact match trước

---

## 🚀 Deployment Notes

### Environment Variables:
```bash
# .env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=cinema_system
```

### Migration Required:
```bash
# Ensure genre and movie_genre tables exist
npm run migration:run
```

### Seed Data (Optional):
```sql
-- Insert default genres
INSERT INTO genre (GenreName) VALUES 
  ('Action'), ('Drama'), ('Comedy'), ('Sci-Fi'), ('Horror'),
  ('Romance'), ('Thriller'), ('Adventure'), ('Animation'), ('Documentary');
```

---

## 📝 API Documentation (Swagger)

API tự động generate Swagger docs tại:
```
http://localhost:3000/api
```

Endpoints được document với:
- ✅ `@ApiOperation` - Mô tả endpoint
- ✅ `@ApiParam` - Mô tả parameters
- ✅ `@ApiResponse` - Mô tả responses
- ✅ `@ApiTags` - Group endpoints

---

## ✅ Summary

**Đã implement:**
1. ✅ Entity: `Genre`, `MovieGenre` (junction table)
2. ✅ Repository: `GenreRepository` với các query methods
3. ✅ Service: `MovieService` với 4 methods mới
4. ✅ Controller: 4 endpoints mới
5. ✅ DTO: `MovieWithGenresDto`, `SearchByGenreResponseDto`
6. ✅ Module: Register entities và repositories
7. ✅ Test file: `test_genre_search.http`
8. ✅ Documentation: README này

**Features:**
- 🔍 Search movies by genre ID/name
- 📋 Get all genres
- 🎬 Get genres of a movie
- 🔎 Partial matching support
- 📊 Complete movie info with all genres
- ⚡ Optimized queries with indexes

**Ready to use!** 🎉
