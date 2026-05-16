import os
import shutil
from db.connection import get_connection

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "covers")

_DECK_COLS = """
    d.id, d.name, d.description, d.category_id, d.user_id, d.created_at,
    d.cover_image_path, d.cover_image_type,
    d.style_bg_color, d.style_text_color, d.style_font_size,
    d.style_font_family, d.style_border_style,
    c.name AS category_name, c.color AS category_color,
    COUNT(DISTINCT f.id) AS card_count,
    COALESCE(SUM(f.ease_count), 0) AS ease_count,
    COALESCE(SUM(f.ease_count + f.hard_count + f.missed_count), 0) AS total_ratings,
    MAX(ss.studied_at) AS last_studied
"""


def get_all_decks(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            f"""SELECT {_DECK_COLS}
                FROM decks d
                LEFT JOIN categories c ON c.id = d.category_id
                LEFT JOIN flashcards f ON f.deck_id = d.id
                LEFT JOIN study_sessions ss ON ss.deck_id = d.id
                WHERE d.user_id = %s
                GROUP BY d.id, d.name, d.description, d.category_id, d.user_id, d.created_at,
                         d.cover_image_path, d.cover_image_type,
                         d.style_bg_color, d.style_text_color, d.style_font_size,
                         d.style_font_family, d.style_border_style,
                         c.name, c.color
                ORDER BY d.created_at DESC""",
            (user_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def get_deck(deck_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            f"""SELECT {_DECK_COLS}
                FROM decks d
                LEFT JOIN categories c ON c.id = d.category_id
                LEFT JOIN flashcards f ON f.deck_id = d.id
                LEFT JOIN study_sessions ss ON ss.deck_id = d.id
                WHERE d.id = %s
                GROUP BY d.id, d.name, d.description, d.category_id, d.user_id, d.created_at,
                         d.cover_image_path, d.cover_image_type,
                         d.style_bg_color, d.style_text_color, d.style_font_size,
                         d.style_font_family, d.style_border_style,
                         c.name, c.color""",
            (deck_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def create_deck(user_id: int, name: str, description: str, category_id, style: dict = None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        s = style or {}
        cursor.execute(
            """INSERT INTO decks (user_id, name, description, category_id,
                                  style_bg_color, style_text_color, style_font_size,
                                  style_font_family, style_border_style)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                user_id, name, description, category_id or None,
                s.get("bg_color", "#ffffff"), s.get("text_color", "#1a1a2e"),
                s.get("font_size", "medium"), s.get("font_family", "sans"),
                s.get("border_style", "rounded"),
            ),
        )
        conn.commit()
        return get_deck(cursor.lastrowid)
    finally:
        cursor.close()
        conn.close()


def update_deck(deck_id: int, user_id: int, name: str, description: str, category_id, style: dict = None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        s = style or {}
        cursor.execute(
            """UPDATE decks
               SET name = %s, description = %s, category_id = %s,
                   style_bg_color = %s, style_text_color = %s, style_font_size = %s,
                   style_font_family = %s, style_border_style = %s
               WHERE id = %s AND user_id = %s""",
            (
                name, description, category_id or None,
                s.get("bg_color", "#ffffff"), s.get("text_color", "#1a1a2e"),
                s.get("font_size", "medium"), s.get("font_family", "sans"),
                s.get("border_style", "rounded"),
                deck_id, user_id,
            ),
        )
        conn.commit()
        return get_deck(deck_id)
    finally:
        cursor.close()
        conn.close()


def save_cover_image(upload_file, deck_id: int) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(upload_file.filename)[1]
    filename = f"deck_{deck_id}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(upload_file.file, f)
    return f"uploads/covers/{filename}"


def set_cover(deck_id: int, user_id: int, cover_path: str, cover_type: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE decks SET cover_image_path = %s, cover_image_type = %s WHERE id = %s AND user_id = %s",
            (cover_path, cover_type, deck_id, user_id),
        )
        conn.commit()
        return get_deck(deck_id)
    finally:
        cursor.close()
        conn.close()


def delete_deck(deck_id: int, user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM decks WHERE id = %s AND user_id = %s", (deck_id, user_id))
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def duplicate_deck(deck_id: int, user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT name, description, category_id,
                      style_bg_color, style_text_color, style_font_size,
                      style_font_family, style_border_style
               FROM decks WHERE id = %s AND user_id = %s""",
            (deck_id, user_id),
        )
        original = cursor.fetchone()
        if not original:
            return None

        cursor.execute(
            """INSERT INTO decks (user_id, name, description, category_id,
                                  style_bg_color, style_text_color, style_font_size,
                                  style_font_family, style_border_style)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                user_id,
                f"{original['name']} (Copy)",
                original["description"],
                original["category_id"],
                original["style_bg_color"], original["style_text_color"],
                original["style_font_size"], original["style_font_family"],
                original["style_border_style"],
            ),
        )
        conn.commit()
        new_deck_id = cursor.lastrowid

        cursor.execute(
            "SELECT question, answer, image_path FROM flashcards WHERE deck_id = %s",
            (deck_id,),
        )
        for card in cursor.fetchall():
            cursor.execute(
                "INSERT INTO flashcards (deck_id, question, answer, image_path) VALUES (%s, %s, %s, %s)",
                (new_deck_id, card["question"], card["answer"], card["image_path"]),
            )
        conn.commit()
        return get_deck(new_deck_id)
    finally:
        cursor.close()
        conn.close()
