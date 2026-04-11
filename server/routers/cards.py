from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from controllers import card_controller

router = APIRouter(tags=["cards"])


@router.get("/decks/{deck_id}/cards")
def list_cards(deck_id: int):
    try:
        return card_controller.get_cards_for_deck(deck_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/decks/{deck_id}/cards", status_code=201)
async def create_card(
    deck_id: int,
    question: str = Form(...),
    answer: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    if not question.strip() or not answer.strip():
        raise HTTPException(status_code=400, detail="Question and answer are required")
    try:
        # Create card first to get its ID for image naming
        card = card_controller.create_card(deck_id, question, answer)
        if image and image.filename:
            image_path = card_controller.save_image(image, card['id'])
            card = card_controller.update_card(card['id'], question, answer, image_path)
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
):
    if not question.strip() or not answer.strip():
        raise HTTPException(status_code=400, detail="Question and answer are required")
    try:
        image_path = None
        if image and image.filename:
            image_path = card_controller.save_image(image, card_id)
        return card_controller.update_card(card_id, question, answer, image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: int):
    try:
        card_controller.delete_card(card_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
