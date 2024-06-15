import {dateAtTime, getHtml, MILLISECONDS_PER_DAY, Theater} from "./lib";
import {Showing} from "./showing";
import {CalendarParser} from "./film-forum-calendar-parser";
import {MovieScraper} from "./film-forum-movie-scraper";

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
      showings.push(new Showing(
        theater,
        moviesWithFormat[listing.title].movie,
        dateAtTime(date, listing.time.hours, listing.time.minutes),
        listing.url
      ))
    })
  })

  return showings
}


const theater: Theater = {
  name: 'Film Forum',
  url: 'https://filmforum.org/',
}

export default { showings, theater }
