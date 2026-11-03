"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Play,
  RotateCcw,
  Ban,
  ChevronRight,
  Server,
  Layers,
  HardDrive
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface ExecutionItem {
  id: string;
  status: string;
  workflowId: string;
  triggerType?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
  errorMessage?: string;
}

export default function ExecutionsPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "e7c051b5-e677-4724-a98a-4179cd14d0cf";

  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutions = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/executions`);
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } catch (e) {
      console.error("Error fetching executions:", e);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 4000);
    return () => clearInterval(interval);
  }, [fetchExecutions]);

  const filtered = executions.filter((e) => {
    const matchesStatus = filterStatus === "ALL" || e.status === filterStatus;
    const matchesSearch = e.id.toLowerCase().includes(searchId.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = executions.filter((e) => e.status === "COMPLETED").length;
  const failedCount = executions.filter((e) => e.status === "FAILED").length;
  const runningCount = executions.filter((e) => e.status === "RUNNING").length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
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
              <h1 className="text-base font-semibold text-white font-mono">
                {currentWorkspace?.name || "Workspace"} Telemetry Ledger
              </h1>
              <span className="text-[10px] font-mono uppercase bg-[#0d1f14] text-[#10b981] border border-[#163821] px-1.5 py-0.5 rounded">
                Live SSE
              </span>
            </div>
            <p className="text-[11px] text-[#525866] font-mono mt-0.5">
              Historical audit log for tenant: <code className="text-[#ededed]">{currentWorkspace?.slug || "finance-team"}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExecutions}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-[#ededed] rounded-md text-xs font-mono transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#e4e4e7] text-black rounded-md text-xs font-mono font-semibold transition"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Trigger Run</span>
          </Link>
        </div>
      </div>

      {/* Summary Counters Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Total Runs</span>
          <p className="text-xl font-mono font-bold text-white">{executions.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Completed (SLA)</span>
          <p className="text-xl font-mono font-bold text-[#10b981]">{completedCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Active In-Flight</span>
          <p className="text-xl font-mono font-bold text-[#e5a93c]">{runningCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-0.5">
          <span className="text-[10px] font-mono text-[#525866] uppercase">Failed Tasks</span>
          <p className="text-xl font-mono font-bold text-[#f43f5e]">{failedCount}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e0f13] border border-[#1f222a] p-3 rounded-lg">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {["ALL", "COMPLETED", "RUNNING", "FAILED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                filterStatus === st
                  ? "bg-[#1f222c] text-white font-semibold"
                  : "bg-[#13151b] text-[#8b949e] hover:text-[#ededed] border border-[#1f222a]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Execution ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#383d4a] rounded-md pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#525866] outline-none transition"
          />
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="bg-[#0e0f13] border border-[#1f222a] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090a0d] border-b border-[#1f222a] text-[#525866] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Execution Hash</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Trigger Origin</th>
                <th className="px-4 py-2.5">Started At</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181a20]">
              {filtered.map((item) => {
                const durationSec =
                  item.finishedAt && item.startedAt
                    ? `${((new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime()) / 1000).toFixed(2)}s`
                    : item.status === "RUNNING"
                    ? "running..."
                    : "-";

                return (
                  <tr key={item.id} className="hover:bg-[#13151b] transition">
                    <td className="px-4 py-2.5 text-[#ededed]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8b949e]">#</span>
                        <span className="font-semibold text-white">{item.id.slice(0, 8)}</span>
                        <span className="text-[#525866]">...{item.id.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium border flex items-center gap-1.5 w-fit ${
                          item.status === "COMPLETED"
                            ? "bg-[#0d1f14] text-[#10b981] border-[#163821]"
                            : item.status === "FAILED"
                            ? "bg-[#250e12] text-[#f43f5e] border-[#441920]"
                            : item.status === "CANCELLED"
                            ? "bg-[#181a20] text-[#8b949e] border-[#23262f]"
                            : "bg-[#221706] text-[#e5a93c] border-[#38260a] animate-pulse"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "COMPLETED"
                              ? "bg-[#10b981]"
                              : item.status === "FAILED"
                              ? "bg-[#f43f5e]"
                              : item.status === "CANCELLED"
                              ? "bg-[#8b949e]"
                              : "bg-[#e5a93c]"
                          }`}
                        ></span>
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#8b949e]">
                      {item.triggerType || "MANUAL_DISPATCH"}
                    </td>
                    <td className="px-4 py-2.5 text-[#525866]">
                      {item.startedAt ? new Date(item.startedAt).toLocaleString() : "Just now"}
                    </td>
                    <td className="px-4 py-2.5 text-[#8b949e]">{durationSec}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/executions/${item.id}`}
                        className="inline-flex items-center gap-1 text-[#8b949e] hover:text-white transition font-medium"
                      >
                        <span>Live Trace</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
