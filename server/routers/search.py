from fastapi import APIRouter, HTTPException, Query
from controllers import search_controller

router = APIRouter(tags=["search"])


@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    try:
        return search_controller.search_cards(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
