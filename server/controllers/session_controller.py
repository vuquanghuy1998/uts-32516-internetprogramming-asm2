from db.connection import get_connection


def get_sessions_for_deck(deck_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT id, deck_id, easy_count, hard_count, missed_count,
                      total_cards, accuracy_percent, studied_at
               FROM study_sessions
               WHERE deck_id = %s
               ORDER BY studied_at DESC""",
            (deck_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def save_session(
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
               (deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (deck_id, easy_count, hard_count, missed_count, total_cards, accuracy_percent),
        )
        conn.commit()
        session_id = cursor.lastrowid

        # Update cumulative stats on each rated card
        for rating_item in card_ratings:
            card_id = rating_item.get('id')
            rating = rating_item.get('rating')
            if card_id and rating in ('easy', 'hard', 'missed'):
                col_map = {'easy': 'ease_count', 'hard': 'hard_count', 'missed': 'missed_count'}
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
