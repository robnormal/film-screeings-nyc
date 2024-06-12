const YEAR_REGEX = /\d\d\d\d(\s*-\s*\d\d\d\d)?/
const DURATION_REGEX = /(\d+)\s*min/i
const FORMAT_REGEX = /\d+\s*mm|DCP|digital|video|HD/i

export class AnthologyListingDivParser {
  private elem: HTMLDivElement;
  private _textNodes: string[]|undefined;
  private _otherDetails: string[]|undefined;
  private _yearIndex: number|undefined;

  constructor(elem: HTMLDivElement) {
    this.elem = elem
  }

  movieTime() {
    let timeMatch = this.timeLink()?.textContent?.trim().toLowerCase()
      .match(/(\d\d?)\s*:\s*(\d\d)\s*(am|pm)/) as RegExpMatchArray | null;

    if (timeMatch !== null && timeMatch.length >= 4) {
      let hours: number = parseInt(timeMatch[1], 10) + (timeMatch[3] === 'pm' ? 12 : 0)
      let minutes = parseInt(timeMatch[2], 10)

      return [hours, minutes]
    } else {
      return [NaN, NaN]
    }
  }

  url(): string {
    return this.timeLink()?.name || ''
  }

  title(): string {
    return this.elem.querySelector('span.film-title')?.textContent?.trim() ?? '';
  }

  director(): string {
    const textNodes = this.textNodes()

    if (textNodes.length > 0) {
      const directorText = textNodes[0]
      const match = directorText.match(/by\s+(.*)/);

      if (match) {
        return match[1]
      }
    }

    return ''
  }

  // string rather than number, because sometimes it's a range, like "1995-1999"
  year(): string {
    const otherDetails = this.otherDetails()

    for (let i = 0; i < otherDetails.length; i++) {
      if (otherDetails[i].match(YEAR_REGEX)) {
        return otherDetails[i]
      }
    }

    return ''
  }

  duration(): number {
    const otherDetails = this.otherDetails()

    for (let i = 0; i < otherDetails.length; i++) {
      const match = otherDetails[i].match(DURATION_REGEX)
      if (match) {
        return parseInt(match[1])
      }
    }

    return NaN
  }

  format(): string {
    const otherDetails = this.otherDetails()

    for (let i = 0; i < otherDetails.length; i++) {
      if (otherDetails[i].match(FORMAT_REGEX)) {
        if (otherDetails[i].indexOf('.') > -1) {
          return otherDetails[i].slice(0, otherDetails[i].indexOf('.'))
        } else {
          return otherDetails[i]
        }
      }
    }

    return ''
  }

  private textNodes(): string[] {
    if (this._textNodes === undefined) {
      this._textNodes = []

      for (let i = 0; i < this.elem.childNodes.length; i++) {
        if (this.elem.childNodes[i].nodeName === '#text') {
          let text = this.elem.childNodes[i].textContent?.trim() ?? ''
          if (text !== '') {
            this._textNodes.push(text)
          }
        }
      }
    }

    return this._textNodes
  }

  private otherDetails(): string[] {
    if (this._otherDetails === undefined) {
      const textNodes = this.textNodes()

      if (textNodes.length < 2) {
        this._otherDetails = []
      } else {
        this._otherDetails = textNodes[1].split(/\s*,\s*/)
      }
    }

    return this._otherDetails
  }

  private timeLink(): HTMLAnchorElement|null {
    return this.elem.querySelector('a')
  }
}