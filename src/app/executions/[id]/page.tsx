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
  Activity,
  Layers
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
    <div className="space-y-4">
      {/* Telemetry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e0f13] border border-[#1f222a] p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 bg-[#161820] hover:bg-[#1f222c] rounded-md border border-[#2b2f3a] text-[#8b949e] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white font-mono flex items-center gap-1.5">
                <span>Execution</span>
                <span className="text-[#e5a93c]">#{executionId ? executionId.slice(0, 8) : "run"}</span>
              </h1>

              <button
                onClick={copyExecutionId}
                title="Copy Full UUID"
                className="p-1 hover:bg-[#161820] rounded text-[#8b949e] hover:text-[#ededed] transition"
              >
                <Copy className="w-3 h-3" />
              </button>
              {copiedId && <span className="text-[10px] text-[#10b981] font-mono">copied</span>}

              {/* Status Pill */}
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium border flex items-center gap-1.5 ${
                  isCompleted
                    ? "bg-[#0d1f14] text-[#10b981] border-[#163821]"
                    : isFailed
                    ? "bg-[#250e12] text-[#f43f5e] border-[#441920]"
                    : isCancelled
                    ? "bg-[#181a20] text-[#8b949e] border-[#23262f]"
                    : "bg-[#221706] text-[#e5a93c] border-[#38260a] animate-pulse"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCompleted
                      ? "bg-[#10b981]"
                      : isFailed
                      ? "bg-[#f43f5e]"
                      : isCancelled
                      ? "bg-[#8b949e]"
                      : "bg-[#e5a93c]"
                  }`}
                ></span>
                <span>{execution?.status || (isRunning ? "RUNNING" : "COMPLETED")}</span>
              </span>
            </div>

            <p className="text-[11px] text-[#525866] font-mono mt-0.5">
              Pipeline: {execution?.workflowId || executionId} &bull; Kafka Outbox + Redis Stream
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#f43f5e] bg-[#250e12] hover:bg-[#341419] border border-[#441920] rounded-md transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Run</span>
            </button>
          )}

          {isFailed && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#e5a93c] bg-[#221706] hover:bg-[#31230c] border border-[#38260a] rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Nodes</span>
            </button>
          )}

          <Link
            href={`/workflows/${execution?.workflowId || executionId}/edit`}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-white text-xs font-mono rounded-md transition"
          >
            <span>Edit Canvas</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Nodes Satisfied</span>
          <p className="text-xl font-mono font-bold text-white">
            {tasks.filter((t) => t.status === "COMPLETED").length} / {tasks.length || 5}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Execution Phase</span>
          <p className="text-base font-mono font-bold text-[#e5a93c] truncate">
            {isCompleted ? "All Tasks Done" : isFailed ? "Halted on Error" : "Kafka Dispatched"}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Live Stream Channel</span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span className="text-xs font-mono text-[#ededed]">Redis Pub/Sub</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Artifact Engine</span>
          <p className="text-sm font-mono text-[#8b949e] truncate pt-0.5">
            MinIO S3 Connected
          </p>
        </div>
      </div>

      {/* Main Execution Split View: Left Steps Timeline, Right Inspector & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Step Sequence Rail (7 Columns) */}
        <div className="lg:col-span-7 bg-[#0e0f13] border border-[#1f222a] rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f222a]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8b949e]">
              DAG Step Sequence Timeline
            </span>
            <span className="text-[10px] font-mono text-[#525866]">
              Click any node to inspect payload
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <div
                  key={step.id || step.nodeId}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 rounded-md border transition cursor-pointer flex items-center justify-between text-xs font-mono ${
                    isSelected
                      ? "bg-[#161820] border-[#e5a93c]"
                      : "bg-[#111216] border-[#1f222a] hover:bg-[#14161d] hover:border-[#2f3340]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded flex items-center justify-center font-bold text-xs ${
                        step.status === "COMPLETED"
                          ? "bg-[#0d1f14] text-[#10b981] border border-[#163821]"
                          : step.status === "RUNNING"
                          ? "bg-[#221706] text-[#e5a93c] border border-[#38260a] animate-pulse"
                          : step.status === "FAILED"
                          ? "bg-[#250e12] text-[#f43f5e] border border-[#441920]"
                          : "bg-[#161820] text-[#525866]"
                      }`}
                    >
                      {step.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : step.status === "FAILED" ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#f43f5e]" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{step.nodeId}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161820] text-[#8b949e] border border-[#23262f]">
                          {step.taskType}
                        </span>
                        {step.currentAttempt && step.currentAttempt > 1 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#221706] text-[#e5a93c] border border-[#38260a]">
                            att {step.currentAttempt}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#525866] mt-0.5 truncate max-w-sm">
                        {step.errorMessage ? (
                          <span className="text-[#f43f5e]">{step.errorMessage}</span>
                        ) : step.outputSummary ? (
                          step.outputSummary
                        ) : (
                          "Dispatched over Kafka partition..."
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-[#8b949e]">{step.duration || "0.28s"}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition ${isSelected ? "text-[#e5a93c] translate-x-0.5" : "text-[#525866]"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector & Live Console (5 Columns) */}
        <div className="lg:col-span-5 space-y-3">
          {/* MinIO Artifact Download Widget */}
          {reportArtifactUrl && (
            <div className="bg-[#0e0f13] border border-[#1f222a] rounded-lg p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[#8b949e] uppercase">Generated S3 Object</span>
                <span className="text-[10px] text-[#10b981] bg-[#0d1f14] px-1.5 py-0.5 rounded border border-[#163821]">
                  MinIO Storage
                </span>
              </div>
              <a
                href={reportArtifactUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-[#111a14] border border-[#1a3824] hover:bg-[#16251b] rounded-md text-xs font-mono text-[#10b981] transition group"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#10b981]" />
                  <div>
                    <div className="font-semibold text-white">Execution Audit Report</div>
                    <div className="text-[10px] text-[#525866]">report-*.json</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#10b981] group-hover:translate-x-0.5 transition" />
              </a>
            </div>
          )}

          {/* Node Payload Inspector */}
          <div className="bg-[#0e0f13] border border-[#1f222a] rounded-lg p-3 space-y-2 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f222a]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8b949e]">
                Payload Inspector: {selectedStep?.nodeId || "Node"}
              </span>
              <div className="flex items-center gap-1 bg-[#13151b] p-0.5 rounded border border-[#1f222a] text-[10px] font-mono">
                <button
                  onClick={() => setActivePayloadTab("output")}
                  className={`px-2 py-0.5 rounded font-semibold transition ${
                    activePayloadTab === "output" ? "bg-[#1f222c] text-white" : "text-[#525866]"
                  }`}
                >
                  Output
                </button>
                <button
                  onClick={() => setActivePayloadTab("input")}
                  className={`px-2 py-0.5 rounded font-semibold transition ${
                    activePayloadTab === "input" ? "bg-[#1f222c] text-white" : "text-[#525866]"
                  }`}
                >
                  Input
                </button>
              </div>
            </div>

            <div className="bg-[#090a0d] p-3 rounded-md border border-[#1f222a] text-[11px] font-mono text-[#ededed] overflow-x-auto max-h-48">
              <pre className="whitespace-pre-wrap break-all text-[#8b949e]">
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
          <div className="bg-[#0e0f13] border border-[#1f222a] rounded-lg p-3 space-y-2 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f222a]">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#525866]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8b949e]">
                  Redis Pub/Sub Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#10b981] bg-[#0d1f14] border border-[#163821] px-1.5 py-0.5 rounded">
                LIVE SSE
              </span>
            </div>

            <div className="bg-[#090a0d] p-3 rounded-md border border-[#1f222a] text-[11px] font-mono text-[#ededed] space-y-1 h-56 overflow-y-auto">
              <p className="text-[#525866]">[SYS] Subscribed to execution progress channel</p>
              <p className="text-[#8b949e]">[ORCH] Correlating execution ID: {executionId}</p>
              <p className="text-[#8b949e]">[KAFKA] Task dispatched to topic task.requested.v1</p>
              {logs.map((log, i) => (
                <p key={i} className="text-[#ededed]">
                  {log}
                </p>
              ))}
              {isCompleted && (
                <p className="text-[#10b981] font-semibold">
                  [ORCH] All DAG tasks satisfied. Execution finished successfully.
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
