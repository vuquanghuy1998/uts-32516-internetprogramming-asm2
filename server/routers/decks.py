from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user
from controllers import deck_controller

router = APIRouter(prefix="/decks", tags=["decks"])


class DeckStyle(BaseModel):
    bg_color: str = "#ffffff"
    text_color: str = "#1a1a2e"
    font_size: str = "medium"
    font_family: str = "sans"
    border_style: str = "rounded"


class DeckBody(BaseModel):
    name: str
    description: str = ""
    category_id: Optional[int] = None
    style: Optional[DeckStyle] = None


@router.get("")
def list_decks(user: dict = Depends(get_current_user)):
    try:
        return deck_controller.get_all_decks(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{deck_id}")
def get_deck(deck_id: int, user: dict = Depends(get_current_user)):
    try:
        deck = deck_controller.get_deck(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        return deck
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
def create_deck(body: DeckBody, user: dict = Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        return deck_controller.create_deck(
            user["id"], body.name, body.description, body.category_id,
            body.style.model_dump() if body.style else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{deck_id}")
def update_deck(deck_id: int, body: DeckBody, user: dict = Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        result = deck_controller.update_deck(
            deck_id, user["id"], body.name, body.description, body.category_id,
            body.style.model_dump() if body.style else None,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Deck not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{deck_id}", status_code=204)
def delete_deck(deck_id: int, user: dict = Depends(get_current_user)):
    try:
        deck_controller.delete_deck(deck_id, user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{deck_id}/duplicate", status_code=201)
def duplicate_deck(deck_id: int, user: dict = Depends(get_current_user)):
    try:
        result = deck_controller.duplicate_deck(deck_id, user["id"])
        if not result:
            raise HTTPException(status_code=404, detail="Deck not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{deck_id}/cover", status_code=200)
async def upload_cover(
    deck_id: int,
    image: Optional[UploadFile] = File(None),
    preset_key: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
):
    try:
        if image and image.filename:
            path = deck_controller.save_cover_image(image, deck_id)
            return deck_controller.set_cover(deck_id, user["id"], path, "upload")
        elif preset_key:
            return deck_controller.set_cover(deck_id, user["id"], preset_key, "preset")
        raise HTTPException(status_code=400, detail="Provide image file or preset_key")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
