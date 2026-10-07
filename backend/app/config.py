import os
from typing import List

class Settings:
    PROJECT_NAME: str = "ForexPulse AI Trading Intelligence Terminal"
    VERSION: str = "2.4.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fx_terminal.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Market Data
    DEFAULT_PROVIDER: str = os.getenv("DEFAULT_PROVIDER", "DEMO_SIMULATOR")  # "DEMO_SIMULATOR", "ALPHA_VANTAGE", "TWELVE_DATA", "YAHOO"
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    TWELVE_DATA_API_KEY: str = os.getenv("TWELVE_DATA_API_KEY", "")
    
    # Risk Parameters
    DEFAULT_ACCOUNT_BALANCE: float = 100000.0  # $100k demo standard
    DEFAULT_RISK_PER_TRADE_PERCENT: float = 1.0  # 1% per trade
    MAX_DAILY_RISK_PERCENT: float = 3.0          # Max 3% daily drawdown allowed
    MAX_LEVERAGE: int = 30                       # Regulated FX ceiling standard
    
    # AI Models
    MIN_CONFIDENCE_THRESHOLD: float = 0.65       # 65% minimum confidence to trigger trade setup
    HIGH_CONFIDENCE_THRESHOLD: float = 0.78      # 78%+ for Grade A setups
    
    # Supported Major FX Pairs & Commodities
    SUPPORTED_PAIRS: List[str] = [
        "EUR/USD",
        "GBP/USD",
        "USD/JPY",
        "USD/CHF",
        "AUD/USD",
        "USD/CAD",
        "NZD/USD",
        "XAU/USD"  # Gold
    ]

settings = Settings()
