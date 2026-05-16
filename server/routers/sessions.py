from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from middleware.auth import get_current_user
from controllers import session_controller

router = APIRouter(tags=["sessions"])


class CardRating(BaseModel):
    id: int
    rating: str  # 'easy' | 'hard' | 'missed'


class SessionBody(BaseModel):
    deck_id: int
    easy_count: int
    hard_count: int
    missed_count: int
    total_cards: int
    accuracy_percent: float
    card_ratings: Optional[List[CardRating]] = []


@router.get("/decks/{deck_id}/sessions")
def list_sessions(deck_id: int, user: dict = Depends(get_current_user)):
    try:
        return session_controller.get_sessions_for_deck(deck_id, user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions", status_code=201)
def save_session(body: SessionBody, user: dict = Depends(get_current_user)):
    try:
        ratings = [r.model_dump() for r in body.card_ratings] if body.card_ratings else []
        session_id = session_controller.save_session(
            user["id"],
            body.deck_id,
            body.easy_count,
            body.hard_count,
            body.missed_count,
            body.total_cards,
            body.accuracy_percent,
            ratings,
        )
        return {"id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard")
def personal_dashboard(user: dict = Depends(get_current_user)):
    try:
        return session_controller.get_personal_dashboard(user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
