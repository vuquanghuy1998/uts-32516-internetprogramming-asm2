from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user
from controllers import category_controller

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryBody(BaseModel):
    name: str
    color: str = "#6366f1"
    description: str = ""


@router.get("")
def list_categories(user: dict = Depends(get_current_user)):
    try:
        return category_controller.get_all_categories(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
def create_category(body: CategoryBody, user: dict = Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        return category_controller.create_category(user["id"], body.name, body.color, body.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{category_id}")
def update_category(category_id: int, body: CategoryBody, user: dict = Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        result = category_controller.update_category(category_id, user["id"], body.name, body.color, body.description)
        if not result:
            raise HTTPException(status_code=404, detail="Category not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, user: dict = Depends(get_current_user)):
    try:
        category_controller.delete_category(category_id, user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
