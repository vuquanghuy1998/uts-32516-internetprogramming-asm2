from db.connection import get_connection


def get_tags_for_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, color FROM tags WHERE user_id = %s ORDER BY name",
            (user_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_tag(user_id: int, name: str, color: str = "#6366f1"):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Reuse existing tag with same name if it exists for this user
        cursor.execute(
            "SELECT id, name, color FROM tags WHERE user_id = %s AND name = %s",
            (user_id, name),
        )
        existing = cursor.fetchone()
        if existing:
            return existing

        cursor.execute(
            "INSERT INTO tags (user_id, name, color) VALUES (%s, %s, %s)",
            (user_id, name, color),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute("SELECT id, name, color FROM tags WHERE id = %s", (new_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_tag(tag_id: int, user_id: int, name: str = None, color: str = None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        updates = {}
        if name is not None:
            updates["name"] = name
        if color is not None:
            updates["color"] = color
        if updates:
            set_clause = ", ".join(f"{k} = %s" for k in updates)
            cursor.execute(
                f"UPDATE tags SET {set_clause} WHERE id = %s AND user_id = %s",
                (*updates.values(), tag_id, user_id),
            )
            conn.commit()
        cursor.execute("SELECT id, name, color FROM tags WHERE id = %s", (tag_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def delete_tag(tag_id: int, user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tags WHERE id = %s AND user_id = %s", (tag_id, user_id))
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def get_tags_for_card(card_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT t.id, t.name, t.color
               FROM tags t
               JOIN card_tags ct ON ct.tag_id = t.id
               WHERE ct.card_id = %s""",
            (card_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def assign_tag_to_card(card_id: int, tag_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT IGNORE INTO card_tags (card_id, tag_id) VALUES (%s, %s)",
            (card_id, tag_id),
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def remove_tag_from_card(card_id: int, tag_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM card_tags WHERE card_id = %s AND tag_id = %s",
            (card_id, tag_id),
        )
        conn.commit()
    finally:
        cursor.close()
        conn.close()
