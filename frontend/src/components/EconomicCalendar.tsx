"use client";

import React, { useState, useEffect } from "react";
import { Calendar, AlertTriangle, ShieldAlert, Clock, Filter } from "lucide-react";
import { NewsItem } from "@/types";
import { api } from "@/lib/api";

export function EconomicCalendar() {
  const [events, setEvents] = useState<NewsItem[]>([]);
  const [filterImpact, setFilterImpact] = useState<string>("ALL");

  useEffect(() => {
    api.getNewsCalendar().then(setEvents).catch(console.error);
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterImpact === "HIGH") return e.impact === "HIGH";
    return true;
  });

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl p-5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1b2336] mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#162035] text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Institutional Macroeconomic Calendar & News Risk Filter
            </h3>
            <p className="text-[11px] text-slate-400">
              High-impact economic data releases & automated signal blackout enforcement
            </p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilterImpact("ALL")}
            className={`px-2.5 py-1 rounded ${
              filterImpact === "ALL" ? "bg-slate-700 text-white font-bold" : "text-slate-400"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterImpact("HIGH")}
            className={`px-2.5 py-1 rounded ${
              filterImpact === "HIGH" ? "bg-rose-900/60 border border-rose-700 text-rose-300 font-bold" : "text-slate-400"
            }`}
          >
            High Impact Only
          </button>
        </div>
      </div>

      {/* High-Impact Alert Banner */}
      <div className="p-3.5 rounded-xl bg-[#1c1214] border border-rose-900/70 text-xs text-rose-200 mb-5 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-rose-300 block mb-0.5">
            HIGH-IMPACT VOLATILITY GUARDRAIL ACTIVE
          </span>
          <p className="text-rose-200/90 leading-relaxed text-[11px]">
            The AI engine automatically reduces signal confidence by 35% or flags WAIT within 45 minutes of tier-1 macroeconomic catalysts (NFP, CPI, Rate Decisions) to protect against spread blowout and slippage.
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto rounded-xl border border-[#182133] bg-[#090d16]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#182133] bg-[#0b101c] text-slate-400">
              <th className="py-2.5 px-4 font-semibold">Event Name</th>
              <th className="py-2.5 px-4 font-semibold">Currency</th>
              <th className="py-2.5 px-4 font-semibold">Impact Rating</th>
              <th className="py-2.5 px-4 font-semibold">Scheduled Time</th>
              <th className="py-2.5 px-4 font-semibold">Previous</th>
              <th className="py-2.5 px-4 font-semibold">Forecast</th>
              <th className="py-2.5 px-4 font-semibold text-right">Countdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151d2e]">
            {filteredEvents.map((e) => {
              const isHigh = e.impact === "HIGH";
              return (
                <tr key={e.id} className="hover:bg-[#12192b] transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                    {isHigh && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                    <span>{e.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#131b2e] border border-[#22304d] text-cyan-300 font-bold">
                      {e.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isHigh
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800/80"
                          : "bg-amber-950/60 text-amber-300 border border-amber-800/60"
                      }`}
                    >
                      {e.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(e.release_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC
                  </td>
                  <td className="py-3 px-4 text-slate-400">{e.previous || "--"}</td>
                  <td className="py-3 px-4 text-slate-200 font-bold">{e.forecast || "--"}</td>
                  <td className="py-3 px-4 text-right text-cyan-400 font-bold">
                    {e.time_until}
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
