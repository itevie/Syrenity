const config = {
  /** Settings for the actual HTTP server */
  server: {
    /** The port the HTTP server should listen on */
    port: 3000,

    /** The maximum body size the server will accept */
    bodyLimit: "5mb",

    /** Settings to do with the routes */
    routes: {
      /** The default version to use for routes.
       * If there is a v1, v2, v3 of a route, and the default is 2, then v2 will be chosen.
       */
      defaultVersion: 2,
    },
  },

  /** Settings to do with the system user account */
  system: {
    id: -1,
  },

  /** Database settings */
  database: {
    /** The connection string for the postgres database */
    constring: "postgres://postgres:postgres@127.0.0.1:5432/syrenity",

    /** The connection string for the testing environment */
    testconstring: "postgres://postgres:postgres@127.0.0.1:5432/syrenity-test",
  },

  /** File settings */
  files: {
    /**
     * Image sizes to allow when accessing files with the ?size parameter.
     * For example: /files/uuid?size=2048
     */
    allowedCustomSizes: [32, 64, 128, 256, 512, 1024, 2048],
  },

  /**
   * Proxy settings
   * The proxy is a safety-net so the user doesn't have to load any URLs.
   */
  proxy: {
    /** Whether or not proxied files should be saved to disk (at ../files/yyyy-mm-dd/file-name.ext) */
    saveLocally: true,
  },

  /** Websocket settings */
  ws: {
    /** How often the server should ask the client if it's still alive */
    heartbeatInterval: 30000,
  },

  // These are all for settings of what is valid for certain pieces ofdata
  validity: {
    username: {
      minLength: 1,
      maxLength: 30,
      pattern: "[a-zA-Z0-9\\._\\-]",
    },

    messages: {
      minLength: 1,
      maxLength: 4000,
    },

    files: {
      nameRegex: "[a-zA-Z0-9]{1,50}(\\.[a-z0-9]{1,7}){1,3}",
    },

    roles: {
      name: {
        minLength: 1,
        maxLength: 30,
      },
    },
    servers: {
      name: {
        minLength: 1,
        maxLength: 30,
      },
    },
    channels: {
      name: {
        minLength: 1,
        maxLength: 20,
      },
      topic: {
        minLength: 1,
        maxLength: 2000,
      },
    },
  },

  defaults: {
    roles: {
      name: "new-role",
      color: null,
      bitfield_allow: 0,
      bitfield_deny: 0,
      rank: -1000000,
    },
  },
} as const;

export default config;
