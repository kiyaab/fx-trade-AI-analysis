from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="trader")  # trader, analyst, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    settings = relationship("UserSetting", back_populates="user", uselist=False)
    risk_profiles = relationship("RiskProfile", back_populates="user")
    watchlists = relationship("Watchlist", back_populates="user")
    paper_trades = relationship("PaperTrade", back_populates="user")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)  # e.g., EUR/USD
    base_currency = Column(String(10), nullable=False)
    quote_currency = Column(String(10), nullable=False)
    asset_class = Column(String(50), default="Forex")
    pip_decimal = Column(Integer, default=4)  # 4 for EUR/USD, 2 for USD/JPY, 2 for XAU/USD
    pip_value_std_lot = Column(Float, default=10.0)  # Pip value per 1.0 standard lot (USD)
    lot_size = Column(Integer, default=100000)  # Standard lot unit
    is_active = Column(Boolean, default=True)

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timeframe = Column(String(10), index=True, nullable=False)  # 1m, 5m, 15m, 1h, 4h, 1d, 1w
    timestamp = Column(DateTime, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)
    provider = Column(String(50), default="DEMO_SIMULATOR")
    data_status = Column(String(20), default="LIVE")  # LIVE, DELAYED, STALE, DEMO

    __table_args__ = (
        Index("ix_market_data_symbol_tf_ts", "symbol", "timeframe", "timestamp"),
    )

class IndicatorSnapshot(Base):
    __tablename__ = "indicators"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timeframe = Column(String(10), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    ema_9 = Column(Float)
    ema_21 = Column(Float)
    ema_50 = Column(Float)
    ema_100 = Column(Float)
    ema_200 = Column(Float)
    sma_50 = Column(Float)
    sma_200 = Column(Float)
    rsi_14 = Column(Float)
    macd_line = Column(Float)
    macd_signal = Column(Float)
    macd_hist = Column(Float)
    atr_14 = Column(Float)
    bb_upper = Column(Float)
    bb_middle = Column(Float)
    bb_lower = Column(Float)
    adx_14 = Column(Float)
    structure_type = Column(String(50))  # HH, HL, LH, LL, Range
    candle_pattern = Column(String(50))  # Engulfing, Pin bar, Doji, etc.

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timeframe = Column(String(10), default="4H")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    signal = Column(String(10), nullable=False)  # BUY, SELL, WAIT
    confidence = Column(Float, nullable=False)  # 0.0 - 1.0 (e.g. 0.78)
    prob_buy = Column(Float, nullable=False)
    prob_sell = Column(Float, nullable=False)
    prob_wait = Column(Float, nullable=False)
    market_direction = Column(String(20))  # Bullish, Bearish, Neutral
    market_regime = Column(String(50))  # TRENDING_BULLISH, RANGING, HIGH_VOLATILITY, etc.
    volatility_level = Column(String(20))  # LOW, MEDIUM, HIGH, EXTREME
    data_freshness = Column(String(20), default="LIVE")
    model_version = Column(String(50), default="ForexPulse-Ensemble-v2.4")
    features_snapshot = Column(JSON, nullable=True)

class TradeSetup(Base):
    __tablename__ = "trade_setups"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timeframe = Column(String(10), default="4H")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    direction = Column(String(10), nullable=False)  # BUY, SELL, WAIT
    quality_grade = Column(String(5), default="A")  # A+, A, B, C
    entry_low = Column(Float, nullable=False)
    entry_high = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit_1 = Column(Float, nullable=False)
    take_profit_2 = Column(Float, nullable=False)
    risk_reward_ratio = Column(Float, nullable=False)
    suggested_lot_size = Column(Float, default=1.0)
    market_regime = Column(String(50))
    confidence_score = Column(Float, nullable=False)
    reasoning_list = Column(JSON, nullable=False)  # Array of technical evidence bullet points
    invalidating_conditions = Column(Text, nullable=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, HIT_TP1, HIT_TP2, STOPPED, INVALIDATED, EXPIRED

class SignalRecord(Base):
    __tablename__ = "signals"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    signal = Column(String(10), nullable=False)
    confidence = Column(Float, nullable=False)
    overall_score = Column(Float, default=80.0)  # 0 to 100
    technical_structure_score = Column(Float)
    trend_alignment_score = Column(Float)
    momentum_score = Column(Float)
    volatility_score = Column(Float)
    sr_score = Column(Float)
    mtf_agreement_score = Column(Float)
    news_risk_score = Column(Float)
    outcome = Column(String(20), default="PENDING")  # WIN, LOSS, BREAKEVEN, EXPIRED

class BacktestRun(Base):
    __tablename__ = "backtests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    symbol = Column(String(20), nullable=False)
    strategy = Column(String(50), nullable=False)
    timeframe = Column(String(10), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    initial_capital = Column(Float, default=100000.0)
    risk_per_trade = Column(Float, default=1.0)
    spread_pips = Column(Float, default=1.2)
    slippage_pips = Column(Float, default=0.5)
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    net_profit = Column(Float, default=0.0)
    net_profit_pct = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    sortino_ratio = Column(Float, default=0.0)
    avg_r = Column(Float, default=0.0)
    equity_curve = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BacktestTrade(Base):
    __tablename__ = "backtest_trades"
    
    id = Column(Integer, primary_key=True, index=True)
    backtest_id = Column(Integer, ForeignKey("backtests.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False)
    entry_time = Column(DateTime, nullable=False)
    exit_time = Column(DateTime, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    lot_size = Column(Float, nullable=False)
    pnl = Column(Float, nullable=False)
    r_multiple = Column(Float, nullable=False)
    exit_reason = Column(String(50))  # TP1, TP2, SL, TIMEOUT

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String(50), unique=True, nullable=False)
    algorithm = Column(String(100), default="Hybrid Ensemble (RF + GBM + Regime Filter)")
    trained_at = Column(DateTime, default=datetime.utcnow)
    dataset_size = Column(Integer, default=250000)
    feature_count = Column(Integer, default=32)
    train_accuracy = Column(Float, default=0.742)
    validation_accuracy = Column(Float, default=0.718)
    out_of_sample_accuracy = Column(Float, default=0.694)
    precision = Column(Float, default=0.725)
    recall = Column(Float, default=0.701)
    f1_score = Column(Float, default=0.713)
    roc_auc = Column(Float, default=0.782)
    brier_score = Column(Float, default=0.182)
    status = Column(String(20), default="DEPLOYED")  # DEPLOYED, CANDIDATE, RETIRED

class Watchlist(Base):
    __tablename__ = "watchlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), default="Default Watchlist")
    symbols = Column(JSON, default=list)  # ["EUR/USD", "GBP/USD", "XAU/USD"]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="watchlists")

class NewsEvent(Base):
    __tablename__ = "news_events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    currency = Column(String(10), index=True, nullable=False)  # USD, EUR, GBP, JPY
    impact = Column(String(20), index=True, nullable=False)  # HIGH, MEDIUM, LOW
    release_time = Column(DateTime, index=True, nullable=False)
    previous = Column(String(50), nullable=True)
    forecast = Column(String(50), nullable=True)
    actual = Column(String(50), nullable=True)
    source = Column(String(100), default="Forex Factory / Bloomberg Feed")

class UserSetting(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme = Column(String(20), default="dark")
    preferred_timezone = Column(String(50), default="UTC")
    risk_percentage = Column(Float, default=1.0)
    max_daily_risk = Column(Float, default=3.0)
    min_ai_confidence = Column(Float, default=0.65)
    preferred_pairs = Column(JSON, default=list)
    preferred_timeframes = Column(JSON, default=list)
    news_filter_enabled = Column(Boolean, default=True)
    sound_alerts = Column(Boolean, default=True)
    data_provider = Column(String(50), default="DEMO_SIMULATOR")
    
    user = relationship("User", back_populates="settings")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    account_balance = Column(Float, default=100000.0)
    account_currency = Column(String(10), default="USD")
    max_risk_per_trade_pct = Column(Float, default=1.0)
    max_daily_drawdown_pct = Column(Float, default=3.0)
    max_open_positions = Column(Integer, default=5)
    leverage = Column(Integer, default=30)
    enforce_stops = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="risk_profiles")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class PaperTrade(Base):
    __tablename__ = "paper_trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symbol = Column(String(20), index=True, nullable=False)
    order_type = Column(String(10), nullable=False)  # BUY, SELL
    lot_size = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    unrealized_pnl = Column(Float, default=0.0)
    realized_pnl = Column(Float, default=0.0)
    status = Column(String(20), default="OPEN")  # OPEN, CLOSED_TP, CLOSED_SL, CLOSED_MANUAL
    opened_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="paper_trades")
