import {getHtml, Theater} from "../../shared/lib";
import {theaters} from "../../shared/theaters";
import {CalendarScraper} from "./calendarScraper";

const CALENDAR_URL: string = 'https://nitehawkcinema.com/williamsburg/film-series/35mm-screenings/'

const theater: Theater = theaters[3]

async function showings(_start: Date, _end: Date) {
  const html = await getHtml(CALENDAR_URL)
  return new CalendarScraper(theater, html).findMovies()
}

export default { showings, theater }
