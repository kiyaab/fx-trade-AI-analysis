from datetime import datetime
from typing import Dict, Any, Optional
import re
from ..schemas import AssistantQueryRequest, AssistantQueryResponse
from .data_provider import default_provider, BASE_ANCHOR_PRICES
from .technical_analysis import TechnicalAnalysisEngine
from .ml_prediction import prediction_engine
from .trade_setup import TradeSetupGenerator
from .multi_timeframe import MultiTimeframeEngine

class AIAssistantEngine:
    """
    Conversational AI Forex Assistant.
    Provides natural language quantitative analysis grounded strictly in the platform's
    live data, market structure, indicators, and model state.
    """

    @classmethod
    def process_query(cls, req: AssistantQueryRequest) -> AssistantQueryResponse:
        q = req.query.strip().lower()
        now = datetime.utcnow()

        # Detect referenced symbol
        target_symbol = "EUR/USD"
        for s in BASE_ANCHOR_PRICES.keys():
            sym_clean = s.lower().replace("/", "")
            if sym_clean in q or s.lower() in q:
                target_symbol = s
                break
        if req.symbol and req.symbol in BASE_ANCHOR_PRICES:
            target_symbol = req.symbol

        # Fetch current state for target symbol
        quote = default_provider.get_latest_quote(target_symbol)
        candles = default_provider.get_historical_candles(target_symbol, timeframe=req.context_timeframe or "4H", count=100)
        df = TechnicalAnalysisEngine.candles_to_dataframe(candles)
        pred = prediction_engine.predict(df, symbol=target_symbol, timeframe=req.context_timeframe or "4H")
        setup = TradeSetupGenerator.generate_setup(df, pred)
        mtf = MultiTimeframeEngine.analyze_symbol(default_provider, target_symbol)

        # 1. "Compare EUR/USD and GBP/USD"
        if "compare" in q:
            other_sym = "GBP/USD" if target_symbol != "GBP/USD" else "USD/JPY"
            for s in BASE_ANCHOR_PRICES.keys():
                if s != target_symbol and (s.lower().replace("/", "") in q or s.lower() in q):
                    other_sym = s
                    break
            
            other_q = default_provider.get_latest_quote(other_sym)
            answer = (
                f"**Comparative Analysis: {target_symbol} vs {other_sym}**\n\n"
                f"• **{target_symbol}**: Trading at `{quote['price']}` ({quote['change_24h_pct']:+.2f}% 24h). "
                f"Bias is **{pred.signal}** ({pred.confidence}% confidence) under a `{pred.market_regime}` regime.\n"
                f"• **{other_sym}**: Trading at `{other_q['price']}` ({other_q['change_24h_pct']:+.2f}% 24h). "
                f"Trend is `{other_q['trend']}` with AI confidence at `{other_q['ai_confidence']}%`.\n\n"
                f"**Institutional Verdict**: {target_symbol if pred.confidence > other_q['ai_confidence'] else other_sym} "
                f"presents clearer structural alignment with superior risk-to-reward asymmetry."
            )
            return AssistantQueryResponse(
                query=req.query,
                answer=answer,
                referenced_symbol=target_symbol,
                current_price=quote["price"],
                regime=pred.market_regime,
                setup_summary=setup.model_dump(),
                invalidation=setup.invalidating_conditions,
                timestamp=now
            )

        # 2. "Find the strongest setup today"
        if "strongest" in q or "best setup" in q or "top trade" in q:
            # Evaluate all pairs quickly
            best_pair = "EUR/USD"
            best_conf = 0.0
            best_setup = setup
            for sym in BASE_ANCHOR_PRICES.keys():
                c = default_provider.get_historical_candles(sym, timeframe="4H", count=80)
                d = TechnicalAnalysisEngine.candles_to_dataframe(c)
                p = prediction_engine.predict(d, symbol=sym, timeframe="4H")
                if p.signal in ["BUY", "SELL"] and p.confidence > best_conf:
                    best_conf = p.confidence
                    best_pair = sym
                    best_setup = TradeSetupGenerator.generate_setup(d, p)

            answer = (
                f"**Today's Highest-Probability Setup: {best_pair}**\n\n"
                f"• **Direction**: `{best_setup.direction}` (Quality Grade: `{best_setup.quality_grade}`)\n"
                f"• **Model Confidence**: `{best_setup.confidence}%`\n"
                f"• **Entry Zone**: `{best_setup.entry_zone}`\n"
                f"• **Stop Loss**: `{best_setup.stop_loss}`\n"
                f"• **Take Profit 1**: `{best_setup.take_profit_1}` | **TP2**: `{best_setup.take_profit_2}`\n"
                f"• **Risk/Reward**: `1:{best_setup.risk_reward_ratio}`\n\n"
                f"**Primary Catalyst**: Multi-timeframe confluence aligns with {best_setup.market_regime} regime and clean support/resistance rejection."
            )
            return AssistantQueryResponse(
                query=req.query,
                answer=answer,
                referenced_symbol=best_pair,
                current_price=best_setup.current_price,
                regime=best_setup.market_regime,
                setup_summary=best_setup.model_dump(),
                invalidation=best_setup.invalidating_conditions,
                timestamp=now
            )

        # 3. "What invalidates this setup?"
        if "invalidate" in q or "invalidation" in q or "when to exit" in q:
            answer = (
                f"**Invalidation Criteria for {target_symbol} ({setup.direction} Setup)**:\n\n"
                f"1. **Structural Breach**: {setup.invalidating_conditions}\n"
                f"2. **Stop Loss Hard Anchor**: If price touches `{setup.stop_loss}`, the setup thesis is 100% invalidated.\n"
                f"3. **Time Degradation**: If price fails to reach `{setup.take_profit_1}` within 24 hours while forming opposing candle patterns (e.g. Pin Bar rejection), close position."
            )
            return AssistantQueryResponse(
                query=req.query,
                answer=answer,
                referenced_symbol=target_symbol,
                current_price=quote["price"],
                regime=pred.market_regime,
                setup_summary=setup.model_dump(),
                invalidation=setup.invalidating_conditions,
                timestamp=now
            )

        # 4. "Calculate position size"
        if "position" in q or "lot" in q or "size" in q or "calculate" in q:
            answer = (
                f"**Position Sizing Calculation for {target_symbol}**:\n\n"
                f"• **Standard Account Balance**: `$100,000`\n"
                f"• **Max Recommended Risk (1%)**: `$1,000`\n"
                f"• **Stop Distance**: `{abs(setup.current_price - setup.stop_loss):.5f}`\n"
                f"• **Suggested Execution**: `{setup.suggested_position_size_lots} Standard Lots`\n"
                f"• **Institutional Safety Rule**: Never risk more than 2% per individual trade to prevent drawdown decay."
            )
            return AssistantQueryResponse(
                query=req.query,
                answer=answer,
                referenced_symbol=target_symbol,
                current_price=quote["price"],
                regime=pred.market_regime,
                setup_summary=setup.model_dump(),
                invalidation=setup.invalidating_conditions,
                timestamp=now
            )

        # 5. Default General / "Analyze Symbol" / "Why is it bullish/bearish"
        answer = (
            f"**Comprehensive Analysis: {target_symbol} ({req.context_timeframe or '4H'})**\n\n"
            f"• **Current Price**: `{quote['price']}` ({quote['change_24h_pct']:+.2f}% 24h)\n"
            f"• **AI Signal**: `{setup.direction}` with **{setup.confidence}%** confidence (Grade {setup.quality_grade})\n"
            f"• **Market Regime**: `{setup.market_regime.replace('_', ' ').title()}` ({setup.volatility_level} Volatility)\n"
            f"• **Multi-Timeframe Verdict**: {mtf.summary_verdict}\n\n"
            f"**Technical Evidence Breakdown**:\n"
            + "\n".join([f"  - {r}" for r in setup.reasoning[:4]]) + "\n\n"
            f"**Actionable Execution Plan**:\n"
            f"  - Entry Zone: `{setup.entry_zone}`\n"
            f"  - Stop Loss: `{setup.stop_loss}`\n"
            f"  - Take Profit: `{setup.take_profit_1}` (TP2: `{setup.take_profit_2}`)\n"
            f"  - Risk/Reward: `1:{setup.risk_reward_ratio}`\n\n"
            f"**Invalidation**: {setup.invalidating_conditions}"
        )
        return AssistantQueryResponse(
            query=req.query,
            answer=answer,
            referenced_symbol=target_symbol,
            current_price=quote["price"],
            regime=pred.market_regime,
            setup_summary=setup.model_dump(),
            invalidation=setup.invalidating_conditions,
            timestamp=now
        )
