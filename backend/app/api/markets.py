from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from ..config import settings
from ..schemas import (
    MarketOverviewItem,
    CandleSchema,
    TechnicalIndicators,
    SupportResistanceZone,
    MarketStructureEvent,
    PriceActionPattern
)
from ..services.data_provider import default_provider, BASE_ANCHOR_PRICES
from ..services.technical_analysis import TechnicalAnalysisEngine

router = APIRouter(prefix="/markets", tags=["Markets"])

@router.get("/overview", response_model=List[MarketOverviewItem])
def get_market_overview():
    """
    Returns market overview cards for all 8 supported Forex pairs and Gold.
    Includes price, daily change, trend, volatility, AI confidence, and signal.
    """
    items = []
    for symbol in settings.SUPPORTED_PAIRS:
        quote = default_provider.get_latest_quote(symbol)
        items.append(MarketOverviewItem(**quote))
    return items

@router.get("/candles", response_model=List[CandleSchema])
def get_candles(
    symbol: str = Query("EUR/USD", description="Currency pair symbol"),
    timeframe: str = Query("4H", description="Timeframe: 1m, 5m, 15m, 30m, 1H, 4H, 1D, 1W"),
    count: int = Query(150, ge=20, le=500, description="Number of candles")
):
    """
    Returns historical OHLCV candlestick series for the interactive charting component.
    """
    if symbol not in BASE_ANCHOR_PRICES:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not supported")
    candles = default_provider.get_historical_candles(symbol, timeframe=timeframe, count=count)
    return candles

@router.get("/indicators")
def get_indicators(
    symbol: str = Query("EUR/USD"),
    timeframe: str = Query("4H")
):
    """
    Returns technical indicators, Support/Resistance zones,
    Market Structure events (BoS, ChoCh), and Price Action candlestick patterns.
    """
    candles = default_provider.get_historical_candles(symbol, timeframe=timeframe, count=120)
    df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
    df_ind, ind = TechnicalAnalysisEngine.compute_all_indicators(df)
    zones = TechnicalAnalysisEngine.identify_support_resistance_zones(df)
    events = TechnicalAnalysisEngine.detect_market_structure(df)
    patterns = TechnicalAnalysisEngine.detect_price_action_patterns(df)

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "current_price": float(df["close"].iloc[-1]),
        "indicators": ind,
        "support_resistance_zones": zones,
        "market_structure_events": events,
        "price_action_patterns": patterns
    }
