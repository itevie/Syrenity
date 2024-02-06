CREATE TABLE files (
	id SERIAL PRIMARY KEY,
  -- Specifies the content type of this file
	type TEXT NOT NULL DEFAULT 'image/png',

  -- This is not really the encoding, base64 is used for files, however it may also be "link" for eexample
	encoding TEXT NOT NULL DEFAULT 'base64',
	content TEXT NOT NULL,
	name TEXT,

  -- The source of the file, for example an artist's page
	source TEXT DEFAULT NULL,
	alt TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);