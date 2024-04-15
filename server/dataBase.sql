CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL UNIQUE,
    passhash VARCHAR(255) NOT NULL
);


INSERT INTO users(username, passhash) VALUES ($1, $2);
