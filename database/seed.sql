-- =============================================================
-- Cardie A2 Demo Data — Seed File
-- Run AFTER schema.sql to populate the database with sample data.
--
-- Admin account:  username=admin  password=Admin!@123
-- Student account: username=student  password=Student!@123
--
-- Hashes generated with passlib bcrypt (cost 12).
-- =============================================================

USE cardie;

-- -------------------------------------------------------------
-- USERS
-- -------------------------------------------------------------

INSERT INTO users (id, username, email, password_hash, role, full_name, has_completed_onboarding) VALUES
(1, 'admin',   'admin@cardie.com.au',
 '$2b$12$p/3yvupoo.ZXU3o5hv2.neamBBAS9ZtonqMSofnx7m.OIdHcJ/y.m',
 'admin', 'Cardie Admin', TRUE),
(2, 'student', 'student@cardie.com.au',
 '$2b$12$dScoZZQMhJfOs4lF3atZfuio.cwYA02lll8sAx1TVGXPLXdAvvbP6',
 'user',  'Student Demo', FALSE);

-- -------------------------------------------------------------
-- CATEGORIES (user_id required after A2 schema change)
-- -------------------------------------------------------------

INSERT INTO categories (id, user_id, name, color, description) VALUES
(1, 2, 'Internet Programming', '#6366f1',
 'UTS 31748/32516 - Programming on the Internet. Covers React, Python/FastAPI, and MySQL as taught in Autumn 2026.');

-- -------------------------------------------------------------
-- DECKS (owned by student user id=2)
-- -------------------------------------------------------------

INSERT INTO decks (id, user_id, category_id, name, description) VALUES
(1, 2, 1, 'Lecture 4 - Advanced React Hooks',
 'Covers the three core React Hooks: useState, useEffect, and useRef — including when to use each and how they interact.'),
(2, 2, 1, 'Lecture 5 - Python & FastAPI Foundations',
 'Covers Python fundamentals (strings, lists, dicts, OOP, type hints, Pydantic) and building CRUD APIs with FastAPI.'),
(3, 2, 1, 'Lecture 6 - Data Persistence with SQL',
 'Covers relational databases, MySQL, raw SQL queries with PyMySQL, and the SQLModel ORM for FastAPI.');

-- -------------------------------------------------------------
-- FLASHCARDS — Deck 1: Lecture 4 (React Hooks)
-- -------------------------------------------------------------

INSERT INTO flashcards (id, deck_id, question, answer, ease_count, hard_count, missed_count) VALUES

(1, 1,
 'What are React Hooks and what two rules must you always follow when using them?',
 'Hooks are functions that let you "hook into" React state and lifecycle features from functional components. The two rules are: (1) only call hooks at the top level of a component — never inside loops, conditions, or nested functions; (2) only call hooks from React functional components, not from regular JavaScript functions or class components.',
 3, 0, 0),

(2, 1,
 'What does the <code>useState</code> hook return, and how do you typically use it?',
 '<code>useState</code> takes an initial value and returns an array of two elements: the current state variable and a setter function to update it. You normally use array destructuring to capture both: <code>const [count, setCount] = useState(0)</code>. Calling the setter triggers a re-render with the new value.',
 2, 1, 0),

(3, 1,
 'Why must you never directly mutate a state object? What should you do instead?',
 'State objects in React are <strong>immutable</strong>. Directly mutating a property (e.g. <code>obj.key = value</code>) does not trigger a re-render. Instead, create a brand-new object that includes the updated value — commonly done with the spread operator: <code>setState(prev => ({ ...prev, key: newValue }))</code>.',
 2, 2, 1),

(4, 1,
 'What is the purpose of the <code>useEffect</code> hook and what two parameters does it accept?',
 '<code>useEffect</code> handles <strong>side effects</strong> — operations that reach outside the component''s render process. It accepts: (1) a setup function containing the side-effect logic; and (2) a dependency array — React skips re-running the effect unless one of those values changes.',
 3, 0, 0),

(5, 1,
 'What does <code>useRef</code> return, and how does it differ from <code>useState</code>?',
 '<code>useRef</code> returns a mutable object with a single <code>current</code> property. Unlike <code>useState</code>, <strong>changing <code>ref.current</code> does NOT trigger a re-render</strong>. This makes it ideal for storing values you want to track silently or for holding a direct reference to a DOM element.',
 2, 1, 1);

-- -------------------------------------------------------------
-- FLASHCARDS — Deck 2: Lecture 5 (Python & FastAPI)
-- -------------------------------------------------------------

INSERT INTO flashcards (id, deck_id, question, answer, ease_count, hard_count, missed_count) VALUES

(6, 2,
 'What is an f-string in Python and how do you write one?',
 'An f-string (formatted string literal) lets you embed variables and expressions directly inside a string. Prefix the string with <code>f</code> and wrap any expression in curly braces: <code>f"Hi {name}!"</code>.',
 3, 0, 0),

(7, 2,
 'What is Pydantic and how does it relate to FastAPI?',
 'Pydantic is a Python data validation library. You define a model class inheriting from <code>BaseModel</code> with typed fields. FastAPI uses Pydantic models to validate request bodies and serialise responses automatically.',
 3, 0, 0),

(8, 2,
 'What is <code>HTTPException</code> in FastAPI and when should you raise it?',
 '<code>HTTPException</code> sends an HTTP error response to the client. Raise it when a resource does not exist or a condition fails: <code>raise HTTPException(status_code=404, detail="Item not found")</code>.',
 2, 2, 1);

-- -------------------------------------------------------------
-- FLASHCARDS — Deck 3: Lecture 6 (MySQL & SQL)
-- -------------------------------------------------------------

INSERT INTO flashcards (id, deck_id, question, answer, ease_count, hard_count, missed_count) VALUES

(9, 3,
 'What is a parameterised SQL query and why should you always use one?',
 'A parameterised query passes user-supplied values as separate parameters rather than embedding them in the SQL string. The driver escapes the values safely, preventing <strong>SQL injection attacks</strong>.',
 3, 0, 0),

(10, 3,
 'Why must you call <code>connection.commit()</code> after write operations in PyMySQL?',
 'PyMySQL does not auto-commit. Changes exist in a <strong>pending transaction</strong> until you call <code>connection.commit()</code>. If an error occurs you can call <code>connection.rollback()</code> to undo all changes since the last commit.',
 1, 2, 2);

-- -------------------------------------------------------------
-- TAGS (owned by student user id=2)
-- -------------------------------------------------------------

INSERT INTO tags (id, user_id, name, color) VALUES
(1, 2, 'hooks',    '#6366f1'),
(2, 2, 'fastapi',  '#f59e0b'),
(3, 2, 'database', '#10b981');

-- Tag assignments
INSERT INTO card_tags (card_id, tag_id) VALUES
(1, 1), (2, 1), (4, 1), (5, 1),  -- React hooks cards → hooks tag
(7, 2), (8, 2),                   -- FastAPI cards → fastapi tag
(9, 3), (10, 3);                  -- SQL cards → database tag

-- -------------------------------------------------------------
-- STUDY SESSIONS (user_id=2, student)
-- 20 sessions spread over 15 days to populate dashboard charts.
-- Accuracy improves over time (60% → 100%) to show a trend.
-- Streak: May 9–16 (8 consecutive days with at least one session).
-- -------------------------------------------------------------

INSERT INTO study_sessions
  (id, user_id, deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent, studied_at)
VALUES
-- May 1 — two sessions, rough start
(1,  2, 1, 3, 1, 1, 5,  60.00, '2026-05-01 09:15:00'),
(2,  2, 2, 1, 1, 1, 3,  33.33, '2026-05-01 20:30:00'),
-- May 2
(3,  2, 3, 1, 0, 1, 2,  50.00, '2026-05-02 19:00:00'),
-- May 3
(4,  2, 1, 3, 2, 0, 5,  60.00, '2026-05-03 10:00:00'),
(5,  2, 2, 2, 1, 0, 3,  66.67, '2026-05-03 21:00:00'),
-- May 4 — rest day (no session)
-- May 5
(6,  2, 1, 4, 1, 0, 5,  80.00, '2026-05-05 09:30:00'),
-- May 6
(7,  2, 3, 2, 0, 0, 2, 100.00, '2026-05-06 18:45:00'),
-- May 7
(8,  2, 2, 2, 1, 0, 3,  66.67, '2026-05-07 08:00:00'),
(9,  2, 1, 4, 0, 1, 5,  80.00, '2026-05-07 20:00:00'),
-- May 8 — rest day (no session)
-- May 9 ← start of 8-day streak
(10, 2, 3, 2, 0, 0, 2, 100.00, '2026-05-09 19:00:00'),
(11, 2, 2, 3, 0, 0, 3, 100.00, '2026-05-09 21:00:00'),
-- May 10
(12, 2, 1, 5, 0, 0, 5, 100.00, '2026-05-10 09:00:00'),
-- May 11
(13, 2, 2, 3, 0, 0, 3, 100.00, '2026-05-11 18:30:00'),
(14, 2, 3, 2, 0, 0, 2, 100.00, '2026-05-11 20:00:00'),
-- May 12
(15, 2, 1, 5, 0, 0, 5, 100.00, '2026-05-12 10:00:00'),
-- May 13
(16, 2, 2, 3, 0, 0, 3, 100.00, '2026-05-13 19:00:00'),
-- May 14
(17, 2, 1, 5, 0, 0, 5, 100.00, '2026-05-14 08:30:00'),
(18, 2, 3, 2, 0, 0, 2, 100.00, '2026-05-14 20:00:00'),
-- May 15
(19, 2, 2, 3, 0, 0, 3, 100.00, '2026-05-15 18:00:00'),
-- May 16 (today)
(20, 2, 1, 5, 0, 0, 5, 100.00, '2026-05-16 09:00:00');
