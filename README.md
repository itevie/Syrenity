# Syrenity

A Discord-like web application for chatting with your friends.

> :warning: The project is very bare-bones and not much works/exists. If you have ideas / know how to improve it, please contact me.

> :warning: At the moment, there is no official website for this at the moment.

## Related projects

- [Syrenity Client](https://github.com/itevie/syrenity-api-client)
- [Dawn UI](https://github.com/itevie/dawn-ui)

## Running yourself

1. Download the repository
2. Install [NodeJS](https://nodejs.org/en) and [PostgreSQL](https://www.postgresql.org/) on your system
3. Initialise the project
    - Create a database called `syrenity`: `psql -c "CREATE DATABASE syrenity;"`
    - Load the schema `psql -d syrenity /path/to/project/schema.sql`
4. Run `npm install`
5. Run `git submodule update --init --recursive`
6. Start it with `npx ts-node src/index.ts`

## Issues

If you find any issues with any part of the project, please either open an issue, or contact me. Make sure to include as much details about the issue as you can.
