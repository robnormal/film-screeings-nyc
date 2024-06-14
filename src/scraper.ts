import {
  DayWithTheaterShowings,
  GroupedShowings,
  MILLISECONDS_PER_DAY,
  Theater,
  TheaterModule,
  TheaterWithShowings
} from "./lib";
import dayjs from "dayjs";
import anthologyFilmArchives from "./anthology-film-archives";
import filmForum from "./film-forum";
import {Showing} from "./showing";

export class Scraper {
  start: Date
  end: Date
  days: string[]
  theaterModules: TheaterModule[]

  constructor(start: Date, end: Date) {
    // make start and end be at the start and end of the day
    this.start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
    this.end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)

    this.days = [];
    for (let date = this.start; date < this.end; date = new Date(date.getTime() + MILLISECONDS_PER_DAY)) {
      this.days.push(dayjs(date).format('YYYY-MM-DD'))
    }

    this.theaterModules = [
      anthologyFilmArchives,
      filmForum,
    ]
  }

  getShowingsForHandlebars() {
    let allShowings: Showing[] = []
    let showings: Showing[]

    return Promise.all(this.theaterModules.map(module => {
      return module.showings(this.start, this.end);
    })).then(xs => {
      return this.structureShowingsForHandlebars(xs.flat(1))
    })
  }

  groupByDateAndTheater(showings: Showing[]): GroupedShowings {
    let grouped: GroupedShowings = {}

    // sort by date
    showings.sort((a: Showing, b: Showing) => a.day < b.day ? 1 : (a.day > b.day ? -1 : 0))

    // populate grouped
    showings.forEach(showing => {
      if (!grouped.hasOwnProperty(showing.day)) {
        grouped[showing.day] = {}
      }
      if (!grouped[showing.day].hasOwnProperty(showing.theater.name)) {
        grouped[showing.day][showing.theater.name] = []
      }

      grouped[showing.day][showing.theater.name].push(showing)
    })

    return grouped
  }

  structureShowingsForHandlebars(showings: Showing[]): DayWithTheaterShowings[] {
    const grouped = this.groupByDateAndTheater(showings)
    let showingsForHandlebars: DayWithTheaterShowings[] = []

    this.days.forEach(day => {
      if (grouped.hasOwnProperty(day)) {
        showingsForHandlebars.push({
          day: day,
          theatersWithShowings: this.theatersWithShowings(grouped[day])
        })
      }
    })

    return showingsForHandlebars
  }

  theatersWithShowings(showingsByTheaterName: Record<string, Showing[]>): TheaterWithShowings[] {
    const theatersWithShowings: TheaterWithShowings[] = []

    this.theaterModules.forEach(module => {
      if (showingsByTheaterName.hasOwnProperty(module.theater.name)) {
        theatersWithShowings.push({
          theater: module.theater,
          showings: showingsByTheaterName[module.theater.name],
        })
      }
    })

    return theatersWithShowings
  }
}