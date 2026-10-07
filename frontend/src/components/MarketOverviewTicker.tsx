"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles, ShieldCheck } from "lucide-react";
import { MarketOverviewItem } from "@/types";

interface MarketOverviewTickerProps {
  items: MarketOverviewItem[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export function MarketOverviewTicker({
  items,
  selectedSymbol,
  onSelectSymbol
}: MarketOverviewTickerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Institutional Market Overview (8 Core Assets)
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">Real-Time Continuous Inference</span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
          Click any card to load deep terminal telemetry
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {items.map((item) => {
          const isSelected = item.symbol === selectedSymbol;
          const isBull = item.change_24h >= 0;
          const isBuy = item.signal === "BUY";
          const isSell = item.signal === "SELL";

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "bg-[#141c2e] border-cyan-500/70 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40"
                  : "bg-[#0d121e] border-[#1b2336] hover:border-slate-600 hover:bg-[#111726]"
              }`}
            >
              {/* Top Row: Symbol & Signal Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white tracking-wide font-mono">
                  {item.symbol}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                    isBuy
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      : isSell
                      ? "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {item.signal}
                </span>
              </div>

              {/* Price & Daily Change */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-bold font-mono text-slate-100 tracking-tight">
                  {item.price.toFixed(item.symbol.includes("JPY") || item.symbol.includes("XAU") ? 2 : 4)}
                </span>
                <span
                  className={`text-[11px] font-mono font-medium flex items-center ${
                    isBull ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isBull ? "+" : ""}
                  {item.change_24h_pct.toFixed(2)}%
                </span>
              </div>

              {/* Bottom Meta: Trend & AI Confidence */}
              <div className="pt-1 border-t border-[#182133] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center space-x-0.5">
                  {isBull ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : item.trend === "BEARISH" ? (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Minus className="w-3 h-3 text-slate-500" />
                  )}
                  <span className="truncate max-w-[42px]">{item.trend}</span>
                </span>
                <span className="text-cyan-400 font-semibold flex items-center space-x-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{item.ai_confidence}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
