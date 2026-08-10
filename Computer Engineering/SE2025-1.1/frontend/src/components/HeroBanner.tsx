"use client"

import { useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { moviesAPI } from "../services/api"
import "./HeroBanner.css"

const HeroBanner = () => {
  const navigate = useNavigate()
  // movie objects from API may use PascalCase (MovieId, PosterUrl, Status)
  // or normalized camelCase (id, posterUrl, status). Use a flexible any type here
  // and handle both shapes when rendering.
  const [slides, setSlides] = useState<any[]>([])
  const [current, setCurrent] = useState<number>(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const loadHero = async () => {
      try {
        const movies = await moviesAPI.nowShowing() // trả về Movie[]
        // prefer NowShowing items but fall back to full list
        const ordered = (movies || []).slice()
        ordered.sort((a: any, b: any) => {
          const sa = (a.status ?? a.Status) === 'NowShowing' ? 0 : 1
          const sb = (b.status ?? b.Status) === 'NowShowing' ? 0 : 1
          return sa - sb
        })
        setSlides(ordered)
        setCurrent(0)
      } catch (err) {
        console.error("Error loading hero movie:", err)
        setSlides([])
      }
    }

    loadHero()
  }, [])

  // manage auto-rotation timer (30 seconds)
  useEffect(() => {
    // clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (slides.length <= 1) return
    timerRef.current = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 30000)
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [slides])

  const handleBookNow = () => {
    const hero = slides[current]
    if (!hero) return
    const movieId = hero.id ?? hero.MovieId
    if (!movieId) return
    // Open the purchase flow (select theater → date → time → seats)
    navigate(`/purchase?movieId=${movieId}`)
  }

  return (
    <div className="hero-banner">
      <div className="hero-slides">
        {slides.length === 0 ? (
          <div className="hero-image" style={{ background: "linear-gradient(135deg,#0f1b45,#1a2f5a)" }} />
        ) : (
          slides.map((s, i) => (
            <div key={s.id ?? s.MovieId ?? i} className={`banner-slide ${i === current ? 'active' : ''}`} aria-hidden={i !== current}>
              {(s.posterUrl ?? s.PosterUrl) ? (
                <img src={s.posterUrl ?? s.PosterUrl} alt={s.Title ?? s?.title} className="hero-image" />
              ) : (
                <div className="hero-image" style={{ background: "linear-gradient(135deg,#0f1b45,#1a2f5a)" }} />
              )}
            </div>
          ))
        )}
      </div>
      <div className="hero-overlay"></div>

      {/* Auto-rotating only — manual nav removed */}
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className="hero-text">
          <h2 className="hero-title">{(slides[current]?.Title ?? slides[current]?.title)?.toString().toUpperCase() ?? "NOW SHOWING"}</h2>
          <p className="hero-date">
            {(slides[current]?.ReleaseDate ?? slides[current]?.releaseDate) ? new Date(slides[current]?.ReleaseDate ?? slides[current]?.releaseDate).toLocaleDateString() : "COMING SOON"}
          </p>
          <button onClick={handleBookNow} className="hero-button">
            MUA VÉ NGAY 
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
