-- Cardie Database Schema
-- Run this file first to create all tables.

CREATE DATABASE IF NOT EXISTS cardie
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cardie;

CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(7)   DEFAULT '#6366f1',
  description TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  deck_id      INT          NOT NULL,
  question     TEXT         NOT NULL,
  answer       TEXT         NOT NULL,
  image_path   VARCHAR(255),
  ease_count   INT          DEFAULT 0,
  hard_count   INT          DEFAULT 0,
  missed_count INT          DEFAULT 0,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id               INT          AUTO_INCREMENT PRIMARY KEY,
  deck_id          INT          NOT NULL,
  easy_count       INT          DEFAULT 0,
  hard_count       INT          DEFAULT 0,
  missed_count     INT          DEFAULT 0,
  total_cards      INT          DEFAULT 0,
  accuracy_percent DECIMAL(5,2),
  studied_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);
