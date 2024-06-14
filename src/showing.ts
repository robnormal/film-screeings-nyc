import {Theater} from "./lib";
import dayjs from "dayjs";

export class Showing {
  theater: Theater
  datetime: Date
  url: string
  title: string
  day: string // Used as key for shows on the same day
  director?: string
  yearMade?: string
  duration?: number
  format?: string

  constructor(theater: Theater, datetime: Date, url: string, title: string) {
    this.theater = theater
    this.datetime = datetime
    this.url = url
    this.title = title
    this.day = dayjs(this.datetime).format('YYYY-MM-DD')
  }
}

