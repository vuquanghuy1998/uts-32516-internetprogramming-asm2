from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from middleware.auth import get_current_user
from controllers import card_controller, tag_controller

router = APIRouter(tags=["cards"])


@router.get("/decks/{deck_id}/cards")
def list_cards(deck_id: int, _user: dict = Depends(get_current_user)):
    try:
        cards = card_controller.get_cards_for_deck(deck_id)
        # Attach tags to each card
        for card in cards:
            card["tags"] = tag_controller.get_tags_for_card(card["id"])
        return cards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/decks/{deck_id}/cards", status_code=201)
async def create_card(
    deck_id: int,
    question: str = Form(...),
    answer: str = Form(...),
    image: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    if not question.strip() or not answer.strip():
        raise HTTPException(status_code=400, detail="Question and answer are required")
    try:
        card = card_controller.create_card(deck_id, question, answer)
        if image and image.filename:
            image_path = card_controller.save_image(image, card["id"])
            card = card_controller.update_card(card["id"], question, answer, image_path)
        card["tags"] = []
        return card
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/cards/{card_id}")
async def update_card(
    card_id: int,
    question: str = Form(...),
    answer: str = Form(...),
    image: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    if not question.strip() or not answer.strip():
        raise HTTPException(status_code=400, detail="Question and answer are required")
    try:
        image_path = None
        if image and image.filename:
            image_path = card_controller.save_image(image, card_id)
        card = card_controller.update_card(card_id, question, answer, image_path)
        card["tags"] = tag_controller.get_tags_for_card(card_id)
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: int, user: dict = Depends(get_current_user)):
    try:
        card_controller.delete_card(card_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
