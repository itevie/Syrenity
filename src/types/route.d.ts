import express from "express";
import * as Ajv from "ajv";

type HttpMethods = "GET" | "POST" | "DELETE" | "PATCH" | "PUT" | "HEAD";
type ExpressRequestLambda = (req: express.Request, res: express.Response) => void;

interface RouteDetails<B = unknown> {
    method: HttpMethods,
    path: string,
    alternatePaths?: string[],
    handler: express.RequestHandler,

    params?: {[key: string]: ParameterDetails},
    query?: {[key: string]: QueryDetails},
    auth?: AuthenticationDetails,
    body?: Ajv.JSONSchemaType<B>
}

interface AuthenticationDetails {
    loggedIn?: boolean,
    allowBots?: boolean,
    botsOnly?: boolean,
}

interface ParameterDetails {
    is?: Resource;
    canView?: boolean;
    mustBeSelf?: boolean;
    mustBeFrom?: string,
}

type QueryOptions = "positiveNumber";
interface QueryDetails {
    type: "number" | "boolean",
    optional?: boolean,
    defaultValue?: string,
    options?: QueryOptions[]
}