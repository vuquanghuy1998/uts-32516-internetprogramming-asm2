from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user
from controllers import tag_controller

router = APIRouter(tags=["tags"])


class TagBody(BaseModel):
    name: str
    color: str = "#6366f1"


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagAssign(BaseModel):
    tag_id: int


@router.get("/tags")
def list_tags(user: dict = Depends(get_current_user)):
    try:
        return tag_controller.get_tags_for_user(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tags", status_code=201)
def create_tag(body: TagBody, user: dict = Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Tag name is required")
    try:
        return tag_controller.create_tag(user["id"], body.name.strip(), body.color)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/tags/{tag_id}")
def update_tag(tag_id: int, body: TagUpdate, user: dict = Depends(get_current_user)):
    try:
        tag = tag_controller.update_tag(tag_id, user["id"], body.name, body.color)
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        return tag
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tags/{tag_id}", status_code=204)
def delete_tag(tag_id: int, user: dict = Depends(get_current_user)):
    try:
        tag_controller.delete_tag(tag_id, user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cards/{card_id}/tags")
def get_card_tags(card_id: int, user: dict = Depends(get_current_user)):
    try:
        return tag_controller.get_tags_for_card(card_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cards/{card_id}/tags", status_code=201)
def assign_tag(card_id: int, body: TagAssign, user: dict = Depends(get_current_user)):
    try:
        tag_controller.assign_tag_to_card(card_id, body.tag_id)
        return {"detail": "Tag assigned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cards/{card_id}/tags/{tag_id}", status_code=204)
def remove_tag(card_id: int, tag_id: int, user: dict = Depends(get_current_user)):
    try:
        tag_controller.remove_tag_from_card(card_id, tag_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
