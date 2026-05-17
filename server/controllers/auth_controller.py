from db.connection import get_connection
from utils.security import hash_password, verify_password, create_token


def admin_exists() -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        count = cursor.fetchone()[0]
        return count > 0
    finally:
        cursor.close()
        conn.close()


def register_user(username: str, email: str, password: str, full_name: str = "") -> dict:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # First-run bootstrap: the very first registration becomes admin
        cursor.execute("SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin'")
        is_first_admin = cursor.fetchone()["cnt"] == 0

        role = "admin" if is_first_admin else "user"
        pw_hash = hash_password(password)

        cursor.execute(
            """INSERT INTO users (username, email, password_hash, role, full_name)
               VALUES (%s, %s, %s, %s, %s)""",
            (username, email, pw_hash, role, full_name),
        )
        conn.commit()
        user_id = cursor.lastrowid

        cursor.execute(
            """SELECT id, username, email, role, full_name, avatar_url,
                      bio, theme_preference, is_active, has_completed_onboarding, created_at
               FROM users WHERE id = %s""",
            (user_id,),
        )
        user = cursor.fetchone()
        user["is_active"] = bool(user["is_active"])
        user["has_completed_onboarding"] = bool(user["has_completed_onboarding"])
        token = create_token({"id": user["id"], "username": user["username"], "role": user["role"]})
        return {"token": token, "user": user}
    finally:
        cursor.close()
        conn.close()


def login_user(identifier: str, password: str) -> dict:
    """Accept username or email in the identifier field."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT id, username, email, password_hash, role, full_name,
                      avatar_url, bio, theme_preference, is_active, has_completed_onboarding, created_at
               FROM users
               WHERE (username = %s OR email = %s) AND is_active = TRUE""",
            (identifier, identifier),
        )
        user = cursor.fetchone()
        if not user or not verify_password(password, user["password_hash"]):
            return None

        # Update last_login timestamp
        cursor.execute("UPDATE users SET last_login = NOW() WHERE id = %s", (user["id"],))
        conn.commit()

        del user["password_hash"]
        user["is_active"] = bool(user["is_active"])
        user["has_completed_onboarding"] = bool(user["has_completed_onboarding"])
        token = create_token({"id": user["id"], "username": user["username"], "role": user["role"]})
        return {"token": token, "user": user}
    finally:
        cursor.close()
        conn.close()
