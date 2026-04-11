from db.connection import get_connection


def search_cards(query: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        like = f"%{query}%"
        cursor.execute(
            """SELECT f.id, f.deck_id, f.question, f.answer,
                      d.name AS deck_name
               FROM flashcards f
               JOIN decks d ON d.id = f.deck_id
               WHERE f.question LIKE %s OR f.answer LIKE %s
               LIMIT 20""",
            (like, like),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
