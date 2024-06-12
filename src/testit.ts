import {scrapeListings} from "./scraper-anthology";

scrapeListings(new Date(2024, 5, 28), new Date(2024, 6, 28)).then(text => console.log(text))