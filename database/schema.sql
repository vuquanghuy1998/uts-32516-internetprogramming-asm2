-- Cardie A2 Database Schema
-- Run this file first to create all tables.

CREATE DATABASE IF NOT EXISTS cardie
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cardie;

CREATE TABLE IF NOT EXISTS users (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  username                 VARCHAR(50)  NOT NULL UNIQUE,
  email                    VARCHAR(150) NOT NULL UNIQUE,
  password_hash            VARCHAR(255) NOT NULL,
  role                     ENUM('admin', 'user') DEFAULT 'user',
  full_name                VARCHAR(100),
  bio                      TEXT,
  avatar_url               VARCHAR(255),
  theme_preference         ENUM('light', 'dark', 'system') DEFAULT 'system',
  is_active                BOOLEAN DEFAULT TRUE,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login               TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(7)   DEFAULT '#6366f1',
  description TEXT,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decks (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT          NOT NULL,
  category_id       INT,
  name              VARCHAR(150) NOT NULL,
  description       TEXT,
  cover_image_path  VARCHAR(255),
  cover_image_type  ENUM('preset', 'upload') DEFAULT 'preset',
  style_bg_color    VARCHAR(7)   DEFAULT '#ffffff',
  style_text_color  VARCHAR(7)   DEFAULT '#1a1a2e',
  style_font_size   ENUM('small', 'medium', 'large') DEFAULT 'medium',
  style_font_family ENUM('sans', 'serif', 'mono', 'decorative') DEFAULT 'sans',
  style_border_style ENUM('none', 'rounded', 'sharp') DEFAULT 'rounded',
  created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
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
  user_id          INT          NOT NULL,
  deck_id          INT          NOT NULL,
  easy_count       INT          DEFAULT 0,
  hard_count       INT          DEFAULT 0,
  missed_count     INT          DEFAULT 0,
  total_cards      INT          DEFAULT 0,
  accuracy_percent DECIMAL(5,2),
  studied_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (deck_id) REFERENCES decks(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(50) NOT NULL,
  user_id INT         NOT NULL,
  color   VARCHAR(7)  DEFAULT '#6366f1',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS card_tags (
  card_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (card_id, tag_id),
  FOREIGN KEY (card_id) REFERENCES flashcards(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)        ON DELETE CASCADE
);
