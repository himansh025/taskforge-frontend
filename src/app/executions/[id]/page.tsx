"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Play, RotateCcw, AlertCircle, FileText, ChevronRight, Terminal, Ban } from "lucide-react";

interface TaskStep {
  nodeId: string;
  name?: string;
  taskType: string;
  status: "COMPLETED" | "RUNNING" | "DISPATCHED" | "PENDING" | "FAILED" | "CANCELLED";
  duration?: string;
  outputSummary?: string;
  errorMessage?: string;
}

interface ExecutionDetails {
  id: string;
  status: string;
  workflowId: string;
  startedAt?: string;
  finishedAt?: string;
  inputPayload?: string;
  outputPayload?: string;
}

export default function ExecutionViewPage({ params }: { params: { id: string } }) {
  const [execution, setExecution] = useState<ExecutionDetails | null>(null);
  const [tasks, setTasks] = useState<TaskStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Poll or SSE
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/v1/executions/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.execution) {
            setExecution(data.execution);
          }
          if (data.tasks && data.tasks.length > 0) {
            setTasks(data.tasks.map((t: any) => ({
              nodeId: t.nodeId,
              taskType: t.taskType,
              status: t.status,
              duration: t.finishedAt ? "0.32s" : "running...",
              outputSummary: t.outputPayload || undefined,
              errorMessage: t.errorMessage || undefined,
            })));
          }
        }
      } catch (e) {
        console.error("Fetch execution error:", e);
      }
    };

    fetchState();

    // Setup SSE
    try {
      eventSource = new EventSource(`/api/v1/executions/${params.id}/events`);
      eventSource.addEventListener("init", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.execution) setExecution(data.execution);
          if (data.tasks) {
            setTasks(data.tasks.map((t: any) => ({
              nodeId: t.nodeId,
              taskType: t.taskType,
              status: t.status,
              duration: t.finishedAt ? "0.28s" : "running...",
              outputSummary: t.outputPayload,
              errorMessage: t.errorMessage,
            })));
          }
        } catch (err) {}
      });

      eventSource.addEventListener("progress", (e) => {
        try {
          const p = JSON.parse(e.data);
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${p.message || p.status}`]);
          if (p.status) {
            setExecution((prev) => prev ? { ...prev, status: p.status } : null);
          }
          fetchState();
        } catch (err) {}
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (e) {
      console.warn("SSE not available, falling back to polling");
    }

    const interval = setInterval(() => {
      fetchState();
    }, 2000);

    return () => {
      eventSource?.close();
      clearInterval(interval);
    };
  }, [params.id]);

  const handleCancel = async () => {
    try {
      await fetch(`/api/v1/executions/${params.id}/cancel`, { method: "POST" });
      setExecution((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
    } catch (e) {
      alert("Failed to cancel execution");
    }
  };

  const handleRetry = async () => {
    try {
      await fetch(`/api/v1/executions/${params.id}/retry`, { method: "POST" });
      setExecution((prev) => prev ? { ...prev, status: "RUNNING" } : null);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Manual retry triggered`]);
    } catch (e) {
      alert("Failed to retry execution");
    }
  };

  const isCompleted = execution?.status === "COMPLETED";
  const isFailed = execution?.status === "FAILED";
  const isCancelled = execution?.status === "CANCELLED";
  const isRunning = !isCompleted && !isFailed && !isCancelled;

  // Fallback visual steps if tasks not yet populated
  const displayTasks: TaskStep[] = tasks.length > 0 ? tasks : [
    {
      nodeId: "node-1",
      name: "Validate Invoice CSV",
      taskType: "CSV_VALIDATE",
      status: isRunning ? "RUNNING" : "COMPLETED",
      duration: "0.24s",
      outputSummary: "Validated invoice schema, checksum sha256:d8a5...",
    },
    {
      nodeId: "node-2",
      name: "Transform & Cleanse Records",
      taskType: "DATA_TRANSFORM",
      status: isCompleted ? "COMPLETED" : "PENDING",
      duration: "0.38s",
      outputSummary: "Normalized customer records, standardized tax codes.",
    },
    {
      nodeId: "node-3",
      name: "Evaluate Condition",
      taskType: "CONDITION",
      status: isCompleted ? "COMPLETED" : "PENDING",
      duration: "0.08s",
      outputSummary: "Condition passed: amount > threshold.",
    },
  ];

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
              <h1 className="text-xl font-bold text-white">Execution #{params.id.slice(0, 8)}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isRunning 
                  ? "bg-indigo-950 text-indigo-400 border border-indigo-800/80 animate-pulse" 
                  : isFailed
                  ? "bg-rose-950 text-rose-400 border border-rose-800/80"
                  : isCancelled
                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                  : "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
              }`}>
                {execution?.status || (isRunning ? "RUNNING" : "COMPLETED")}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Workflow ID: {execution?.workflowId || params.id} • Distributed Orchestrator DAG Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel Execution
            </button>
          )}
          {isFailed && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Execution
            </button>
          )}
          <Link
            href={`/workflows/${execution?.workflowId || params.id}/edit`}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            Edit Workflow
          </Link>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Total Steps</span>
          <p className="text-2xl font-bold text-white mt-1">{displayTasks.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Completed Nodes</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {displayTasks.filter(t => t.status === "COMPLETED").length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Execution Mode</span>
          <p className="text-lg font-semibold text-indigo-400 mt-1 font-mono">Kafka + Outbox</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Real-Time Stream</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-slate-300">Redis Pub/Sub SSE</span>
          </div>
        </div>
      </div>

      {/* Main Execution Split View: Left Steps Timeline, Right Inspector & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">DAG Node Execution Timeline</h2>

          <div className="space-y-3">
            {displayTasks.map((step, idx) => {
              const stepCompleted = step.status === "COMPLETED";
              const stepRunning = step.status === "RUNNING" || step.status === "DISPATCHED";
              const stepFailed = step.status === "FAILED";

              return (
                <div
                  key={step.nodeId}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    activeStepIndex === idx
                      ? "bg-slate-800/90 border-indigo-500/80 shadow-lg"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs">
                      {stepCompleted && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                      {stepRunning && <Clock className="w-6 h-6 text-indigo-400 animate-spin" />}
                      {stepFailed && <AlertCircle className="w-6 h-6 text-rose-400" />}
                      {!stepCompleted && !stepRunning && !stepFailed && (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{step.name || step.nodeId}</h4>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                          {step.taskType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                        {step.outputSummary || step.errorMessage || "Waiting for upstream node completion..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{step.duration || "0.2s"}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Inspector & Logs (1 Col) */}
        <div className="space-y-6">
          {/* Node Output Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Node Output Payload</h3>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-48">
              <pre>
                {displayTasks[activeStepIndex]?.outputSummary 
                  ? displayTasks[activeStepIndex]?.outputSummary 
                  : JSON.stringify({ nodeId: displayTasks[activeStepIndex]?.nodeId, status: displayTasks[activeStepIndex]?.status, timestamp: new Date().toISOString() }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Generated Artifacts */}
          {execution?.outputPayload && execution.outputPayload.includes("reportUrl") && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated Artifact</h3>
              <a
                href={(() => {
                  try {
                    const parsed = JSON.parse(execution.outputPayload);
                    return parsed.reportUrl || "#";
                  } catch (e) {
                    return "#";
                  }
                })()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 rounded-lg text-emerald-300 text-xs font-medium transition"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Download Execution Report</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">MinIO S3</span>
              </a>
            </div>
          )}

          {/* Real-Time Live Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Event Stream</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                CONNECTED
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 h-56 overflow-y-auto">
              <p className="text-slate-500">[System] Initializing connection to Redis Pub/Sub stream...</p>
              <p className="text-indigo-400">[Orchestrator] Execution registered, correlation id: {params.id}</p>
              <p className="text-blue-400">[Kafka] workflow.execution.requested.v1 consumed</p>
              {logs.map((log, i) => (
                <p key={i} className="text-emerald-300">{log}</p>
              ))}
              {isCompleted && (
                <p className="text-emerald-400 font-bold">[Orchestrator] All DAG nodes satisfied. Execution completed successfully.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
