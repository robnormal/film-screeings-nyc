import {JSDOM} from 'jsdom';
import {AnthologyListingDivParser} from "./anthology_listing_div_parser";
import {dateAtTime, getHtml, Theater} from "../shared/lib";
import {Showing} from "./showing";
import {theaters} from "../shared/theaters";

class MonthScraper {
  start: Date
  end: Date
  year: number
  month: number
  url: string

  constructor(start: Date, end: Date, year: number, month: number) {
    // make start and end be at the start and end of the day
    this.start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
    this.end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
    this.year = year
    this.month = month
    this.url = anthologyUrl(year, month)
  }

  listings(): Promise<Showing[]> {
    return getHtml(this.url).then(html => this.showingsFromPage(html))
  }

  showingsFromPage(html: string): Showing[] {
    const dom = new JSDOM(html)
    const topElements = dom.window.document
      .querySelectorAll('#calendar > div.film-showing > div.showing-details, #calendar > h3')

    const showings: Showing[] = []
    let date: Date, showing: Showing|undefined

    topElements.forEach((elem) => {
      switch (elem.tagName.toLowerCase()) {
        case 'h3':
          date = this.dateFromHeading(elem as HTMLHeadingElement) ?? date
          break
        case 'div':
          if (date >= this.start && date <= this.end) {
            showing = this.showingFromDiv(elem as HTMLDivElement, date)
            if (showing) {
              showings.push(showing)
            }
          }
          break
      }
    })

    return showings
  }

  showingFromDiv(elem: HTMLDivElement, date: Date): Showing|undefined {
    const parser = new AnthologyListingDivParser(elem)
    const [hours, minutes] = parser.movieTime()

    if (!isNaN(hours) && !isNaN(minutes)) {
      const title = parser.title()

      if (title !== '') {
        const showing = new Showing(
          theater,
          { title },
          dateAtTime(date, hours, minutes),
          this.url + '#' + parser.urlAnchor()
        )

        showing.movie.director = parser.director()
        showing.movie.yearMade = parser.year()
        showing.movie.duration = parser.duration()
        showing.format = parser.format()

        return showing
      }
    }
  }

  dateFromHeading(elem: HTMLHeadingElement): Date|undefined {
    let timestamp, child: ChildNode

    for (let i = 0; i < elem.childNodes.length; i++) {
      child = elem.childNodes[i]

      if (child.nodeName === '#text') {
        timestamp = Date.parse((child.textContent?.trim() ?? '') + ', ' + this.year)
        if (!isNaN(timestamp)) {
          return new Date(timestamp)
        }
      }
    }
  }
}

function anthologyUrl(year: number, month: number) {
  // URL uses standard calendar number for months, which is 1 off from array-index number that JS uses
  return `http://anthologyfilmarchives.org/film_screenings/calendar?view=list&month=${month+1}&year=${year}`
}

async function showings(start: Date, end: Date): Promise<Showing[]> {
  const startMonth = start.getMonth()
  const startYear = start.getFullYear()
  const endMonth = end.getMonth()
  const endYear = end.getFullYear()

  let showings: Showing[] = []

  for (let year = startYear; year <= endYear; year++) {
    for (let month = startMonth; month <= endMonth; month++) {
      const scraper = new MonthScraper(start, end, year, month)
      const monthListings = await scraper.listings()

      showings = showings.concat(monthListings)
    }
  }

  return showings
}

const theater: Theater = theaters[0]

export default { showings, theater }
