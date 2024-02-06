import express from "express";
import path from "path";
import getAllFiles from "./getAllFiles";
import Logger from "../Logger";
import { RouteDetails } from "../types/route";
import authenticate from "../middlware/authenticator";

const logger = new Logger("Routes");

const routes: {[key: string]: RouteDetails} = {};

/**
 * Loads all the routes in the routes directory
 */
export default (app: express.Application) => {
  // Get the route files
  const routeFiles = getAllFiles(path.join(__dirname, "/../routes"));

  // Loop through routes
  for (const routeFile of routeFiles) {
    // Import the route
    const route = require(routeFile).default as RouteDetails;

    const loadRoute = (path: string) => {
      app[route.method.toLowerCase()](path, authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
          await route.handler(req, res, next);
        } catch (err) {
          next(err);
        }
      });
      routes[`${route.method.toUpperCase()} ${path.replace(/:[a-zA-Z]+/g, "[^\\\\]+")}`] = route;
  
      logger.log(`Loaded route ${path}`);
    }
    
    loadRoute(route.path);

    if (route.alternatePaths) {
      for (let i in route.alternatePaths) {
        loadRoute(route.alternatePaths[i]);
      }
    }
  }
}

export {routes};