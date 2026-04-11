from db.connection import get_connection


def get_all_decks():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                d.id, d.name, d.description, d.category_id, d.created_at,
                c.name AS category_name, c.color AS category_color,
                COUNT(DISTINCT f.id) AS card_count,
                COALESCE(SUM(f.ease_count), 0) AS ease_count,
                COALESCE(SUM(f.ease_count + f.hard_count + f.missed_count), 0) AS total_ratings,
                MAX(ss.studied_at) AS last_studied
            FROM decks d
            LEFT JOIN categories c ON c.id = d.category_id
            LEFT JOIN flashcards f ON f.deck_id = d.id
            LEFT JOIN study_sessions ss ON ss.deck_id = d.id
            GROUP BY d.id, d.name, d.description, d.category_id, d.created_at,
                     c.name, c.color
            ORDER BY d.created_at DESC
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def get_deck(deck_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                d.id, d.name, d.description, d.category_id, d.created_at,
                c.name AS category_name, c.color AS category_color,
                COUNT(DISTINCT f.id) AS card_count,
                MAX(ss.studied_at) AS last_studied
            FROM decks d
            LEFT JOIN categories c ON c.id = d.category_id
            LEFT JOIN flashcards f ON f.deck_id = d.id
            LEFT JOIN study_sessions ss ON ss.deck_id = d.id
            WHERE d.id = %s
            GROUP BY d.id, d.name, d.description, d.category_id, d.created_at,
                     c.name, c.color
        """, (deck_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def create_deck(name: str, description: str, category_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO decks (name, description, category_id) VALUES (%s, %s, %s)",
            (name, description, category_id or None),
        )
        conn.commit()
        return get_deck(cursor.lastrowid)
    finally:
        cursor.close()
        conn.close()


def update_deck(deck_id: int, name: str, description: str, category_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE decks SET name = %s, description = %s, category_id = %s WHERE id = %s",
            (name, description, category_id or None, deck_id),
        )
        conn.commit()
        return get_deck(deck_id)
    finally:
        cursor.close()
        conn.close()


def delete_deck(deck_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM decks WHERE id = %s", (deck_id,))
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def duplicate_deck(deck_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT name, description, category_id FROM decks WHERE id = %s", (deck_id,)
        )
        original = cursor.fetchone()
        if not original:
            return None

        cursor.execute(
            "INSERT INTO decks (name, description, category_id) VALUES (%s, %s, %s)",
            (f"{original['name']} (Copy)", original['description'], original['category_id']),
        )
        conn.commit()
        new_deck_id = cursor.lastrowid

        # Copy all flashcards
        cursor.execute(
            "SELECT question, answer, image_path FROM flashcards WHERE deck_id = %s",
            (deck_id,),
        )
        cards = cursor.fetchall()
        for card in cards:
            cursor.execute(
                "INSERT INTO flashcards (deck_id, question, answer, image_path) VALUES (%s, %s, %s, %s)",
                (new_deck_id, card['question'], card['answer'], card['image_path']),
            )
        conn.commit()

        return get_deck(new_deck_id)
    finally:
        cursor.close()
        conn.close()
