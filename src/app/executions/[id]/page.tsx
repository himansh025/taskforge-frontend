"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Play, RotateCcw, AlertCircle, FileText, ChevronRight, Terminal } from "lucide-react";

interface TaskStep {
  nodeId: string;
  name: string;
  taskType: string;
  status: "COMPLETED" | "RUNNING" | "PENDING" | "FAILED";
  duration: string;
  outputSummary?: string;
}

export default function ExecutionViewPage({ params }: { params: { id: string } }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(3);

  const steps: TaskStep[] = [
    {
      nodeId: "node-1",
      name: "Validate Invoice CSV",
      taskType: "CSV_VALIDATE",
      status: "COMPLETED",
      duration: "0.24s",
      outputSummary: "Validated 142 rows. Total: $84,520.50. Checksum: sha256:d8a5f3...",
    },
    {
      nodeId: "node-2",
      name: "Transform & Cleanse Records",
      taskType: "DATA_TRANSFORM",
      status: "COMPLETED",
      duration: "0.41s",
      outputSummary: "Normalized customer IDs, standardized VAT codes to ISO-3166.",
    },
    {
      nodeId: "node-3",
      name: "Evaluate Condition",
      taskType: "CONDITION",
      status: "COMPLETED",
      duration: "0.08s",
      outputSummary: "Condition evaluated TRUE: Amount > 10,000 threshold matched.",
    },
    {
      nodeId: "node-4",
      name: "Generate Summary Report",
      taskType: "GENERATE_REPORT",
      status: isRunning ? "RUNNING" : "COMPLETED",
      duration: "0.62s",
      outputSummary: "s3://taskforge-artifacts/reports/execution-summary.pdf (42 KB)",
    },
    {
      nodeId: "node-5",
      name: "Dispatch Notification Email",
      taskType: "SEND_EMAIL",
      status: isRunning ? "PENDING" : "COMPLETED",
      duration: isRunning ? "-" : "0.19s",
      outputSummary: isRunning ? undefined : "Dispatched notification to finance-team@taskforge.local via Mailpit.",
    },
  ];

  const triggerRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Execution Run #ex-8f2a1b</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isRunning 
                  ? "bg-indigo-950 text-indigo-400 border border-indigo-800/80 animate-pulse" 
                  : "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
              }`}>
                {isRunning ? "RUNNING" : "COMPLETED"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Workflow: Invoice Intake & Validation • Correlation ID: {params.id}
            </p>
          </div>
        </div>

        <button
          onClick={triggerRerun}
          disabled={isRunning}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-xs transition"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} /> Rerun Execution
        </button>
      </div>

      {/* Progress Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Execution Steps</h2>
          {steps.map((step, idx) => (
            <div
              key={step.nodeId}
              className={`p-4 rounded-xl border transition ${
                step.status === "RUNNING"
                  ? "bg-slate-900/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10"
                  : step.status === "COMPLETED"
                  ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  : "bg-slate-950/40 border-slate-800/40 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step.status === "COMPLETED" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {step.status === "RUNNING" && (
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                  {step.status === "PENDING" && (
                    <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-sm text-white">{step.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-indigo-400">{step.taskType}</span>
                      <span>•</span>
                      <span>Node: {step.nodeId}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-slate-300">{step.duration}</div>
                  <div className={`text-[10px] uppercase font-bold mt-0.5 ${
                    step.status === "COMPLETED" ? "text-emerald-400" :
                    step.status === "RUNNING" ? "text-indigo-400" : "text-slate-500"
                  }`}>
                    {step.status}
                  </div>
                </div>
              </div>

              {step.outputSummary && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300 bg-slate-950/70 p-2.5 rounded-lg flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{step.outputSummary}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Execution Metadata & Artifacts */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Execution Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Trigger Type</span>
                <span className="text-white font-mono">MANUAL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Duration</span>
                <span className="text-white font-mono">1.54s</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Worker Group</span>
                <span className="text-white font-mono">worker-service-group</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Kafka Partitions</span>
                <span className="text-white font-mono">3 / in-sync</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Outbox State</span>
                <span className="text-emerald-400 font-mono">PROCESSED (0 lag)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Generated Artifacts</h3>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-medium text-white">execution-summary.pdf</div>
                  <div className="text-[10px] text-slate-500">MinIO S3 • 42 KB</div>
                </div>
              </div>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
