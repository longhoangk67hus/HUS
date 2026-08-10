import type React from "react"
import MovieCard from "./MovieCard"
import "./MovieList.css"
import type { Movie } from "../types"

interface MovieListProps {
  movies: Movie[]
}

const MovieList: React.FC<MovieListProps> = ({ movies }) => {
  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard key={movie.MovieId} {...movie} />
      ))}
    </div>
  )
}

export default MovieList
