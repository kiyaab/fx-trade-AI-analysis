"use client";

import React, { useState, useEffect } from "react";
import { Wallet, PlusCircle, XCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap } from "lucide-react";
import { PortfolioSummary, PaperTrade } from "@/types";
import { api } from "@/lib/api";

interface PaperTradingPanelProps {
  initialSymbol?: string;
}

export function PaperTradingPanel({ initialSymbol = "EUR/USD" }: PaperTradingPanelProps) {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [sl, setSl] = useState<number>(1.0815);
  const [tp, setTp] = useState<number>(1.0920);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      await api.placePaperOrder({
        symbol,
        order_type: orderType,
        lot_size: lotSize,
        stop_loss: sl,
        take_profit: tp
      });
      await fetchPortfolio();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTrade = async (tradeId: number) => {
    try {
      await api.closePaperOrder(tradeId);
      await fetchPortfolio();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1b2336] mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#162035] text-cyan-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              Institutional Paper Trading Terminal
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Risk-free simulated execution engine with real-time mark-to-market PnL tracking
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-400">
          VIRTUAL ACCOUNT: ACTIVE
        </span>
      </div>

      {portfolio && (
        <>
          {/* Portfolio Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center font-mono mb-6 text-xs">
            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Balance</span>
              <span className="text-base font-bold text-white">
                ${portfolio.virtual_balance.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Equity</span>
              <span className="text-base font-bold text-cyan-400">
                ${portfolio.equity.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c1a17] border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 uppercase block mb-1">Unrealized PnL</span>
              <span
                className={`text-base font-bold ${
                  portfolio.unrealized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {portfolio.unrealized_pnl >= 0 ? "+" : ""}${portfolio.unrealized_pnl.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Realized PnL</span>
              <span
                className={`text-base font-bold ${
                  portfolio.realized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {portfolio.realized_pnl >= 0 ? "+" : ""}${portfolio.realized_pnl.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">Open Positions</span>
              <span className="text-base font-bold text-slate-200">
                {portfolio.open_positions_count}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c1a17] border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 uppercase block mb-1">Win Rate</span>
              <span className="text-base font-bold text-emerald-300">
                {portfolio.win_rate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
            {/* New Order Form (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-[#090d16] border border-[#182133] space-y-3 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                Simulated Order Ticket
              </h4>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Asset Pair</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-[#111726] border border-[#1e293b] text-white p-2 rounded focus:outline-none"
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

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType("BUY")}
                  className={`py-2 rounded font-bold text-xs ${
                    orderType === "BUY"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#111726] text-slate-400 border border-[#1e293b]"
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("SELL")}
                  className={`py-2 rounded font-bold text-xs ${
                    orderType === "SELL"
                      ? "bg-rose-600 text-white"
                      : "bg-[#111726] text-slate-400 border border-[#1e293b]"
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Volume (Standard Lots)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lotSize}
                  onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-[#111726] border border-[#1e293b] text-white p-2 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-rose-400 block mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={sl}
                    onChange={(e) => setSl(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#1a0f16] border border-rose-900/60 text-rose-300 p-2 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={tp}
                    onChange={(e) => setTp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0d1c19] border border-emerald-900/60 text-emerald-300 p-2 rounded focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-950 mt-2"
              >
                {submitting ? "Placing Order..." : `Execute Paper ${orderType} Order`}
              </button>
            </div>

            {/* Positions Table (8 cols) */}
            <div className="lg:col-span-8 p-4 rounded-xl bg-[#090d16] border border-[#182133] space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                Open & Recent Paper Positions
              </h4>
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-[#182133] text-slate-400">
                      <th className="py-2 px-2.5">Symbol</th>
                      <th className="py-2 px-2.5">Type</th>
                      <th className="py-2 px-2.5">Lots</th>
                      <th className="py-2 px-2.5">Entry</th>
                      <th className="py-2 px-2.5">Current</th>
                      <th className="py-2 px-2.5">PnL ($)</th>
                      <th className="py-2 px-2.5">Status</th>
                      <th className="py-2 px-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151d2e]">
                    {portfolio.trades.map((t) => {
                      const isOpen = t.status === "OPEN";
                      const pnl = isOpen ? t.unrealized_pnl : t.realized_pnl;
                      const isWin = pnl >= 0;

                      return (
                        <tr key={t.id} className="hover:bg-[#12192b]">
                          <td className="py-2 px-2.5 font-bold text-white">{t.symbol}</td>
                          <td className="py-2 px-2.5 font-bold">
                            <span className={t.order_type === "BUY" ? "text-emerald-400" : "text-rose-400"}>
                              {t.order_type}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-slate-400">{t.lot_size}</td>
                          <td className="py-2 px-2.5 text-slate-300">{t.entry_price.toFixed(4)}</td>
                          <td className="py-2 px-2.5 text-slate-300">{t.current_price.toFixed(4)}</td>
                          <td className={`py-2 px-2.5 font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                            {isWin ? "+" : ""}${pnl.toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isOpen
                                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-right">
                            {isOpen && (
                              <button
                                onClick={() => handleCloseTrade(t.id)}
                                className="px-2 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] cursor-pointer"
                              >
                                Close
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
