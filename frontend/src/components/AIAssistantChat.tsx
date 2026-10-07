"use client";

import React, { useState } from "react";
import { Bot, Send, User, Sparkles, HelpCircle, Terminal } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIAssistantChatProps {
  currentSymbol?: string;
}

export function AIAssistantChat({ currentSymbol = "EUR/USD" }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        `Welcome to the **ForexPulse AI Assistant**. I provide rigorous mathematical market intelligence grounded strictly in our live price action, market structure, indicators, and ML model outputs.\n\nTry asking:\n• "Analyze ${currentSymbol}"\n• "Why is GBP/USD bullish?"\n• "Find the strongest setup today"\n• "What invalidates this setup?"\n• "Compare EUR/USD and GBP/USD"`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const samplePrompts = [
    `Analyze ${currentSymbol}`,
    "Find the strongest setup today",
    "What invalidates this setup?",
    "Calculate my position size",
    "Compare EUR/USD and GBP/USD"
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.queryAssistant(textToSend, currentSymbol, "4H");
      const botMsg: Message = {
        role: "assistant",
        content: res.answer,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = {
        role: "assistant",
        content: "An error occurred connecting to the analytical inference engine. Please retry.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl flex flex-col h-[580px]">
      {/* Header */}
      <div className="p-4 border-b border-[#1b2336] bg-[#0a0e18] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-900/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <span>ForexPulse Conversational AI Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Grounded Engine
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Zero hallucination • Strictly anchored to terminal indicators & live state
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
          Active Symbol Context: <strong className="text-cyan-400">{currentSymbol}</strong>
        </div>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="px-4 py-2 bg-[#0c101c] border-b border-[#182133] flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-slate-500 shrink-0">Prompts:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#131b2e] border border-[#1f2c45] text-slate-300 hover:text-white hover:border-cyan-500/50 shrink-0 transition-all cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#090d16] font-mono text-xs">
        {messages.map((m, i) => {
          const isBot = m.role === "assistant";
          return (
            <div
              key={i}
              className={`flex items-start space-x-2.5 ${isBot ? "justify-start" : "justify-end"}`}
            >
              {isBot && (
                <div className="w-7 h-7 rounded-md bg-[#162238] border border-cyan-700/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed ${
                  isBot
                    ? "bg-[#0e1424] border border-[#1d273d] text-slate-200"
                    : "bg-cyan-950/80 border border-cyan-700/60 text-cyan-100"
                }`}
              >
                {m.content}
                <div className="text-[9px] text-slate-500 mt-1.5 text-right">{m.timestamp}</div>
              </div>
              {!isBot && (
                <div className="w-7 h-7 rounded-md bg-[#1e293b] text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Querying quantitative market models & price action structures...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-[#1b2336] bg-[#0a0e18] flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask the AI about ${currentSymbol}, market regime, position size, or setups...`}
          className="flex-1 bg-[#111726] border border-[#1e293b] text-white text-xs font-mono py-2.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
