import os
import shutil
from db.connection import get_connection
from utils.security import hash_password, verify_password

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

_USER_COLS = """id, username, email, role, full_name, avatar_url,
               bio, theme_preference, is_active, has_completed_onboarding,
               created_at, last_login"""


def get_all_users():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(f"SELECT {_USER_COLS} FROM users ORDER BY created_at DESC")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def get_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            f"""SELECT {_USER_COLS},
                       (SELECT COUNT(*) FROM decks WHERE user_id = u.id) AS deck_count,
                       (SELECT COUNT(*) FROM study_sessions WHERE user_id = u.id) AS session_count
                FROM users u WHERE u.id = %s""",
            (user_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_user(user_id: int, fields: dict):
    """Update allowed profile fields. Only non-None values are written."""
    allowed = {"full_name", "username", "email", "bio", "avatar_url", "theme_preference", "has_completed_onboarding"}
    updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
    if not updates:
        return get_user(user_id)

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"UPDATE users SET {set_clause} WHERE id = %s",
            (*updates.values(), user_id),
        )
        conn.commit()
        return get_user(user_id)
    finally:
        cursor.close()
        conn.close()


def change_password(user_id: int, current_password: str, new_password: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        if not row or not verify_password(current_password, row["password_hash"]):
            return False
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (hash_password(new_password), user_id),
        )
        conn.commit()
        return True
    finally:
        cursor.close()
        conn.close()


def set_user_role(user_id: int, role: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
        conn.commit()
        return get_user(user_id)
    finally:
        cursor.close()
        conn.close()


def toggle_active(user_id: int, is_active: bool):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_active = %s WHERE id = %s", (is_active, user_id))
        conn.commit()
        return get_user(user_id)
    finally:
        cursor.close()
        conn.close()


def delete_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    finally:
        cursor.close()
        conn.close()


def get_user_study_history(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT ss.id, ss.deck_id, d.name AS deck_name,
                      ss.easy_count, ss.hard_count, ss.missed_count,
                      ss.total_cards, ss.accuracy_percent, ss.studied_at
               FROM study_sessions ss
               JOIN decks d ON d.id = ss.deck_id
               WHERE ss.user_id = %s
               ORDER BY ss.studied_at DESC
               LIMIT 50""",
            (user_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def get_admin_stats():
    """Summary stats for the admin dashboard."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Active users this week (at least one session in last 7 days)
        cursor.execute(
            """SELECT COUNT(DISTINCT user_id) AS active_this_week
               FROM study_sessions
               WHERE studied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"""
        )
        active_row = cursor.fetchone()

        # Top 5 decks across all users by total sessions
        cursor.execute(
            """SELECT d.id, d.name, u.username AS owner,
                      COUNT(ss.id) AS session_count,
                      COALESCE(SUM(ss.total_cards), 0) AS total_cards_studied
               FROM study_sessions ss
               JOIN decks d ON d.id = ss.deck_id
               JOIN users u ON u.id = d.user_id
               GROUP BY d.id, d.name, u.username
               ORDER BY session_count DESC
               LIMIT 5"""
        )
        top_decks = cursor.fetchall()

        # Per-user study summary (username, total sessions, total cards, last active)
        cursor.execute(
            """SELECT u.id, u.username, u.email,
                      COUNT(ss.id) AS total_sessions,
                      COALESCE(SUM(ss.total_cards), 0) AS total_cards_studied,
                      MAX(ss.studied_at) AS last_active
               FROM users u
               LEFT JOIN study_sessions ss ON ss.user_id = u.id
               GROUP BY u.id, u.username, u.email
               ORDER BY last_active DESC"""
        )
        user_summaries = cursor.fetchall()

        return {
            "active_this_week": active_row["active_this_week"],
            "top_decks": top_decks,
            "user_summaries": user_summaries,
        }
    finally:
        cursor.close()
        conn.close()


def save_avatar(upload_file, user_id: int) -> str:
    avatars_dir = os.path.join(UPLOAD_DIR, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)
    ext = os.path.splitext(upload_file.filename)[1]
    filename = f"avatar_{user_id}{ext}"
    dest = os.path.join(avatars_dir, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(upload_file.file, f)
    return f"uploads/avatars/{filename}"
