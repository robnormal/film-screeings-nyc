import {getHtml, Movie, Theater} from "../shared/lib";
import {JSDOM} from "jsdom";
import {Showing} from "./showing";
import dayjs from "dayjs";
import {theaters} from "../shared/theaters";

const CALENDAR_URL = 'https://metrograph.com/nyc/'

async function showings(_start: Date, _end: Date) {
  const html = await getHtml(CALENDAR_URL)
  return new CalendarScraper(html).findMovies()
}

class CalendarScraper {
  dom: JSDOM

  constructor(html: string) {
    this.dom = new JSDOM(html)
  }

  findMovies() {
    const showings: Showing[] = []
    const movieDivs = this.dom.window.document
      .querySelectorAll('#fl-main-content div.homepage-in-theater-movie')

    movieDivs.forEach(div => {
      const infoDiv = div.querySelector('h3.movie_title')?.parentElement
      if (!infoDiv) {
        return
      }

      const titleLink = infoDiv.querySelector(':scope > h3.movie_title a[href]')
      if (!titleLink) {
        return
      }

      const title = titleLink.textContent?.trim()
      if (title === undefined) {
        return
      }

      const url = new URL(titleLink.getAttribute('href') || '', theater.url).href
      const movie: Movie = { title }

      const subheadings = infoDiv.querySelectorAll(':scope > h5')
      movie.director = subheadings.item(0).textContent?.trim()

      const detailsText = subheadings.item(1).textContent /* 2002 / 70min / 35mm */

      let format: string, duration: string

      const details = detailsText?.split(/\s*\/\s*/)
      if (details && details.length >= 3) {
        [movie.yearMade, duration, format] = details

        const durationMatch = duration.toLowerCase().match(/(\d+)\s*min/)
        if (durationMatch) {
          movie.duration = parseInt(durationMatch[1])
        }
      }

      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const showDays = infoDiv.querySelectorAll(':scope > div.showtimes > div.film_day')

      showDays.forEach(showDayDiv => {
        // Looks like "Sunday May 5"
        const dayElem = showDayDiv.querySelector(':scope > h5')

        if (!dayElem) {
          return
        }

        const dayText = dayElem.textContent?.trim() || ''
        const dayWords = dayText.split(/\s+/)

        if (dayWords.length >= 3) {
          let [_, month, day] = dayWords
          const year = currentMonth === 11 && month.toLowerCase() === 'december' ? currentYear + 1 : currentYear

          const times: string[] = Array.from(showDayDiv.querySelectorAll(':scope > a:not(:empty)')).map(elem => {
            // have to massage time for dayjs to work
            const text = elem.textContent?.trim().toLowerCase() || ''
            const match = text?.match(/(\d\d?\s*:\s*\d\d)(am|pm)?/)

            if (!match) {
              return text
            } else if (match.length >= 3) {
              return match[1] + ' ' + match[2]
            } else {
              return match[1]
            }
          })

          times.forEach(time => {
            const datetimeText = [year, month, day, time].join(' ')
            const date = dayjs(datetimeText, 'YYYY MMMM D h:mm a').toDate()
            const showing = new Showing(theater, movie, date, url)
            showing.format = format
            showings.push(showing)
          })
        }
      })
    })

    return showings
  }
}

const theater: Theater = theaters[2]

export default { showings, theater }
