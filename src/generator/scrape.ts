import {promises as fsPromises} from 'fs'
import Handlebars from "handlebars";
import {formatAsTime, MILLISECONDS_PER_DAY} from "../shared/lib";
import {Scraper} from "./scraper";

Handlebars.registerHelper('time', function(context: Date, _options) {
  return formatAsTime(context)
})

const FILM_FORMATS = [
  '70mm',
  '35mm',
  '16mm',
  '8mm',
]

export async function run() {
  const start = new Date()
  const end = new Date(start.getTime() + 7*MILLISECONDS_PER_DAY)
  const scraper = new Scraper(start, end)

  const showings = await scraper.getShowings()

  const filmShowings = showings.filter(showing => {
    return showing.format && FILM_FORMATS.indexOf(showing.format) > -1
  })
  const showingViews = filmShowings.map(showing => showing.getView())
  showingViews.sort((a, b) => {
    return a.dateText < b.dateText ? -1 : (a.dateText > b.dateText ? 1 : 0)
  })
  return fsPromises.writeFile(
    'src/frontend/film-showings.ts',
    'export const showings = ' + JSON.stringify(showingViews, undefined, 2),
    'utf8',
  )

    /*
  const daysWithTheaterShowings = scraper.structureShowingsForHandlebars(filmShowings)
  const template = await fsPromises.readFile('src/generator/movie-calendar.handlebars', 'utf8')
  const page = Handlebars.compile(template)({ daysWithTheaterShowings })

  return fsPromises.writeFile('output/calendar.html', page, "utf8")

     */
}

run()