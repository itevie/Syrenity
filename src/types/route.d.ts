import express from 'express';
import * as Ajv from 'ajv';

type HttpMethods = "GET" | "POST" | "DELETE" | "PATCH" | "PUT" | "HEAD";
type ExpressRequestLambda = (req: express.Request, res: express.Response) => void;

/**
 * Describes a server route
 */
interface RouteDetails {
  /* Route details */
  method: HttpMethods;
  path: string;
  alternatePaths?: string[];
  handler: express.RequestHandler;

  details?: {
    auth?: {
      loggedIn?: boolean;
      allowBots?: boolean;
    },

    params?: {[key: string]: ParameterDetails}

    body?: {
      schema: Ajv.JSONSchemaType<unknown>
    };

    permissions?: {
      required: number[];
      channelParam?: string;
      skipIfRelationship?: boolean;
    }

    ratelimit?: {
      amount: number;
      every: {
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
      } | undefined;
    }

    query?: {[key: string]: QueryDetails};
  }
}

interface QueryDetails {
  type: 'integer' | 'string' | 'boolean';
  options?: string[] | number[] | boolean[];
  optional?: boolean;
  default?: string | number;
}

interface ParameterDetails {
  is?: 'guild' | 'channel' | 'user' | 'message' | 'role';
  canView?: boolean;
  mustBeSelf?: boolean;
}