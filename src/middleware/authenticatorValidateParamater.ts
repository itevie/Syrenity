import express from "express";
import { ParameterDetails } from "../types/route";
import * as database from "../util/database";
import { canView } from "../util/permissionChecker";
import AuthenticationError from "../errors/AuthenticationError";

export default async function validateURLParameters(
    req: express.Request,
    res: express.Response,
    params: { [key: string]: ParameterDetails }
): Promise<void | AuthenticationError> {
    // Loop through the params to test
    for (const i in params) {
        const paramTest = params[i];
        let param = req.params[i];

        // Check the is
        if (paramTest.is) {
            // The param should be int
            if (isNaN(parseInt(param)) && !["invite", "file"].includes(paramTest.is)) {
                // If the route is @me and is = user it's fine
                if (param !== "@me" || paramTest.is !== "user") {
                    return new AuthenticationError({
                        message: `param ${i} must be of type integer (${paramTest.is})`,
                        at: `param.${i}`,
                        statusCode: 400,
                        errorCode: "UrlParameterTypeError",
                    });
                }
            }

            // Get the action to perform
            const action: ((id: string) => Promise<boolean | AuthenticationError>) | undefined = {
                "user": async (_id: string): Promise<boolean | AuthenticationError> => {
                    const id = parseInt(_id);
                    // Check if @me is required
                    if (
                        paramTest.mustBeSelf === true
                        && (
                            param !== "@me"
                            && param !== (req.user as FullUser)?.id.toString()
                        )
                    ) return new AuthenticationError({
                        message: `@me must be used for this route`,
                        at: `params.${i}`,
                        statusCode: 400,
                        errorCode: "MustBeSelfForParameter",
                    });

                    // Check if @me is used, but there is no one logged in
                    if (param === "@me" && !req.user) {
                        return new AuthenticationError({
                            message: `Used @me in parameter, but no one is logged in`,
                            at: `params.${i}`,
                            statusCode: 400,
                            errorCode: "NotLoggedIn",
                        });
                    } else if (param === "@me") {
                        // Modify given param
                        param = "" + (req.user as FullUser).id;
                        req.params[i] = param;
                    }

                    return await database.actions.users.exists(parseInt(param));
                },
                "guild": (param: string) => database.actions.guilds.exists(parseInt(param)),
                "channel": (param: string) => database.actions.channels.exists(parseInt(param)),
                "message": (param: string) => database.actions.messages.exists(parseInt(param)),
                "invite": (param: string) => database.actions.invites.exists(param),
            }[paramTest.is];

            // Check if it worked
            if (!action) {
                console.error(`The param test for ${paramTest.is} is not handled`);
                process.exit(1);
            }

            // Run it
            let result = await action(param);

            // Validate it
            if (result !== true) {
                // Check if the result returned an error
                if (result !== false) {
                    return result;
                } else {
                    return new AuthenticationError({
                        message: `The ${paramTest.is} ${param} does not exist`,
                        at: `params.${i}`,
                        statusCode: 404,
                        errorCode: "NonexistentResource",
                    });
                }
            }
        }

        // Check canview
        if ((!("canView" in paramTest) || paramTest.canView) && req.params[i] !== "-1") {
            let ableToView = await canView(req.user as User, paramTest.is as Resource, parseInt(req.params[i]));

            if (!ableToView) {
                return new AuthenticationError({
                    message: `You do not have permission to view the ${paramTest.is} ${req.params[i]}`,
                    at: `params.${i}`,
                    statusCode: 401,
                    errorCode: "NotAllowedToViewResource"
                });
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
                    return new AuthenticationError({
                        message: `The message ${message.id} is not from the channel ${req.params[paramTest.mustBeFrom]}`,
                        at: `params.${i}`,
                        statusCode: 401,
                        errorCode: "InvalidUrl",
                    });
                }
            } else {
                console.error(`Cannot compare ${paramTest.is} and ${otherThing.is} for mustBeFrom`);
                process.exit(0);
            }
        }
    }
}