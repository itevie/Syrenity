import express from "express";
import path from "path";
import { getAllFiles } from "./util";
import { RouteDetails } from "../types/route";
import Logger from "./Logger";
import authenticate from "../middleware/authenticator";
import config from "../config";

const logger = new Logger("route-manager");
export const routes: { [key: string]: RouteDetails } = {};

export function loadRoutes(app: express.Application): void {
  // Get the route files
  const routeFiles = getAllFiles(path.join(__dirname + "/../routes"));

  // Function to load the given path
  const loadRoute = (route: RouteDetails) => {
    app[route.method.toLowerCase()](
      route.path,
      authenticate,
      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        try {
          await route.handler(req, res, next);
        } catch (err) {
          next(err);
        }
      }
    );
    routes[
      `${route.method.toUpperCase()} ${route.path.replace(/:[a-zA-Z]+/g, "[^\\/]+")}`
    ] = route;

    logger.log(`Loaded route ${route.method} ${route.path}`);
  };

  const versionDefaults: { [key: string]: [number, RouteDetails] } = {};

  for (const routeFile of routeFiles) {
    // Check if should skip (name's starting with _)
    if (routeFile.match(/(_[a-zA-Z0-9\-_]+\.ts)$/)) {
      continue;
    }

    // Import the route dynamically
    const route = require(routeFile).default as RouteDetails;

    if (routeFile.match(/api\/v[0-9]+/)) {
      let version = parseInt(routeFile.match(/api\/v([0-9]+)/)?.[1] as string);
      if (version === 0) continue;

      const id = `${route.method} ${route.path}`;

      if (
        versionDefaults[id] &&
        (version === config.server.routes.defaultVersion ||
          versionDefaults[id][0] < version)
      ) {
        versionDefaults[id][1] = route;
      } else versionDefaults[id] = [version, route];
      route.path = `/api/v${version}${route.path}`;
    }

    // Load base path
    loadRoute(route);

    // Load alternate paths
    if (route.alternatePaths) {
      for (const path of route.alternatePaths) {
        loadRoute({ ...route, path: path });
      }
    }
  }

  // Load default version routes
  logger.log("Loading default versiond routes");
  for (const path in versionDefaults) {
    loadRoute({
      ...versionDefaults[path][1],
      path: `${versionDefaults[path][1].path.replace(/\/v[0-9]+/, "")}`,
    });
  }
}
