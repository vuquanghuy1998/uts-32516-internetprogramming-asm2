from db.connection import get_connection


def search_cards(query: str, user_id: int, tag_id: int = None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        like = f"%{query}%"
        if tag_id:
            cursor.execute(
                """SELECT f.id, f.deck_id, f.question, f.answer,
                          d.name AS deck_name
                   FROM flashcards f
                   JOIN decks d ON d.id = f.deck_id
                   JOIN card_tags ct ON ct.card_id = f.id
                   WHERE d.user_id = %s
                     AND ct.tag_id = %s
                     AND (f.question LIKE %s OR f.answer LIKE %s)
                   LIMIT 20""",
                (user_id, tag_id, like, like),
            )
        else:
            cursor.execute(
                """SELECT f.id, f.deck_id, f.question, f.answer,
                          d.name AS deck_name
                   FROM flashcards f
                   JOIN decks d ON d.id = f.deck_id
                   WHERE d.user_id = %s
                     AND (f.question LIKE %s OR f.answer LIKE %s)
                   LIMIT 20""",
                (user_id, like, like),
            )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
