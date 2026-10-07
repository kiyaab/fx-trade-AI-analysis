"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  PauseCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Percent,
  Compass,
  Zap,
  HelpCircle
} from "lucide-react";
import { TradeSetup, AIPrediction } from "@/types";

interface AITradeSetupCardProps {
  setup: TradeSetup | null;
  prediction: AIPrediction | null;
  onExecutePaperTrade?: (setup: TradeSetup) => void;
  onLoadRiskCalc?: (setup: TradeSetup) => void;
}

export function AITradeSetupCard({
  setup,
  prediction,
  onExecutePaperTrade,
  onLoadRiskCalc
}: AITradeSetupCardProps) {
  const [showUncertainty, setShowUncertainty] = useState<boolean>(false);

  if (!setup || !prediction) {
    return (
      <div className="p-6 rounded-xl bg-[#0e1320] border border-[#1b2336] animate-pulse text-center">
        <p className="text-xs font-mono text-slate-500">Synthesizing AI Market Intelligence Setup...</p>
      </div>
    );
  }

  const isBuy = setup.direction === "BUY";
  const isSell = setup.direction === "SELL";
  const isWait = setup.direction === "WAIT";

  const gradeColor =
    setup.quality_grade === "A+"
      ? "text-emerald-400 border-emerald-500/60 bg-emerald-950/40"
      : setup.quality_grade === "A"
      ? "text-cyan-400 border-cyan-500/60 bg-cyan-950/40"
      : setup.quality_grade === "B"
      ? "text-amber-400 border-amber-500/60 bg-amber-950/40"
      : "text-slate-400 border-slate-700 bg-slate-900";

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl">
      {/* Top Banner: Pair, Direction, Grade & Confidence */}
      <div className="p-4 border-b border-[#1b2336] bg-[#0a0e18] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono text-lg shadow-lg ${
              isBuy
                ? "bg-emerald-950 border border-emerald-500/70 text-emerald-400 shadow-emerald-950/60"
                : isSell
                ? "bg-rose-950 border border-rose-500/70 text-rose-400 shadow-rose-950/60"
                : "bg-slate-800 border border-slate-700 text-slate-300"
            }`}
          >
            {isBuy ? (
              <ArrowUpRight className="w-6 h-6" />
            ) : isSell ? (
              <ArrowDownRight className="w-6 h-6" />
            ) : (
              <PauseCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white font-mono">{setup.symbol}</h3>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider ${
                  isBuy
                    ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60"
                    : isSell
                    ? "bg-rose-900/40 text-rose-300 border border-rose-700/60"
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                {setup.direction} SIGNAL
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 flex items-center space-x-2 mt-0.5">
              <span>Regime: <strong className="text-slate-200">{setup.market_regime.replace("_", " ")}</strong></span>
              <span>•</span>
              <span>Vol: <strong className="text-slate-200">{setup.volatility_level}</strong></span>
            </p>
          </div>
        </div>

        {/* Quality Grade & Confidence Score */}
        <div className="flex items-center space-x-3 text-right">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Model Confidence</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{setup.confidence}%</span>
          </div>
          <div className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold ${gradeColor}`}>
            Grade {setup.quality_grade}
          </div>
        </div>
      </div>

      {/* Model Probabilities Tri-Bar */}
      <div className="p-3 bg-[#0c101c] border-b border-[#182133]">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <span className="text-emerald-400 font-semibold">BUY: {prediction.prob_buy}%</span>
          <span className="text-slate-400">WAIT: {prediction.prob_wait}%</span>
          <span className="text-rose-400 font-semibold">SELL: {prediction.prob_sell}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#182133] overflow-hidden flex">
          <div style={{ width: `${prediction.prob_buy}%` }} className="bg-emerald-500 transition-all duration-300" />
          <div style={{ width: `${prediction.prob_wait}%` }} className="bg-slate-500 transition-all duration-300" />
          <div style={{ width: `${prediction.prob_sell}%` }} className="bg-rose-500 transition-all duration-300" />
        </div>
      </div>

      {/* Numerical Setup Matrix: Entry, SL, TP1, TP2, R:R */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 bg-[#090e18] border-b border-[#182133] text-center font-mono">
        <div className="p-2 rounded-lg bg-[#0e1424] border border-[#1b253b]">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Entry Zone</span>
          <span className="text-xs font-bold text-white tracking-tight">{setup.entry_zone}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#1a0f16] border border-rose-900/40">
          <span className="text-[10px] text-rose-400 uppercase block mb-0.5">Stop Loss</span>
          <span className="text-xs font-bold text-rose-300">{setup.stop_loss.toFixed(4)}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0d1c19] border border-emerald-900/40">
          <span className="text-[10px] text-emerald-400 uppercase block mb-0.5">Take Profit 1</span>
          <span className="text-xs font-bold text-emerald-300">{setup.take_profit_1.toFixed(4)}</span>
        </div>

        <div className="p-2 rounded-lg bg-[#0d1c19] border border-emerald-900/40">
          <span className="text-[10px] text-emerald-400 uppercase block mb-0.5">Take Profit 2</span>
          <span className="text-xs font-bold text-emerald-300">{setup.take_profit_2.toFixed(4)}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-[#101b2d] border border-cyan-800/40">
          <span className="text-[10px] text-cyan-400 uppercase block mb-0.5">Risk : Reward</span>
          <span className="text-xs font-bold text-cyan-300">1 : {setup.risk_reward_ratio}</span>
        </div>
      </div>

      {/* Technical Evidence Checklist */}
      <div className="p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Technical Evidence Checklist</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          {setup.reasoning.map((r, i) => (
            <div key={i} className="flex items-start space-x-2 p-2 rounded bg-[#0b101c] border border-[#162033]">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="text-slate-300">{r}</span>
            </div>
          ))}
        </div>

        {/* Structural Invalidation Banner (Section 10 Requirement) */}
        <div className="p-3 rounded-lg bg-[#1c1411] border border-amber-800/60 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Structural Invalidation Condition</span>
          </div>
          <p className="text-amber-200/90 leading-relaxed">{setup.invalidating_conditions}</p>
        </div>

        {/* Uncertainty & Risk Considerations Toggle */}
        <div className="pt-1">
          <button
            onClick={() => setShowUncertainty(!showUncertainty)}
            className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1.5 px-2 rounded bg-[#0d121e] border border-[#1a2336]"
          >
            <span className="flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Model Uncertainty & Risk Boundary Details</span>
            </span>
            {showUncertainty ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showUncertainty && (
            <div className="mt-2 p-3 rounded-lg bg-[#090d16] border border-[#182133] text-xs font-mono text-slate-400 space-y-1.5">
              <p>• Model Version: <span className="text-slate-200">{prediction.model_version}</span></p>
              <p>• Data Freshness: <span className="text-emerald-400">{setup.data_freshness}</span></p>
              <p>• Suggested Position Size: <span className="text-cyan-400 font-bold">{setup.suggested_position_size_lots} Standard Lots</span> (1% risk balance rule)</p>
              <p className="text-[11px] text-slate-500 italic mt-2">
                "The platform is an analytical decision-support tool. All predictions are mathematical probabilities, not guarantees."
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          {onExecutePaperTrade && (
            <button
              onClick={() => onExecutePaperTrade(setup)}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-emerald-950"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Execute Paper Trade ({setup.suggested_position_size_lots} Lots)</span>
            </button>
          )}

          {onLoadRiskCalc && (
            <button
              onClick={() => onLoadRiskCalc(setup)}
              className="py-2 px-3 rounded-lg bg-[#141b2c] hover:bg-[#1a2338] text-cyan-300 border border-cyan-800/40 font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>Verify Risk Parameters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
