-- =============================================================
-- Cardie — Demo Sessions (additive patch)
-- Run this against an EXISTING cardie database that already has
-- users and decks from seed.sql.  Safe to re-run: DELETE clears
-- old sessions first so IDs don't collide.
--
-- Assumes:  user_id=2 (student), deck_id 1/2/3 exist.
-- Result:   20 sessions over 15 days (May 1–16 2026).
--           Accuracy trend: 33–60 % → 100 % (shows improvement).
--           Study streak:   8 consecutive days (May 9–16).
-- =============================================================

USE cardie;

DELETE FROM study_sessions WHERE user_id = 2;

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
-- May 4 — rest day (no session, streak resets here)
-- May 5
(6,  2, 1, 4, 1, 0, 5,  80.00, '2026-05-05 09:30:00'),
-- May 6
(7,  2, 3, 2, 0, 0, 2, 100.00, '2026-05-06 18:45:00'),
-- May 7
(8,  2, 2, 2, 1, 0, 3,  66.67, '2026-05-07 08:00:00'),
(9,  2, 1, 4, 0, 1, 5,  80.00, '2026-05-07 20:00:00'),
-- May 8 — rest day (no session, streak resets here)
-- May 9 ← start of current 8-day streak
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
