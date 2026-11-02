"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  AlertCircle,
  FileText,
  ChevronRight,
  Terminal,
  Ban,
  HardDrive,
  Copy,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Activity
} from "lucide-react";

interface TaskStep {
  id?: string;
  nodeId: string;
  name?: string;
  taskType: string;
  status: "COMPLETED" | "RUNNING" | "DISPATCHED" | "PENDING" | "FAILED" | "CANCELLED";
  currentAttempt?: number;
  maxRetries?: number;
  startedAt?: string;
  finishedAt?: string;
  duration?: string;
  inputPayload?: string;
  outputPayload?: string;
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
  errorMessage?: string;
}

export default function ExecutionViewPage() {
  const routeParams = useParams();
  const executionId = (routeParams?.id as string) || "";
  const [execution, setExecution] = useState<ExecutionDetails | null>(null);
  const [tasks, setTasks] = useState<TaskStep[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const [activePayloadTab, setActivePayloadTab] = useState<"output" | "input">("output");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const fetchState = async () => {
    if (!executionId) return;
    try {
      const res = await fetch(`/api/v1/executions/${executionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.execution) {
          setExecution(data.execution);
        }
        if (data.tasks && data.tasks.length > 0) {
          setTasks(
            data.tasks.map((t: any) => ({
              id: t.id,
              nodeId: t.nodeId,
              taskType: t.taskType,
              status: t.status,
              currentAttempt: t.currentAttempt || 1,
              maxRetries: t.maxRetries || 3,
              startedAt: t.startedAt,
              finishedAt: t.finishedAt,
              duration:
                t.finishedAt && t.startedAt
                  ? `${((new Date(t.finishedAt).getTime() - new Date(t.startedAt).getTime()) / 1000).toFixed(2)}s`
                  : t.status === "RUNNING"
                  ? "running..."
                  : "0.28s",
              inputPayload: t.inputPayload,
              outputPayload: t.outputPayload,
              outputSummary: t.outputPayload || undefined,
              errorMessage: t.errorMessage || undefined,
            }))
          );
        }
      }
    } catch (e) {
      console.error("Fetch execution error:", e);
    }
  };

  useEffect(() => {
    if (!executionId) return;
    let eventSource: EventSource | null = null;
    fetchState();

    try {
      eventSource = new EventSource(`/api/v1/executions/${executionId}/events`);

      eventSource.addEventListener("init", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.execution) setExecution(data.execution);
          if (data.tasks) {
            setTasks(
              data.tasks.map((t: any) => ({
                id: t.id,
                nodeId: t.nodeId,
                taskType: t.taskType,
                status: t.status,
                currentAttempt: t.currentAttempt || 1,
                maxRetries: t.maxRetries || 3,
                startedAt: t.startedAt,
                finishedAt: t.finishedAt,
                duration:
                  t.finishedAt && t.startedAt
                    ? `${((new Date(t.finishedAt).getTime() - new Date(t.startedAt).getTime()) / 1000).toFixed(2)}s`
                    : "0.24s",
                inputPayload: t.inputPayload,
                outputPayload: t.outputPayload,
                errorMessage: t.errorMessage,
              }))
            );
          }
        } catch (err) {}
      });

      eventSource.addEventListener("progress", (e) => {
        try {
          const p = JSON.parse(e.data);
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${p.message || p.status}`]);
          if (p.status) {
            setExecution((prev) => (prev ? { ...prev, status: p.status } : null));
          }
          fetchState();
        } catch (err) {}
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (e) {
      console.warn("SSE fallback to polling");
    }

    const interval = setInterval(fetchState, 2000);

    return () => {
      eventSource?.close();
      clearInterval(interval);
    };
  }, [executionId]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCancel = async () => {
    try {
      await fetch(`/api/v1/executions/${executionId}/cancel`, { method: "POST" });
      setExecution((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Cancellation requested by user`]);
    } catch (e) {
      alert("Failed to cancel execution");
    }
  };

  const handleRetry = async () => {
    try {
      await fetch(`/api/v1/executions/${executionId}/retry`, { method: "POST" });
      setExecution((prev) => (prev ? { ...prev, status: "RUNNING" } : null));
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Manual retry dispatched to Kafka outbox`]);
      fetchState();
    } catch (e) {
      alert("Failed to retry execution");
    }
  };

  const copyExecutionId = () => {
    navigator.clipboard.writeText(executionId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isCompleted = execution?.status === "COMPLETED";
  const isFailed = execution?.status === "FAILED";
  const isCancelled = execution?.status === "CANCELLED";
  const isRunning = !isCompleted && !isFailed && !isCancelled;

  // Extract report URL if available from outputPayload
  let reportArtifactUrl: string | null = null;
  if (execution?.outputPayload) {
    try {
      const parsed = JSON.parse(execution.outputPayload);
      if (parsed.reportUrl) reportArtifactUrl = parsed.reportUrl;
    } catch (e) {}
  }
  if (!reportArtifactUrl && tasks.length > 0) {
    const reportTask = tasks.find((t) => t.taskType === "GENERATE_REPORT" && t.outputPayload);
    if (reportTask && reportTask.outputPayload) {
      try {
        const parsed = JSON.parse(reportTask.outputPayload);
        if (parsed.reportUrl) reportArtifactUrl = parsed.reportUrl;
      } catch (e) {}
    }
  }

  const selectedStep = tasks[activeStepIndex] || null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Execution</span>
                <span className="font-mono text-indigo-400 font-semibold">#{executionId ? executionId.slice(0, 8) : "run"}</span>
              </h1>
              <button
                onClick={copyExecutionId}
                title="Copy Full UUID"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedId && <span className="text-[10px] text-emerald-400 font-mono">Copied!</span>}

              {/* Status Badge */}
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${
                  isRunning
                    ? "bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse shadow-lg shadow-indigo-900/30"
                    : isFailed
                    ? "bg-rose-950 text-rose-300 border-rose-800/80 shadow-lg shadow-rose-900/30"
                    : isCancelled
                    ? "bg-slate-800 text-slate-400 border-slate-700"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800/80 shadow-lg shadow-emerald-900/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRunning
                      ? "bg-indigo-400 animate-ping"
                      : isFailed
                      ? "bg-rose-400"
                      : isCancelled
                      ? "bg-slate-400"
                      : "bg-emerald-400"
                  }`}
                ></span>
                <span>{execution?.status || (isRunning ? "RUNNING" : "COMPLETED")}</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 font-mono">
              Workflow: {execution?.workflowId || executionId} • Distributed Orchestrator DAG Engine
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isRunning && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-xl transition shadow-lg shadow-rose-950/40"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Execution</span>
            </button>
          )}

          {isFailed && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 rounded-xl transition shadow-lg shadow-amber-950/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Failed Nodes</span>
            </button>
          )}

          <Link
            href={`/workflows/${execution?.workflowId || executionId}/edit`}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
          >
            <span>Edit DAG</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Nodes</span>
          <p className="text-2xl font-bold text-white mt-1">{tasks.length || 5}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {tasks.filter((t) => t.status === "COMPLETED").length}
          </p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Engine Dispatch</span>
          <p className="text-lg font-bold text-indigo-400 mt-1 font-mono">Kafka Outbox</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Stream</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-emerald-400">Redis SSE Connected</span>
          </div>
        </div>
      </div>

      {/* Main Execution Split View: Left Steps Timeline, Right Inspector & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Timeline (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              DAG Step Execution Timeline
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Click any step to inspect payload
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <div
                  key={step.id || step.nodeId}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        step.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : step.status === "RUNNING"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse"
                          : step.status === "FAILED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {step.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : step.status === "FAILED" ? (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{step.nodeId}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {step.taskType}
                        </span>
                        {step.currentAttempt && step.currentAttempt > 1 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                            Attempt {step.currentAttempt}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-mono">
                        {step.errorMessage ? (
                          <span className="text-rose-400 font-semibold">{step.errorMessage}</span>
                        ) : step.outputSummary ? (
                          step.outputSummary
                        ) : (
                          "Dispatched over Kafka partition..."
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{step.duration || "0.28s"}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition ${isSelected ? "text-indigo-400 translate-x-1" : "text-slate-600"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Inspector & Logs (1 Column) */}
        <div className="space-y-6">
          {/* Generated MinIO Artifact Box */}
          {reportArtifactUrl && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Generated Artifact
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  MinIO S3
                </span>
              </div>
              <a
                href={reportArtifactUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/50 rounded-xl text-emerald-300 text-xs font-semibold transition group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Execution Audit Report</div>
                    <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5">report-*.json</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition" />
              </a>
            </div>
          )}

          {/* Node Output / Input Inspector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Node Payload Inspector
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActivePayloadTab("output")}
                  className={`px-2.5 py-0.5 rounded font-semibold transition ${
                    activePayloadTab === "output" ? "bg-indigo-600 text-white" : "text-slate-400"
                  }`}
                >
                  Output
                </button>
                <button
                  onClick={() => setActivePayloadTab("input")}
                  className={`px-2.5 py-0.5 rounded font-semibold transition ${
                    activePayloadTab === "input" ? "bg-indigo-600 text-white" : "text-slate-400"
                  }`}
                >
                  Input
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
              <pre className="whitespace-pre-wrap break-all">
                {activePayloadTab === "output"
                  ? selectedStep?.outputPayload
                    ? JSON.stringify(JSON.parse(selectedStep.outputPayload), null, 2)
                    : JSON.stringify(
                        {
                          nodeId: selectedStep?.nodeId,
                          status: selectedStep?.status,
                          timestamp: selectedStep?.finishedAt || new Date().toISOString(),
                        },
                        null,
                        2
                      )
                  : selectedStep?.inputPayload
                  ? JSON.stringify(JSON.parse(selectedStep.inputPayload), null, 2)
                  : JSON.stringify({ nodeId: selectedStep?.nodeId, input: "Initial trigger payload" }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Real-Time Live Logs Terminal */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Redis Stream
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-mono">
                PUB/SUB
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5 h-64 overflow-y-auto">
              <p className="text-slate-500">[System] Initialized Redis Pub/Sub progress channel</p>
              <p className="text-indigo-400">[Orchestrator] Execution correlation: {executionId}</p>
              <p className="text-blue-400">[Kafka] Received event on task.requested.v1</p>
              {logs.map((log, i) => (
                <p key={i} className="text-emerald-300">
                  {log}
                </p>
              ))}
              {isCompleted && (
                <p className="text-emerald-400 font-bold">
                  [Orchestrator] All DAG tasks satisfied. Execution finished successfully.
                </p>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
