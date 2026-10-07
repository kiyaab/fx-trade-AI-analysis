import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.data_provider import default_provider
from app.services.technical_analysis import TechnicalAnalysisEngine
from app.services.ml_prediction import prediction_engine
from app.services.trade_setup import TradeSetupGenerator
from app.services.risk_engine import RiskManagementEngine
from app.schemas import RiskCalculationRequest

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_market_overview():
    response = client.get("/api/v1/markets/overview")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 8
    symbols = [x["symbol"] for x in items]
    assert "EUR/USD" in symbols
    assert "XAU/USD" in symbols

def test_candles_and_indicators():
    candles = default_provider.get_historical_candles("EUR/USD", timeframe="4H", count=80)
    assert len(candles) == 80
    
    df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
    df_ind, ind = TechnicalAnalysisEngine.compute_all_indicators(df)
    assert ind.rsi_14 is not None
    assert ind.ema_50 is not None
    assert ind.atr_14 is not None

def test_ml_prediction_and_setup():
    candles = default_provider.get_historical_candles("EUR/USD", timeframe="4H", count=80)
    df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
    pred = prediction_engine.predict(df, symbol="EUR/USD", timeframe="4H")
    
    assert pred.signal in ["BUY", "SELL", "WAIT"]
    assert 50.0 <= pred.confidence <= 90.0  # Confirms no fake 100% certainty
    assert abs((pred.prob_buy + pred.prob_sell + pred.prob_wait) - 100.0) < 1.0

    setup = TradeSetupGenerator.generate_setup(df, pred)
    assert setup.direction in ["BUY", "SELL", "WAIT"]
    assert setup.risk_reward_ratio >= 1.0
    assert len(setup.reasoning) >= 3
    assert "invalidated" in setup.invalidating_conditions.lower()

def test_risk_calculator():
    req = RiskCalculationRequest(
        symbol="EUR/USD",
        account_balance=100000.0,
        risk_percentage=1.0,
        entry_price=1.0850,
        stop_loss=1.0800,
        take_profit_1=1.0950
    )
    res = RiskManagementEngine.calculate_position_risk(req)
    assert res.risk_amount_usd == 1000.0
    assert res.pip_risk == 50.0
    assert res.suggested_lot_size > 0.0
    assert res.risk_reward_ratio_tp1 == 2.0
    assert res.is_safe is True

def test_backtest_run():
    payload = {
        "symbol": "EUR/USD",
        "timeframe": "4H",
        "strategy": "MULTI_TIMEFRAME_AI",
        "initial_capital": 100000.0,
        "risk_per_trade_pct": 1.0,
        "spread_pips": 1.2,
        "slippage_pips": 0.5
    }
    response = client.post("/api/v1/backtest/run", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["total_trades"] > 0
    assert res["win_rate"] > 0
    assert len(res["equity_curve"]) > 0
    assert len(res["walk_forward"]) == 4

def test_assistant_query():
    payload = {
        "query": "Analyze EUR/USD",
        "symbol": "EUR/USD",
        "context_timeframe": "4H"
    }
    response = client.post("/api/v1/assistant/query", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "EUR/USD" in res["answer"]
    assert res["current_price"] > 0
