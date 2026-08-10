import React, { useState, useEffect } from 'react'
import type { Movie } from '../../types'
import './Movies.css'
import { moviesAPI } from '../../services/api'

type GenreItem = {
  genreId: number
  genreName: string
}

interface MovieForm {
  Title: string
  Description: string
  Duration: number
  ReleaseDate: string
  PosterUrl: string
  TrailerUrl: string
  Director: string
  Cast: string
  Language: string
  AgeRating: string
  Status: 'ComingSoon' | 'NowShowing' | 'Ended'
}

const normalizeGenreIds = (items: any[]): number[] => {
  if (!Array.isArray(items)) return []
  const ids = items
    .map((g: any) => Number(g?.genreId ?? g?.GenreId ?? g?.id ?? 0))
    .filter((n: number) => Number.isFinite(n) && n > 0)
  return Array.from(new Set(ids))
}

const normalizeGenreNames = (items: any[]): string[] => {
  if (!Array.isArray(items)) return []
  const names = items
    .map((g: any) => String(g?.genreName ?? g?.GenreName ?? g?.name ?? '').trim())
    .filter((s: string) => s.length > 0)
  return Array.from(new Set(names))
}

const getSelectedValuesAsNumbers = (selectEl: HTMLSelectElement): number[] => {
  const ids = Array.from(selectEl.selectedOptions)
    .map((o) => Number(o.value))
    .filter((n) => Number.isFinite(n) && n > 0)
  return Array.from(new Set(ids))
}

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [genres, setGenres] = useState<GenreItem[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])
  const [formData, setFormData] = useState<MovieForm>({
    Title: '',
    Description: '',
    Duration: 120,
    ReleaseDate: '',
    PosterUrl: '',
    TrailerUrl: '',
    Director: '',
    Cast: '',
    Language: 'Vietnamese',
    AgeRating: 'PG',
    Status: 'ComingSoon',
  })

  useEffect(() => {
    loadMovies()
    loadGenres()
  }, [])

  const loadGenres = async () => {
    try {
      const data = await moviesAPI.genresAll()
      setGenres(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading genres:', error)
      setGenres([])
    }
  }

  const loadMovies = async () => {
    setLoading(true)
    try {
      const data = await moviesAPI.list()
      // Normalize the response data to ensure all fields are properly mapped
      const normalizedMovies = data.map((m: any) => {
        const rawGenres =
          m.genres ??
          m.Genres ??
          m.genreNames ??
          m.GenreNames ??
          m.genresList ??
          m.categories ??
          m.tags ??
          m.genre

        let extractedGenres: string[] | undefined
        if (Array.isArray(rawGenres)) {
          extractedGenres = rawGenres.map((g: any) => String(g?.genreName ?? g?.GenreName ?? g).trim()).filter(Boolean)
        } else if (typeof rawGenres === 'string' && rawGenres.trim().length) {
          extractedGenres = rawGenres.split(',').map((s: string) => s.trim()).filter(Boolean)
        }

        return {
        MovieId: m.movieId || m.MovieId || 0,
        Title: m.title || m.Title || '',
        Slug: m.slug || m.Slug || '',
        Description: m.description || m.Description || '',
        Duration: m.duration || m.Duration || 0,
        ReleaseDate: m.releaseDate || m.ReleaseDate || '',
        PosterUrl: m.posterUrl || m.PosterUrl || '',
        TrailerUrl: m.trailerUrl || m.TrailerUrl || '',
        Director: m.director || m.Director || '',
        Cast: m.cast || m.Cast || '',
        Language: m.language || m.Language || '',
        AgeRating: m.ageRating || m.AgeRating || '',
        Status: m.status || m.Status || 'ComingSoon',
        AverageRating: m.averageRating || m.AverageRating || 0,
        Genres: extractedGenres,
        }
      })

      // Enrich with genres if backend list doesn't include them
      const enriched = await Promise.all(
        normalizedMovies.map(async (movie: Movie) => {
          if (movie.Genres && movie.Genres.length > 0) return movie
          if (!movie.MovieId) return movie

          const g = await moviesAPI.genresByMovie(movie.MovieId)
          const names = normalizeGenreNames(g)
          return {
            ...movie,
            Genres: names.length > 0 ? names : movie.Genres,
          }
        }),
      )

      setMovies(enriched)
    } catch (error) {
      console.error('Error loading movies:', error)
      alert('Lỗi khi tải danh sách phim: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Duration' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Prepare data to send to backend (convert to backend format if needed)
      const moviePayload = {
        title: formData.Title,
        description: formData.Description,
        duration: formData.Duration,
        releaseDate: formData.ReleaseDate,
        posterUrl: formData.PosterUrl,
        trailerUrl: formData.TrailerUrl,
        director: formData.Director,
        cast: formData.Cast,
        language: formData.Language,
        ageRating: formData.AgeRating,
        status: formData.Status,
        genreIds: selectedGenreIds,
      }

      if (editingId) {
        // Update existing movie
        await moviesAPI.update(editingId, moviePayload)
        alert('Cập nhật phim thành công!')
      } else {
        // Create new movie
        await moviesAPI.create(moviePayload)
        alert('Phim được thêm thành công!')
      }
      
      // After successful creation/update, reload movies
      await loadMovies()
      setShowModal(false)
      setEditingId(null)
      setSelectedGenreIds([])
      setFormData({
        Title: '',
        Description: '',
        Duration: 120,
        ReleaseDate: '',
        PosterUrl: '',
        TrailerUrl: '',
        Director: '',
        Cast: '',
        Language: 'Vietnamese',
        AgeRating: 'PG',
        Status: 'ComingSoon',
      })
    } catch (error) {
      console.error('Error saving movie:', error)
      alert('Lỗi khi lưu phim: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.MovieId)
    setFormData({
      Title: movie.Title,
      Description: movie.Description,
      Duration: movie.Duration,
      ReleaseDate: movie.ReleaseDate,
      PosterUrl: movie.PosterUrl || '',
      TrailerUrl: movie.TrailerUrl || '',
      Director: movie.Director || '',
      Cast: movie.Cast || '',
      Language: movie.Language || 'Vietnamese',
      AgeRating: movie.AgeRating || 'PG',
      Status: movie.Status,
    })

    // Load existing genres for this movie (best-effort)
    setSelectedGenreIds([])
    moviesAPI
      .genresByMovie(movie.MovieId)
      .then((g) => {
        const ids = normalizeGenreIds(g)
        setSelectedGenreIds(ids)
      })
      .catch(() => {
        setSelectedGenreIds([])
      })

    setShowModal(true)
  }

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa phim "${title}"?`)) {
      try {
        await moviesAPI.delete(id)
        alert('Xóa phim thành công!')
        await loadMovies()
      } catch (error) {
        console.error('Error deleting movie:', error)
        alert('Lỗi khi xóa phim: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setSelectedGenreIds([])
    setFormData({
      Title: '',
      Description: '',
      Duration: 120,
      ReleaseDate: '',
      PosterUrl: '',
      TrailerUrl: '',
      Director: '',
      Cast: '',
      Language: 'Vietnamese',
      AgeRating: 'PG',
      Status: 'ComingSoon',
    })
  }

  return (
    <div className="movies-container">
      <div className="movies-header">
        <h1>Quản Lý Phim</h1>
        <button className="btn-add-movie" onClick={() => setShowModal(true)}>
          + Thêm Phim Mới
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : movies.length === 0 ? (
        <div className="no-movies">Không có phim nào</div>
      ) : (
        <div className="movies-table-wrapper">
          <table className="movies-table">
            <thead>
              <tr>
                <th>Tên Phim</th>
                <th>Poster</th>
                <th>Thể Loại</th>
                <th>Diễn Viên</th>
                <th>Thời Lượng</th>
                <th>Mô Tả</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.MovieId} className={`status-${movie.Status?.toLowerCase()}`}>
                  <td className="title-cell">
                    <strong>{movie.Title}</strong>
                  </td>
                  <td className="poster-cell">
                    {movie.PosterUrl ? (
                      <img src={movie.PosterUrl} alt={movie.Title} className="poster-thumb" />
                    ) : (
                      <span className="no-poster">Không có poster</span>
                    )}
                  </td>
                  <td className="genres-cell">{movie.Genres && movie.Genres.length > 0 ? movie.Genres.join(', ') : '—'}</td>
                  <td className="cast-cell">{movie.Cast || 'N/A'}</td>
                  <td className="duration-cell">
                    <strong>{movie.Duration} phút</strong>
                  </td>
                  <td className="description-cell">
                    <p>{movie.Description ? movie.Description.substring(0, 100) + '...' : 'N/A'}</p>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge status-${movie.Status?.toLowerCase()}`}>
                      {movie.Status === 'NowShowing'
                        ? 'Đang Chiếu'
                        : movie.Status === 'ComingSoon'
                          ? 'Sắp Chiếu'
                          : 'Đã Kết Thúc'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="btn-edit" onClick={() => handleEdit(movie)}>
                      Sửa
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(movie.MovieId, movie.Title)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm Phim */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Sửa Phim' : 'Thêm Phim Mới'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="movie-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên Phim *</label>
                  <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên phim"
                  />
                </div>
                <div className="form-group">
                  <label>Đạo Diễn</label>
                  <input
                    type="text"
                    name="Director"
                    value={formData.Director}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đạo diễn"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Diễn Viên</label>
                  <textarea
                    name="Cast"
                    value={formData.Cast}
                    onChange={handleInputChange}
                    placeholder="Nhập tên diễn viên (cách nhau bằng dấu phẩy)"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mô Tả *</label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập mô tả phim"
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời Lượng (phút) *</label>
                  <input
                    type="number"
                    name="Duration"
                    value={formData.Duration}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Ngày Phát Hành *</label>
                  <input
                    type="date"
                    name="ReleaseDate"
                    value={formData.ReleaseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>URL Poster</label>
                  <input
                    type="text"
                    name="PosterUrl"
                    value={formData.PosterUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
                <div className="form-group">
                  <label>URL Trailer</label>
                  <input
                    type="text"
                    name="TrailerUrl"
                    value={formData.TrailerUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngôn Ngữ</label>
                  <input
                    type="text"
                    name="Language"
                    value={formData.Language}
                    onChange={handleInputChange}
                    placeholder="ví dụ: Vietnamese, English"
                  />
                </div>
                <div className="form-group">
                  <label>Xếp Hạng Độ Tuổi</label>
                  <select name="AgeRating" value={formData.AgeRating} onChange={handleInputChange}>
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="NC-17">NC-17</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label>Trạng Thái *</label>
                  <select name="Status" value={formData.Status} onChange={handleInputChange} required>
                    <option value="ComingSoon">Sắp Chiếu</option>
                    <option value="NowShowing">Đang Chiếu</option>
                    <option value="Ended">Đã Kết Thúc</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label>Thể Loại</label>
                  {genres.length === 0 ? (
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Không tải được danh sách thể loại</div>
                  ) : (
                    <select
                      className="genres-multiselect"
                      multiple
                      value={selectedGenreIds.map(String)}
                      onChange={(e) => {
                        setSelectedGenreIds(getSelectedValuesAsNumbers(e.target))
                      }}
                    >
                      {genres.map((g) => (
                        <option key={g.genreId} value={g.genreId}>
                          {g.genreName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? 'Cập Nhật Phim' : 'Thêm Phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Movies
