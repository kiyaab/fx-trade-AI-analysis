from fastapi import APIRouter
from .markets import router as markets_router
from .signals import router as signals_router
from .backtest import router as backtest_router
from .risk import router as risk_router
from .assistant import router as assistant_router
from .news import router as news_router
from .paper_trading import router as paper_trading_router
from .monitoring import router as monitoring_router

api_router = APIRouter()
api_router.include_router(markets_router)
api_router.include_router(signals_router)
api_router.include_router(backtest_router)
api_router.include_router(risk_router)
api_router.include_router(assistant_router)
api_router.include_router(news_router)
api_router.include_router(paper_trading_router)
api_router.include_router(monitoring_router)
