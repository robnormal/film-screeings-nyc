import React, { useState } from 'react';
import TheaterTabs from './theater_tabs';
import MovieList from './movie_list';

import {groupBy, SetState, ShowingView, Theater} from "../shared/lib";
import {theaters} from "../shared/theaters";
import {showings} from "./film-showings";

type ShowingsByTheater = Record<string, ShowingView[]>

const App = () => {
  const [selectedTheaterId, setSelectedTheaterId]: [string, SetState<string>] = useState(theaters[0].id)
  const showingsByTheater: ShowingsByTheater = groupBy(showings, (showing: ShowingView) => showing.theaterId)
  const theatersById: Record<string, Theater> = {}
  theaters.forEach((t: Theater) => theatersById[t.id] = t)

  return (
    <div>
      <TheaterTabs
        theaters={theaters}
        selectedTheaterId={selectedTheaterId}
        onSelectTheater={setSelectedTheaterId}
      />
      <h2 className="theater-name">{theatersById[selectedTheaterId].name}</h2>
      <MovieList
        showings={showingsByTheater[selectedTheaterId] || []}
      />
    </div>
  );
};

export default App;
