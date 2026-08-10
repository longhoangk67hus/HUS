"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { moviesAPI } from "../services/api"
import type { Movie } from "../types"

const Trailer = () => {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        if (!movieId) return
        const data = await moviesAPI.details(Number.parseInt(movieId))
        setMovie(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movie")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovie()
  }, [movieId])

  if (isLoading) return <div style={{ textAlign: "center", padding: "48px" }}>Loading...</div>
  if (error) return <div style={{ textAlign: "center", padding: "48px", color: "red" }}>{error}</div>

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <main style={{ flex: 1, maxWidth: "1280px", margin: "0 auto", padding: "48px 16px", width: "100%" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: "24px",
            backgroundColor: "#475569",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>

        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              aspectRatio: "16/9",
              backgroundColor: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {movie?.TrailerUrl ? (
              <iframe
                width="100%"
                height="100%"
                src={movie.TrailerUrl}
                title={`${movie.Title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
              ></iframe>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
                <p style={{ color: "#9ca3af" }}>Trailer not available</p>
              </div>
            )}
          </div>

          <div style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>{movie?.Title}</h3>
            <p style={{ color: "#d1d5db", marginBottom: "24px" }}>{movie?.Description}</p>
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <span style={{ color: "#9ca3af" }}>Duration: {movie?.Duration} min</span>
              <span style={{ color: "#9ca3af" }}>Rating: {movie?.AverageRating}/10</span>
            </div>
            <button
              onClick={() => navigate(`/booking/${movieId}`)}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "12px 32px",
                borderRadius: "8px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
            >
              Book Tickets Now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Trailer
