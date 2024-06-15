import {promises as fsPromises} from 'fs'
import Handlebars from "handlebars";

import {indicesUpTo, MILLISECONDS_PER_DAY, viewShowing} from "./lib";

import {Showing} from "./showing";
import {Scraper} from "./scraper";

Handlebars.registerHelper('daysWithShowings', function(context: Showing[], options) {
  return indicesUpTo(context.length).map(index => {
    options.fn(viewShowing(context[index]))
  }).join('')
})

export async function run() {
  const start = new Date()
  const end = new Date(start.getTime() + 7*MILLISECONDS_PER_DAY)
  const scraper = new Scraper(start, end)

  const daysWithTheaterShowings = await scraper.getShowingsForHandlebars()

  const template = await fsPromises.readFile('src/movie-calendar.handlebars', 'utf8')
  const page = Handlebars.compile(template)({ days: daysWithTheaterShowings })

  return fsPromises.writeFile('output/calendar.html', page, "utf8")
}

run()