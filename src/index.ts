import express from "express";
import expressWs from "express-ws";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import connectPostgres from "connect-pg-simple";
import passport from "passport";
import "dotenv/config";

import Logger from "./util/Logger";
import config from "./config";
import { initialise as initialiseDatabase, quickQuery } from "./util/database";
import { initialise as initialiseWs } from "./ws/websocketUtil";
import { loadRoutes } from "./util/routeManager";
import requestLogger from "./middleware/requestLogger";
import { defaultBitfield } from "./util/PermissionBitfield";
import ErrorHandler from "./middleware/ErrorHandler";
import { initialise, query } from "./database/database";
import SyServer, { DatabaseServer } from "./models/Servers";

// Basic setup
const logger = new Logger("server");
logger.log("Preparing server");
const pgSession = connectPostgres(session);
Error.stackTraceLimit = 10_000;
export const fileStoreLocation = path.resolve(
  path.join(__dirname, "/../files"),
);

// Create the express app
const app = expressWs(express()).app;

app.use(requestLogger);
// Setup static files
app.use(
  "/public",
  express.static(path.resolve(path.join(__dirname, "client/build"))),
);

// Setup other middleware
app.use(cors());
app.use(bodyParser.urlencoded());
app.use(
  bodyParser.json({
    limit: config.server.bodyLimit,
  }),
);

if (!process.env.DB_CONSTRING) {
  throw new Error("Missing DB_CONSTRING in env");
}

// Setup passport
app.use(
  session({
    store: new pgSession({
      conString: process.env.DB_CONSTRING,
      tableName: "sessions",
    }),
    secret: "dog food",
    resave: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }),
);

// Load auths
require("./auth/local");

// Finialise passport
app.use(passport.initialize());
app.use(passport.session());
if (require.main === module) {
  // Final setup
  (async () => {
    await initialiseDatabase();
    await initialise(process.env.DB_CONSTRING!);
    initialiseWs(app);
    loadRoutes(app);

    // @ts-ignore
    app.use(ErrorHandler);

    // Start express server
    app.listen(config.server.port, async () => {
      logger.log(
        `Listening on port ${config.server.port} (http://localhost:${config.server.port}/)`,
      );
    });

    const servers = (
      await query<DatabaseServer>({
        text: "SELECT * FROM guilds",
        values: [],
      })
    ).rows.map((x) => new SyServer(x));
    for await (const server of servers) {
      await server.organiseChannels();
    }

    // Check args
    const args = process.argv[2] || "";

    if (args.includes("e")) {
      logger.log(`Resetting @everyone's`);

      // Reset everyone roles
      await quickQuery(
        `UPDATE roles SET bitfield_allow = ${defaultBitfield}, bitfield_deny = 0 WHERE is_everyone = true;`,
      );
    }
  })();
}
