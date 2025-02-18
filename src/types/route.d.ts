import express from "express";
import * as Ajv from "ajv";

type HttpMethods = "GET" | "POST" | "DELETE" | "PATCH" | "PUT" | "HEAD";
type ExpressRequestLambda = (
  req: express.Request,
  res: express.Response
) => void;

declare module "express-serve-static-core" {
  interface Request {
    user: User;
  }
}

interface RouteDetails<B = unknown> {
  method: HttpMethods;
  path: string;
  alternatePaths?: string[];
  handler: express.RequestHandler;

  params?: { [key: string]: ParameterDetails };
  query?: { [key: string]: QueryDetails };
  auth?: AuthenticationDetails;
  body?: Ajv.JSONSchemaType<B>;
  permissions?: PermissionDetails;
}

interface PermissionDetails {
  permissions: number;
  guildParam?: string;
  channelParam?: string;
  userParam?: string;
  unlessSelf?: boolean;
}

interface AuthenticationDetails {
  loggedIn?: boolean;
  botsOnly?: boolean;
  disallowBots?: boolean;
  sessionOnly?: boolean;
}

interface ParameterDetails {
  is?: Resource;
  canView?: boolean | null;
  mustBeSelf?: boolean;
  mustBeFrom?: string;
}

type QueryOptions = "positiveNumber";
interface QueryDetails {
  type: "number" | "boolean" | "string";
  optional?: boolean;
  defaultValue?: string;
  options?: QueryOptions[];
}
