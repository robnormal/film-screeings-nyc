import {formatAsDate, getHtml, MILLISECONDS_PER_MINUTE, Movie, Theater} from "../shared/lib";
import {theaters} from "../shared/theaters";

function apiUrl(start: Date, end: Date) {
  return `https://www.filmlinc.org/wp-content/themes/filmlinc/api-events.php?start=${formatAsDate(start)}&end=${formatAsDate(end)}`
}

/*
"title":"Original Cast Album: Company",
"permalink":"https:\/\/www.filmlinc.org\/films\/original-cast-album-company\/",
"start":1718931600000,
"end":1718935200000,
"venue_tess":"Walter Reade Theater",
"running_time":"53",
"directors":["D. A. Pennebaker"]},
 */

async function showings(start: Date, end: Date) {
  const json = await getHtml(apiUrl(start, end))

  let listings
  try {
    listings = JSON.parse(json)
  } catch (_e) {
    // do nothing
  }

  if (!listings) {
    return []
  }

  listings.forEach((listing: any) => {
    if (isValidListing(listing)) {
      let movie: Movie = { title: listing.title }

      let startTime = new Date(listing.start)
      let minutesLong = NaN

      if (typeof listing.running_time === 'string') {
        minutesLong = parseInt(listing.running_time)
      }

      // running_time may have been invalid, or nonexistent
      if (isNaN(minutesLong) && typeof listing.end === 'number') {
        let endTime = new Date(listing.end)
        minutesLong = (endTime.getTime() - startTime.getTime()) / MILLISECONDS_PER_MINUTE
      }

      if (!isNaN(minutesLong)) {
        movie.duration = minutesLong
      }

      if (typeof listing.director === 'string') {
        movie.director = listing.director
      } else if (listing.director.join) {
        movie.director = listing.director.join(', ')
      }

      
    }
  })
}

function isValidListing(listing: any) {
  return listing
    && listing.production_id
    && typeof listing.title === 'string'
    && typeof listing.permalink === 'string'
    && typeof listing.start === 'number'
    && (typeof listing.end === 'number' || listing.running_time)
}

const theater: Theater = theaters[5]

export default { showings, theater }
