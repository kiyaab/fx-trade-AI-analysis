"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MarketOverviewTicker } from "@/components/MarketOverviewTicker";
import { InteractiveTradingChart } from "@/components/InteractiveTradingChart";
import { AITradeSetupCard } from "@/components/AITradeSetupCard";
import { MultiTimeframeMatrix } from "@/components/MultiTimeframeMatrix";
import { RiskManagementCalculator } from "@/components/RiskManagementCalculator";
import { BacktestingStudio } from "@/components/BacktestingStudio";
import { AIAssistantChat } from "@/components/AIAssistantChat";
import { PaperTradingPanel } from "@/components/PaperTradingPanel";
import { EconomicCalendar } from "@/components/EconomicCalendar";
import { ModelMonitoringView } from "@/components/ModelMonitoringView";
import { LandingHero } from "@/components/LandingHero";
import {
  MarketOverviewItem,
  Candle,
  TechnicalIndicators,
  SupportResistanceZone,
  MarketStructureEvent,
  PriceActionPattern,
  TradeSetup,
  AIPrediction,
  MultiTimeframeAnalysis
} from "@/types";
import { api } from "@/lib/api";
import { Activity, ShieldCheck, Cpu, ArrowUpRight, ArrowDownRight, Layers, Bot, Zap } from "lucide-react";

const SUPPORTED_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "XAU/USD"
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("EUR/USD");
  const [timeframe, setTimeframe] = useState<string>("4H");

  // Telemetry State
  const [marketItems, setMarketItems] = useState<MarketOverviewItem[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | undefined>();
  const [zones, setZones] = useState<SupportResistanceZone[]>([]);
  const [events, setEvents] = useState<MarketStructureEvent[]>([]);
  const [patterns, setPatterns] = useState<PriceActionPattern[]>([]);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [setup, setSetup] = useState<TradeSetup | null>(null);
  const [mtf, setMtf] = useState<MultiTimeframeAnalysis | null>(null);
  const [rankedSetups, setRankedSetups] = useState<any[]>([]);

  // Initial load & Polling
  const fetchMarketData = async () => {
    try {
      const items = await api.getMarketOverview();
      setMarketItems(items);
    } catch (e) {
      console.error("Market overview fetch failed:", e);
    }
  };

  const fetchSymbolTelemetry = async (sym: string, tf: string) => {
    try {
      const [cList, indData, predData, setupData, mtfData, rankedData] = await Promise.all([
        api.getCandles(sym, tf, 120),
        api.getIndicators(sym, tf),
        api.getPrediction(sym, tf),
        api.getTradeSetup(sym, tf),
        api.getMultiTimeframe(sym),
        api.getRankedSetups()
      ]);

      setCandles(cList);
      setIndicators(indData.indicators);
      setZones(indData.support_resistance_zones);
      setEvents(indData.market_structure_events);
      setPatterns(indData.price_action_patterns);
      setPrediction(predData);
      setSetup(setupData);
      setMtf(mtfData);
      setRankedSetups(rankedData);
    } catch (e) {
      console.error("Symbol telemetry fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSymbolTelemetry(selectedSymbol, timeframe);
  }, [selectedSymbol, timeframe]);

  const handleExecutePaperTrade = async (s: TradeSetup) => {
    try {
      await api.placePaperOrder({
        symbol: s.symbol,
        order_type: s.direction === "SELL" ? "SELL" : "BUY",
        lot_size: s.suggested_position_size_lots,
        stop_loss: s.stop_loss,
        take_profit: s.take_profit_1
      });
      setActiveTab("papertrading");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        supportedPairs={SUPPORTED_PAIRS}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-3 sm:p-4 lg:p-5 space-y-4">
        {/* Market Overview Ticker Cards (Always visible on terminal views) */}
        {activeTab !== "landing" && marketItems.length > 0 && (
          <MarketOverviewTicker
            items={marketItems}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={(sym) => setSelectedSymbol(sym)}
          />
        )}

        {/* Tab 1: Terminal Dashboard (Unified Cockpit) */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Top Grid: Pro Chart (7 cols) + AI Setup Card (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <InteractiveTradingChart
                  symbol={selectedSymbol}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  candles={candles}
                  indicators={indicators}
                  zones={zones}
                  events={events}
                  patterns={patterns}
                />
              </div>

              <div className="lg:col-span-5">
                <AITradeSetupCard
                  setup={setup}
                  prediction={prediction}
                  onExecutePaperTrade={handleExecutePaperTrade}
                  onLoadRiskCalc={() => setActiveTab("risk")}
                />
              </div>
            </div>

            {/* Bottom Grid: MTF Matrix (6 cols) + Ranked Setups Table (6 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <MultiTimeframeMatrix mtf={mtf} />
              </div>

              {/* Ranked Setups Leaderboard */}
              <div className="lg:col-span-6 rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden p-4 font-mono shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        AI Quantitative Signal Ranking (Confluence Scores)
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500">Multivariate Weighted Model</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#182133] text-slate-400">
                          <th className="py-2 px-2.5">Pair</th>
                          <th className="py-2 px-2.5">Direction</th>
                          <th className="py-2 px-2.5">Grade</th>
                          <th className="py-2 px-2.5">Score</th>
                          <th className="py-2 px-2.5">R : R</th>
                          <th className="py-2 px-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#151d2e]">
                        {rankedSetups.map((item) => {
                          const isBuy = item.direction === "BUY";
                          const isSell = item.direction === "SELL";
                          return (
                            <tr
                              key={item.symbol}
                              className={`hover:bg-[#131a2b] transition-colors cursor-pointer ${
                                item.symbol === selectedSymbol ? "bg-[#141d30]" : ""
                              }`}
                              onClick={() => setSelectedSymbol(item.symbol)}
                            >
                              <td className="py-2 px-2.5 font-bold text-white">{item.symbol}</td>
                              <td className="py-2 px-2.5 font-bold">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    isBuy
                                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                                      : isSell
                                      ? "bg-rose-950/80 text-rose-400 border border-rose-800"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {item.direction}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 text-cyan-300 font-bold">{item.quality_grade}</td>
                              <td className="py-2 px-2.5 font-bold text-slate-200">
                                {item.overall_score}/100
                              </td>
                              <td className="py-2 px-2.5 text-slate-400">1:{item.risk_reward_ratio}</td>
                              <td className="py-2 px-2.5 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSymbol(item.symbol);
                                  }}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#182133] mt-3 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Weights: Structure 25% • Trend 20% • Mom 15% • Vol 10% • S/R 10%</span>
                  <button
                    onClick={() => setActiveTab("signals")}
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    View All Setups →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pro Chart View */}
        {activeTab === "chart" && (
          <div className="space-y-4">
            <InteractiveTradingChart
              symbol={selectedSymbol}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              candles={candles}
              indicators={indicators}
              zones={zones}
              events={events}
              patterns={patterns}
            />
          </div>
        )}

        {/* Tab 3: AI Trade Setups & Signals */}
        {activeTab === "signals" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <AITradeSetupCard
                setup={setup}
                prediction={prediction}
                onExecutePaperTrade={handleExecutePaperTrade}
                onLoadRiskCalc={() => setActiveTab("risk")}
              />
            </div>
            <div className="lg:col-span-6">
              <MultiTimeframeMatrix mtf={mtf} />
            </div>
          </div>
        )}

        {/* Tab 4: Multi-Timeframe Matrix View */}
        {activeTab === "mtf" && (
          <div className="space-y-4">
            <MultiTimeframeMatrix mtf={mtf} />
          </div>
        )}

        {/* Tab 5: Risk Engine View */}
        {activeTab === "risk" && (
          <RiskManagementCalculator
            initialSymbol={selectedSymbol}
            initialEntry={setup?.current_price}
            initialSL={setup?.stop_loss}
            initialTP1={setup?.take_profit_1}
            initialTP2={setup?.take_profit_2}
          />
        )}

        {/* Tab 6: Backtest Studio View */}
        {activeTab === "backtest" && (
          <BacktestingStudio initialSymbol={selectedSymbol} />
        )}

        {/* Tab 7: Paper Trading Simulator */}
        {activeTab === "papertrading" && (
          <PaperTradingPanel initialSymbol={selectedSymbol} />
        )}

        {/* Tab 8: AI Assistant Conversational Terminal */}
        {activeTab === "assistant" && (
          <AIAssistantChat currentSymbol={selectedSymbol} />
        )}

        {/* Tab 9: Economic Calendar View */}
        {activeTab === "news" && <EconomicCalendar />}

        {/* Tab 10: Model Monitoring Dashboard */}
        {activeTab === "mlops" && <ModelMonitoringView />}

        {/* Tab 11: Landing Overview & Architecture */}
        {activeTab === "landing" && (
          <LandingHero
            onOpenDashboard={() => setActiveTab("dashboard")}
            onExploreAnalysis={() => setActiveTab("signals")}
          />
        )}
      </main>
    </div>
  );
}
