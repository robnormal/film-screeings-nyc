import {scrapeDates} from "./scraper-anthology";

scrapeDates(new Date(2024, 5, 10), new Date(2024, 5, 16)).then(text => console.log(text))