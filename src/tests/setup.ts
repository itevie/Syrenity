import pg from "pg";
import config from "../config";
import { writeFileSync } from "fs";
import Logger, { addToLoggerWhitelist, loggerWhitelist } from "../util/Logger";
import { execSync } from "child_process";
import axios from "axios";
import resources from "./resources";
import { getAllFiles } from "../util/util";
import Test from "./test";

const constring = config.database.constring;
const testConstring = constring.replace(/\/syrenity$/, "/syrenity_test");

addToLoggerWhitelist("testing");
const logger = new Logger("testing");

// Load tests
logger.log(`Loading all tests...`);
const tests: Test[] = [];
const files = getAllFiles(__dirname + "/tests");
for (const file of files) {
  const test = require(file);
  tests.push(test.default as Test);
}
logger.log(`Loaded ${tests.length} tests`);

(async () => {
  (config.database.constring as any) = testConstring;

  // Dump
  logger.log(`Connected, dumping schema...`);
  const result = execSync(`pg_dump --schema-only ${constring}`);
  writeFileSync(
    __dirname + "/dump.sql",
    result.toString() +
      Object.entries(resources)
        .map((x) => x[1].setup)
        .join("\n")
  );
  logger.log(`Dumped schema to ./dump.sql`);

  const systemClient = new pg.Client({
    connectionString: constring.replace(/\/syrenity$/, "/postgres"),
  });

  // Connect to system & create test db
  await systemClient.connect();
  logger.log(`Connected to system database for creating test database`);
  await systemClient.query(`DROP DATABASE IF EXISTS syrenity_test;`);
  await systemClient.query(`CREATE DATABASE syrenity_test;`);
  await systemClient.end();

  // Connect to test
  logger.log(`Initialising syrenity_test`);
  const testClient = new pg.Client({
    connectionString: testConstring,
  });
  execSync(`psql ${testConstring} < ${__dirname}/dump.sql`, {});
  logger.log(`Schema restored to 'syrenity_test'`);

  await testClient.end();

  // Start server
  logger.log(`Starting main server`);
  require(__dirname + "/../index.ts");
  logger.log(`Waiting 3s...`);

  setTimeout(async () => {
    logger.log(`Now starting tests...`);

    for await (const test of tests) {
      const id = `${test.name}:${test.group}`;
      const result = await test.run();
      if (result !== true) {
        logger.error(`Test ${id} failed: ${result}`);
      } else {
        logger.success(`Test ${id} succeeded!`);
      }
    }

    logger.log(`Tests complete, killing self.`);
    process.exit(0);
  }, 3000);
})();
