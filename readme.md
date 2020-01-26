## Scrapper for Evaly users

This scapper will scrape evaly users data and save it to database.

### Install

- yarn install

and adjust your database configuration in `knexfile.js, then: 
 - knex migrate:latest
 - node index.js
 
Make sure you've [knex](http://knexjs.org) installed 
