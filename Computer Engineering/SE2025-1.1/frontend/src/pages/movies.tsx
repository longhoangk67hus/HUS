import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import MovieSection from "../components/MovieSection"
import type { Movie } from "../types"
import { moviesAPI } from "../services/api"
import "./movies.css"

const Movies = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [nowMovies, setNowMovies] = useState<Movie[]>([])
  const [comingMovies, setComingMovies] = useState<Movie[]>([])
  const [showAllNow, setShowAllNow] = useState(false)
  const [showAllSoon, setShowAllSoon] = useState(false)
  const [searchParams] = useSearchParams()
  const q = searchParams.get("q")?.trim() ?? ""

  // Normalizer reused by list + search results
  const normalize = (raw: Record<string, unknown>): Movie => {
    const get = (keys: string[]) => {
      for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(raw, k)) return raw[k]
      }
      return undefined
    }
    const rawGenres = get(["Genres", "genres", "GenreNames", "genresList", "categories", "tags", "genre"])
    let genres: string[] | undefined
    if (Array.isArray(rawGenres)) genres = (rawGenres as unknown[]).map((g) => String(g))
    else if (typeof rawGenres === 'string' && rawGenres.trim()) genres = rawGenres.split(',').map(s => s.trim()).filter(Boolean)

    return {
      MovieId: Number(get(["movieId", "MovieId"]) ?? 0),
      Title: String(get(["title", "Title"]) ?? ""),
      Slug: String(get(["slug", "Slug"]) ?? ""),
      Description: String(get(["description", "Description"]) ?? ""),
      Duration: Number(get(["duration", "Duration"]) ?? 0),
      AverageRating: Number(get(["averageRating", "AverageRating"]) ?? 0),
      PosterUrl: String(get(["posterUrl", "PosterUrl"]) ?? ""),
      TrailerUrl: String(get(["trailerUrl", "TrailerUrl"]) ?? ""),
      Status: (String(get(["status", "Status"]) ?? "NowShowing") as unknown) as Movie["Status"],
      ReleaseDate: String(get(["releaseDate", "ReleaseDate"]) ?? ""),
      Genres: genres,
    }
  }

  useEffect(() => {
    // If a search query exists, the search effect (below) will handle fetching.
    if (q) return

    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const [nowRes, comingRes] = await Promise.all([
          moviesAPI.nowShowing(),
          moviesAPI.comingSoon(),
        ])

        const mappedNow = Array.isArray(nowRes) ? nowRes.map((r) => normalize(r as unknown as Record<string, unknown>)) : []
        const mappedComing = Array.isArray(comingRes) ? comingRes.map((r) => normalize(r as unknown as Record<string, unknown>)) : []

        if (mappedNow.length === 0 && mappedComing.length === 0) {
          try {
            const all = await (moviesAPI.list ? moviesAPI.list() : [])
            const mappedAll = Array.isArray(all) ? all.map((r) => normalize(r as unknown as Record<string, unknown>)) : []
            setNowMovies(mappedAll.filter((m) => m.Status === "NowShowing"))
            setComingMovies(mappedAll.filter((m) => m.Status === "ComingSoon"))
          } catch (err) {
            console.error("Fallback list() failed:", err)
            setNowMovies(mappedNow)
            setComingMovies(mappedComing)
          }
        } else {
          setNowMovies(mappedNow)
          setComingMovies(mappedComing)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [q])

  // Search effect: when `?q=` is present, execute a search by movie name
  useEffect(() => {
    if (!q) return

    const doSearch = async () => {
      try {
        setIsLoading(true)
        const res = await moviesAPI.search(q)
        const mapped = Array.isArray(res) ? res.map((r) => normalize(r as unknown as Record<string, unknown>)) : []
        setNowMovies(mapped)
        setComingMovies([])
      } catch (err) {
        console.error("Search failed:", err)
        setNowMovies([])
        setComingMovies([])
      } finally {
        setIsLoading(false)
      }
    }

    doSearch()
  }, [q])

  return (
    <div className="movies-page">
      <Header />

      <main className="movies-container">
        {isLoading ? (
          <div className="loading">Đang tải phim...</div>
        ) : (
          <>
            {q ? (
              <>
                {/* <h2 style={{ margin: "0 0 16px 0", width: "100%", textAlign: "left", maxWidth: 1400, marginLeft: "1rem" }}>
                  Kết quả tìm kiếm: "{q}"
                </h2> */}
                {nowMovies.length === 0 ? (
                  <div style={{ padding: "1rem", color: "#666" }}>Không tìm thấy phim nào với từ khóa "{q}".</div>
                ) : (
                  <MovieSection title={`Kết quả tìm kiếm: "${q}"`} movies={nowMovies} showViewAll={false} />
                )}
              </>
            ) : (
              <>
                <MovieSection
                  title="PHIM ĐANG CHIẾU"
                  movies={showAllNow ? nowMovies : nowMovies.slice(0, 8)}
                  onViewAll={() => setShowAllNow(true)}
                  showViewAll={!showAllNow && nowMovies.length > 8}
                />

                <MovieSection
                  title="PHIM SẮP CHIẾU"
                  movies={showAllSoon ? comingMovies : comingMovies.slice(0, 8)}
                  onViewAll={() => setShowAllSoon(true)}
                  showViewAll={!showAllSoon && comingMovies.length > 8}
                />
              </>
            )}
          </>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default Movies