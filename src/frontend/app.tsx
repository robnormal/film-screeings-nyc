import React, { useState, useEffect } from 'react';
import TheaterTabs from './theater_tabs';
import MovieList from './movie_list';

import {SetState, ShowingView} from "../shared/lib";
import {theaters} from "../shared/theaters";

type ShowingsByTheater = Record<string, ShowingView[]>

function apiUrl(theaterId: string) {
  return `https://api.example.com/theaters/${theaterId}/movies`
}

const App = () => {
  const [selectedTheater, setSelectedTheater]: [string, SetState<string>] = useState(theaters[0].id)
  const [movieListings, setMovieListings]: [ShowingsByTheater, SetState<ShowingsByTheater>] = useState({})

  useEffect(() => {
    Promise
      .all(theaters.map(theater => fetch(apiUrl(theater.id))))
      .then(responses => {
        return Promise.all(responses.map(response => response.json())).then(showingsLists => {
          const showingsByTheater: ShowingsByTheater = {}
          showingsLists.forEach((showings, index) => {
            showingsByTheater[theaters[index].id] = showings
          })

          setMovieListings(showingsByTheater);
        })
      })
  }, []);

  return (
    <div>
      <TheaterTabs
        theaters={theaters}
        selectedTheaterId={selectedTheater}
        onSelectTheater={setSelectedTheater}
      />
      <MovieList
        showings={movieListings[selectedTheater] || []}
      />
    </div>
  );
};

export default App;
