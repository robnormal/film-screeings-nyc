import {formatAsDate, Movie, ShowingView, Theater} from "../shared/lib";

export class Showing {
  uid: string
  theater: Theater
  datetime: Date
  url: string
  movie: Movie
  day: string // Used as key for shows on the same day
  format?: string

  constructor(theater: Theater, movie: Movie, datetime: Date, url: string) {
    this.theater = theater
    this.movie = movie
    this.datetime = datetime
    this.url = url
    this.day = formatAsDate(this.datetime)

    this.uid = [theater.name, this.movie.title, this.datetime.toString()].join('%')
  }

  getView(): ShowingView {
    return {
      uid: this.uid,
      theaterId: this.theater.id,
      movie: this.movie,
      url: this.url,
      datetime: this.datetime,
      format: this.format,
    }

  }
}
