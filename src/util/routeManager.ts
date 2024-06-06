import express from "express";
import path from "path";
import { getAllFiles } from "./util";
import { RouteDetails } from "../types/route";
import Logger from "./Logger";
import authenticate from "../middleware/authenticator";

const logger = new Logger("route-manager");
export const routes: {[key: string]: RouteDetails} = {};

export function loadRoutes(app: express.Application): void {
    // Get the route files
    const routeFiles = getAllFiles(
        path.join(__dirname + "/../routes")
    );

    for (const routeFile of routeFiles) {
        // Check if should skip (name's starting with _)
        if (routeFile.match(/(_[a-zA-Z0-9\-_]+\.ts)$/)) {
            continue;
        }

        // Import the route dynamically
        const route = require(routeFile).default as RouteDetails;

        // Function to load the given path
        const loadRoute = (path: string) => {
            app[route.method.toLowerCase()](path, authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
                try {
                    route.handler(req, res, next);
                } catch (err) {
                    next(err);
                }
            });
            routes[`${route.method.toUpperCase()} ${path.replace(/:[a-zA-Z]+/g, "[^\\/]+")}`] = route;
        
            logger.log(`Loaded route ${path}`);
        }

        // Load base path
        loadRoute(route.path);

        // Load alternate paths
        if (route.alternatePaths) {
            for (const path of route.alternatePaths) {
                loadRoute(path);
            }
        }
    }
}