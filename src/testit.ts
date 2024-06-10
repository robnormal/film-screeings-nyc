import {scrapeDates} from "./scraper-anthology";

scrapeDates(new Date(2024, 5, 28), new Date(2024, 6, 6)).then(text => console.log(text))