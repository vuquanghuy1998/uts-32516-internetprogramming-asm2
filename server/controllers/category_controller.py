from db.connection import get_connection


def get_all_categories(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, user_id, name, color, description, created_at FROM categories WHERE user_id = %s ORDER BY name",
            (user_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def create_category(user_id: int, name: str, color: str, description: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO categories (user_id, name, color, description) VALUES (%s, %s, %s, %s)",
            (user_id, name, color, description),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute(
            "SELECT id, user_id, name, color, description, created_at FROM categories WHERE id = %s",
            (new_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_category(category_id: int, user_id: int, name: str, color: str, description: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "UPDATE categories SET name = %s, color = %s, description = %s WHERE id = %s AND user_id = %s",
            (name, color, description, category_id, user_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None
        cursor.execute(
            "SELECT id, user_id, name, color, description, created_at FROM categories WHERE id = %s",
            (category_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def delete_category(category_id: int, user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM categories WHERE id = %s AND user_id = %s", (category_id, user_id))
        conn.commit()
    finally:
        cursor.close()
        conn.close()
