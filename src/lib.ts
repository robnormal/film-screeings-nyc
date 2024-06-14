import dayjs from "dayjs";
import {Showing} from "./showing";

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

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
    title: showing.title,
    duration: showing.duration ? `${Math.floor(showing.duration/60)}h ${showing.duration % 60}m` : '',
    time: dayjs(showing.datetime).format('h:mm a')
  }
}

export function indicesUpTo(length: number) {
  return [...Array(length).keys()]
}