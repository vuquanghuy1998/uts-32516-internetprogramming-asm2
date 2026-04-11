from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controllers import category_controller

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryBody(BaseModel):
    name: str
    color: str = "#6366f1"
    description: str = ""


@router.get("")
def list_categories():
    try:
        return category_controller.get_all_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
def create_category(body: CategoryBody):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        return category_controller.create_category(body.name, body.color, body.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{category_id}")
def update_category(category_id: int, body: CategoryBody):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        result = category_controller.update_category(category_id, body.name, body.color, body.description)
        if not result:
            raise HTTPException(status_code=404, detail="Category not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int):
    try:
        category_controller.delete_category(category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
