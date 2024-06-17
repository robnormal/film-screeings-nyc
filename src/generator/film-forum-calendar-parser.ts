import {JSDOM} from "jsdom";

export type CalendarListing = {
  title: string
  url: string
  time: {
    hours: number,
    minutes: number,
  }
}

export class CalendarParser {
  dom: JSDOM

  constructor(html: string) {
    this.dom = new JSDOM(html)
  }

  async getListings() {
    let tab: Element|null
    const listingsByDay: CalendarListing[][] = []

    for (let i = 0; i < 7; i++) {
      tab = this.dom.window.document.querySelector(`#tabs-${i}`)
      if (tab) {
        listingsByDay.push(this.dayListings(tab))
      }
    }

    // const movies = this.populateMovies(listingsByDay.flat(1))
    return listingsByDay
  }

  dayListings(elem: Element): CalendarListing[] {
    const paragraphs = elem.querySelectorAll(':scope > p')
    const calendarListings: CalendarListing[] = []

    paragraphs.forEach(paragraph => {
      const link = paragraph.querySelector(':scope > strong a[href]')
      if (!link) {
        return
      }
      const url = link.getAttribute('href')
      const title = link.textContent?.trim()

      if (url && title) {
        paragraph.querySelectorAll(':scope > span').forEach(span => {
          const [hours, minutes] = this.timeFromText(span.textContent || '')

          calendarListings.push({
            url: url,
            title: title,
            time: {hours, minutes},
          })
        })
      }
    })

    return calendarListings
  }

  timeFromText(text: string) {
    const match = text.match(/(\d\d?)\s*:\s*(\d\d)/)

    if (!match) {
      return [NaN, NaN]
    } else {
      // No am/pm information is given, but shows never start after 10pm, so assume 10 and 11 are am
      return [
        match[1] === '10' || match[1] === '11' ? parseInt(match[1]) : parseInt(match[1]) + 12,
        parseInt(match[2])
      ]
    }
  }
}
