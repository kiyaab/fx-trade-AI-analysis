from fastapi import APIRouter
from ..schemas import BacktestRequest, BacktestResponse
from ..services.backtest_engine import BacktestingEngine

router = APIRouter(prefix="/backtest", tags=["Backtesting"])

@router.post("/run", response_model=BacktestResponse)
def run_backtest(req: BacktestRequest):
    """
    Executes an event-driven backtest with spread, slippage,
    realistic fills, equity curve generation, and walk-forward validation folds.
    """
    return BacktestingEngine.run_backtest(req)
