-- Migration: make categories user-scoped
-- Run this ONCE against an existing cardie database that already has data.
-- For a fresh setup, drop and recreate from schema.sql instead.

USE cardie;

-- Step 1: add nullable user_id column
ALTER TABLE categories ADD COLUMN user_id INT NULL AFTER id;

-- Step 2: assign existing categories to the first admin user
UPDATE categories SET user_id = (SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1)
WHERE user_id IS NULL;

-- Step 3: enforce NOT NULL and add FK
ALTER TABLE categories MODIFY COLUMN user_id INT NOT NULL;
ALTER TABLE categories ADD CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
