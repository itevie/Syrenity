import express from "express";
import { RouteDetails } from "../types/route";
import { routes } from "../util/routeManager";
import Ajv, { ValidateFunction } from 'ajv';
import ajvFormat from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import validateURLParameters from "./authenticatorValidateParamater";
import { actions } from "../util/database";

export interface AuthenticationError {
    message: string,
    at: string,
    status: number,
}
const ajv = new Ajv({ allErrors: true, $data: true });
ajvFormat(ajv);
ajvErrors(ajv);

export default async(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        // Get the url
        const url = new URL("http://localhost:3000" + req.originalUrl);
        const routeName = `${req.method.toUpperCase()} ${url.pathname}`;

        // Try to find the route
        let route: RouteDetails | null = null;

        for (const r in routes) {
            const regex = new RegExp(`^(${r})$`);
            if (regex.exec(routeName)) {
                route = routes[r];
                break;
            }
        }

        // Only attempt to authenticate if that route was found
        if (!route) return next();

        // Check for token authentication
        if (req.headers.authorization) {
            // Extract the token
            const token = req.headers.authorization.split(" ")[1];

            // Check if existent
            if (!token) {
                return res.status(400).send({
                    message: `Invalid authorization format`,
                    at: `header.authorization`
                });
            }

            // Try fetch the application
            try {
                const application = await actions.applications.fetchByToken(token);
                const user = await actions.users.fetch(application.bot_account);
                req.login(user, () => {});
                req.user = user;
            } catch {
                return res.status(400).send({
                    message: `Invalid token`,
                    at: `header.authorization`
                });
            }
        }

        // Check authentication
        if (route.auth) {
            // Check if needs to be logged in
            if (route.auth.loggedIn) {
                if (!req.user) {
                    return res.status(401).send({
                        message: `You need to be logged in to access this resource`
                    });
                }
            }
        }

        // Validation
        if (route.params) {
            const valid = await validateURLParameters(req, res, route.params);

            // Check if it was valid
            if (typeof valid !== "boolean") {
                return res.status(valid.status).send({
                    message: valid.message,
                    at: valid.at
                });
            }
        }

        // Check if body needs to be validated
        if (route.body) {
            // Compile JSON schema
            const validate = ajv.compile(route.body);

            // Check if it was valid
            const valid = validate(req.body);
            if (!valid) {
                return res.status(400).send({
                    message: `There are errors in the body of your request`,
                    errors: generateErrorFromSchemaErrors(validate)
                })
            }
        }

        next();
    } catch (err) {
        console.error(`Authentication error: `);
        console.error(err);
        next(err);
    }
}

function generateErrorFromSchemaErrors(validate: ValidateFunction) {
    const errors: {[key: string]: any} = [];

    for (const i in validate.errors) {
        errors.push({
            message: validate.errors[i].message,
            at: validate.errors[i].instancePath.replace("/", "")
        });
    }

    return errors;
}