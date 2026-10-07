"use client";

import React, { useState, useEffect } from "react";
import { Calculator, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import { RiskCalcRequest, RiskCalcResponse } from "@/types";
import { api } from "@/lib/api";

interface RiskManagementCalculatorProps {
  initialSymbol?: string;
  initialEntry?: number;
  initialSL?: number;
  initialTP1?: number;
  initialTP2?: number;
}

export function RiskManagementCalculator({
  initialSymbol = "EUR/USD",
  initialEntry = 1.0850,
  initialSL = 1.0815,
  initialTP1 = 1.0920,
  initialTP2 = 1.0965
}: RiskManagementCalculatorProps) {
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [balance, setBalance] = useState<number>(100000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [entry, setEntry] = useState<number>(initialEntry);
  const [sl, setSl] = useState<number>(initialSL);
  const [tp1, setTp1] = useState<number>(initialTP1);
  const [tp2, setTp2] = useState<number | undefined>(initialTP2);
  const [leverage, setLeverage] = useState<number>(30);

  const [result, setResult] = useState<RiskCalcResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data: RiskCalcRequest = {
        symbol,
        account_balance: balance,
        risk_percentage: riskPct,
        entry_price: entry,
        stop_loss: sl,
        take_profit_1: tp1,
        take_profit_2: tp2,
        leverage
      };
      const res = await api.calculateRisk(data);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [symbol, balance, riskPct, entry, sl, tp1, tp2, leverage]);

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1b2336] mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#162035] text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              Institutional Risk Management & Position Size Engine
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Strict mathematical position sizing to eliminate drawdown risk
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#101726] border border-[#1c263b] text-cyan-300">
          Max Ceiling: 2.0% Risk
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 bg-[#090d16] p-4 rounded-xl border border-[#182133]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Trade Parameters
          </h4>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Currency Pair</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#111726] border border-[#1e293b] text-white text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Account Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111726] border border-[#1e293b] text-white text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Risk per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPct}
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111726] border border-[#1e293b] text-white text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Entry Price</label>
              <input
                type="number"
                step="0.0001"
                value={entry}
                onChange={(e) => setEntry(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111726] border border-[#1e293b] text-white text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-rose-400 block mb-1">Stop Loss Price</label>
              <input
                type="number"
                step="0.0001"
                value={sl}
                onChange={(e) => setSl(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#1a0f16] border border-rose-900/60 text-rose-300 text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-emerald-400 block mb-1">Take Profit 1</label>
              <input
                type="number"
                step="0.0001"
                value={tp1}
                onChange={(e) => setTp1(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0d1c19] border border-emerald-900/60 text-emerald-300 text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-emerald-400 block mb-1">Take Profit 2 (Opt)</label>
              <input
                type="number"
                step="0.0001"
                value={tp2 || ""}
                onChange={(e) => setTp2(parseFloat(e.target.value) || undefined)}
                className="w-full bg-[#0d1c19] border border-emerald-900/60 text-emerald-300 text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Account Leverage (1:X)</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full bg-[#111726] border border-[#1e293b] text-white text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value={10}>1:10 (Conservative)</option>
              <option value={20}>1:20 (Standard Institutional)</option>
              <option value={30}>1:30 (Regulated Standard)</option>
              <option value={50}>1:50 (Professional)</option>
            </select>
          </div>
        </div>

        {/* Right Output Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <>
              {/* Primary Lot Sizing Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#121a2c] to-[#0c121e] border border-cyan-800/40 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase block mb-1">Recommended Position Size</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                      {result.suggested_lot_size}
                    </span>
                    <span className="text-sm text-slate-300">Standard Lots</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    ({result.micro_lots} Micro Lots / {Math.round(result.suggested_lot_size * 100000).toLocaleString()} Units)
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase block mb-1">Dollar Risk Exposure</span>
                  <span className="text-2xl font-bold text-rose-400 font-mono">
                    ${result.risk_amount_usd.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 block">({riskPct}% of balance)</span>
                </div>
              </div>

              {/* Metric Matrix Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-[#0e1424] border border-[#1b2336]">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Pips at Risk</span>
                  <span className="font-bold text-white text-sm">{result.pip_risk} pips</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0e1424] border border-[#1b2336]">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Pip Value (Std)</span>
                  <span className="font-bold text-white text-sm">${result.pip_value_std_lot}/pip</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0e1424] border border-[#1b2336]">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Required Margin</span>
                  <span className="font-bold text-slate-200 text-sm">${result.margin_required_usd.toLocaleString()}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0e1424] border border-[#1b2336]">
                  <span className="text-[10px] text-slate-400 uppercase block mb-1">Reward : Risk</span>
                  <span className="font-bold text-cyan-400 text-sm">1 : {result.risk_reward_ratio_tp1}</span>
                </div>
              </div>

              {/* Profit Targets Projection */}
              <div className="p-3.5 rounded-xl bg-[#090e18] border border-[#162033] grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-[#0c1a17] border border-emerald-900/40">
                  <span className="text-[10px] text-emerald-400 uppercase block mb-0.5">Potential Profit (TP1)</span>
                  <span className="text-base font-bold text-emerald-300">
                    +${result.potential_profit_tp1_usd.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">R:R = 1:{result.risk_reward_ratio_tp1}</span>
                </div>

                {result.potential_profit_tp2_usd && (
                  <div className="p-2 rounded-lg bg-[#0c1a17] border border-emerald-900/40">
                    <span className="text-[10px] text-emerald-400 uppercase block mb-0.5">Potential Profit (TP2)</span>
                    <span className="text-base font-bold text-emerald-300">
                      +${result.potential_profit_tp2_usd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">R:R = 1:{result.risk_reward_ratio_tp2}</span>
                  </div>
                )}
              </div>

              {/* Warning Guardrails (Requirement #11) */}
              {result.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-[#1a1112] border border-rose-900/50 text-xs text-rose-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-400 mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Risk Guardrail Warnings</span>
                  </div>
                  {result.warnings.map((w, idx) => (
                    <p key={idx}>• {w}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">Calculating risk metrics...</div>
          )}
        </div>
      </div>
    </div>
  );
}
