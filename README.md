# Syrenity

A Discord-like web application for chatting with your friends.

> :warning: At the moment, there is no official website for this at the moment.

## Related projects

- [Syrenity Client](https://github.com/itevie/syrenity-api-client)
- [Dawn UI](https://github.com/itevie/dawn-ui)

## Running yourself

1. Download the repository
2. Install [NodeJS](https://nodejs.org/en), [PostgreSQL](https://www.postgresql.org/) on your system
3. Initialise the repository
   - Create a database called `syrenity`: `psql -c "CREATE DATABASE syrenity;"`
   - Load the dump `psql -d syrenity -f "src/sql/dump.sql"`
4. Run `npm install` or `pnpm install`, then `npm install -g ts-node` or with `pnpm`
5. Start it with `ts-node src/index.ts`

## Issues

If you find any issues with any part of the project, please either open an issue, or contact me. Make sure to include as much details about the issue as you can.
