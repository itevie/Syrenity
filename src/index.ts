// Imports - packages
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import hbs from 'hbs';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import connectPostgres from 'connect-pg-simple';
import expressWs from 'express-ws';

// Imports - local
import Logger from './Logger';
import config from './config.json';
import payloadTooLargeMiddlware from './middlware/payloadTooLargeError';
import requestLogger from './middlware/requestLogger';
import * as database from './database';
import loadRoutes from './util/loadRoutes';
import { initialise as initialiseWs } from './ws/ws';
import authenticator from './middlware/authenticator';
import errorHandler from './middlware/errorHandler';
import { updateGuildEveryones } from './util/permissions';

// Setup
const logger = new Logger('server');
logger.log("Preparing server...");
const pgSession = connectPostgres(session);
Error.stackTraceLimit = 100000;

// Create express app
const app = expressWs(express()).app;

// Setup app
app.use(requestLogger);

// Setup static files
app.use("/public/js/app/syrenity", express.static(path.join(__dirname + "../../../Syrenity 2.1 Client/build")));
app.use('/', express.static(path.join(__dirname, "/public")));

// Setup other middleware
app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json({
  limit: config.server.body_limit
}));
app.use(payloadTooLargeMiddlware);

// Setup passport
app.use(
  session({
    store: new pgSession({
      conString: config.database.constring,
      tableName: 'sessions',
    }),
    secret: 'dog food',
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  })
);

// Load auths
require("./auth/local");

// Finialise passport
app.use(passport.initialize());
app.use(passport.session());

// Set up handlebars
hbs.registerPartials(path.join(__dirname, "/views/partials"));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/views"));

// Final setup
(async () => {
  // Initialise database
  await database.initialise();
  await updateGuildEveryones();

  // Initialise routes
  await initialiseWs(app);
  await loadRoutes(app)
  app.use(errorHandler);

  // Start express server
  app.listen(config.server.port, () => {
    logger.log(`Server listening on port ${config.server.port}`);

    // Finally initialise error handler
  });
})();
