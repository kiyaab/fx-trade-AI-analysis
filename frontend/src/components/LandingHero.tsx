"use client";

import React from "react";
import {
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Layers,
  History,
  Calculator,
  Bot,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface LandingHeroProps {
  onOpenDashboard: () => void;
  onExploreAnalysis: () => void;
}

export function LandingHero({ onOpenDashboard, onExploreAnalysis }: LandingHeroProps) {
  return (
    <div className="space-y-16 pb-12 font-mono">
      {/* Hero Section */}
      <div className="relative pt-8 pb-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Institutional Quant Trading Intelligence Terminal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          AI-Powered Forex <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Market Intelligence
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Analyze market structure, momentum, volatility, and multi-timeframe conditions with an intelligent quantitative trading analysis engine. Built for precision, risk management, and transparency.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenDashboard}
            className="flex items-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
          >
            <span>Open Trading Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreAnalysis}
            className="py-3 px-6 rounded-xl bg-[#111726] hover:bg-[#182138] border border-[#222f46] text-slate-200 font-bold text-sm transition-all cursor-pointer"
          >
            Explore AI Analysis
          </button>
        </div>

        {/* Non-Guarantee Trust Banner */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="p-3 rounded-xl bg-[#121622] border border-[#1e273a] text-xs text-slate-400 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Probabilistic Machine Learning • No False Certainty • Institutional Risk Engine</span>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#0e1320] border border-[#1b2336] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Probabilistic Ensemble</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Never outputs blind buy/sell shouts. Predicts calibrated probabilities P(BUY), P(SELL), P(WAIT) and generates setups only when confidence and risk filters are met.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1320] border border-[#1b2336] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Multi-Timeframe Confluence</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Synthesizes 1W, 1D, 4H, 1H, 15M, and 5M trend, momentum, and structural states into a unified market bias matrix before triggering orders.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0e1320] border border-[#1b2336] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Institutional Risk Safeguards</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Automatically sizes positions based on capital and volatility. Hard caps prevent over-leveraging and enforce structural stop-losses.
          </p>
        </div>
      </div>

      {/* How It Works Workflow */}
      <div className="p-6 rounded-2xl bg-[#0a0e18] border border-[#1b2336] space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider text-center">
          How the Terminal Operates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1a243a] space-y-2">
            <span className="text-cyan-400 font-bold text-lg">01</span>
            <h4 className="font-bold text-white">Market Data & Features</h4>
            <p className="text-slate-400 font-sans">
              Live quotes and historical candles feed into non-lookahead technical indicators and cyclical feature extractors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1a243a] space-y-2">
            <span className="text-indigo-400 font-bold text-lg">02</span>
            <h4 className="font-bold text-white">Regime Classification</h4>
            <p className="text-slate-400 font-sans">
              Identifies Trending, Ranging, High Volatility, or Consolidation states to dynamically adjust strategy rules.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1a243a] space-y-2">
            <span className="text-emerald-400 font-bold text-lg">03</span>
            <h4 className="font-bold text-white">Setup Generation</h4>
            <p className="text-slate-400 font-sans">
              Derives exact Entry, Stop Loss, TP1, TP2, R:R asymmetry, checklist rationale, and structural invalidation rules.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1a243a] space-y-2">
            <span className="text-amber-400 font-bold text-lg">04</span>
            <h4 className="font-bold text-white">Risk & Execution</h4>
            <p className="text-slate-400 font-sans">
              Validates news calendar blackouts, determines precise lot sizing, and allows one-click paper trade execution.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ & Transparency Section */}
      <div className="p-6 rounded-2xl bg-[#0e1320] border border-[#1b2336] space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
          Frequently Answered Inquiries
        </h3>
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#090d16] border border-[#182133] space-y-1">
            <h4 className="font-bold text-cyan-300">Does this system guarantee trading profits?</h4>
            <p className="text-slate-400 font-sans leading-relaxed">
              No. Forex markets are subject to macroeconomic shocks, counterparty spread expansions, and uncertainty. The system provides quantitative probabilistic edge and strict risk parameters, never guaranteed outcomes.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#090d16] border border-[#182133] space-y-1">
            <h4 className="font-bold text-cyan-300">How are predictions validated?</h4>
            <p className="text-slate-400 font-sans leading-relaxed">
              Models are evaluated using temporal walk-forward out-of-sample folds with spread and slippage deductions to prevent look-ahead bias and data leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Risk Disclosure Footer */}
      <div className="p-4 rounded-xl bg-[#14121a] border border-amber-900/50 text-xs text-amber-300/80 leading-relaxed">
        <div className="flex items-center space-x-2 font-bold text-amber-400 mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Regulatory Risk Disclosure</span>
        </div>
        Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. High leverage can work against you as well as for you. Before deciding to trade foreign exchange, carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment.
      </div>
    </div>
  );
}
