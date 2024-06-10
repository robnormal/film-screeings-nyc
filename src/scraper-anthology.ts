import {JSDOM} from 'jsdom';

type Showing = { time: Date, title: string, text: string }

export async function getHtml(url: string) {
  // Validate url
  new URL(url)

  const res = await fetch(url, {
    credentials: 'same-origin',
  })

  if (res.status >= 400 && res.status < 500) {
    throw new Error(res.status.toString())
  } else if (res.status < 200 || res.status >= 300) {
    console.log(res.headers.get('location'))
    console.error('Unknown status: ' + res.status)
    throw new Error('An unknown error occurred')
  }

  return res.text()
}

function anthologyUrl(year: number, month: number) {
  // URL uses standard calendar number for months, which is 1 off from array-index number that JS uses
  return `http://anthologyfilmarchives.org/film_screenings/calendar?view=list&month=${month+1}&year=${year}`
}

export async function scrapeDates(start: Date, end: Date) {
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
      listings = listings.concat(extractListingsDOM(html, year, start, end))
    }
  }

  return listings
}

export function extractListingsDOM(html: string, year: number, start: Date, end: Date): Showing[] {
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

function dateFromHeadingEXAMPLE(elem: HTMLHeadingElement, year: number) {
  const children = elem.childNodes.values()
  let result: IteratorResult<ChildNode, ChildNode>
  let timestamp = NaN

  while ((result = children.next()) && !result.done) {
    if (result.value.nodeType === Node.TEXT_NODE) {
      timestamp = Date.parse((elem.textContent?.trim() ?? '') + ', ' + year)
      break
    }
  }

  if (!isNaN(timestamp)) {
    return new Date(timestamp)
  }
}

function extractShowing(elem: HTMLDivElement, date: Date): Showing|undefined {
  let timeMatch = elem.querySelector('a')?.textContent?.trim().toLowerCase()
    .match(/(\d\d?)\s*:\s*(\d\d)\s*(am|pm)/) as RegExpMatchArray|null;

  if (timeMatch !== null && timeMatch.length >= 4) {
    let hours = parseInt(timeMatch[1], 10) + (timeMatch[3] === 'pm' ? 12 : 0)
    let minutes = parseInt(timeMatch[2], 10)

    if (!isNaN(hours) && !isNaN(minutes)) {
      return {
        time: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes),
        title: elem.querySelector('span.film-title')?.textContent?.trim() ?? '',
        text: elem.textContent ?? '',
      }
    }
  }
}
// In Finnish, English, and French with English subtitles, 2023, 81 min, DCP. These screenings are presented with support from Unifrance.
