from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Market Data Schemas
class CandleSchema(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0

class MarketOverviewItem(BaseModel):
    symbol: str
    price: float
    change_24h: float
    change_24h_pct: float
    high_24h: float
    low_24h: float
    trend: str  # BULLISH, BEARISH, NEUTRAL
    volatility: str  # LOW, MEDIUM, HIGH, EXTREME
    ai_confidence: float  # e.g. 78.0
    signal: str  # BUY, SELL, WAIT
    spread_pips: float
    data_status: str  # LIVE, DELAYED, STALE, DEMO
    updated_at: datetime

# Technical Analysis & Indicator Schemas
class TechnicalIndicators(BaseModel):
    ema_9: Optional[float] = None
    ema_21: Optional[float] = None
    ema_50: Optional[float] = None
    ema_100: Optional[float] = None
    ema_200: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    rsi_14: Optional[float] = None
    stoch_rsi_k: Optional[float] = None
    stoch_rsi_d: Optional[float] = None
    macd_line: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    atr_14: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    adx_14: Optional[float] = None
    roc_12: Optional[float] = None
    historical_volatility: Optional[float] = None

class SupportResistanceZone(BaseModel):
    zone_type: str  # RESISTANCE, SUPPORT, ORDER_BLOCK, LIQUIDITY
    price_low: float
    price_high: float
    strength: float  # 0 to 100
    test_count: int
    is_major: bool

class MarketStructureEvent(BaseModel):
    event_type: str  # BOS_BULLISH, BOS_BEARISH, CHOCH_BULLISH, CHOCH_BEARISH, SWING_HIGH, SWING_LOW
    price: float
    timestamp: datetime
    label: str

class PriceActionPattern(BaseModel):
    pattern_name: str  # Bullish Engulfing, Bearish Pin Bar, Morning Star, etc.
    bias: str  # BULLISH, BEARISH, NEUTRAL
    significance: str  # HIGH, MEDIUM, LOW
    candle_index: int

# Multi-Timeframe Matrix
class MTFRow(BaseModel):
    timeframe: str  # 1W, 1D, 4H, 1H, 15M, 5M
    trend: str      # Bullish, Bearish, Neutral
    momentum: str   # Strong, Moderate, Weak
    structure: str  # Bullish, Bearish, Range
    signal: str     # BUY, SELL, WAIT
    weight: float   # 0.25, 0.20, etc.

class MultiTimeframeAnalysis(BaseModel):
    symbol: str
    overall_bias: str  # STRONG_BULLISH, MODERATE_BULLISH, NEUTRAL_WAIT, MODERATE_BEARISH, STRONG_BEARISH
    alignment_score: float  # 0 to 100
    rows: List[MTFRow]
    summary_verdict: str

# AI Prediction & Setup
class AIPredictionResponse(BaseModel):
    symbol: str
    timeframe: str
    signal: str  # BUY, SELL, WAIT
    confidence: float  # e.g. 78.4%
    prob_buy: float
    prob_sell: float
    prob_wait: float
    market_direction: str  # Bullish, Bearish, Neutral
    market_regime: str  # TRENDING_BULLISH, RANGING, HIGH_VOLATILITY, etc.
    volatility_level: str  # LOW, MEDIUM, HIGH, EXTREME
    timestamp: datetime
    data_freshness: str  # LIVE, DEMO, DELAYED
    model_version: str

class TradeSetupResponse(BaseModel):
    symbol: str
    direction: str  # BUY, SELL, WAIT
    quality_grade: str  # A+, A, B, C
    confidence: float
    current_price: float
    entry_zone: str  # "1.1720 - 1.1735"
    entry_low: float
    entry_high: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    risk_reward_ratio: float
    suggested_position_size_lots: float
    volatility_level: str
    market_regime: str
    reasoning: List[str]
    invalidating_conditions: str
    timestamp: datetime
    data_freshness: str
    is_actionable: bool
    setup_score: float  # out of 100

# Risk Calculator
class RiskCalculationRequest(BaseModel):
    symbol: str = "EUR/USD"
    account_balance: float = 100000.0
    risk_percentage: float = 1.0  # 1%
    entry_price: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: Optional[float] = None
    account_currency: str = "USD"
    leverage: int = 30

class RiskCalculationResponse(BaseModel):
    symbol: str
    risk_amount_usd: float
    pip_risk: float
    pip_value_std_lot: float
    suggested_lot_size: float
    micro_lots: float
    margin_required_usd: float
    potential_profit_tp1_usd: float
    potential_profit_tp2_usd: Optional[float]
    risk_reward_ratio_tp1: float
    risk_reward_ratio_tp2: Optional[float]
    warnings: List[str]
    is_safe: bool

# Backtesting Schemas
class BacktestRequest(BaseModel):
    symbol: str = "EUR/USD"
    timeframe: str = "4H"
    strategy: str = "MULTI_TIMEFRAME_AI"  # MULTI_TIMEFRAME_AI, TREND_MOMENTUM_BREAKOUT, MEAN_REVERSION_BB
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    initial_capital: float = 100000.0
    risk_per_trade_pct: float = 1.0
    spread_pips: float = 1.2
    slippage_pips: float = 0.5
    stop_loss_method: str = "ATR_STRUCTURE"  # ATR_STRUCTURE, FIXED_PIPS, SWING_LOW_HIGH
    take_profit_method: str = "RR_2_5"  # RR_2_5, S_R_ZONES

class BacktestTradeItem(BaseModel):
    trade_id: int
    symbol: str
    direction: str
    entry_time: str
    exit_time: str
    entry_price: float
    exit_price: float
    stop_loss: float
    take_profit: float
    lot_size: float
    pnl: float
    r_multiple: float
    exit_reason: str

class WalkForwardFold(BaseModel):
    period: str
    train_accuracy: float
    val_accuracy: float
    out_of_sample_accuracy: float
    sharpe: float
    net_profit_pct: float

class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    timeframe: str
    initial_capital: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: float
    net_profit: float
    net_profit_pct: float
    max_drawdown: float
    sharpe_ratio: float
    sortino_ratio: float
    avg_r: float
    avg_trade_pnl: float
    largest_win: float
    largest_loss: float
    consecutive_losses_max: int
    equity_curve: List[Dict[str, Any]]
    trade_log: List[BacktestTradeItem]
    walk_forward: List[WalkForwardFold]
    disclaimer: str = "Past backtest performance does not guarantee future results."

# AI Assistant Schemas
class AssistantMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AssistantQueryRequest(BaseModel):
    query: str
    symbol: Optional[str] = "EUR/USD"
    context_timeframe: Optional[str] = "4H"

class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    referenced_symbol: Optional[str]
    current_price: Optional[float]
    regime: Optional[str]
    setup_summary: Optional[Dict[str, Any]]
    invalidation: Optional[str]
    timestamp: datetime

# News & Economic Calendar
class NewsItem(BaseModel):
    id: int
    title: str
    currency: str
    impact: str  # HIGH, MEDIUM, LOW
    release_time: datetime
    previous: Optional[str] = None
    forecast: Optional[str] = None
    actual: Optional[str] = None
    is_high_impact: bool
    time_until: str

# Model Monitoring Schemas
class ModelMonitoringMetrics(BaseModel):
    model_version: str
    algorithm: str
    dataset_size: int
    features_count: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    brier_score: float
    prediction_drift_psi: float
    feature_drift_detected: bool
    last_trained: str
    status: str
    feature_importances: Dict[str, float]

# Paper Trading
class PaperTradeOrderRequest(BaseModel):
    symbol: str
    order_type: str  # BUY, SELL
    lot_size: float = 1.0
    stop_loss: float
    take_profit: float

class PaperTradeResponse(BaseModel):
    id: int
    symbol: str
    order_type: str
    lot_size: float
    entry_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    unrealized_pnl: float
    realized_pnl: float
    status: str
    opened_at: datetime
    closed_at: Optional[datetime]
