import {
  MarketOverviewItem,
  Candle,
  TechnicalIndicators,
  SupportResistanceZone,
  MarketStructureEvent,
  PriceActionPattern,
  MultiTimeframeAnalysis,
  AIPrediction,
  TradeSetup,
  RiskCalcRequest,
  RiskCalcResponse,
  BacktestParams,
  BacktestResult,
  NewsItem,
  ModelMonitoringMetrics,
  PortfolioSummary,
  PaperTrade
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    // Next.js dynamic fetch
    cache: "no-store"
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Markets
  getMarketOverview: () => fetchJson<MarketOverviewItem[]>("/markets/overview"),
  getCandles: (symbol: string, timeframe: string = "4H", count: number = 150) =>
    fetchJson<Candle[]>(`/markets/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&count=${count}`),
  getIndicators: (symbol: string, timeframe: string = "4H") =>
    fetchJson<{
      symbol: string;
      timeframe: string;
      current_price: number;
      indicators: TechnicalIndicators;
      support_resistance_zones: SupportResistanceZone[];
      market_structure_events: MarketStructureEvent[];
      price_action_patterns: PriceActionPattern[];
    }>(`/markets/indicators?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`),

  // Signals & Prediction
  getPrediction: (symbol: string, timeframe: string = "4H") =>
    fetchJson<AIPrediction>(`/signals/prediction?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`),
  getTradeSetup: (symbol: string, timeframe: string = "4H") =>
    fetchJson<TradeSetup>(`/signals/setup?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`),
  getMultiTimeframe: (symbol: string) =>
    fetchJson<MultiTimeframeAnalysis>(`/signals/multi-timeframe?symbol=${encodeURIComponent(symbol)}`),
  getRankedSetups: () => fetchJson<any[]>("/signals/ranked-setups"),
  getExplanation: (symbol: string, timeframe: string = "4H") =>
    fetchJson<any>(`/signals/explanation?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`),
  getSignalHistory: () => fetchJson<any>("/signals/history"),

  // Risk Engine
  calculateRisk: (data: RiskCalcRequest) =>
    fetchJson<RiskCalcResponse>("/risk/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Backtest
  runBacktest: (data: BacktestParams) =>
    fetchJson<BacktestResult>("/backtest/run", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // AI Assistant
  queryAssistant: (query: string, symbol: string = "EUR/USD", contextTimeframe: string = "4H") =>
    fetchJson<{
      query: string;
      answer: string;
      referenced_symbol: string;
      current_price: number;
      regime: string;
      setup_summary?: any;
      invalidation?: string;
      timestamp: string;
    }>("/assistant/query", {
      method: "POST",
      body: JSON.stringify({ query, symbol, context_timeframe: contextTimeframe })
    }),

  // News
  getNewsCalendar: () => fetchJson<NewsItem[]>("/news/calendar"),
  checkNewsRisk: (symbol: string) =>
    fetchJson<{ has_high_impact_news: boolean; action: string; warning: string | null; event: any }>(
      `/news/check-risk?symbol=${encodeURIComponent(symbol)}`
    ),

  // Paper Trading
  getPortfolio: () => fetchJson<PortfolioSummary>("/paper-trading/portfolio"),
  placePaperOrder: (data: { symbol: string; order_type: "BUY" | "SELL"; lot_size: number; stop_loss: number; take_profit: number }) =>
    fetchJson<PaperTrade>("/paper-trading/order", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  closePaperOrder: (tradeId: number) =>
    fetchJson<PaperTrade>(`/paper-trading/close/${tradeId}`, { method: "POST" }),

  // Model Monitoring
  getMonitoringMetrics: () => fetchJson<ModelMonitoringMetrics>("/monitoring/metrics"),
  retrainModel: () => fetchJson<any>("/monitoring/retrain", { method: "POST" })
};
