# Syrenity
A Discord-like web application created using Node.JS with Express, and a database using Postgresql.

## Running
Download the repository, run `npm install` then run `ts-node src/index.ts`.

You will need to install and setup postgresql, to do this:
 - Install postgres
 - Create a database called "discord" or modify the constring in src/config.json to use a custom name / server
 - Run the sql script in sql/setup.sql
 - Validate its setup correctly by doing some test query: `SELECT * FROM users;`

