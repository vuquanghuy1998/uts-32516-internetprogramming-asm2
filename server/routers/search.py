from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from middleware.auth import get_current_user
from controllers import search_controller

router = APIRouter(tags=["search"])


@router.get("/search")
def search(
    q: str = Query(..., min_length=1),
    tag_id: Optional[int] = Query(None),
    user: dict = Depends(get_current_user),
):
    try:
        return search_controller.search_cards(q, user["id"], tag_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
