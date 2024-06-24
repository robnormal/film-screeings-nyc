import {formatAsDate, Movie, ShowingView, Theater} from "../shared/lib";

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

  getView(): ShowingView {
    return {
      theaterId: this.theater.id,
      movie: this.movie,
      url: this.url,
      timestamp: this.datetime.getTime(),
      dateText: formatAsDate(this.datetime),
      format: this.format,
    }
  }
}

// https://production-api.readingcinemas.com/films?brandId=US&countryId=6&cinemaId=0000000004&status=getShows&flag=nowshowing&searchAttribute=35mm&selectedDate=2024-06-20