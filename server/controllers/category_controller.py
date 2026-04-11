from db.connection import get_connection


def get_all_categories():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, name, color, description, created_at FROM categories ORDER BY name"
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_category(name: str, color: str, description: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO categories (name, color, description) VALUES (%s, %s, %s)",
            (name, color, description),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute(
            "SELECT id, name, color, description, created_at FROM categories WHERE id = %s",
            (new_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_category(category_id: int, name: str, color: str, description: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "UPDATE categories SET name = %s, color = %s, description = %s WHERE id = %s",
            (name, color, description, category_id),
        )
        conn.commit()
        cursor.execute(
            "SELECT id, name, color, description, created_at FROM categories WHERE id = %s",
            (category_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def delete_category(category_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
        conn.commit()
    finally:
        cursor.close()
        conn.close()
