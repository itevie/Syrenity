CREATE TABLE invites (
    id TEXT PRIMARY KEY,
    guild_id INT REFERENCES guilds(id),
    channel_id INT REFERENCES channels(id) DEFAULT null,
    created_by INT REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_in INT DEFAULT 604800000,
    max_uses INT DEFAULT NULL,
    uses INT DEFAULT 0 NOT NULL
);

CREATE TABLE assigned_roles (
    member_id INT REFERENCES users(id) NOT NULL,
    role_id INT REFERENCES roles(id) NOT NULL,
    guild_id INT REFERENCES guilds(id) NOT NULL
);