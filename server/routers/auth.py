from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterBody(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = ""


class LoginBody(BaseModel):
    identifier: str  # username or email
    password: str


@router.get("/admin-exists")
def admin_exists():
    return {"exists": auth_controller.admin_exists()}


@router.post("/register", status_code=201)
def register(body: RegisterBody):
    if not body.username.strip() or not body.email.strip() or not body.password:
        raise HTTPException(status_code=400, detail="Username, email and password are required")
    try:
        result = auth_controller.register_user(
            body.username.strip(), body.email.strip(), body.password, body.full_name
        )
        return result
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=409, detail="Username or email already taken")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
def login(body: LoginBody):
    if not body.identifier.strip() or not body.password:
        raise HTTPException(status_code=400, detail="Identifier and password are required")
    try:
        result = auth_controller.login_user(body.identifier.strip(), body.password)
        if not result:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
