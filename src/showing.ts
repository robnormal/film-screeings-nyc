import {formatAsDate, Movie, Theater} from "./lib";

export class Showing {
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
  }
}
