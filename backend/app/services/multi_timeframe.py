from typing import Dict, List
import pandas as pd
from ..schemas import MTFRow, MultiTimeframeAnalysis
from .data_provider import MarketDataProvider
from .technical_analysis import TechnicalAnalysisEngine

TIMEFRAME_WEIGHTS = {
    "1W": 0.25,
    "1D": 0.25,
    "4H": 0.20,
    "1H": 0.15,
    "15M": 0.10,
    "5M": 0.05
}

class MultiTimeframeEngine:
    """
    Evaluates multi-timeframe confluence across 1W, 1D, 4H, 1H, 15M, 5M.
    Derives trend, momentum, structure, signal, and composite market bias.
    """

    @classmethod
    def analyze_symbol(cls, provider: MarketDataProvider, symbol: str) -> MultiTimeframeAnalysis:
        rows: List[MTFRow] = []
        weighted_score = 0.0  # +100 for max bullish, -100 for max bearish

        for tf, weight in TIMEFRAME_WEIGHTS.items():
            candles = provider.get_historical_candles(symbol, timeframe=tf, count=60)
            df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
            if df.empty or len(df) < 15:
                # Fallback neutral
                rows.append(MTFRow(
                    timeframe=tf,
                    trend="Neutral",
                    momentum="Neutral",
                    structure="Range",
                    signal="WAIT",
                    weight=weight
                ))
                continue

            df, ind = TechnicalAnalysisEngine.compute_all_indicators(df)
            cur_price = float(df["close"].iloc[-1])

            # Trend Determination
            ema_21 = ind.ema_21 or cur_price
            ema_50 = ind.ema_50 or cur_price
            ema_200 = ind.ema_200 or cur_price

            trend_val = 0
            if cur_price > ema_50 and ema_21 > ema_50:
                trend = "Bullish"
                trend_val = 1
            elif cur_price < ema_50 and ema_21 < ema_50:
                trend = "Bearish"
                trend_val = -1
            else:
                trend = "Neutral"

            # Momentum Determination
            rsi = ind.rsi_14 or 50.0
            macd_h = ind.macd_hist or 0.0
            if rsi > 58 and macd_h > 0:
                momentum = "Strong"
                mom_val = 1
            elif rsi < 42 and macd_h < 0:
                momentum = "Strong"  # Bearish strong
                mom_val = -1
            elif 45 <= rsi <= 55:
                momentum = "Neutral"
                mom_val = 0
            else:
                momentum = "Moderate"
                mom_val = 0.5 if rsi > 50 else -0.5

            # Market Structure
            events = TechnicalAnalysisEngine.detect_market_structure(df, window=3)
            bullish_bos = any(e.event_type == "BOS_BULLISH" for e in events[-2:])
            bearish_bos = any(e.event_type == "BOS_BEARISH" for e in events[-2:])
            if bullish_bos:
                structure = "Bullish"
                struct_val = 1
            elif bearish_bos:
                structure = "Bearish"
                struct_val = -1
            else:
                structure = "Range" if abs(trend_val) == 0 else trend
                struct_val = trend_val * 0.7

            # Signal for this TF
            total_tf_score = (trend_val * 0.45) + (mom_val * 0.35) + (struct_val * 0.20)
            if total_tf_score >= 0.50:
                sig = "BUY"
            elif total_tf_score <= -0.50:
                sig = "SELL"
            else:
                sig = "WAIT"

            rows.append(MTFRow(
                timeframe=tf,
                trend=trend,
                momentum=momentum,
                structure=structure,
                signal=sig,
                weight=weight
            ))

            weighted_score += (total_tf_score * 100.0) * weight

        # Overall composite bias
        if weighted_score >= 45.0:
            overall_bias = "STRONG_BULLISH"
            summary_verdict = f"{symbol} shows strong multi-timeframe bullish confluence. Higher timeframes (1W, 1D, 4H) dominate momentum and structure."
        elif weighted_score >= 18.0:
            overall_bias = "MODERATE_BULLISH"
            summary_verdict = f"{symbol} maintains mild bullish bias, though lower timeframes display pullbacks or consolidation."
        elif weighted_score <= -45.0:
            overall_bias = "STRONG_BEARISH"
            summary_verdict = f"{symbol} exhibits heavy downward momentum across daily and 4-hour structures."
        elif weighted_score <= -18.0:
            overall_bias = "MODERATE_BEARISH"
            summary_verdict = f"{symbol} leans bearish with persistent resistance rejections on intraday charts."
        else:
            overall_bias = "NEUTRAL_WAIT"
            summary_verdict = f"{symbol} is in equilibrium or displaying conflicting timeframe signals. Market structure recommends waiting for clean breakout."

        alignment_score = round(abs(weighted_score), 1)

        return MultiTimeframeAnalysis(
            symbol=symbol,
            overall_bias=overall_bias,
            alignment_score=alignment_score,
            rows=rows,
            summary_verdict=summary_verdict
        )
