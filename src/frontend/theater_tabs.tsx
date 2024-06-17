import React from 'react';
import {Theater} from "../shared/lib";

const TheaterTabs = ({ theaters, selectedTheaterId, onSelectTheater }: { theaters: Theater[], selectedTheaterId: string, onSelectTheater: Function}) => {
  return (
    <div className="theater-tabs">
      {theaters.map(theater => (
        <button
          key={theater.id}
          className={theater.id === selectedTheaterId ? 'active' : ''}
          onClick={() => onSelectTheater(theater.id)}
        >
          {theater.name}
        </button>
      ))}
    </div>
  )
}

export default TheaterTabs