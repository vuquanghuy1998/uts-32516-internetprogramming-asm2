-- Cardie Sample Data
-- Run after schema.sql to populate the database with demo content.

USE cardie;

-- Categories
INSERT INTO categories (name, color, description) VALUES
  ('Computer Science', '#6366f1', 'Programming, algorithms, and data structures'),
  ('Languages',        '#f59e0b', 'Foreign language vocabulary and grammar'),
  ('Science',          '#10b981', 'Physics, chemistry, and biology concepts');

-- Decks
INSERT INTO decks (category_id, name, description) VALUES
  (1, 'Python Basics',        'Core Python syntax and built-in functions'),
  (1, 'Data Structures',      'Arrays, linked lists, trees, graphs, and hash maps'),
  (2, 'Japanese N5 Vocab',    'JLPT N5 level vocabulary — 800 essential words'),
  (3, 'Physics — Mechanics',  'Newtons laws, kinematics, and energy');

-- Flashcards — Python Basics (deck 1)
INSERT INTO flashcards (deck_id, question, answer) VALUES
  (1, '<p>What is a <strong>list comprehension</strong> in Python?</p>',
      '<p>A concise way to create lists: <code>[expr for item in iterable if condition]</code></p>'),
  (1, '<p>What does <code>enumerate()</code> do?</p>',
      '<p>Returns an iterator of <em>(index, value)</em> pairs from an iterable.</p>'),
  (1, '<p>What is the difference between <code>is</code> and <code>==</code>?</p>',
      '<p><code>is</code> checks identity (same object in memory); <code>==</code> checks equality (same value).</p>'),
  (1, '<p>How do you open a file safely in Python?</p>',
      '<p>Use a <code>with</code> statement: <code>with open("file.txt") as f:</code> — automatically closes the file.</p>');

-- Flashcards — Data Structures (deck 2)
INSERT INTO flashcards (deck_id, question, answer) VALUES
  (2, '<p>What is the time complexity of <strong>binary search</strong>?</p>',
      '<p>O(log n) — the search space halves on each step.</p>'),
  (2, '<p>What is a <strong>hash collision</strong>?</p>',
      '<p>When two different keys produce the same hash value and map to the same bucket.</p>'),
  (2, '<p>What is the difference between a <strong>stack</strong> and a <strong>queue</strong>?</p>',
      '<p>Stack = LIFO (last in, first out). Queue = FIFO (first in, first out).</p>');

-- Flashcards — Japanese N5 (deck 3)
INSERT INTO flashcards (deck_id, question, answer) VALUES
  (3, '<p>何 (なに / なん)</p>', '<p>What / how many</p>'),
  (3, '<p>食べる (たべる)</p>',   '<p>To eat</p>'),
  (3, '<p>大きい (おおきい)</p>', '<p>Big / large</p>'),
  (3, '<p>学校 (がっこう)</p>',   '<p>School</p>');

-- Flashcards — Physics Mechanics (deck 4)
INSERT INTO flashcards (deck_id, question, answer) VALUES
  (4, '<p>State <strong>Newton\'s Second Law</strong>.</p>',
      '<p>F = ma — Force equals mass times acceleration.</p>'),
  (4, '<p>What is the formula for <strong>kinetic energy</strong>?</p>',
      '<p>KE = ½mv² where m is mass and v is velocity.</p>'),
  (4, '<p>What is the unit of force in SI?</p>',
      '<p>Newton (N), equivalent to kg·m/s².</p>');

-- Sample study session for deck 1
INSERT INTO study_sessions (deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent)
VALUES (1, 3, 1, 0, 4, 75.00);
