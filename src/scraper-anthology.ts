import {JSDOM} from 'jsdom';
import {AnthologyListingDivParser} from "./anthology_listing_div_parser";
import {getHtml, Showing} from "./lib";

function anthologyUrl(year: number, month: number) {
  // URL uses standard calendar number for months, which is 1 off from array-index number that JS uses
  return `http://anthologyfilmarchives.org/film_screenings/calendar?view=list&month=${month+1}&year=${year}`
}

async function scrapeListings(start: Date, end: Date) {
  // make start and end be at the start and end of the day
  start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
  end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)

  const startMonth = start.getMonth()
  const startYear = start.getFullYear()
  const endMonth = end.getMonth()
  const endYear = end.getFullYear()

  let listings: Showing[] = []

  for (let year = startYear; year <= endYear; year++) {
    for (let month = startMonth; month <= endMonth; month++) {
      const html = await getHtml(anthologyUrl(year, month))
      listings = listings.concat(extractListings(html, year, start, end))
    }
  }

  return listings
}

function extractListings(html: string, year: number, start: Date, end: Date): Showing[] {
  const dom = new JSDOM(html)
  const topElements = dom.window.document
    .querySelectorAll('#calendar > div.film-showing > div.showing-details, #calendar > h3')

  const showings: Showing[] = []
  let date: Date, showing: Showing|undefined

  topElements.forEach((elem) => {
    switch (elem.tagName.toLowerCase()) {
      case 'h3':
        date = dateFromHeading(elem as HTMLHeadingElement, year) ?? date
        break
      case 'div':
        if (date >= start && date <= end) {
          showing = extractShowing(elem as HTMLDivElement, date)
          if (showing) {
            showings.push(showing)
          }
        }
        break
    }
  })

  return showings
}

function dateFromHeading(elem: HTMLHeadingElement, year: number): Date|undefined {
  let timestamp, child: ChildNode

  for (let i = 0; i < elem.childNodes.length; i++) {
    child = elem.childNodes[i]

    if (child.nodeName === '#text') {
      timestamp = Date.parse((child.textContent?.trim() ?? '') + ', ' + year)
      if (!isNaN(timestamp)) {
        return new Date(timestamp)
      }
    }
  }
}

function extractShowing(elem: HTMLDivElement, date: Date): Showing|undefined {
  const parser = new AnthologyListingDivParser(elem)

  const [hours, minutes] = parser.movieTime()

  if (!isNaN(hours) && !isNaN(minutes)) {
    const title = parser.title()

    if (title !== '') {
      return {
        time: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes),
        title: title,
        url: parser.url(),
        director: parser.director(),
        year: parser.year(),
        duration: parser.duration(),
        format: parser.format(),
      }
    }
  }
}

export default { scrapeListings }
