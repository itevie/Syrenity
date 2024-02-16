# Syrenity
A Discord-like web application created using Node.JS with Express, and a database using Postgresql.

## Running
Download the repository.

You will need to install and setup postgresql, to do this:
 - Install postgres
 - Create a database called "discord" or modify the constring in src/config.json to use a custom name / server
    - You can try `psql -c "CREATE DATABASE Discord;"`
 - Run the sql script in sql/setup.sql
    - You can try `psql -d Discord -f "sql/setup.sql"`
 - Validate its setup correctly by doing some test query: `SELECT * FROM users;`
    - You can try `psql -d Discord -c "SELECT * FROM users;"`

Then you can run it by doing:
1. Run `npm install`
2. Run `ts-node src/index.ts`.

### Running in GitHub Codespaces
Open this, then copy contents of `setup.sh` and run it in terminal.

