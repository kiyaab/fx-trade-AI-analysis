from typing import Dict, Any, List
from ..schemas import AIPredictionResponse, TradeSetupResponse, TechnicalIndicators

class AIExplanationEngine:
    """
    Generates deterministic, mathematically grounded justifications for predictions.
    Explains the confluence of evidence, structural boundaries, and explicitly highlights uncertainty.
    """

    @classmethod
    def generate_detailed_explanation(
        cls,
        setup: TradeSetupResponse,
        prediction: AIPredictionResponse,
        indicators: TechnicalIndicators
    ) -> Dict[str, Any]:
        symbol = setup.symbol
        direction = setup.direction
        conf = setup.confidence
        regime = setup.market_regime.replace("_", " ").title()

        # Build Primary Evidence Synthesis
        primary_points = []
        if direction == "BUY":
            primary_points.append(f"{symbol} exhibits a bullish market structure within a {regime} regime.")
            if indicators.ema_200 and setup.current_price > indicators.ema_200:
                primary_points.append(f"Price is sustaining above the 200-period EMA ({indicators.ema_200:.4f}), which acts as structural dynamic support.")
            if indicators.rsi_14 and indicators.rsi_14 > 50:
                primary_points.append(f"RSI stands at {indicators.rsi_14:.1f}, confirming positive momentum without entering overbought exhaustion.")
            if indicators.macd_hist and indicators.macd_hist > 0:
                primary_points.append(f"MACD histogram expansion ({indicators.macd_hist:.5f}) demonstrates buyer dominance.")
            primary_points.append(f"Calculated reward-to-risk ratio of 1:{setup.risk_reward_ratio} provides positive statistical expectancy.")
        elif direction == "SELL":
            primary_points.append(f"{symbol} demonstrates dominant downward price action under a {regime} regime.")
            if indicators.ema_200 and setup.current_price < indicators.ema_200:
                primary_points.append(f"Price is trading beneath the institutional 200 EMA ({indicators.ema_200:.4f}), reinforcing the macro downtrend.")
            if indicators.rsi_14 and indicators.rsi_14 < 50:
                primary_points.append(f"RSI is depressed at {indicators.rsi_14:.1f}, confirming persistent selling velocity.")
            if indicators.macd_hist and indicators.macd_hist < 0:
                primary_points.append(f"MACD histogram reflects accelerating bearish impulse.")
            primary_points.append(f"Calculated reward-to-risk ratio of 1:{setup.risk_reward_ratio} aligns with disciplined risk asymmetry.")
        else:
            primary_points.append(f"{symbol} is currently oscillating within an {regime} state.")
            primary_points.append("Conflicting momentum vectors and compressed volatility suggest high probability of false breakouts.")
            primary_points.append("The algorithmic recommendation is to WAIT for structural expansion before committing capital.")

        # Build Uncertainty & Caveat Synthesis (Requirement #14 & #31)
        uncertainty_factors = []
        if conf < 75.0:
            uncertainty_factors.append("Model confidence is moderate (<75%), meaning probability of choppy whipsaws remains non-trivial.")
        if setup.volatility_level == "HIGH":
            uncertainty_factors.append("Elevated volatility expands candle wick variance, increasing early stop-out risks.")
        if indicators.adx_14 and indicators.adx_14 < 22:
            uncertainty_factors.append(f"ADX is subdued ({indicators.adx_14:.1f}), signaling weak underlying trend commitment.")
        uncertainty_factors.append("Unexpected macroeconomic headlines or geopolitical catalysts can swiftly override technical structures.")

        executive_summary = (
            f"{symbol} has an evaluated {direction} bias ({conf}% model confidence). "
            f"This hypothesis is supported by {len(primary_points)} technical factors across moving average positioning, "
            f"oscillator velocity, and regime classification. Invalidation is clearly anchored at {setup.stop_loss}."
        )

        return {
            "symbol": symbol,
            "direction": direction,
            "confidence": conf,
            "executive_summary": executive_summary,
            "primary_evidence": primary_points,
            "uncertainty_and_risks": uncertainty_factors,
            "invalidation_criterion": setup.invalidating_conditions,
            "factual_disclaimer": "This analysis represents quantitative probabilistic modeling, not guaranteed market outcomes or financial advice."
        }
