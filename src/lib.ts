import dayjs from "dayjs";
import {Showing} from "./showing";

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export type Movie = {
  title: string
  director?: string
  yearMade?: string
  duration?: number
}

export type ShowingView = {
  url: string,
  time: string,
  title: string,
  duration: string,
}

export type Theater = {
  name: string,
  url: string,
}

export type TheaterModule = {
  theater: Theater,
  showings: (start: Date, end: Date) => Promise<Showing[]>,
}

export type TheaterWithShowings = {
  theater: Theater,
  showings: Showing[],
}

export type DayWithTheaterShowings = {
  day: string,
  theatersWithShowings: TheaterWithShowings[],
}

export type GroupedShowings = Record<string, Record<string, Showing[]>>

export async function getHtml(url: string) {
  // Validate url
  new URL(url)

  const res = await fetch(url, {
    credentials: 'same-origin',
  })

  if (res.status >= 400 && res.status < 500) {
    throw new Error(res.status.toString())
  } else if (res.status < 200 || res.status >= 300) {
    console.log(res.headers.get('location'))
    console.error('Unknown status: ' + res.status)
    throw new Error('An unknown error occurred')
  }

  return res.text()
}

export function viewShowing(showing: Showing): ShowingView {
  return {
    url: showing.url,
    title: showing.movie.title,
    duration: showing.movie.duration ? formatDuration(showing.movie.duration) : '',
    time: formatAsTime(showing.datetime)
  }
}

export function formatDuration(duration: number) {
  return `${Math.floor(duration/60)}h ${duration % 60}m`
}

export function indicesUpTo(length: number) {
  return [...Array(length).keys()]
}

export function dateAtTime(date: Date, hours: number, minutes: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes)
}

export function init<T>(record: Record<string, T>, key: string, value: T) {
  if (!record.hasOwnProperty(key)) {
    record[key] = value
  }
}

export function formatAsDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatAsTime(date: Date): string {
  return dayjs(date).format('h:mm a')
}

