import {JSDOM} from "jsdom";
import {Showing} from "../showing";
import {absoluteUrl, Movie, Theater} from "../../shared/lib";

export class CalendarScraper {
  dom: JSDOM
  theater: Theater

  constructor(theater: Theater, html: string) {
    this.theater = theater
    this.dom = new JSDOM(html)
  }

  findMovies() {
    const showings: Showing[] = []
    const showtimes: Record<string, Date[]> = this.extractShowtimeData(this.findShowtimeData())

    Object.keys(showtimes).forEach(listingId => {
      const infoDiv = this.findMovieInfoDiv(listingId)
      if (!infoDiv) {
        return
      }

      const titleLink: HTMLAnchorElement|null = infoDiv.querySelector('h1 a.title[href]')
      if (!titleLink) {
        return
      }

      const title = titleLink.textContent?.trim()
      if (title === undefined) {
        return
      }

      const movie: Movie = { title }
      const url = absoluteUrl(titleLink, this.theater.url)

      let format: string
      infoDiv.querySelectorAll('p.show-specs > span').forEach(subheading => {
        let match

        const heading = subheading.textContent
        if (!heading) {
          return
        }

        match = heading.match(/Director:?\s*(.+)/i)
        if (match) {
          movie.director = match[1].trim()
        }

        match = heading.match(/Run Time:?\s*(\d+)/i)
        if (match) {
          movie.duration = parseInt(match[1])
        }

        match = heading.match(/Release Year:?\s*(\d+)/i)
        if (match) {
          movie.yearMade = match[1]
        }

        match = heading.match(/Format:?\s*(.+)/i)
        if (match) {
          format = match[1].trim()
        }
      })

      showtimes[listingId].forEach(datetime => {
        let showing = new Showing(this.theater, movie, datetime, url)
        showing.format = format
        showings.push(showing)
      })
    })

    return showings
  }

  findShowtimeData(): any {
    const prefixText: string = 'window["theme_posts"] = '

    const inlineScripts: NodeListOf<HTMLScriptElement> = this.dom.window.document
      .querySelectorAll('script:not([src])')

    for (let i = 0; i < inlineScripts.length; i++) {
      let script = inlineScripts[i].text

      // don't use regex, because the string is huge
      let start = 0
      while (script[start].match(/\s/)) {
        start++
      }

      if (script.slice(start, start + prefixText.length) !== prefixText) {
        continue
      }
      start += prefixText.length

      let end = script.length - 1
      while (script[end].match(/[\s;]/)) {
        end--
      }

      try {
        return JSON.parse(script.slice(start, end + 1))
      } catch (e) {
        console.log(e)
        return null
      }
    }
  }

  extractShowtimeData(movieData: any) {
    const showtimes: Record<string, Date[]> = {}

    if (movieData && movieData.forEach) {
      movieData.forEach((movieData: any) => {
        if (!movieData || !movieData.ID || !movieData.all_showtimes || !movieData.all_showtimes.forEach) {
          return
        }
        showtimes[movieData.ID.toString()] = []

        movieData.all_showtimes.forEach((x: any) => {
          if (x && x._datetime) {
            let timestamp = parseInt(x._datetime.toString())
            if (!isNaN(timestamp)) {
              showtimes[movieData.ID.toString()].push(new Date(timestamp * 1000))
            }
          }
        })
      })
    }

    return showtimes
  }

  findMovieInfoDiv(listingId: string) {
    const dateSelect = this.dom.window.document.getElementById(`showtime-dates-${listingId}`)
    if (!dateSelect) {
      return null
    }

    let showtimeSelectionDiv = dateSelect.parentElement
    while (showtimeSelectionDiv && !showtimeSelectionDiv.matches('div.single-show-showtimes')) {
      showtimeSelectionDiv = showtimeSelectionDiv.parentElement
    }
    if (!showtimeSelectionDiv) {
      return null
    }

    return showtimeSelectionDiv.parentElement
  }
}

