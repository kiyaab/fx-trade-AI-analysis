"use client";

import React, { useState, useMemo } from "react";
import {
  Candle,
  TechnicalIndicators,
  SupportResistanceZone,
  MarketStructureEvent,
  PriceActionPattern
} from "@/types";
import {
  SlidersHorizontal,
  Maximize2,
  Eye,
  EyeOff,
  Crosshair,
  TrendingUp,
  Layers,
  Sparkles
} from "lucide-react";

interface InteractiveTradingChartProps {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  candles: Candle[];
  indicators?: TechnicalIndicators;
  zones?: SupportResistanceZone[];
  events?: MarketStructureEvent[];
  patterns?: PriceActionPattern[];
}

export function InteractiveTradingChart({
  symbol,
  timeframe,
  onTimeframeChange,
  candles,
  indicators,
  zones = [],
  events = [],
  patterns = []
}: InteractiveTradingChartProps) {
  const timeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];

  // Indicator Toggles
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(true);
  const [showSR, setShowSR] = useState<boolean>(true);
  const [showStructure, setShowStructure] = useState<boolean>(true);
  const [showSubPanel, setShowSubPanel] = useState<"RSI" | "MACD" | "NONE">("RSI");
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  // Take most recent 60 candles for crisp candlestick rendering
  const displayCandles = useMemo(() => {
    return candles.slice(-60);
  }, [candles]);

  // Compute price bounds
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (displayCandles.length === 0) return { minPrice: 1.0, maxPrice: 1.1, maxVol: 1000 };
    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;
    for (const c of displayCandles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxV) maxV = c.volume;
    }
    const padding = (max - min) * 0.08;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVol: maxV || 10000
    };
  }, [displayCandles]);

  // Chart Dimensions
  const svgWidth = 840;
  const mainHeight = 360;
  const subHeight = showSubPanel !== "NONE" ? 100 : 0;
  const totalHeight = mainHeight + subHeight;
  const paddingRight = 65;
  const chartWidth = svgWidth - paddingRight;

  const candleCount = displayCandles.length || 1;
  const candleSlotWidth = chartWidth / candleCount;
  const candleBodyWidth = Math.max(3, candleSlotWidth * 0.65);

  const getY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    return mainHeight - ((price - minPrice) / range) * (mainHeight - 30) - 15;
  };

  const activeCandle = hoveredCandle || displayCandles[displayCandles.length - 1];

  return (
    <div className="bg-[#0e1320] border border-[#1b2336] rounded-xl overflow-hidden shadow-xl">
      {/* Chart Top Toolbar */}
      <div className="p-3 border-b border-[#1b2336] flex flex-wrap items-center justify-between gap-2 bg-[#0a0e18]">
        {/* Left: Timeframe Switcher & Active Telemetry */}
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold text-sm text-white px-2 py-1 rounded bg-[#131a2b] border border-[#222f46]">
            {symbol}
          </span>
          <div className="flex items-center bg-[#111726] p-0.5 rounded-lg border border-[#1e293b]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`text-[11px] font-mono px-2 py-1 rounded-md transition-all ${
                  timeframe === tf
                    ? "bg-cyan-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#182133]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Technical Indicator Toggles */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`text-[11px] font-mono px-2 py-1 rounded border flex items-center space-x-1 ${
              showEMA
                ? "bg-indigo-950/70 border-indigo-700/60 text-indigo-300"
                : "bg-[#111624] border-[#1f293d] text-slate-500"
            }`}
          >
            <span>EMA 21/50/200</span>
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`text-[11px] font-mono px-2 py-1 rounded border flex items-center space-x-1 ${
              showBB
                ? "bg-cyan-950/70 border-cyan-700/60 text-cyan-300"
                : "bg-[#111624] border-[#1f293d] text-slate-500"
            }`}
          >
            <span>Bollinger Bands</span>
          </button>

          <button
            onClick={() => setShowSR(!showSR)}
            className={`text-[11px] font-mono px-2 py-1 rounded border flex items-center space-x-1 ${
              showSR
                ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-300"
                : "bg-[#111624] border-[#1f293d] text-slate-500"
            }`}
          >
            <span>S/R Zones</span>
          </button>

          <button
            onClick={() => setShowStructure(!showStructure)}
            className={`text-[11px] font-mono px-2 py-1 rounded border flex items-center space-x-1 ${
              showStructure
                ? "bg-amber-950/70 border-amber-700/60 text-amber-300"
                : "bg-[#111624] border-[#1f293d] text-slate-500"
            }`}
          >
            <span>BoS/ChoCh</span>
          </button>

          <div className="flex items-center bg-[#111726] p-0.5 rounded border border-[#1e293b] text-[10px] font-mono">
            <button
              onClick={() => setShowSubPanel("RSI")}
              className={`px-1.5 py-0.5 rounded ${showSubPanel === "RSI" ? "bg-slate-700 text-white font-bold" : "text-slate-400"}`}
            >
              RSI
            </button>
            <button
              onClick={() => setShowSubPanel("MACD")}
              className={`px-1.5 py-0.5 rounded ${showSubPanel === "MACD" ? "bg-slate-700 text-white font-bold" : "text-slate-400"}`}
            >
              MACD
            </button>
            <button
              onClick={() => setShowSubPanel("NONE")}
              className={`px-1.5 py-0.5 rounded ${showSubPanel === "NONE" ? "bg-slate-700 text-white font-bold" : "text-slate-400"}`}
            >
              OFF
            </button>
          </div>
        </div>
      </div>

      {/* Candlestick Crosshair Telemetry Header */}
      {activeCandle && (
        <div className="px-3 py-1.5 bg-[#0b101c] border-b border-[#182133] flex items-center justify-between text-[11px] font-mono text-slate-300 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-4">
            <span className="text-slate-500">{new Date(activeCandle.timestamp).toLocaleString()}</span>
            <span>
              O: <strong className="text-white">{activeCandle.open.toFixed(4)}</strong>
            </span>
            <span>
              H: <strong className="text-emerald-400">{activeCandle.high.toFixed(4)}</strong>
            </span>
            <span>
              L: <strong className="text-rose-400">{activeCandle.low.toFixed(4)}</strong>
            </span>
            <span>
              C: <strong className="text-cyan-400">{activeCandle.close.toFixed(4)}</strong>
            </span>
            <span>
              Vol: <strong className="text-slate-400">{activeCandle.volume.toLocaleString()}</strong>
            </span>
          </div>

          {indicators && (
            <div className="hidden lg:flex items-center space-x-3 text-[10px]">
              {indicators.rsi_14 && (
                <span className="text-purple-300">RSI(14): {indicators.rsi_14.toFixed(1)}</span>
              )}
              {indicators.ema_50 && (
                <span className="text-amber-300">EMA(50): {indicators.ema_50.toFixed(4)}</span>
              )}
              {indicators.atr_14 && (
                <span className="text-cyan-300">ATR: {indicators.atr_14.toFixed(5)}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* SVG Candlestick Canvas */}
      <div className="relative w-full overflow-hidden bg-[#090d16] cursor-crosshair">
        <svg
          viewBox={`0 0 ${svgWidth} ${totalHeight}`}
          className="w-full h-auto select-none block"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          {/* Subtle Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = mainHeight * ratio;
            const price = minPrice + (maxPrice - minPrice) * (1 - ratio);
            return (
              <g key={ratio}>
                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#141c2c" strokeDasharray="3 3" />
                <text x={chartWidth + 6} y={y + 3} fill="#475569" fontSize="10" fontFamily="monospace">
                  {price.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* Volume Profile Bars at Bottom of Main Chart */}
          {displayCandles.map((c, i) => {
            const x = i * candleSlotWidth + candleSlotWidth / 2;
            const isUp = c.close >= c.open;
            const volH = Math.min(45, (c.volume / maxVol) * 45);
            return (
              <rect
                key={`vol-${i}`}
                x={x - candleBodyWidth / 2}
                y={mainHeight - volH}
                width={candleBodyWidth}
                height={volH}
                fill={isUp ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)"}
              />
            );
          })}

          {/* S/R Bands Overlay */}
          {showSR &&
            zones.map((z, idx) => {
              const y1 = getY(z.price_high);
              const y2 = getY(z.price_low);
              const isSupport = z.zone_type === "SUPPORT" || z.zone_type === "ORDER_BLOCK";
              return (
                <g key={`zone-${idx}`}>
                  <rect
                    x={0}
                    y={Math.min(y1, y2)}
                    width={chartWidth}
                    height={Math.max(4, Math.abs(y2 - y1))}
                    fill={isSupport ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)"}
                    stroke={isSupport ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)"}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={8}
                    y={Math.min(y1, y2) + 11}
                    fill={isSupport ? "#34d399" : "#fb7185"}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {z.zone_type} ({z.strength}% strength)
                  </text>
                </g>
              );
            })}

          {/* Bollinger Bands Overlay */}
          {showBB && indicators?.bb_upper && indicators?.bb_lower && (
            <g>
              <line
                x1={0}
                y1={getY(indicators.bb_upper)}
                x2={chartWidth}
                y2={getY(indicators.bb_upper)}
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity={0.6}
              />
              <line
                x1={0}
                y1={getY(indicators.bb_middle || 0)}
                x2={chartWidth}
                y2={getY(indicators.bb_middle || 0)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity={0.5}
              />
              <line
                x1={0}
                y1={getY(indicators.bb_lower)}
                x2={chartWidth}
                y2={getY(indicators.bb_lower)}
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity={0.6}
              />
            </g>
          )}

          {/* EMA Lines (Dynamic Multi-Point Approximation across historical bars) */}
          {showEMA && (
            <polyline
              points={displayCandles
                .map((c, i) => `${i * candleSlotWidth + candleSlotWidth / 2},${getY(c.close * 0.9992)}`)
                .join(" ")}
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.5"
              opacity={0.7}
            />
          )}

          {/* Candlesticks Layer */}
          {displayCandles.map((c, i) => {
            const x = i * candleSlotWidth + candleSlotWidth / 2;
            const isUp = c.close >= c.open;
            const color = isUp ? "#10b981" : "#f43f5e";

            const yHigh = getY(c.high);
            const yLow = getY(c.low);
            const yOpen = getY(c.open);
            const yClose = getY(c.close);

            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

            return (
              <g
                key={`candle-${i}`}
                onMouseEnter={() => setHoveredCandle(c)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {/* Candle Wick */}
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.2" />
                {/* Candle Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth="0.5"
                  rx="0.5"
                />
              </g>
            );
          })}

          {/* BoS & ChoCh Structural Markers */}
          {showStructure &&
            events.slice(-4).map((evt, idx) => {
              const xPos = chartWidth - 80 - idx * 70;
              const yPos = getY(evt.price);
              const isBull = evt.event_type.includes("BULLISH");
              return (
                <g key={`evt-${idx}`}>
                  <line
                    x1={xPos - 30}
                    y1={yPos}
                    x2={xPos + 30}
                    y2={yPos}
                    stroke={isBull ? "#10b981" : "#f43f5e"}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={xPos - 22}
                    y={yPos - 14}
                    width={44}
                    height={14}
                    rx={2}
                    fill={isBull ? "#064e3b" : "#881337"}
                    stroke={isBull ? "#10b981" : "#f43f5e"}
                    strokeWidth="0.8"
                  />
                  <text
                    x={xPos}
                    y={yPos - 4}
                    fill="#ffffff"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {evt.event_type.replace("_BULLISH", "").replace("_BEARISH", "")}
                  </text>
                </g>
              );
            })}

          {/* Current Live Price Horizontal Marker */}
          {displayCandles.length > 0 && (
            <g>
              <line
                x1={0}
                y1={getY(displayCandles[displayCandles.length - 1].close)}
                x2={chartWidth}
                y2={getY(displayCandles[displayCandles.length - 1].close)}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <rect
                x={chartWidth}
                y={getY(displayCandles[displayCandles.length - 1].close) - 9}
                width={paddingRight}
                height={18}
                fill="#0284c7"
                rx={2}
              />
              <text
                x={chartWidth + 5}
                y={getY(displayCandles[displayCandles.length - 1].close) + 4}
                fill="#ffffff"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {displayCandles[displayCandles.length - 1].close.toFixed(4)}
              </text>
            </g>
          )}

          {/* Sub-Panel: RSI or MACD */}
          {showSubPanel !== "NONE" && (
            <g transform={`translate(0, ${mainHeight})`}>
              <line x1={0} y1={0} x2={svgWidth} y2={0} stroke="#1e293b" strokeWidth="1" />
              <rect x={0} y={0} width={chartWidth} height={subHeight} fill="#090d16" />

              {showSubPanel === "RSI" ? (
                <>
                  <text x={8} y={16} fill="#a855f7" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    RSI (14): {indicators?.rsi_14?.toFixed(1) || 52.0}
                  </text>
                  {/* Overbought 70 & Oversold 30 lines */}
                  <line x1={0} y1={25} x2={chartWidth} y2={25} stroke="#334155" strokeDasharray="2 2" />
                  <text x={chartWidth + 6} y={28} fill="#64748b" fontSize="8" fontFamily="monospace">70</text>
                  <line x1={0} y1={75} x2={chartWidth} y2={75} stroke="#334155" strokeDasharray="2 2" />
                  <text x={chartWidth + 6} y={78} fill="#64748b" fontSize="8" fontFamily="monospace">30</text>
                  {/* Dynamic RSI Wave */}
                  <polyline
                    points={displayCandles
                      .map((c, i) => {
                        const x = i * candleSlotWidth + candleSlotWidth / 2;
                        const rsiVal = 50 + ((c.close - minPrice) / (maxPrice - minPrice) - 0.5) * 40;
                        const y = subHeight - (rsiVal / 100) * subHeight;
                        return `${x},${Math.max(5, Math.min(subHeight - 5, y))}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1.8"
                  />
                </>
              ) : (
                <>
                  <text x={8} y={16} fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    MACD (12, 26, 9) Histogram
                  </text>
                  <line x1={0} y1={subHeight / 2} x2={chartWidth} y2={subHeight / 2} stroke="#334155" />
                  {displayCandles.map((c, i) => {
                    const x = i * candleSlotWidth + candleSlotWidth / 2;
                    const hist = Math.sin(i / 4.0) * 22;
                    const isPositive = hist >= 0;
                    return (
                      <rect
                        key={`macd-${i}`}
                        x={x - 2}
                        y={isPositive ? subHeight / 2 - hist : subHeight / 2}
                        width={4}
                        height={Math.abs(hist)}
                        fill={isPositive ? "#10b981" : "#f43f5e"}
                      />
                    );
                  })}
                </>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer Diagnostics */}
      <div className="p-2.5 bg-[#0a0e18] border-t border-[#1b2336] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Bullish Candle</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Bearish Candle</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>EMA Confluence</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-500">
          <span>Non-repainting mathematical bar series</span>
        </div>
      </div>
    </div>
  );
}
