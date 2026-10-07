from typing import List
from fastapi import APIRouter, Query
from ..schemas import NewsItem
from ..services.news_engine import NewsEngine

router = APIRouter(prefix="/news", tags=["News & Macro"])

@router.get("/calendar", response_model=List[NewsItem])
def get_economic_calendar():
    """
    Returns upcoming macroeconomic events and impact ratings.
    """
    return NewsEngine.get_upcoming_economic_events()

@router.get("/check-risk")
def check_news_risk(symbol: str = Query("EUR/USD")):
    """
    Checks if a high-impact news blackout window is active for the pair.
    """
    return NewsEngine.check_news_risk_for_symbol(symbol)
