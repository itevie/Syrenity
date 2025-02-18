const resources = {
  normalUser: {
    id: 1,
    setup: `
      INSERT INTO public.users (id, username, password) VALUES (1, 'normal-user', 'null');
      INSERT INTO public.tokens (token, account) VALUES ('normal-user', 1);
    `,
  },

  privateServerOwner: {
    id: 2,
    setup: `INSERT INTO public.users (id, username, password) VALUES (2, 'private-server-owner', 'null');`,
  },

  privateServer: {
    id: 1,
    setup: `INSERT INTO public.guilds (id, name, owner_id) VALUES (1, 'private-server', 2);`,
  },

  privateServerChannel: {
    id: 1,
    setup: `INSERT INTO public.channels (id, type, guild_id) VALUES (1, 'channel', 1);`,
  },
} as const;

export default resources;
