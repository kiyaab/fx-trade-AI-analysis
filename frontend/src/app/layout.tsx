import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForexPulse AI — Institutional Forex Market Intelligence & Trade Prediction Terminal",
  description:
    "Advanced AI Forex market analysis platform with multi-timeframe confluence, probabilistic predictions, technical indicators, institutional risk management, and walk-forward backtesting.",
  keywords: [
    "Forex AI",
    "Trading Intelligence Terminal",
    "Multi-timeframe Analysis",
    "Forex Prediction Engine",
    "Quantitative Backtesting",
    "Risk Management Calculator"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080b11] text-slate-100">{children}</body>
    </html>
  );
}
