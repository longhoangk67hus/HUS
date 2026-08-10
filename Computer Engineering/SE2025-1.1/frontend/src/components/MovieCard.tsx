import type React from "react"
import { useNavigate } from "react-router-dom"
// import useAuth removed — navigation always goes to theaters page
import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import "./MovieCard.css"
import type { Movie } from "../types"
import { moviesAPI } from "../services/api"

interface MovieCardProps extends Movie {
  price?: number
  Genres?: string[]
}

const MovieCard: React.FC<MovieCardProps> = ({ MovieId, Title, PosterUrl, price = 120000, TrailerUrl, Description, Genres }) => {
  const navigate = useNavigate()
  
  const [showTrailer, setShowTrailer] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [extraGenres, setExtraGenres] = useState<string[] | undefined>(undefined)
  const [trailerLoading, setTrailerLoading] = useState(false)
  const [trailerUrlLocal, setTrailerUrlLocal] = useState<string | undefined>(TrailerUrl)

  const handleBookTicket = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    // Close any open modals first so the theaters page is visible
    closeTrailer()
    closeInfo()
    // Navigate to the dedicated purchase flow scoped to this movie
    navigate(`/purchase?movieId=${MovieId}`)
  }

  const getEmbedUrl = (url?: string) => {
    if (!url) return undefined
    try {
      const u = new URL(url)
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${u.searchParams.get("v")}`
      }
      if (u.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
      }
      return url
    } catch {
      return url
    }
  }

  const openTrailer = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (trailerLoading) return

    // If we already have a trailer URL (from prop or fetched), open directly
    if (trailerUrlLocal) {
      setShowTrailer(true)
      return
    }

    // otherwise try prop first, then API fallback
    if (TrailerUrl) {
      setTrailerUrlLocal(TrailerUrl)
      setShowTrailer(true)
      return
    }

    try {
      setTrailerLoading(true)
      const res = await moviesAPI.details?.(MovieId as number)
      let candidate: string | undefined
      if (res) {
        const r = res as unknown as Record<string, unknown>
        const v1 = r["TrailerUrl"]
        const v2 = r["TrailerURL"]
        const v3 = r["trailerUrl"]
        const v4 = r["trailer_url"]
        candidate = (typeof v1 === "string" && v1) || (typeof v2 === "string" && v2) || (typeof v3 === "string" && v3) || (typeof v4 === "string" && v4) || undefined
      }
      if (candidate) {
        setTrailerUrlLocal(candidate)
        setShowTrailer(true)
      } else {
        console.warn("Trailer not available for movie", MovieId)
      }
    } catch (err) {
      console.error("Failed to fetch movie trailer", err)
    } finally {
      setTrailerLoading(false)
    }
  }

  const closeTrailer = () => setShowTrailer(false)

  const openInfo = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const details = await moviesAPI.details?.(MovieId as number)
      if (details) {
        const d = details as unknown as Record<string, unknown>
        const maybeGenres = d["Genres"] ?? d["genres"] ?? d["GenreNames"] ?? d["genresList"] ?? d["categories"] ?? d["tags"]
        if (Array.isArray(maybeGenres)) {
          setExtraGenres((maybeGenres as unknown[]).map((g) => String(g)))
        }
      }
    } catch (err) {
      console.debug('Failed to load extra movie details', err)
    }
    setShowInfo(true)
  }

  const closeInfo = () => setShowInfo(false)

  // Lazy-load genres for this movie if prop `Genres` is not provided
  useEffect(() => {
    let mounted = true
    const loadGenres = async () => {
      if ((Array.isArray(Genres) && Genres.length) || extraGenres) return
      try {
        const res = await moviesAPI.genresByMovie?.(MovieId as number)
        if (!mounted || !res) return
        // res may be array of { genreId, genreName } or simple strings
        const parsed = (res as any[]).map((g) => {
          if (!g) return ''
          if (typeof g === 'string') return g
          return (g.genreName ?? g.GenreName ?? g.name ?? String(g))
        }).filter(Boolean)
        if (parsed.length) setExtraGenres(parsed)
      } catch (err) {
        // silently ignore
        // console.debug('Failed to lazy-load genres', err)
      }
    }

    loadGenres()
    return () => { mounted = false }
  }, [Genres, MovieId, extraGenres])

  const embedUrl = getEmbedUrl(trailerUrlLocal)

  useEffect(() => {
    if (showTrailer) {
      document.body.classList.add("trailer-open")
    } else {
      document.body.classList.remove("trailer-open")
    }
    return () => { document.body.classList.remove("trailer-open") }
  }, [showTrailer])

  return (
    <div className="movie-card" onClick={(e) => { /* clicking card (outside poster) opens trailer */ openTrailer(e); }} role="button" tabIndex={0}>
      <div className="movie-poster-container" onClick={(e) => { e.stopPropagation(); openInfo(e); }}>
        {PosterUrl ? (
          <img src={PosterUrl} alt={Title} className="movie-poster" />
        ) : (
          <div className="movie-poster placeholder">
            <span className="placeholder-text">{Title ? Title.split(" ").slice(0, 2).map((s) => s[0]).join("") : "--"}</span>
          </div>
        )}
        <div className="movie-overlay"></div>
        <div className="trailer-button-container">
          <button disabled={trailerLoading} onClick={(e) => { e.stopPropagation(); openTrailer(e); }} className="trailer-button">
            {trailerLoading ? "Đang tải..." : "XEM TRAILER"}
          </button>
        </div>
      </div>

      <div className="movie-infos" onClick={(e) => e.stopPropagation()}>
        <h3 className="movie-titles" onClick={(e) => { e.stopPropagation(); openInfo(e); }}>{Title}</h3>

        {/* Show genres on the card if available (from prop or fetched extraGenres) */}
        {((Array.isArray(Genres) && Genres.length) || (Array.isArray(extraGenres) && extraGenres.length)) && (
          <div className="movie-genres" aria-hidden>
            {((Array.isArray(Genres) && Genres.length) ? Genres : extraGenres)!.slice(0, 3).map((g) => (
              <span key={g} className="movie-genre-pill">{g}</span>
            ))}
          </div>
        )}

        {/* <div className="movie-meta">
          {AverageRating && (
            <div className="movie-rating">
              <span className="star">★</span>
              <span className="rating-text">{AverageRating}</span>
            </div>
          )}
        </div> */}

        <div className="movie-price-section">
          <span className="movie-price">From {price.toLocaleString("en-US")}₫</span>
        </div>

        <button onClick={(e) => { e.stopPropagation(); handleBookTicket(e); }} className="book-button">
          MUA VÉ
        </button>
      </div>

      {showTrailer && ReactDOM.createPortal(
        <div className="trailer-modal" onClick={closeTrailer}>
          <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close" onClick={(e) => { e.stopPropagation(); closeTrailer(); }} aria-label="Close trailer">×</button>

            <div>
              {embedUrl ? (
                <div className="trailer-embed">
                  <iframe
                    src={embedUrl}
                    title={`Trailer - ${Title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="trailer-placeholder">Trailer unavailable</div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showInfo && ReactDOM.createPortal(
        <div className="movie-info-modal" onClick={closeInfo}>
          <div className="movie-info-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close" onClick={(e) => { e.stopPropagation(); closeInfo(); }} aria-label="Close info">×</button>
            <div>
              <div style={{ color: '#e6eef8' }}>
                <h2 style={{ marginTop: 0 }}>{Title}</h2>
                <p style={{ color: '#cbd5e1' }}>{Description}</p>
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button onClick={(e) => { e.stopPropagation(); handleBookTicket(e); }} className="book-button">MUA VÉ</button>
                  <button onClick={(e) => { e.stopPropagation(); closeInfo(); setTimeout(() => openTrailer(), 50); }} className="trailer-button">XEM TRAILER</button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showLoginPrompt && ReactDOM.createPortal(
        <div className="login-prompt-modal" onClick={() => setShowLoginPrompt(false)}>
          <div className="login-prompt-content" onClick={(e) => e.stopPropagation()}>
            <h3>Vui lòng đăng nhập để mua vé</h3>
            <p>Bạn cần đăng nhập hoặc đăng ký để tiếp tục mua vé.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => { setShowLoginPrompt(false); navigate('/login') }} className="book-button">Đăng nhập</button>
              <button onClick={() => { setShowLoginPrompt(false); navigate('/login?signup=1') }} className="book-button">Đăng ký</button>
              <button onClick={() => setShowLoginPrompt(false)} style={{ background: "transparent", color: "#cbd5e1", border: "1px solid #333" }}>Hủy</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default MovieCard
