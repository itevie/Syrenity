import Ajv, { JSONSchemaType } from "ajv"
require("ajv-errors");
import bcrypt from 'bcrypt';

import { RouteDetails } from "../../types/route";
import config from '../../config.json';
import * as database from '../../database';
import { createDiscriminator } from "../../util/simple";

interface RegisterBody {
  username: string;
  password: string;
  email: string;
}

export default {
  method: "POST",
  path: "/api/register",
  handler: async (req, res) => {
    const body = req.body as RegisterBody;

    // Collect details
    const username = body.username;
    const givenPassword = body.password;
    const email = body.email;

    // Check if email already exists
    if (await database.actions.users.emailExists(email)) {
      return res.status(400).send({
        message: `This email already exists`,
        at: "email"
      });
    }
    
    // Fetch the discriminators for the username
    const disciminators = await database.actions.users.fetchDiscriminatorsForusername(username);

    // Check if there is too many
    if (disciminators.length > 9995) {
      return res.status(400).send({
        message: `Too many people have this username`,
        at: "username"
      });
    }

    // Generate new
    let newDiscrim = createDiscriminator();

    while (disciminators.includes(newDiscrim)) {
      newDiscrim = createDiscriminator();
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(givenPassword, salt);

    // TODO: Add email verification

    // Create user
    await database.actions.users.createUser(username, password, email, newDiscrim);

    return res.status(200).send({
      message: "Account created!"
    });
  },
  details: {
    auth: {
      allowBots: false,
    },

    body: {
      schema: {
        type: "object",
        properties: {
          username: {
            type: "string",
            maxLength: config.validity.usernames.maxLength,
            minLength: config.validity.usernames.minLength,
            pattern: config.validity.usernames.validCharacters,
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 100,
          },
          email: {
            type: "string",
            format: "email",
          },
        },
        required: ["username", "email", "password"],
        errorMessage: {
          properties: {
            username: `Username must be ${config.validity.usernames.minLength}-${config.validity.usernames.maxLength} in length and can only contain ${config.validity.usernames.validCharacters.replace(/[\[\]\\]/g, "")}`,
            password: `Password must be at least 8 characters long`,
            email: `A valid email must be provided`
          }
        }
      } as JSONSchemaType<RegisterBody>
    }
  }
} as RouteDetails