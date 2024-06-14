import {JSDOM} from 'jsdom';
import {AnthologyListingDivParser} from "./anthology_listing_div_parser";
import {getHtml, Theater} from "./lib";
import {Showing} from "./showing";

const theater: Theater = {
  name: 'Anthology Film Archives',
  url: 'http://anthologyfilmarchives.org/',
}

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
    const parser = new AnthologyListingDivParser(elem, this.url)
    const [hours, minutes] = parser.movieTime()

    if (!isNaN(hours) && !isNaN(minutes)) {
      const title = parser.title()

      if (title !== '') {
        const showing = new Showing(
          theater,
          new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes),
          this.url + parser.url(),
          title
        )

        showing.director = parser.director()
        showing.yearMade = parser.year()
        showing.duration = parser.duration()
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

type DateWithShowingsByTheater = {
  date: Date,
  showingsByTheater: [{
    theater: Theater,
    showings: Showing[],
  }],
}

function groupListingsByDateAndTheater(showings: Showing[]): DateWithShowingsByTheater[] {
  const showingsByDateAndTheater: DateWithShowingsByTheater[] = []

  showings.forEach(showing => {
    const day = showing.datetime.getDay().toString()

    if (!showingsByDateAndTheater.hasOwnProperty(day)) {
      showingsByDateAndTheater[day] = { date: day, showingsByTheater: [] }
    }

    showingsByDateAndTheater[day].showings.push(showing)
  })

  return showingsByDateAndTheater
}

async function showings(start: Date, end: Date): Promise<Showing[]> {
  const startMonth = start.getMonth()
  const startYear = start.getFullYear()
  const endMonth = end.getMonth()
  const endYear = end.getFullYear()

  let listings: Showing[] = []

  for (let year = startYear; year <= endYear; year++) {
    for (let month = startMonth; month <= endMonth; month++) {
      const scraper = new MonthScraper(start, end, year, month)
      const monthListings = await scraper.listings()

      listings = listings.concat(monthListings)
    }
  }

  return listings
}

export default { showings, theater }
