import {dateAtTime, getHtml, MILLISECONDS_PER_DAY, Theater} from "../shared/lib";
import {Showing} from "./showing";
import {CalendarParser} from "./film-forum-calendar-parser";
import {MovieScraper} from "./film-forum-movie-scraper";
import {theaters} from "../shared/theaters";

async function showings(_start: Date, _end: Date): Promise<Showing[]> {
  const html = await getHtml(theater.url)

  const parser = new CalendarParser(html)
  const listingsByDay = await parser.getListings()

  const movieScraper = new MovieScraper(listingsByDay.flat(1))
  const moviesWithFormat = await movieScraper.moviesWithFormatByTitle()

  const today = new Date()
  const showings: Showing[] = []

  listingsByDay.forEach((listings, day) => {
    const date = new Date(today.getTime() + day * MILLISECONDS_PER_DAY)

    listings.forEach(listing => {
      const showing= new Showing(
        theater,
        moviesWithFormat[listing.title].movie,
        dateAtTime(date, listing.time.hours, listing.time.minutes),
        listing.url
      )
      showing.format = moviesWithFormat[listing.title].format
      showings.push(showing)
    })
  })

  return showings
}

const theater: Theater = theaters[1]

export default { showings, theater }
