"use client";

import React from "react";
import { Layers, ShieldCheck, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MultiTimeframeAnalysis } from "@/types";

interface MultiTimeframeMatrixProps {
  mtf: MultiTimeframeAnalysis | null;
}

export function MultiTimeframeMatrix({ mtf }: MultiTimeframeMatrixProps) {
  if (!mtf) {
    return (
      <div className="p-6 rounded-xl bg-[#0e1320] border border-[#1b2336] animate-pulse text-center">
        <p className="text-xs font-mono text-slate-500">Evaluating multi-timeframe structural alignment...</p>
      </div>
    );
  }

  const isStrongBull = mtf.overall_bias === "STRONG_BULLISH";
  const isModBull = mtf.overall_bias === "MODERATE_BULLISH";
  const isStrongBear = mtf.overall_bias === "STRONG_BEARISH";
  const isModBear = mtf.overall_bias === "MODERATE_BEARISH";

  const biasBadgeColor =
    isStrongBull || isModBull
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
      : isStrongBear || isModBear
      ? "bg-rose-950/80 text-rose-300 border-rose-700/60"
      : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-xl">
      {/* Matrix Header */}
      <div className="p-4 border-b border-[#1b2336] bg-[#0a0e18] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#162035] text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <span>Multi-Timeframe Analysis Matrix</span>
              <span className="text-xs font-normal text-slate-400">({mtf.symbol})</span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Cross-timeframe confluence evaluation (1W down to 5M)
            </p>
          </div>
        </div>

        {/* Composite Market Bias Badge */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Confluence Index</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{mtf.alignment_score}%</span>
          </div>
          <span className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold uppercase ${biasBadgeColor}`}>
            {mtf.overall_bias.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Summary Verdict Callout */}
      <div className="px-4 py-2.5 bg-[#0c111e] border-b border-[#182133] text-xs font-mono text-slate-300 flex items-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="leading-relaxed">{mtf.summary_verdict}</span>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#182133] bg-[#090d16] text-slate-400">
              <th className="py-2.5 px-4 font-semibold">Timeframe</th>
              <th className="py-2.5 px-4 font-semibold">Trend</th>
              <th className="py-2.5 px-4 font-semibold">Momentum</th>
              <th className="py-2.5 px-4 font-semibold">Structure</th>
              <th className="py-2.5 px-4 font-semibold">Signal</th>
              <th className="py-2.5 px-4 font-semibold text-right">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151d2e]">
            {mtf.rows.map((row) => {
              const isBuy = row.signal === "BUY";
              const isSell = row.signal === "SELL";
              const isBullTrend = row.trend === "Bullish";
              const isBearTrend = row.trend === "Bearish";

              return (
                <tr key={row.timeframe} className="hover:bg-[#12192b] transition-colors">
                  <td className="py-2.5 px-4 font-bold text-white flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{row.timeframe}</span>
                  </td>

                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 ${
                        isBullTrend
                          ? "text-emerald-400 font-semibold"
                          : isBearTrend
                          ? "text-rose-400 font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {isBullTrend ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : isBearTrend ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>{row.trend}</span>
                    </span>
                  </td>

                  <td className="py-2.5 px-4 text-slate-300">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        row.momentum === "Strong"
                          ? "bg-indigo-950/70 text-indigo-300 border border-indigo-800/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {row.momentum}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 text-slate-300 font-medium">
                    {row.structure}
                  </td>

                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isBuy
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                          : isSell
                          ? "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {row.signal}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono">
                    {(row.weight * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
