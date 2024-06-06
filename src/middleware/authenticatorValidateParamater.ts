import express from "express";
import { ParameterDetails } from "../types/route";
import { AuthenticationError } from "./authenticator";
import * as database from "../util/database";
import { canView } from "../util/permissionChecker";

export default async function validateURLParameters(
    req: express.Request,
    res: express.Response,
    params: {[key: string]: ParameterDetails}
): Promise<boolean | AuthenticationError> {
    // Loop through the params to test
    for (const i in params) {
        const paramTest = params[i];
        let param = req.params[i];

        // Check the is
        if (paramTest.is) {
            // The param should be int
            if (isNaN(parseInt(param))) {
                // If the route is @me and is = user it's fine
                if (param !== "@me" || paramTest.is !== "user") {
                    return {
                        message: `param ${i} must be of type integer (${paramTest.is})`,
                        at: `param.${i}`,
                        status: 400,
                    };
                } 
            }

            // Get the action to perform
            const action: ((id: number) => Promise<boolean | AuthenticationError>) | undefined = {
                "user": async (id: number): Promise<boolean | AuthenticationError> => {
                    // Check if @me is required
                    if (
                        paramTest.mustBeSelf === true
                        && (
                            param !== "@me"
                            && param !== (req.user as FullUser)?.id.toString()
                        )
                    ) return {
                        message: `@me must be used for this route`,
                        at: `params.${i}`,
                        status: 400,
                    };

                    // Check if @me is used, but there is no one logged in
                    if (param === "@me" && !req.user) {
                        return {
                            message: `Used @me in parameter, but no one is logged in`,
                            at: `params.${i}`,
                            status: 400,
                        }
                    } else if (param === "@me") {
                        // Modify given param
                        param = "" + (req.user as FullUser).id;
                        req.params[i] = param;
                    }

                    return await database.actions.users.exists(parseInt(param));
                },
                "guild": database.actions.guilds.exists,
                "channel": database.actions.channels.exists,
                "message": database.actions.messages.exists
            }[paramTest.is];

            // Check if it worked
            if (!action) {
                console.error(`The param test for ${paramTest.is} is not handled`);
                process.exit(1);
            }

            // Run it
            let result = await action(parseInt(param));

            // Validate it
            if (result !== true) {
                // Check if the result returned an error
                if (result !== false) {
                    return result;
                } else {
                    return {
                        message: `The ${paramTest.is} ${param} does not exist`,
                        at: `params.${i}`,
                        status: 404,
                    }
                }
            }
        }

        // Check canview
        if (!("canView" in paramTest) || paramTest.canView) {
            let ableToView = await canView(req.user as User, paramTest.is as Resource, parseInt(req.params[i]));

            if (!ableToView) {
                return {
                    message: `You do not have permission to view the ${paramTest.is} ${req.params[i]}`,
                    at: `params.${i}`,
                    status: 401,
                };
            }
        }
    }

    // Now that it has been validated, check the mustBeFrom's
    for (const i in params) {
        const paramTest = params[i];
        let param = req.params[i];

        // Check for mustBeFrom
        if (paramTest.mustBeFrom) {
            // Get the other thing
            let otherThing = params[paramTest.mustBeFrom];

            // Check for message in channel
            if (paramTest.is === "message" && otherThing.is === "channel") {
                // Fetch the message
                let message = await database.actions.messages.fetch(parseInt(param));

                // Compare IDs
                if (message.channel_id !== parseInt(req.params[paramTest.mustBeFrom])) {
                    return {
                        message: `The message ${message.channel_id} is not from the channel ${req.params[paramTest.mustBeFrom]}`,
                        at: `params.${i}`,
                        status: 401,
                    };
                }
            } else {
                console.error(`Cannot compare ${paramTest.is} and ${otherThing.is} for mustBeFrom`);
                process.exit(0);
            }
        }
    }

    return true;
}