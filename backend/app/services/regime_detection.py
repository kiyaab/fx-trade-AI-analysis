from typing import Tuple, Dict
import pandas as pd
from .technical_analysis import TechnicalAnalysisEngine

class MarketRegimeDetector:
    """
    Classifies market regime into 8 canonical financial states:
    - TRENDING_BULLISH
    - TRENDING_BEARISH
    - RANGING
    - HIGH_VOLATILITY
    - LOW_VOLATILITY
    - BREAKOUT
    - REVERSAL
    - UNCERTAIN
    """

    @classmethod
    def detect_regime(cls, df: pd.DataFrame) -> Tuple[str, str, Dict[str, str]]:
        if len(df) < 30:
            return "UNCERTAIN", "MEDIUM", {
                "strategy": "WAIT",
                "risk_guidance": "Insufficient historical candle volume for regime confirmation.",
                "reasoning": "Data buffer initialization required."
            }

        df_ind, ind = TechnicalAnalysisEngine.compute_all_indicators(df)
        close = df_ind["close"].iloc[-1]
        prev_close = df_ind["close"].iloc[-5]
        
        adx = ind.adx_14 or 20.0
        rsi = ind.rsi_14 or 50.0
        bb_bw = float(df_ind["bb_bandwidth"].iloc[-1]) if "bb_bandwidth" in df_ind else 0.02
        bb_pct_b = float(df_ind["bb_pct_b"].iloc[-1]) if "bb_pct_b" in df_ind else 0.5
        atr_14 = ind.atr_14 or 0.001
        norm_atr = atr_14 / close

        # Volatility assessment
        if norm_atr > 0.006 or bb_bw > 0.035:
            vol_level = "HIGH"
        elif norm_atr < 0.0018:
            vol_level = "LOW"
        else:
            vol_level = "MEDIUM"

        # Regime evaluation tree
        # 1. High Volatility Spike / News Breakout
        if vol_level == "HIGH" and (bb_pct_b > 1.05 or bb_pct_b < -0.05):
            regime = "BREAKOUT"
            guidance = {
                "strategy": "BREAKOUT_MOMENTUM",
                "risk_guidance": "High volatility breakout in progress. Widen stop-losses and reduce lot size by 30%.",
                "reasoning": f"Price breached Bollinger Band with expanding bandwidth ({bb_bw:.4f}) and elevated ATR."
            }
        # 2. Trending Bullish
        elif adx > 25.0 and close > ind.ema_50 and ind.ema_21 > ind.ema_50 and rsi > 52.0:
            regime = "TRENDING_BULLISH"
            guidance = {
                "strategy": "TREND_FOLLOWING_PULLBACK",
                "risk_guidance": "Favor BUY orders on pullbacks toward EMA 21 / Support confluence.",
                "reasoning": f"Bullish alignment across EMAs with ADX strength at {adx:.1f} and positive momentum."
            }
        # 3. Trending Bearish
        elif adx > 25.0 and close < ind.ema_50 and ind.ema_21 < ind.ema_50 and rsi < 48.0:
            regime = "TRENDING_BEARISH"
            guidance = {
                "strategy": "TREND_FOLLOWING_RALLY_FADE",
                "risk_guidance": "Favor SELL orders on rallies into resistance or dynamic EMA rejection.",
                "reasoning": f"Bearish alignment below EMA 50 with ADX at {adx:.1f} indicating active downtrend."
            }
        # 4. Reversal from extremes
        elif (rsi > 74.0 and bb_pct_b > 0.98) or (rsi < 26.0 and bb_pct_b < 0.02):
            regime = "REVERSAL"
            guidance = {
                "strategy": "COUNTER_TREND_MEAN_REVERSION",
                "risk_guidance": "Severe oscillator exhaustion. Wait for confirmed candle reversal pattern before entry.",
                "reasoning": f"Extreme RSI ({rsi:.1f}) coupled with outer Bollinger boundary rejection."
            }
        # 5. Ranging / Consolidation
        elif adx < 20.0 and 0.15 < bb_pct_b < 0.85:
            regime = "RANGING"
            guidance = {
                "strategy": "RANGE_BOUND_S_R",
                "risk_guidance": "Trade boundaries: buy support, sell resistance. Avoid trend continuation bets.",
                "reasoning": f"ADX is compressed at {adx:.1f}, indicating low directional trend momentum."
            }
        # 6. Low Volatility Squeeze
        elif vol_level == "LOW" and bb_bw < 0.012:
            regime = "LOW_VOLATILITY"
            guidance = {
                "strategy": "SQUEEZE_PREPARATION",
                "risk_guidance": "Market is tightly compressed. Anticipate volatile expansion; wait for confirmed break.",
                "reasoning": "Bollinger bandwidth compression reflects pre-breakout accumulation/distribution."
            }
        # 7. Uncertain / Choppy
        else:
            regime = "UNCERTAIN"
            guidance = {
                "strategy": "WAIT",
                "risk_guidance": "Conflicting technical evidence. Capital preservation is the highest priority.",
                "reasoning": "Mixed signals between moving averages and oscillators without clean market structure."
            }

        return regime, vol_level, guidance
