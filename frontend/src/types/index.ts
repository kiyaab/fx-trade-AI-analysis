export type SignalType = "BUY" | "SELL" | "WAIT";
export type MarketDirection = "Bullish" | "Bearish" | "Neutral";
export type VolatilityLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
export type QualityGrade = "A+" | "A" | "B" | "C";

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketOverviewItem {
  symbol: string;
  price: number;
  change_24h: number;
  change_24h_pct: number;
  high_24h: number;
  low_24h: number;
  trend: string;
  volatility: string;
  ai_confidence: number;
  signal: SignalType;
  spread_pips: number;
  data_status: string;
  updated_at: string;
}

export interface TechnicalIndicators {
  ema_9?: number;
  ema_21?: number;
  ema_50?: number;
  ema_100?: number;
  ema_200?: number;
  sma_50?: number;
  sma_200?: number;
  rsi_14?: number;
  stoch_rsi_k?: number;
  stoch_rsi_d?: number;
  macd_line?: number;
  macd_signal?: number;
  macd_hist?: number;
  atr_14?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  adx_14?: number;
  roc_12?: number;
  historical_volatility?: number;
}

export interface SupportResistanceZone {
  zone_type: "RESISTANCE" | "SUPPORT" | "ORDER_BLOCK" | "LIQUIDITY";
  price_low: number;
  price_high: number;
  strength: number;
  test_count: number;
  is_major: boolean;
}

export interface MarketStructureEvent {
  event_type: string;
  price: number;
  timestamp: string;
  label: string;
}

export interface PriceActionPattern {
  pattern_name: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  significance: "HIGH" | "MEDIUM" | "LOW";
  candle_index: number;
}

export interface MTFRow {
  timeframe: string;
  trend: string;
  momentum: string;
  structure: string;
  signal: SignalType;
  weight: number;
}

export interface MultiTimeframeAnalysis {
  symbol: string;
  overall_bias: string;
  alignment_score: number;
  rows: MTFRow[];
  summary_verdict: string;
}

export interface AIPrediction {
  symbol: string;
  timeframe: string;
  signal: SignalType;
  confidence: number;
  prob_buy: number;
  prob_sell: number;
  prob_wait: number;
  market_direction: MarketDirection;
  market_regime: string;
  volatility_level: VolatilityLevel;
  timestamp: string;
  data_freshness: string;
  model_version: string;
}

export interface TradeSetup {
  symbol: string;
  direction: SignalType;
  quality_grade: QualityGrade;
  confidence: number;
  current_price: number;
  entry_zone: string;
  entry_low: number;
  entry_high: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  risk_reward_ratio: number;
  suggested_position_size_lots: number;
  volatility_level: VolatilityLevel;
  market_regime: string;
  reasoning: string[];
  invalidating_conditions: string;
  timestamp: string;
  data_freshness: string;
  is_actionable: boolean;
  setup_score: number;
}

export interface RiskCalcRequest {
  symbol: string;
  account_balance: number;
  risk_percentage: number;
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2?: number;
  leverage: number;
}

export interface RiskCalcResponse {
  symbol: string;
  risk_amount_usd: number;
  pip_risk: number;
  pip_value_std_lot: number;
  suggested_lot_size: number;
  micro_lots: number;
  margin_required_usd: number;
  potential_profit_tp1_usd: number;
  potential_profit_tp2_usd?: number;
  risk_reward_ratio_tp1: number;
  risk_reward_ratio_tp2?: number;
  warnings: string[];
  is_safe: boolean;
}

export interface BacktestParams {
  symbol: string;
  timeframe: string;
  strategy: string;
  initial_capital: number;
  risk_per_trade_pct: number;
  spread_pips: number;
  slippage_pips: number;
}

export interface BacktestTrade {
  trade_id: number;
  symbol: string;
  direction: string;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  lot_size: number;
  pnl: number;
  r_multiple: number;
  exit_reason: string;
}

export interface WalkForwardFold {
  period: string;
  train_accuracy: number;
  val_accuracy: number;
  out_of_sample_accuracy: number;
  sharpe: number;
  net_profit_pct: number;
}

export interface BacktestResult {
  symbol: string;
  strategy: string;
  timeframe: string;
  initial_capital: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  net_profit: number;
  net_profit_pct: number;
  max_drawdown: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  avg_r: number;
  avg_trade_pnl: number;
  largest_win: number;
  largest_loss: number;
  consecutive_losses_max: number;
  equity_curve: { timestamp: string; equity: number; drawdown: number }[];
  trade_log: BacktestTrade[];
  walk_forward: WalkForwardFold[];
  disclaimer: string;
}

export interface NewsItem {
  id: number;
  title: string;
  currency: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  release_time: string;
  previous?: string;
  forecast?: string;
  actual?: string;
  is_high_impact: boolean;
  time_until: string;
}

export interface ModelMonitoringMetrics {
  model_version: string;
  algorithm: string;
  dataset_size: number;
  features_count: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  brier_score: number;
  prediction_drift_psi: number;
  feature_drift_detected: boolean;
  last_trained: string;
  status: string;
  feature_importances: Record<string, number>;
}

export interface PaperTrade {
  id: number;
  symbol: string;
  order_type: "BUY" | "SELL";
  lot_size: number;
  entry_price: number;
  current_price: number;
  stop_loss: number;
  take_profit: number;
  unrealized_pnl: number;
  realized_pnl: number;
  status: string;
  opened_at: string;
  closed_at?: string;
}

export interface PortfolioSummary {
  virtual_balance: number;
  equity: number;
  unrealized_pnl: number;
  realized_pnl: number;
  open_positions_count: number;
  closed_positions_count: number;
  win_rate: number;
  trades: PaperTrade[];
}
