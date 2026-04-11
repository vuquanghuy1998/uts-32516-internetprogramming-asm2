import os
import shutil
from db.connection import get_connection

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')


def get_cards_for_deck(deck_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT id, deck_id, question, answer, image_path,
                      ease_count, hard_count, missed_count, created_at
               FROM flashcards
               WHERE deck_id = %s
               ORDER BY created_at""",
            (deck_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_card(deck_id: int, question: str, answer: str, image_path: str = None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """INSERT INTO flashcards (deck_id, question, answer, image_path)
               VALUES (%s, %s, %s, %s)""",
            (deck_id, question, answer, image_path),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute(
            """SELECT id, deck_id, question, answer, image_path,
                      ease_count, hard_count, missed_count, created_at
               FROM flashcards WHERE id = %s""",
            (new_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_card(card_id: int, question: str, answer: str, image_path: str = None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if image_path is not None:
            cursor.execute(
                "UPDATE flashcards SET question = %s, answer = %s, image_path = %s WHERE id = %s",
                (question, answer, image_path, card_id),
            )
        else:
            cursor.execute(
                "UPDATE flashcards SET question = %s, answer = %s WHERE id = %s",
                (question, answer, card_id),
            )
        conn.commit()
        cursor.execute(
            """SELECT id, deck_id, question, answer, image_path,
                      ease_count, hard_count, missed_count, created_at
               FROM flashcards WHERE id = %s""",
            (card_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def delete_card(card_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT image_path FROM flashcards WHERE id = %s", (card_id,))
        card = cursor.fetchone()
        if card and card['image_path']:
            full_path = os.path.join(UPLOAD_DIR, os.path.basename(card['image_path']))
            if os.path.exists(full_path):
                os.remove(full_path)
        cursor.execute("DELETE FROM flashcards WHERE id = %s", (card_id,))
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def save_image(upload_file, card_id: int) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(upload_file.filename)[1]
    filename = f"card_{card_id}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(upload_file.file, f)
    return f"uploads/{filename}"
