import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(payload: dict) -> str:
    expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    return jwt.encode(data, os.getenv("JWT_SECRET", "change-me"), algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        os.getenv("JWT_SECRET", "change-me"),
        algorithms=["HS256"],
    )
