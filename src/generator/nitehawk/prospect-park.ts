import {getHtml, Theater} from "../../shared/lib";
import {theaters} from "../../shared/theaters";
import {CalendarScraper} from "./calendarScraper";

const CALENDAR_URL: string = 'https://nitehawkcinema.com/prospectpark/film-series/35mm-screenings-2/'

const theater: Theater = theaters[4]

async function showings(_start: Date, _end: Date) {
  const html = await getHtml(CALENDAR_URL)
  return new CalendarScraper(theater, html).findMovies()
}

export default { showings, theater }
