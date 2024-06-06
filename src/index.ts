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
import { actions, initialise as initialiseDatabase } from "./util/database";
import { initialise as initialiseWs, send } from "./ws/websocketUtil";
import { loadRoutes } from "./util/routeManager";
import requestLogger from "./middleware/requestLogger";

// Basic setup
const logger = new Logger("server");
logger.log("Preparing server");
const pgSession = connectPostgres(session);
Error.stackTraceLimit = 10_000;

// Create the express app
const app = expressWs(express()).app;

// Setup static files
app.use("/", express.static(
    path.join(__dirname, "/public")
));

// Setup other middleware
app.use(cors());
app.use(requestLogger);
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({
    limit: config.server.bodyLimit
}));

// Setup passport
app.use(
    session({
        store: new pgSession({
            conString: config.database.constring,
            tableName: "sessions"
        }),
        secret: "dog food",
        resave: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        }
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
    initialiseWs(app);
    loadRoutes(app);

    // Start express server
    app.listen(config.server.port, () => {
        logger.log(`Listening on port ${config.server.port} (http://localhost:${config.server.port}/)`);
    });
})();