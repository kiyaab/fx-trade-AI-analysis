from fastapi import APIRouter, HTTPException
from ..schemas import PaperTradeOrderRequest, PaperTradeResponse
from ..services.paper_trading import paper_trading_service

router = APIRouter(prefix="/paper-trading", tags=["Paper Trading"])

@router.get("/portfolio")
def get_portfolio():
    """
    Returns virtual balance, equity, unrealized/realized PnL, and open/closed positions.
    """
    return paper_trading_service.get_portfolio_summary()

@router.post("/order", response_model=PaperTradeResponse)
def place_paper_order(req: PaperTradeOrderRequest):
    """
    Simulates a paper trading order execution without real capital.
    """
    return paper_trading_service.open_trade(req)

@router.post("/close/{trade_id}", response_model=PaperTradeResponse)
def close_paper_order(trade_id: int):
    """
    Closes an open simulated paper position at current market price.
    """
    trade = paper_trading_service.close_trade(trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade
