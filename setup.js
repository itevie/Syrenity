const pg = require("pg");
const fs = require("fs");
const config = require("./src/config.json");

const client = new pg.Client(config.database.constring);

(async () => {
    await client.connect();
    await client.query(fs.readFileSync("./sql/setup.sql", "utf-8"), []);
    console.log("done");
    process.exit(0);
})();