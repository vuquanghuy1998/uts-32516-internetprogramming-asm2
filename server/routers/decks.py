from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from controllers import deck_controller

router = APIRouter(prefix="/decks", tags=["decks"])


class DeckBody(BaseModel):
    name: str
    description: str = ""
    category_id: Optional[int] = None


@router.get("")
def list_decks():
    try:
        return deck_controller.get_all_decks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{deck_id}")
def get_deck(deck_id: int):
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
def create_deck(body: DeckBody):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        return deck_controller.create_deck(body.name, body.description, body.category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{deck_id}")
def update_deck(deck_id: int, body: DeckBody):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        result = deck_controller.update_deck(deck_id, body.name, body.description, body.category_id)
        if not result:
            raise HTTPException(status_code=404, detail="Deck not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{deck_id}", status_code=204)
def delete_deck(deck_id: int):
    try:
        deck_controller.delete_deck(deck_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{deck_id}/duplicate", status_code=201)
def duplicate_deck(deck_id: int):
    try:
        result = deck_controller.duplicate_deck(deck_id)
        if not result:
            raise HTTPException(status_code=404, detail="Deck not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
