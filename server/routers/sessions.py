from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
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
def list_sessions(deck_id: int):
    try:
        return session_controller.get_sessions_for_deck(deck_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions", status_code=201)
def save_session(body: SessionBody):
    try:
        ratings = [r.dict() for r in body.card_ratings] if body.card_ratings else []
        session_id = session_controller.save_session(
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
