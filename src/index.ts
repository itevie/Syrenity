import express from "express";
import expressWs from "express-ws";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import connectPostgres from "connect-pg-simple";
import passport from "passport";

import Logger from "./util/Logger";
import config from "./config.json";
import {
  actions,
  initialise as initialiseDatabase,
  query,
  quickQuery,
} from "./util/database";
import { initialise as initialiseWs, send } from "./ws/websocketUtil";
import { loadRoutes } from "./util/routeManager";
import requestLogger from "./middleware/requestLogger";
import { hasPermission } from "./util/permissionChecker";
import { defaultBitfield } from "./util/PermissionBitfield";
import ErrorHandler from "./middleware/ErrorHandler";
import { generateToken } from "./util/util";
import database from "./database/database";

// Basic setup
const logger = new Logger("server");
logger.log("Preparing server");
const pgSession = connectPostgres(session);
Error.stackTraceLimit = 10_000;
export const fileStoreLocation = path.resolve(
  path.join(__dirname, "/../files")
);

// Create the express app
const app = expressWs(express()).app;

app.use(requestLogger);
// Setup static files
app.use("/public", express.static(path.join(__dirname, "/client/build")));

// Setup other middleware
app.use(cors());
app.use(bodyParser.urlencoded());
app.use(
  bodyParser.json({
    limit: config.server.bodyLimit,
  })
);

// Setup passport
app.use(
  session({
    store: new pgSession({
      conString: config.database.constring,
      tableName: "sessions",
    }),
    secret: "dog food",
    resave: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Load auths
require("./auth/local");

// Finialise passport
app.use(passport.initialize());
app.use(passport.session());

// Final setup
(async () => {
  await initialiseDatabase();
  await database.initialise(config.database.constring);
  initialiseWs(app);
  loadRoutes(app);

  // @ts-ignore
  app.use(ErrorHandler);

  // Start express server
  app.listen(config.server.port, async () => {
    logger.log(
      `Listening on port ${config.server.port} (http://localhost:${config.server.port}/)`
    );
  });

  // Check args
  const args = process.argv[2] || "";

  if (args.includes("e")) {
    logger.log(`Resetting @everyone's`);

    // Reset everyone roles
    await quickQuery(
      `UPDATE roles SET bitfield_allow = ${defaultBitfield}, bitfield_deny = 0 WHERE is_everyone = true;`
    );
  }
})();
