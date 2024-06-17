import React, { useState, useEffect } from 'react';
import TheaterTabs from './theater_tabs';
import MovieList from './movie_list';

import {groupBy, init, SetState, ShowingView} from "../shared/lib";
import {theaters} from "../shared/theaters";
import {showings} from "./film-showings";

type ShowingsByTheater = Record<string, ShowingView[]>

const App = () => {
  const [selectedTheater, setSelectedTheater]: [string, SetState<string>] = useState(theaters[0].id)
  const showingsByTheater: ShowingsByTheater = groupBy(showings, (showing: ShowingView) => showing.theaterId)

  /*
  const [movieListings, setMovieListings]: [ShowingsByTheater, SetState<ShowingsByTheater>] = useState({})
  useEffect(() => {
    fetch('movie-times.json').then(response => response.json()).then((showings: ShowingView[]) => {
      const showingsByTheater: ShowingsByTheater = {}
      showings.forEach(showing => {
        init(showingsByTheater, showing.theaterId, [] as ShowingView[])
        showingsByTheater[showing.theaterId].push(showing)
      })

      setMovieListings(showingsByTheater);
    })
  }, []);
   */

  return (
    <div>
      <TheaterTabs
        theaters={theaters}
        selectedTheaterId={selectedTheater}
        onSelectTheater={setSelectedTheater}
      />
      <MovieList
        showings={showingsByTheater[selectedTheater] || []}
      />
    </div>
  );
};

export default App;
