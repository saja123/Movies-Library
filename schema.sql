DROP TABLE IF EXISTS Movie;

CREATE TABLE Movie(
id SERIAL PRIMARY KEY,
title varchar(255),
release_date varchar(255),
poster_path varchar(255),
overview varchar(255)
);