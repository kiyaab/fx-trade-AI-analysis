from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..schemas import NewsItem

class NewsEngine:
    """
    Forex Economic Calendar & Macroeconomic Impact Filter.
    Monitors high-impact macroeconomic releases and enforces signal blackout periods.
    """

    @classmethod
    def get_upcoming_economic_events(cls) -> List[NewsItem]:
        now = datetime.utcnow()
        # Realistic calendar events relative to current time
        events_data = [
            {
                "id": 1,
                "title": "US Non-Farm Payrolls (NFP)",
                "currency": "USD",
                "impact": "HIGH",
                "offset_hours": 3.5,
                "previous": "142K",
                "forecast": "150K",
                "actual": None,
            },
            {
                "id": 2,
                "title": "US Core CPI MoM",
                "currency": "USD",
                "impact": "HIGH",
                "offset_hours": 7.0,
                "previous": "0.3%",
                "forecast": "0.2%",
                "actual": None,
            },
            {
                "id": 3,
                "title": "ECB Main Refinancing Rate Decision",
                "currency": "EUR",
                "impact": "HIGH",
                "offset_hours": 12.0,
                "previous": "3.65%",
                "forecast": "3.40%",
                "actual": None,
            },
            {
                "id": 4,
                "title": "UK GDP (MoM)",
                "currency": "GBP",
                "impact": "MEDIUM",
                "offset_hours": 18.0,
                "previous": "0.0%",
                "forecast": "0.2%",
                "actual": None,
            },
            {
                "id": 5,
                "title": "Bank of Japan Policy Rate",
                "currency": "JPY",
                "impact": "HIGH",
                "offset_hours": 26.0,
                "previous": "0.25%",
                "forecast": "0.25%",
                "actual": None,
            },
            {
                "id": 6,
                "title": "German Flash Manufacturing PMI",
                "currency": "EUR",
                "impact": "MEDIUM",
                "offset_hours": 32.0,
                "previous": "40.6",
                "forecast": "41.2",
                "actual": None,
            },
            {
                "id": 7,
                "title": "Australian Unemployment Rate",
                "currency": "AUD",
                "impact": "HIGH",
                "offset_hours": 40.0,
                "previous": "4.2%",
                "forecast": "4.1%",
                "actual": None,
            }
        ]

        items = []
        for e in events_data:
            release_dt = now + timedelta(hours=e["offset_hours"])
            diff_mins = int((release_dt - now).total_seconds() / 60)
            if diff_mins < 60:
                time_until = f"in {diff_mins}m"
            else:
                time_until = f"in {diff_mins // 60}h {diff_mins % 60}m"

            items.append(NewsItem(
                id=e["id"],
                title=e["title"],
                currency=e["currency"],
                impact=e["impact"],
                release_time=release_dt,
                previous=e["previous"],
                forecast=e["forecast"],
                actual=e["actual"],
                is_high_impact=(e["impact"] == "HIGH"),
                time_until=time_until
            ))
        return items

    @classmethod
    def check_news_risk_for_symbol(cls, symbol: str) -> Dict[str, Any]:
        """
        Evaluates whether high-impact events are impending within a 60-minute window for currencies in the pair.
        """
        currencies = symbol.split("/") if "/" in symbol else [symbol[:3], symbol[3:]]
        events = cls.get_upcoming_economic_events()
        now = datetime.utcnow()

        imminent_events = []
        for e in events:
            if e.currency in currencies and e.is_high_impact:
                delta_mins = (e.release_time - now).total_seconds() / 60.0
                if 0 <= delta_mins <= 60:
                    imminent_events.append(e)

        if imminent_events:
            return {
                "has_high_impact_news": True,
                "action": "BLOCK_NEW_SETUPS",
                "warning": f"HIGH IMPACT EVENT IMMINENT: {imminent_events[0].title} releases {imminent_events[0].time_until}. New setups restricted.",
                "event": imminent_events[0]
            }
        return {
            "has_high_impact_news": False,
            "action": "ALLOW",
            "warning": None,
            "event": None
        }
