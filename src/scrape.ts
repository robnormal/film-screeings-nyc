import anthology from "./scraper-anthology";
import {Showing} from "./lib";
import {promises as fsPromises} from 'fs'
import Handlebars from "handlebars";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export async function run() {
  const start = new Date()
  const end = new Date(start.getTime() + 7*MILLISECONDS_PER_DAY)

  const anthologyListings = await anthology.scrapeListings(start, end)
  // TODO: scrape other sites
  const filmForumListings = []

  const listings: Showing[] = [].concat(anthologyListings, filmForumListings)

  const template = await fsPromises.readFile('src/movie-calendar.handlebars', 'utf8')
  const page = Handlebars.compile(template)({ listings })

  return fsPromises.writeFile('output/calendar.html', page, "utf8")
}

run()