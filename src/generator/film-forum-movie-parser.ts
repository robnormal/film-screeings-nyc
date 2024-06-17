import {JSDOM} from "jsdom";

const YEAR_REGEX = /\b(\d\d\d\d)\b/
const DURATION_REGEX = /\b(\d+)\s*mins?\b/
const DIRECTOR_REGEX = /directed\s+by\s+([\w\s-]+)/i

export class MoviePageParser {
  dom: JSDOM
  elems: NodeListOf<Element>
  text: string

  constructor(html: string) {
    this.dom = new JSDOM(html)
    this.elems = this.dom.window.document
      .querySelectorAll('#content > div > div.page > div.copy strong')

    let textContents: string[] = []
    this.elems.forEach(elem => textContents.push(elem.textContent?.toLowerCase() || ''))
    this.text = textContents.join("\n")
  }

  yearMade() {
    const yearMatch: RegExpMatchArray | null = this.text.match(YEAR_REGEX)

    return yearMatch ? yearMatch[1] : undefined
  }

  duration() {
    const durationMatch: RegExpMatchArray | null = this.text.match(DURATION_REGEX)

    return durationMatch ? parseInt(durationMatch[1]) : undefined
  }

  director() {
    const directorMatch: RegExpMatchArray | null = this.text.match(DIRECTOR_REGEX)
    return directorMatch ? directorMatch[1] : undefined
  }

  format() {
    if (this.text.match(/35\s*mm/)) {
      return '35mm'
    } else if (this.text.match(/16\s*mm/)) {
      return '16mm'
    } else if (this.text.match(/8\s*mm/)) {
      return '8mm'
    } else if (this.text.match(/70\s*mm/)) {
      return '70mm'
    } else if (this.text.match(/4k/)) {
      return '4K'
    } else {
      return 'DCP'
    }
  }
}
