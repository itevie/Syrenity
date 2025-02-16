const config = {
  // Settings for the server itself
  server: {
    // Max size for the body of HTTP requests
    bodyLimit: "5mb",

    // The port the server should listen on
    port: 3000,

    routes: {
      // The default version to use for routes
      // If it is 2, and there is a v1 and v3 of the route, it will pick v2
      defaultVersion: 2,
    },
  },

  // Settings for the database
  database: {
    // Where the database is stored
    constring: "postgres://postgres:postgres@127.0.0.1:5432/syrenity",
  },

  // Settings for files
  files: {
    // The allowed sizes for the ?size query
    allowedCustomSizes: [32, 64, 128, 256, 512, 1024, 2048],
  },

  // Settings for the proxy where files can be loaded without the client having to load them theirself
  proxy: {
    // Whether or not to save proxied files to the disk
    saveLocally: true,
  },

  // Settings for the web socket
  ws: {
    // How often to check if the client is still responsive
    heartbeat_interval: 30000,
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
