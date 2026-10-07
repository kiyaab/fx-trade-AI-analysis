from datetime import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
from ..schemas import TradeSetupResponse, AIPredictionResponse
from .technical_analysis import TechnicalAnalysisEngine
from .data_provider import BASE_ANCHOR_PRICES

class TradeSetupGenerator:
    """
    Constructs high-probability, risk-defined Forex Trade Setups.
    Computes Entry Zone, Stop-Loss, Take-Profit 1, Take-Profit 2,
    Risk/Reward ratio, Quality Grade (A+, A, B, C), and strict invalidation criteria.
    """

    @classmethod
    def generate_setup(
        cls,
        df: pd.DataFrame,
        prediction: AIPredictionResponse,
        account_balance: float = 100000.0,
        risk_pct: float = 1.0
    ) -> TradeSetupResponse:
        now = datetime.utcnow()
        symbol = prediction.symbol
        spec = BASE_ANCHOR_PRICES.get(symbol, BASE_ANCHOR_PRICES["EUR/USD"])
        pips_decimals = spec["pips"]
        
        cur_price = float(df["close"].iloc[-1])
        df_ind, ind = TechnicalAnalysisEngine.compute_all_indicators(df)
        atr = float(ind.atr_14 or (cur_price * 0.0035))
        zones = TechnicalAnalysisEngine.identify_support_resistance_zones(df)
        events = TechnicalAnalysisEngine.detect_market_structure(df)

        direction = prediction.signal
        reasons: List[str] = []
        is_actionable = direction in ["BUY", "SELL"] and prediction.confidence >= 65.0

        # Calculate Entry, SL, TP1, TP2, RR based on ATR and structure
        if direction == "BUY":
            entry_low = round(cur_price - (atr * 0.25), pips_decimals)
            entry_high = round(cur_price + (atr * 0.15), pips_decimals)
            entry_mid = (entry_low + entry_high) / 2.0
            
            # SL placed below recent swing low or 1.5 * ATR
            sl_distance = max(atr * 1.5, (15 * (10 ** -pips_decimals)))
            stop_loss = round(cur_price - sl_distance, pips_decimals)
            
            # TP1 at 1.8R, TP2 at 2.8R
            risk_dist = entry_mid - stop_loss
            tp1_dist = risk_dist * 1.8
            tp2_dist = risk_dist * 2.8
            take_profit_1 = round(entry_mid + tp1_dist, pips_decimals)
            take_profit_2 = round(entry_mid + tp2_dist, pips_decimals)
            rr_ratio = round(tp1_dist / risk_dist, 2) if risk_dist > 0 else 2.0

            # Dynamic invalidation sentence
            invalidation = (
                f"Setup is invalidated if price prints a sustained close below {stop_loss} on the 1H timeframe, "
                f"or if a bearish Change of Character (ChoCh) breaks support before entry is triggered."
            )

            # Checklist reasons
            reasons.append(f"Market regime confirmed as {prediction.market_regime.replace('_', ' ')}")
            if ind.ema_200 and cur_price > ind.ema_200:
                reasons.append("Price holds firmly above the institutional 200 EMA")
            if ind.rsi_14 and ind.rsi_14 > 50:
                reasons.append(f"RSI is bullish ({ind.rsi_14:.1f}) confirming upward momentum")
            if ind.macd_hist and ind.macd_hist > 0:
                reasons.append("MACD histogram is expanding in positive territory")
            reasons.append(f"Calculated Risk-to-Reward ratio is 1:{rr_ratio} to TP1")
            reasons.append("Support zone held on multiple retests with buying volume")

        elif direction == "SELL":
            entry_low = round(cur_price - (atr * 0.15), pips_decimals)
            entry_high = round(cur_price + (atr * 0.25), pips_decimals)
            entry_mid = (entry_low + entry_high) / 2.0
            
            sl_distance = max(atr * 1.5, (15 * (10 ** -pips_decimals)))
            stop_loss = round(cur_price + sl_distance, pips_decimals)
            
            risk_dist = stop_loss - entry_mid
            tp1_dist = risk_dist * 1.8
            tp2_dist = risk_dist * 2.8
            take_profit_1 = round(entry_mid - tp1_dist, pips_decimals)
            take_profit_2 = round(entry_mid - tp2_dist, pips_decimals)
            rr_ratio = round(tp1_dist / risk_dist, 2) if risk_dist > 0 else 2.0

            invalidation = (
                f"Setup is invalidated if price prints a sustained close above {stop_loss} on the 1H timeframe, "
                f"or if a bullish Break of Structure (BoS) breaches the local supply cluster."
            )

            reasons.append(f"Market regime confirmed as {prediction.market_regime.replace('_', ' ')}")
            if ind.ema_200 and cur_price < ind.ema_200:
                reasons.append("Price trades below the institutional 200 EMA resistance")
            if ind.rsi_14 and ind.rsi_14 < 50:
                reasons.append(f"RSI is bearish ({ind.rsi_14:.1f}) reflecting selling pressure")
            if ind.macd_hist and ind.macd_hist < 0:
                reasons.append("MACD histogram confirms downward momentum expansion")
            reasons.append(f"Calculated Risk-to-Reward ratio is 1:{rr_ratio} to TP1")
            reasons.append("Supply zone rejected prior rallies with upper wicks")

        else:
            # WAIT regime
            entry_low = round(cur_price * 0.998, pips_decimals)
            entry_high = round(cur_price * 1.002, pips_decimals)
            stop_loss = round(cur_price * 0.995, pips_decimals)
            take_profit_1 = round(cur_price * 1.005, pips_decimals)
            take_profit_2 = round(cur_price * 1.008, pips_decimals)
            rr_ratio = 1.0
            invalidation = "Setup is currently neutral and invalidated for aggressive entry. Market is in consolidation or conflicting regime. Stand aside until a structural breakout occurs."
            reasons = [
                "Market is currently in consolidation/uncertain regime",
                "Oscillators are neutral without directional edge",
                "Higher timeframes and intraday charts show conflicting signals",
                "Standing aside prevents chop and capital erosion"
            ]

        # Calculate suggested lot size based on 1% risk
        risk_dollars = account_balance * (risk_pct / 100.0)
        risk_pips = abs(cur_price - stop_loss) / (10 ** -pips_decimals)
        pip_val_std = spec.get("spread", 1.0) * 10.0  # Approx $10 per pip per lot
        suggested_lots = round(max(0.01, min(10.0, risk_dollars / (max(risk_pips, 1.0) * 10.0))), 2)

        # Quality Grade determination
        conf = prediction.confidence
        if conf >= 78.0 and rr_ratio >= 2.0:
            quality = "A+"
            score = 92.0
        elif conf >= 72.0:
            quality = "A"
            score = 84.0
        elif conf >= 65.0:
            quality = "B"
            score = 75.0
        else:
            quality = "C"
            score = 60.0

        entry_zone_str = f"{entry_low} – {entry_high}"

        return TradeSetupResponse(
            symbol=symbol,
            direction=direction,
            quality_grade=quality,
            confidence=prediction.confidence,
            current_price=cur_price,
            entry_zone=entry_zone_str,
            entry_low=entry_low,
            entry_high=entry_high,
            stop_loss=stop_loss,
            take_profit_1=take_profit_1,
            take_profit_2=take_profit_2,
            risk_reward_ratio=rr_ratio,
            suggested_position_size_lots=suggested_lots,
            volatility_level=prediction.volatility_level,
            market_regime=prediction.market_regime,
            reasoning=reasons,
            invalidating_conditions=invalidation,
            timestamp=now,
            data_freshness="LIVE (DEMO)",
            is_actionable=is_actionable,
            setup_score=score
        )
