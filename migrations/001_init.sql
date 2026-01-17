-- Migration: 001_init.sql
-- Description: Setup lookup tables for localized music metadata

CREATE TABLE IF NOT EXISTS locales (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'en', 'de', 'uk'
    region_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS genre_lookup (
    id SERIAL PRIMARY KEY,
    locale_id INTEGER REFERENCES locales(id),
    genre_name VARCHAR(100) NOT NULL
);

-- Example Data for English
INSERT INTO locales (code, region_name) VALUES ('en', 'English (USA)');
INSERT INTO genre_lookup (locale_id, genre_name) VALUES (1, 'Rock'), (1, 'Synthwave'), (1, 'Jazz');

-- Example Data for German
INSERT INTO locales (code, region_name) VALUES ('de', 'German (Germany)');
INSERT INTO genre_lookup (locale_id, genre_name) VALUES (2, 'Schlager'), (2, 'Klassik'), (2, 'Elektronisch');