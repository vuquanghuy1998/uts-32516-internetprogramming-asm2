from db.connection import get_connection


def get_sessions_for_deck(deck_id: int, user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT id, deck_id, user_id, easy_count, hard_count, missed_count,
                      total_cards, accuracy_percent, studied_at
               FROM study_sessions
               WHERE deck_id = %s AND user_id = %s
               ORDER BY studied_at DESC""",
            (deck_id, user_id),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def save_session(
    user_id: int,
    deck_id: int,
    easy_count: int,
    hard_count: int,
    missed_count: int,
    total_cards: int,
    accuracy_percent: float,
    card_ratings: list,
):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO study_sessions
               (user_id, deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (user_id, deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent),
        )
        conn.commit()
        session_id = cursor.lastrowid

        for rating_item in card_ratings:
            card_id = rating_item.get("id")
            rating = rating_item.get("rating")
            if card_id and rating in ("easy", "hard", "missed"):
                col_map = {"easy": "ease_count", "hard": "hard_count", "missed": "missed_count"}
                col = col_map[rating]
                cursor.execute(
                    f"UPDATE flashcards SET {col} = {col} + 1 WHERE id = %s",
                    (card_id,),
                )
        conn.commit()
        return session_id
    finally:
        cursor.close()
        conn.close()


def get_personal_dashboard(user_id: int):
    """Aggregated stats for the personal dashboard."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        from datetime import date, timedelta

        # Overall totals across all sessions
        cursor.execute(
            """SELECT
                 COALESCE(SUM(easy_count), 0)  AS total_easy,
                 COALESCE(SUM(hard_count), 0)  AS total_hard,
                 COALESCE(SUM(missed_count), 0) AS total_missed,
                 COALESCE(SUM(total_cards), 0)  AS total_studied,
                 COUNT(id) AS total_sessions
               FROM study_sessions WHERE user_id = %s""",
            (user_id,),
        )
        agg = cursor.fetchone()

        total_rated = (agg["total_easy"] or 0) + (agg["total_hard"] or 0) + (agg["total_missed"] or 0)
        overall_accuracy = round(agg["total_easy"] / total_rated * 100, 1) if total_rated > 0 else 0

        # Cards studied today / this week / this month
        cursor.execute(
            """SELECT
                 COALESCE(SUM(CASE WHEN DATE(studied_at) = CURDATE() THEN total_cards ELSE 0 END), 0) AS today,
                 COALESCE(SUM(CASE WHEN studied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN total_cards ELSE 0 END), 0) AS this_week,
                 COALESCE(SUM(CASE WHEN studied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total_cards ELSE 0 END), 0) AS this_month
               FROM study_sessions WHERE user_id = %s""",
            (user_id,),
        )
        period_counts = cursor.fetchone()

        # Study streak (consecutive days with at least one session)
        cursor.execute(
            """SELECT DATE(studied_at) AS day
               FROM study_sessions
               WHERE user_id = %s
               GROUP BY DATE(studied_at)
               ORDER BY day DESC""",
            (user_id,),
        )
        days = [row["day"] for row in cursor.fetchall()]
        streak = 0
        if days:
            today = date.today()
            for i, d in enumerate(days):
                if d == today - timedelta(days=i):
                    streak += 1
                else:
                    break

        # Cards studied per day — last 30 days
        cursor.execute(
            """SELECT DATE(studied_at) AS day, SUM(total_cards) AS cards
               FROM study_sessions
               WHERE user_id = %s AND studied_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
               GROUP BY DATE(studied_at)
               ORDER BY day""",
            (user_id,),
        )
        daily_cards = cursor.fetchall()

        # Accuracy trend — last 10 sessions
        cursor.execute(
            """SELECT accuracy_percent, DATE(studied_at) AS day
               FROM study_sessions
               WHERE user_id = %s
               ORDER BY studied_at DESC
               LIMIT 10""",
            (user_id,),
        )
        accuracy_trend = list(reversed(cursor.fetchall()))

        # Most and least studied decks
        cursor.execute(
            """SELECT d.id, d.name, COUNT(ss.id) AS session_count
               FROM study_sessions ss
               JOIN decks d ON d.id = ss.deck_id
               WHERE ss.user_id = %s
               GROUP BY d.id, d.name
               ORDER BY session_count DESC
               LIMIT 1""",
            (user_id,),
        )
        most_studied = cursor.fetchone()

        cursor.execute(
            """SELECT d.id, d.name, COUNT(ss.id) AS session_count
               FROM study_sessions ss
               JOIN decks d ON d.id = ss.deck_id
               WHERE ss.user_id = %s
               GROUP BY d.id, d.name
               ORDER BY session_count ASC
               LIMIT 1""",
            (user_id,),
        )
        least_studied = cursor.fetchone()

        # Total decks and total flashcards owned by user
        cursor.execute(
            "SELECT COUNT(id) AS total_decks FROM decks WHERE user_id = %s",
            (user_id,),
        )
        deck_row = cursor.fetchone()

        cursor.execute(
            """SELECT COUNT(f.id) AS total_cards
               FROM flashcards f
               JOIN decks d ON d.id = f.deck_id
               WHERE d.user_id = %s""",
            (user_id,),
        )
        card_row = cursor.fetchone()

        # Top 5 hardest cards (highest missed_count) across user's decks
        cursor.execute(
            """SELECT f.id, f.question, f.missed_count, d.name AS deck_name
               FROM flashcards f
               JOIN decks d ON d.id = f.deck_id
               WHERE d.user_id = %s AND f.missed_count > 0
               ORDER BY f.missed_count DESC
               LIMIT 5""",
            (user_id,),
        )
        hardest_cards = cursor.fetchall()

        # Top 5 easiest cards (highest ease_count) across user's decks
        cursor.execute(
            """SELECT f.id, f.question, f.ease_count, d.name AS deck_name
               FROM flashcards f
               JOIN decks d ON d.id = f.deck_id
               WHERE d.user_id = %s AND f.ease_count > 0
               ORDER BY f.ease_count DESC
               LIMIT 5""",
            (user_id,),
        )
        easiest_cards = cursor.fetchall()

        return {
            "total_easy": agg["total_easy"],
            "total_hard": agg["total_hard"],
            "total_missed": agg["total_missed"],
            "total_studied": agg["total_studied"],
            "total_sessions": agg["total_sessions"],
            "overall_accuracy": overall_accuracy,
            "streak": streak,
            "cards_today": period_counts["today"],
            "cards_this_week": period_counts["this_week"],
            "cards_this_month": period_counts["this_month"],
            "daily_cards": daily_cards,
            "accuracy_trend": accuracy_trend,
            "most_studied_deck": most_studied,
            "least_studied_deck": least_studied,
            "total_decks": deck_row["total_decks"],
            "total_cards": card_row["total_cards"],
            "hardest_cards": hardest_cards,
            "easiest_cards": easiest_cards,
        }
    finally:
        cursor.close()
        conn.close()
