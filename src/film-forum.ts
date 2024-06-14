import {Theater} from "./lib";
import {Showing} from "./showing";

async function showings(start: Date, end: Date): Promise<Showing[]> {
  return []
}

const theater: Theater = {
  name: 'Film Forum',
  url: 'https://filmforum.org/',
}

export default { showings, theater }
