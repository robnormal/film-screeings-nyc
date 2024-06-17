import {getHtml, init, Movie} from "../shared/lib";
import {CalendarListing} from "./film-forum-calendar-parser";
import {MoviePageParser} from "./film-forum-movie-parser";

export type MoviesWithFormat = Record<string, { movie: Movie, format: string }>
type MoviePage = { title: string, html: string }

export class MovieScraper {
  listingsByTitle: Record<string, CalendarListing[]> = {}
  movieUrlsByTitle: Record<string, string> = {}

  constructor(listings: CalendarListing[]) {
    listings.forEach((listing: CalendarListing) => {
      init(this.listingsByTitle, listing.title, [])
      this.listingsByTitle[listing.title].push(listing)

      this.movieUrlsByTitle[listing.title] = listing.url
    })
  }

  moviesWithFormatByTitle(): Promise<MoviesWithFormat > {
    return this.moviePages().then(moviePages => this.getMoviesWithFormat(moviePages))
  }

  private moviePages(): Promise<MoviePage[]> {
    return Promise.all(Object.keys(this.movieUrlsByTitle).map(title => {
      return getHtml(this.movieUrlsByTitle[title]).then(html => {
        return { title, html }
      })
    }))
  }

  private getMoviesWithFormat(moviePages: MoviePage[]): MoviesWithFormat {
    const moviesWithFormat: Record<string, { movie: Movie, format: string }> = {}

    moviePages.forEach((moviePage: { title: string, html: string }) => {
      const parser = new MoviePageParser(moviePage.html)
      moviesWithFormat[moviePage.title] = {
        format: parser.format(),
        movie: {
          title: moviePage.title,
          duration: parser.duration(),
          director: parser.director(),
          yearMade: parser.yearMade(),
        }
      }
    })

    return moviesWithFormat
  }
}
