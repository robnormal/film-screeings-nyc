import React from 'react';
import {formatAsTime, ShowingView} from "../shared/lib";

const MovieList = ({ showings }: { showings: ShowingView[]}) => {
  return (
    <div className="movie-list">
      {showings.length > 0 ? (
        showings.map(showing => (
          <div key={showing.uid} className="movie-item">
            <h3>{showing.movie.title}</h3>
            <p>Length: {showing.movie.duration} mins</p>
            <p>Showtime: {formatAsTime(showing.datetime)}</p>
          </div>
        ))
      ) : (
        <p>No movies available</p>
      )}
    </div>
  )
}

export default MovieList
