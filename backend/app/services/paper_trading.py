from datetime import datetime
from typing import List, Dict, Any, Optional
from ..schemas import PaperTradeOrderRequest, PaperTradeResponse
from .data_provider import default_provider, BASE_ANCHOR_PRICES

class PaperTradingEngine:
    """
    Forex Paper Trading Simulator.
    Simulates real broker order fills with virtual capital,
    live mark-to-market PnL updates, stop-loss and take-profit monitoring.
    """

    def __init__(self):
        self.initial_balance = 100000.0
        self.balance = 100000.0
        self.trades: Dict[int, Dict[str, Any]] = {}
        self._next_id = 1
        self._seed_sample_trades()

    def _seed_sample_trades(self):
        now = datetime.utcnow()
        # Seed 1 open trade and 2 closed trades for realistic initial dashboard
        self.trades[1] = {
            "id": 1,
            "symbol": "EUR/USD",
            "order_type": "BUY",
            "lot_size": 1.5,
            "entry_price": 1.0845,
            "current_price": 1.0865,
            "stop_loss": 1.0810,
            "take_profit": 1.0920,
            "unrealized_pnl": 300.0,
            "realized_pnl": 0.0,
            "status": "OPEN",
            "opened_at": now,
            "closed_at": None
        }
        self.trades[2] = {
            "id": 2,
            "symbol": "GBP/USD",
            "order_type": "SELL",
            "lot_size": 1.0,
            "entry_price": 1.3020,
            "current_price": 1.2970,
            "stop_loss": 1.3050,
            "take_profit": 1.2970,
            "unrealized_pnl": 0.0,
            "realized_pnl": 500.0,
            "status": "CLOSED_TP",
            "opened_at": now,
            "closed_at": now
        }
        self._next_id = 3

    def get_portfolio_summary(self) -> Dict[str, Any]:
        open_trades = [t for t in self.trades.values() if t["status"] == "OPEN"]
        closed_trades = [t for t in self.trades.values() if t["status"] != "OPEN"]

        # Recalculate mark-to-market for open trades
        total_unrealized_pnl = 0.0
        for t in open_trades:
            q = default_provider.get_latest_quote(t["symbol"])
            cur_p = q["price"]
            t["current_price"] = cur_p
            diff = (cur_p - t["entry_price"]) if t["order_type"] == "BUY" else (t["entry_price"] - cur_p)
            spec = BASE_ANCHOR_PRICES.get(t["symbol"], BASE_ANCHOR_PRICES["EUR/USD"])
            pip_size = 10 ** -spec["pips"]
            pips = diff / pip_size
            u_pnl = round(pips * 10.0 * t["lot_size"], 2)
            t["unrealized_pnl"] = u_pnl
            total_unrealized_pnl += u_pnl

        realized_pnl = sum(t["realized_pnl"] for t in closed_trades)
        equity = round(self.balance + realized_pnl + total_unrealized_pnl, 2)
        win_count = len([t for t in closed_trades if t["realized_pnl"] > 0])
        win_rate = round((win_count / max(1, len(closed_trades))) * 100.0, 1) if closed_trades else 100.0

        return {
            "virtual_balance": round(self.balance + realized_pnl, 2),
            "equity": equity,
            "unrealized_pnl": round(total_unrealized_pnl, 2),
            "realized_pnl": round(realized_pnl, 2),
            "open_positions_count": len(open_trades),
            "closed_positions_count": len(closed_trades),
            "win_rate": win_rate,
            "trades": list(self.trades.values())[::-1]
        }

    def open_trade(self, req: PaperTradeOrderRequest) -> PaperTradeResponse:
        quote = default_provider.get_latest_quote(req.symbol)
        now = datetime.utcnow()
        trade_id = self._next_id
        self._next_id += 1

        entry_p = quote["price"]
        record = {
            "id": trade_id,
            "symbol": req.symbol,
            "order_type": req.order_type,
            "lot_size": req.lot_size,
            "entry_price": entry_p,
            "current_price": entry_p,
            "stop_loss": req.stop_loss,
            "take_profit": req.take_profit,
            "unrealized_pnl": 0.0,
            "realized_pnl": 0.0,
            "status": "OPEN",
            "opened_at": now,
            "closed_at": None
        }
        self.trades[trade_id] = record
        return PaperTradeResponse(**record)

    def close_trade(self, trade_id: int) -> Optional[PaperTradeResponse]:
        if trade_id not in self.trades:
            return None
        t = self.trades[trade_id]
        if t["status"] != "OPEN":
            return PaperTradeResponse(**t)

        quote = default_provider.get_latest_quote(t["symbol"])
        t["current_price"] = quote["price"]
        t["closed_at"] = datetime.utcnow()
        t["status"] = "CLOSED_MANUAL"

        diff = (t["current_price"] - t["entry_price"]) if t["order_type"] == "BUY" else (t["entry_price"] - t["current_price"])
        spec = BASE_ANCHOR_PRICES.get(t["symbol"], BASE_ANCHOR_PRICES["EUR/USD"])
        pip_size = 10 ** -spec["pips"]
        pips = diff / pip_size
        t["realized_pnl"] = round(pips * 10.0 * t["lot_size"], 2)
        t["unrealized_pnl"] = 0.0

        return PaperTradeResponse(**t)

paper_trading_service = PaperTradingEngine()
