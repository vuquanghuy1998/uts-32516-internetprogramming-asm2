from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user, require_admin
from controllers import user_controller

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_preference: Optional[str] = None
    has_completed_onboarding: Optional[bool] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class RoleUpdate(BaseModel):
    role: str  # 'admin' | 'user'


class AdminUserEdit(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None


# ── Own profile ──────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    try:
        data = user_controller.get_user(user["id"])
        if not data:
            raise HTTPException(status_code=404, detail="User not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/me")
def update_me(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    try:
        return user_controller.update_user(user["id"], body.model_dump())
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=409, detail="Username or email already taken")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/me/password")
def change_password(body: PasswordChange, user: dict = Depends(get_current_user)):
    if not body.new_password or len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    try:
        ok = user_controller.change_password(user["id"], body.current_password, body.new_password)
        if not ok:
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        return {"detail": "Password changed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/me/avatar")
async def upload_avatar(image: UploadFile = File(...), user: dict = Depends(get_current_user)):
    try:
        path = user_controller.save_avatar(image, user["id"])
        user_controller.update_user(user["id"], {"avatar_url": path})
        return {"avatar_url": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/sessions")
def my_sessions(user: dict = Depends(get_current_user)):
    try:
        return user_controller.get_user_study_history(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Admin routes ─────────────────────────────────────────────────────────────

@router.get("")
def list_users(admin: dict = Depends(require_admin)):
    try:
        return user_controller.get_all_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
def get_user(user_id: int, admin: dict = Depends(require_admin)):
    try:
        data = user_controller.get_user(user_id)
        if not data:
            raise HTTPException(status_code=404, detail="User not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}")
def edit_user(user_id: int, body: AdminUserEdit, admin: dict = Depends(require_admin)):
    try:
        return user_controller.update_user(user_id, body.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/role")
def set_role(user_id: int, body: RoleUpdate, admin: dict = Depends(require_admin)):
    if body.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'user'")
    try:
        return user_controller.set_user_role(user_id, body.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/active")
def toggle_active(user_id: int, body: dict, admin: dict = Depends(require_admin)):
    try:
        return user_controller.toggle_active(user_id, body.get("is_active", True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    try:
        user_controller.delete_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/sessions")
def user_sessions(user_id: int, admin: dict = Depends(require_admin)):
    try:
        return user_controller.get_user_study_history(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
