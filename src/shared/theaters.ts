import {Theater} from "./lib";

export const theaters = [
  {
    id: '1',
    name: 'Anthology Film Archives',
    url: 'http://anthologyfilmarchives.org/',
  },
  {
    id: '2',
    name: 'Film Forum',
    url: 'https://filmforum.org/',
  },
  {
    id: '3',
    name: 'Metrograph',
    url: 'https://metrograph.com/',
  },
  {
    id: '4',
    name: 'Nitehawk - Williamsburg',
    url: 'htts://nitehawkcinema.com/williamsburg/',
  },
  {
    id: '5',
    name: 'Nitehawk - Prospect Park',
    url: 'htts://nitehawkcinema.com/prospectpark/',
  }
]

export const theatersById: Record<string, Theater> = {}
theaters.forEach(theater => theatersById[theater.id] = theater)
