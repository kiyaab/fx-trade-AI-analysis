"use client";

import React, { useState } from "react";
import {
  History,
  Play,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { BacktestParams, BacktestResult } from "@/types";
import { api } from "@/lib/api";

interface BacktestingStudioProps {
  initialSymbol?: string;
}

export function BacktestingStudio({ initialSymbol = "EUR/USD" }: BacktestingStudioProps) {
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [strategy, setStrategy] = useState<string>("MULTI_TIMEFRAME_AI");
  const [timeframe, setTimeframe] = useState<string>("4H");
  const [capital, setCapital] = useState<number>(100000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [spread, setSpread] = useState<number>(1.2);
  const [slippage, setSlippage] = useState<number>(0.5);

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const params: BacktestParams = {
        symbol,
        strategy,
        timeframe,
        initial_capital: capital,
        risk_per_trade_pct: riskPct,
        spread_pips: spread,
        slippage_pips: slippage
      };
      const data = await api.runBacktest(params);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1b2336] mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#162035] text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              Quantitative Backtesting & Walk-Forward Validation Studio
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Realistic event-driven simulation with spreads, slippage, and non-lookahead execution
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={loading}
          className="flex items-center space-x-1.5 py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-md shadow-cyan-950 transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? "Simulating Execution..." : "Run Backtest Engine"}</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 p-3.5 rounded-xl bg-[#090d16] border border-[#182133] mb-6 font-mono text-xs">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Asset Pair</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          >
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/USD">GBP/USD</option>
            <option value="USD/JPY">USD/JPY</option>
            <option value="USD/CHF">USD/CHF</option>
            <option value="AUD/USD">AUD/USD</option>
            <option value="USD/CAD">USD/CAD</option>
            <option value="NZD/USD">NZD/USD</option>
            <option value="XAU/USD">XAU/USD</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          >
            <option value="MULTI_TIMEFRAME_AI">Multi-Timeframe AI</option>
            <option value="TREND_MOMENTUM_BREAKOUT">Trend Momentum Breakout</option>
            <option value="MEAN_REVERSION_BB">Mean Reversion BB</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          >
            <option value="1H">1H</option>
            <option value="4H">4H</option>
            <option value="1D">1D</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Initial Balance ($)</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Risk / Trade (%)</label>
          <input
            type="number"
            step="0.1"
            value={riskPct}
            onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Spread (pips)</label>
          <input
            type="number"
            step="0.1"
            value={spread}
            onChange={(e) => setSpread(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Slippage (pips)</label>
          <input
            type="number"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#111726] border border-[#1e293b] text-white p-1.5 rounded focus:outline-none"
          />
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center font-mono">
            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Total Trades</span>
              <span className="text-base font-bold text-white">{result.total_trades}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c1a17] border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 uppercase block mb-1">Win Rate</span>
              <span className="text-base font-bold text-emerald-300">{result.win_rate}%</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Profit Factor</span>
              <span className="text-base font-bold text-cyan-400">{result.profit_factor}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c1a17] border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 uppercase block mb-1">Net Profit</span>
              <span className="text-base font-bold text-emerald-300">+${result.net_profit.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Net Gain</span>
              <span className="text-base font-bold text-emerald-400">+{result.net_profit_pct}%</span>
            </div>

            <div className="p-3 rounded-lg bg-[#1a0f16] border border-rose-900/40">
              <span className="text-[10px] text-rose-400 uppercase block mb-1">Max Drawdown</span>
              <span className="text-base font-bold text-rose-300">-{result.max_drawdown}%</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Sharpe Ratio</span>
              <span className="text-base font-bold text-indigo-400">{result.sharpe_ratio}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Average R</span>
              <span className="text-base font-bold text-cyan-300">{result.avg_r}R</span>
            </div>
          </div>

          {/* Equity Curve SVG Visualization */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-[#182133]">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="font-bold text-slate-300">Simulated Equity Growth Curve</span>
              <span className="text-emerald-400 font-bold">
                Ending Equity: ${(capital + result.net_profit).toLocaleString()}
              </span>
            </div>

            <div className="relative w-full h-44">
              <svg viewBox="0 0 800 160" className="w-full h-full">
                {/* Horizontal gridlines */}
                {[0.25, 0.5, 0.75].map((r) => (
                  <line
                    key={r}
                    x1={0}
                    y1={160 * r}
                    x2={800}
                    y2={160 * r}
                    stroke="#162033"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Equity Curve Line */}
                {result.equity_curve.length > 1 && (
                  <polyline
                    points={result.equity_curve
                      .map((pt, idx) => {
                        const x = (idx / (result.equity_curve.length - 1)) * 800;
                        const minEq = capital * 0.95;
                        const maxEq = Math.max(capital + result.net_profit, capital * 1.05);
                        const y = 150 - ((pt.equity - minEq) / (maxEq - minEq || 1)) * 135;
                        return `${x},${Math.max(10, Math.min(150, y))}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Walk-Forward Validation Table (Section 13 Requirement) */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-[#182133] space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Walk-Forward Out-Of-Sample Validation</span>
              </h4>
              <span className="text-[10px] text-slate-500">4 Temporal Out-Of-Sample Folds</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#182133] text-slate-400">
                    <th className="py-2 px-3 font-semibold">Evaluation Fold</th>
                    <th className="py-2 px-3 font-semibold">Train Accuracy</th>
                    <th className="py-2 px-3 font-semibold">Validation Accuracy</th>
                    <th className="py-2 px-3 font-semibold">Out-Of-Sample Accuracy</th>
                    <th className="py-2 px-3 font-semibold">Sharpe Ratio</th>
                    <th className="py-2 px-3 font-semibold text-right">Net Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151d2e]">
                  {result.walk_forward.map((wf, idx) => (
                    <tr key={idx} className="hover:bg-[#12192b]">
                      <td className="py-2 px-3 font-bold text-white">{wf.period}</td>
                      <td className="py-2 px-3 text-slate-300">{wf.train_accuracy}%</td>
                      <td className="py-2 px-3 text-slate-300">{wf.val_accuracy}%</td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">{wf.out_of_sample_accuracy}%</td>
                      <td className="py-2 px-3 text-indigo-400">{wf.sharpe}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">+{wf.net_profit_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trade Log Snippet */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-[#182133] space-y-2 font-mono">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recent Executed Trades Log ({result.trade_log.length} records)
            </h4>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-[#182133] text-slate-400">
                    <th className="py-1.5 px-3">#</th>
                    <th className="py-1.5 px-3">Dir</th>
                    <th className="py-1.5 px-3">Entry</th>
                    <th className="py-1.5 px-3">Exit</th>
                    <th className="py-1.5 px-3">Lots</th>
                    <th className="py-1.5 px-3">Exit Reason</th>
                    <th className="py-1.5 px-3 text-right">R-Multiple</th>
                    <th className="py-1.5 px-3 text-right">PnL ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151d2e]">
                  {result.trade_log.slice(0, 15).map((t) => {
                    const isWin = t.pnl > 0;
                    return (
                      <tr key={t.trade_id} className="hover:bg-[#12192b]">
                        <td className="py-1.5 px-3 text-slate-500">{t.trade_id}</td>
                        <td className="py-1.5 px-3 font-bold">
                          <span className={t.direction === "BUY" ? "text-emerald-400" : "text-rose-400"}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-300">{t.entry_price.toFixed(4)}</td>
                        <td className="py-1.5 px-3 text-slate-300">{t.exit_price.toFixed(4)}</td>
                        <td className="py-1.5 px-3 text-slate-400">{t.lot_size}</td>
                        <td className="py-1.5 px-3 text-slate-400">{t.exit_reason}</td>
                        <td className="py-1.5 px-3 text-right text-cyan-400 font-bold">{t.r_multiple}R</td>
                        <td className={`py-1.5 px-3 text-right font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                          {isWin ? "+" : ""}${t.pnl.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Backtest Disclaimer */}
          <div className="p-3 rounded-lg bg-[#14121a] border border-amber-900/40 text-[11px] font-mono text-amber-300/80 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{result.disclaimer} Backtest results do not include unexpected macroeconomic liquidity blackouts.</span>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 font-mono text-xs">
          Configure backtest parameters above and click "Run Backtest Engine" to initiate event-driven simulation.
        </div>
      )}
    </div>
  );
}
