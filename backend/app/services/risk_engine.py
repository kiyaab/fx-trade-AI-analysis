from typing import Dict, Any, List
from ..schemas import RiskCalculationRequest, RiskCalculationResponse
from .data_provider import BASE_ANCHOR_PRICES

class RiskManagementEngine:
    """
    Institutional Forex Risk Management & Position Sizing Engine.
    Enforces risk percentage boundaries, calculates precise lot sizes,
    pip risk, dollar exposure, margin requirements, and leverage safeguards.
    """

    @classmethod
    def calculate_position_risk(cls, req: RiskCalculationRequest) -> RiskCalculationResponse:
        spec = BASE_ANCHOR_PRICES.get(req.symbol, BASE_ANCHOR_PRICES["EUR/USD"])
        pip_decimals = spec["pips"]
        pip_size = 10 ** -pip_decimals  # 0.0001 for 4-decimal, 0.01 for 2-decimal

        # Risk amount in USD
        risk_usd = round(req.account_balance * (req.risk_percentage / 100.0), 2)

        # Pip distance to stop loss
        price_diff = abs(req.entry_price - req.stop_loss)
        pips_at_risk = round(price_diff / pip_size, 1)

        # Standard lot pip value in USD (approx $10 for EUR/USD, varies for JPY/CHF/Gold)
        if "JPY" in req.symbol:
            pip_value_std = 1000.0 / req.entry_price  # Approx ~$6.50-$7.00 per pip per standard lot
        elif req.symbol == "XAU/USD":
            pip_value_std = 10.0  # $10 per 0.10 move per standard 100oz contract
        else:
            pip_value_std = 10.0  # Standard $10/pip for USD-quoted pairs

        # Lot sizing
        if pips_at_risk <= 0:
            suggested_lots = 0.01
        else:
            dollar_per_pip_needed = risk_usd / pips_at_risk
            raw_lots = dollar_per_pip_needed / max(pip_value_std, 1.0)
            suggested_lots = round(max(0.01, min(50.0, raw_lots)), 2)

        micro_lots = round(suggested_lots * 100.0, 1)

        # Potential Profit TP1
        tp1_price_diff = abs(req.take_profit_1 - req.entry_price)
        tp1_pips = round(tp1_price_diff / pip_size, 1)
        profit_tp1_usd = round(tp1_pips * pip_value_std * suggested_lots, 2)
        rr_tp1 = round(tp1_pips / max(pips_at_risk, 0.1), 2)

        # Potential Profit TP2
        profit_tp2_usd = None
        rr_tp2 = None
        if req.take_profit_2:
            tp2_price_diff = abs(req.take_profit_2 - req.entry_price)
            tp2_pips = round(tp2_price_diff / pip_size, 1)
            profit_tp2_usd = round(tp2_pips * pip_value_std * suggested_lots, 2)
            rr_tp2 = round(tp2_pips / max(pips_at_risk, 0.1), 2)

        # Margin requirement (Notional Value / Leverage)
        # 1 standard lot = 100,000 units base currency
        notional_value_usd = suggested_lots * 100000.0 * (req.entry_price if "USD" not in req.symbol.split("/")[0] else 1.0)
        margin_req_usd = round(notional_value_usd / max(1, req.leverage), 2)

        # Risk safety validations and warnings
        warnings: List[str] = []
        is_safe = True

        if req.risk_percentage > 2.0:
            warnings.append(f"Risk of {req.risk_percentage}% exceeds institutional safety ceiling (max 2.0% recommended).")
            is_safe = False

        if pips_at_risk < 10.0:
            warnings.append(f"Stop-loss is only {pips_at_risk} pips away. High probability of noise trigger during market spread expansion.")

        if margin_req_usd > (req.account_balance * 0.40):
            warnings.append("Margin requirement exceeds 40% of your account balance. Excessive leverage exposure.")
            is_safe = False

        if rr_tp1 < 1.5:
            warnings.append(f"Risk-to-Reward ratio (1:{rr_tp1}) is below the recommended 1:1.5 threshold.")

        return RiskCalculationResponse(
            symbol=req.symbol,
            risk_amount_usd=risk_usd,
            pip_risk=pips_at_risk,
            pip_value_std_lot=round(pip_value_std, 2),
            suggested_lot_size=suggested_lots,
            micro_lots=micro_lots,
            margin_required_usd=margin_req_usd,
            potential_profit_tp1_usd=profit_tp1_usd,
            potential_profit_tp2_usd=profit_tp2_usd,
            risk_reward_ratio_tp1=rr_tp1,
            risk_reward_ratio_tp2=rr_tp2,
            warnings=warnings,
            is_safe=is_safe
        )
