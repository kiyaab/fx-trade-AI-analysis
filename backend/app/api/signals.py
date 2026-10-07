from typing import List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from ..config import settings
from ..schemas import (
    AIPredictionResponse,
    TradeSetupResponse,
    MultiTimeframeAnalysis
)
from ..services.data_provider import default_provider, BASE_ANCHOR_PRICES
from ..services.technical_analysis import TechnicalAnalysisEngine
from ..services.ml_prediction import prediction_engine
from ..services.trade_setup import TradeSetupGenerator
from ..services.multi_timeframe import MultiTimeframeEngine
from ..services.explanation_engine import AIExplanationEngine
from ..services.signal_ranking import SignalRankingEngine
from ..services.news_engine import NewsEngine

router = APIRouter(prefix="/signals", tags=["AI Signals"])

@router.get("/prediction", response_model=AIPredictionResponse)
def get_prediction(
    symbol: str = Query("EUR/USD"),
    timeframe: str = Query("4H")
):
    """
    Returns probabilistic AI prediction with class probabilities P(BUY), P(SELL), P(WAIT).
    """
    candles = default_provider.get_historical_candles(symbol, timeframe=timeframe, count=100)
    df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
    pred = prediction_engine.predict(df, symbol=symbol, timeframe=timeframe)
    return pred

@router.get("/setup", response_model=TradeSetupResponse)
def get_trade_setup(
    symbol: str = Query("EUR/USD"),
    timeframe: str = Query("4H")
):
    """
    Returns complete actionable trade setup with entry zone, SL, TP1, TP2, R:R,
    suggested position size, reasoning checklist, and invalidation rules.
    """
    candles = default_provider.get_historical_candles(symbol, timeframe=timeframe, count=100)
    df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
    pred = prediction_engine.predict(df, symbol=symbol, timeframe=timeframe)
    setup = TradeSetupGenerator.generate_setup(df, pred)
    return setup

@router.get("/multi-timeframe", response_model=MultiTimeframeAnalysis)
def get_multi_timeframe_analysis(
    symbol: str = Query("EUR/USD")
):
    """
    Evaluates multi-timeframe alignment across 1W, 1D, 4H, 1H, 15M, 5M.
    """
    return MultiTimeframeEngine.analyze_symbol(default_provider, symbol)

@router.get("/ranked-setups")
def get_ranked_setups():
    """
    Returns all supported pairs ranked by quantitative multi-factor setup quality score (0-100).
    """
    ranked_list = []
    for symbol in settings.SUPPORTED_PAIRS:
        candles = default_provider.get_historical_candles(symbol, timeframe="4H", count=80)
        df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
        pred = prediction_engine.predict(df, symbol=symbol, timeframe="4H")
        setup = TradeSetupGenerator.generate_setup(df, pred)
        mtf = MultiTimeframeEngine.analyze_symbol(default_provider, symbol)
        news_risk = NewsEngine.check_news_risk_for_symbol(symbol)["has_high_impact_news"]

        scoring = SignalRankingEngine.calculate_signal_score(setup, pred, mtf, news_risk)

        ranked_list.append({
            "symbol": symbol,
            "direction": setup.direction,
            "confidence": setup.confidence,
            "quality_grade": setup.quality_grade,
            "overall_score": scoring["overall_score"],
            "classification": scoring["classification"],
            "breakdown": scoring["breakdown"],
            "entry_zone": setup.entry_zone,
            "stop_loss": setup.stop_loss,
            "take_profit_1": setup.take_profit_1,
            "risk_reward_ratio": setup.risk_reward_ratio,
            "market_regime": setup.market_regime,
            "is_actionable": setup.is_actionable
        })

    # Sort descending by overall score
    ranked_list.sort(key=lambda x: x["overall_score"], reverse=True)
    return ranked_list

@router.get("/explanation")
def get_ai_explanation(
    symbol: str = Query("EUR/USD"),
    timeframe: str = Query("4H")
):
    """
    Returns mathematically verifiable explanations and uncertainty caveats.
    """
    candles = default_provider.get_historical_candles(symbol, timeframe=timeframe, count=100)
    df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
    _, ind = TechnicalAnalysisEngine.compute_all_indicators(df)
    pred = prediction_engine.predict(df, symbol=symbol, timeframe=timeframe)
    setup = TradeSetupGenerator.generate_setup(df, pred)
    return AIExplanationEngine.generate_detailed_explanation(setup, pred, ind)

@router.get("/history")
def get_signal_history():
    """
    Returns transparent AI performance history and win-rate statistics.
    """
    return SignalRankingEngine.get_signal_history_summary()
