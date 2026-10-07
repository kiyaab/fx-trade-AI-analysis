"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Cpu,
  BarChart3,
  Layers,
  Calculator,
  History,
  Bot,
  Calendar,
  Wallet,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
  supportedPairs: string[];
}

export function Header({
  activeTab,
  setActiveTab,
  selectedSymbol,
  setSelectedSymbol,
  supportedPairs
}: HeaderProps) {
  const [timeUtc, setTimeUtc] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + " UTC");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "chart", label: "Pro Chart", icon: TrendingUp },
    { id: "signals", label: "AI Setups", icon: Cpu },
    { id: "mtf", label: "MTF Matrix", icon: Layers },
    { id: "risk", label: "Risk Engine", icon: Calculator },
    { id: "backtest", label: "Backtest Studio", icon: History },
    { id: "papertrading", label: "Paper Trading", icon: Wallet },
    { id: "assistant", label: "AI Assistant", icon: Bot },
    { id: "news", label: "Macro News", icon: Calendar },
    { id: "mlops", label: "Model Monitor", icon: Activity },
    { id: "landing", label: "Overview / Info", icon: CheckCircle2 }
  ];

  return (
    <header className="border-b border-[#1e293b] bg-[#090d16] sticky top-0 z-50 px-4 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Brand & Symbol Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                FOREXPULSE
              </span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
                AI TERMINAL v2.4
              </span>
            </div>
          </div>

          {/* Quick Symbol Dropdown */}
          <div className="relative">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-[#111726] border border-[#222f46] text-white text-xs font-mono font-semibold py-1.5 px-3 pr-8 rounded-md hover:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer appearance-none"
            >
              {supportedPairs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Data Freshness Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#0e1422] border border-[#1b2438]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">FEED: LIVE (DEMO)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">14ms</span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-[#162238] text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#111726]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Clock & Disclaimer Tag */}
        <div className="hidden xl:flex items-center space-x-3 text-xs font-mono">
          <div className="text-slate-400 px-2 py-1 rounded bg-[#101625] border border-[#1b2336]">
            {timeUtc}
          </div>
          <div className="flex items-center space-x-1.5 text-amber-400/90 text-[11px] bg-amber-950/30 border border-amber-800/40 px-2 py-1 rounded">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Probabilistic Model</span>
          </div>
        </div>
      </div>
    </header>
  );
}
