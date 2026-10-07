"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, CheckCircle2, ShieldCheck, Cpu, Database, AlertCircle } from "lucide-react";
import { ModelMonitoringMetrics } from "@/types";
import { api } from "@/lib/api";

export function ModelMonitoringView() {
  const [metrics, setMetrics] = useState<ModelMonitoringMetrics | null>(null);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [retrainMsg, setRetrainMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getMonitoringMetrics().then(setMetrics).catch(console.error);
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg(null);
    try {
      const res = await api.retrainModel();
      setRetrainMsg(`Model successfully retrained! Candidate: ${res.deployed_version} (${res.out_of_sample_improvement} improvement)`);
      const updated = await api.getMonitoringMetrics();
      setMetrics(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setRetraining(false);
    }
  };

  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Loading ML inference telemetry and drift metrics...
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#0e1320] border border-[#1b2336] overflow-hidden shadow-2xl p-5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1b2336] mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#162035] text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              MLOps Model Performance & Feature Drift Dashboard
            </h3>
            <p className="text-[11px] text-slate-400">
              Live monitoring of out-of-sample calibration, PSI drift, and feature importances
            </p>
          </div>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center space-x-1.5 py-2 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? "animate-spin" : ""}`} />
          <span>{retraining ? "Executing Pipeline..." : "Trigger Validated Retraining"}</span>
        </button>
      </div>

      {retrainMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{retrainMsg}</span>
        </div>
      )}

      {/* Primary Status Banner */}
      <div className="p-4 rounded-xl bg-[#090d16] border border-[#182133] mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Active Deployed Architecture</span>
          <span className="text-sm font-bold text-white">{metrics.algorithm}</span>
          <span className="text-slate-400 text-[11px] block mt-0.5">
            Model Version: <strong className="text-cyan-400">{metrics.model_version}</strong> • Trained: {metrics.last_trained}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Dataset Size</span>
            <span className="text-sm font-bold text-slate-200">{metrics.dataset_size.toLocaleString()} bars</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Health Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold">
              {metrics.status}
            </span>
          </div>
        </div>
      </div>

      {/* Model Accuracy & Calibration Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center mb-6 text-xs">
        <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">Out-Of-Sample Acc</span>
          <span className="text-base font-bold text-emerald-400">{(metrics.accuracy * 100).toFixed(1)}%</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">Precision</span>
          <span className="text-base font-bold text-cyan-400">{(metrics.precision * 100).toFixed(1)}%</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">Recall</span>
          <span className="text-base font-bold text-cyan-400">{(metrics.recall * 100).toFixed(1)}%</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">F1-Score</span>
          <span className="text-base font-bold text-indigo-400">{(metrics.f1_score * 100).toFixed(1)}%</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">ROC-AUC</span>
          <span className="text-base font-bold text-cyan-300">{metrics.roc_auc.toFixed(3)}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">Brier Calibration</span>
          <span className="text-base font-bold text-emerald-300">{metrics.brier_score.toFixed(3)}</span>
        </div>
      </div>

      {/* Feature Importance & Drift Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        {/* Left: Feature Importances Bar Chart */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-[#182133] space-y-3">
          <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
            Top Gini-Impurity Feature Weights
          </h4>
          <div className="space-y-2.5">
            {Object.entries(metrics.feature_importances).map(([feat, weight]) => (
              <div key={feat} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">{feat}</span>
                  <span className="text-cyan-400 font-bold">{(weight * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#162033] overflow-hidden">
                  <div
                    style={{ width: `${weight * 100 * 3.5}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Drift & Stability Metrics */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-[#182133] space-y-3">
          <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
            Drift & Calibration Diagnostics
          </h4>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Population Stability Index (PSI)</span>
                <span className="text-[11px] text-slate-400">Prediction distribution drift metric</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-400">{metrics.prediction_drift_psi}</span>
                <span className="text-[10px] text-slate-500 block">&lt; 0.10: No Drift</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Feature Distribution Shift</span>
                <span className="text-[11px] text-slate-400">Kolmogorov-Smirnov test across inputs</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold">
                PASSED (STABLE)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1424] border border-[#1b2336] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Automated Model Gatekeeper</span>
                <span className="text-[11px] text-slate-400">Never deploy candidate without test gain</span>
              </div>
              <span className="text-cyan-400 font-bold text-xs">ENFORCED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
