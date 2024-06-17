import React from 'react';
import {formatAsTime, formatHumanDate, groupBy, ShowingView} from "../shared/lib";
import dayjs from "dayjs";

function showingUid(showing: ShowingView): string {
  return [showing.theaterId, showing.movie.title, Math.floor(showing.timestamp/1000)].join('%')
}

const MovieList = ({ showings }: { showings: ShowingView[]}) => {
  const showingsByDate = groupBy(showings, showing => showing.dateText)
  const dates = Object.keys(showingsByDate)
  dates.sort()

  return (
    <div className="movie-list">
      {dates.length > 0 ? (
        dates.map(dateText => {
          return (
            <div className="daylistings" key={dateText}>
              <h2>{formatHumanDate(dayjs(dateText, 'YYYY-MM-DD').toDate())}</h2>
              <ul>
                {showingsByDate[dateText].map(showing => {
                  const date = new Date(showing.timestamp)
                  return (
                    <li key={showingUid(showing)} className="movie-item">
                      <h3><a href={showing.url}>{showing.movie.title}</a></h3>
                      <p>{formatAsTime(date)}</p>
                      <p>{showing.movie.yearMade} {showing.movie.director && ` / ${showing.movie.director}`} / {showing.movie.duration} mins</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })
      ) : (
        <p>No movies available</p>
      )}
    </div>
  )
}

export default MovieList
