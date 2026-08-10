import { useEffect, useState } from "react"
import Header from "../components/Header"
import HeroBanner from "../components/HeroBanner"
import MovieSection from "../components/MovieSection"
import Footer from "../components/Footer"
import type { Movie } from "../types"
import { moviesAPI } from "../services/api"
import "./home.css"

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [nowMovies, setNowMovies] = useState<Movie[]>([])
  const [comingMovies, setComingMovies] = useState<Movie[]>([])
  const [showAllNow, setShowAllNow] = useState(false)
  const [showAllSoon, setShowAllSoon] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const [nowRes, comingRes] = await Promise.all([
          moviesAPI.nowShowing(),
          moviesAPI.comingSoon(),
        ])

        const normalize = (raw: Record<string, unknown>): Movie => {
          const get = (keys: string[]) => {
            for (const k of keys) {
              if (Object.prototype.hasOwnProperty.call(raw, k)) return raw[k]
            }
            return undefined
          }

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
          }
        }

        const mappedNow = Array.isArray(nowRes) ? nowRes.map((r) => normalize(r as unknown as Record<string, unknown>)) : []
        const mappedComing = Array.isArray(comingRes) ? comingRes.map((r) => normalize(r as unknown as Record<string, unknown>)) : []

        // If backend endpoints return empty arrays, try fetching the full list and partition by Status
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
  }, [])

  return (
    <div className="home-container">
      <Header />
      <HeroBanner />
      <main className="main-content">
        {isLoading ? (
          <div className="loading">Đang tải phim...</div>
        ) : (
          <>
            <MovieSection
              title="PHIM ĐANG CHIẾU"
              movies={showAllNow ? nowMovies : nowMovies.slice(0, 4)}
              onViewAll={() => setShowAllNow(true)}
              showViewAll={!showAllNow && nowMovies.length > 4}
            />
            <MovieSection
              title="PHIM SẮP CHIẾU"
              movies={showAllSoon ? comingMovies : comingMovies.slice(0, 4)}
              onViewAll={() => setShowAllSoon(true)}
              showViewAll={!showAllSoon && comingMovies.length > 4}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Home
