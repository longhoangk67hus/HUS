
import MovieCard from "./MovieCard"
import type { Movie } from "../types"
import "./MovieSection.css"


interface Props {
  title: string
  movies: Movie[]
  onViewAll?: () => void
  showViewAll?: boolean
}

export default function MovieSection({ title, movies, onViewAll, showViewAll }: Props) {
  return (
    <section className="movies-section">
      <div className="section-header">
        <h2 className="text-title">{title}</h2>

        {/* connector line between title and view-all */}
        {showViewAll && onViewAll ? (
          <>
            <span className="header-connector" aria-hidden="true" />
            <button className="view-all" onClick={onViewAll}>Xem tất cả</button>
          </>
        ) : null}
      </div>

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.MovieId} {...movie} />
        ))}
      </div>
    </section>
  )
}