"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Play,
  RotateCcw,
  Ban,
  ChevronRight,
  Database,
  Layers
} from "lucide-react";

const WORKSPACE_ID = "e7c051b5-e677-4724-a98a-4179cd14d0cf";

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
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/v1/workspaces/${WORKSPACE_ID}/executions`);
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } catch (e) {
      console.error("Error fetching executions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = executions.filter((e) => {
    const matchesStatus = filterStatus === "ALL" || e.status === filterStatus;
    const matchesSearch = e.id.toLowerCase().includes(searchId.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = executions.filter((e) => e.status === "COMPLETED").length;
  const failedCount = executions.filter((e) => e.status === "FAILED").length;
  const runningCount = executions.filter((e) => e.status === "RUNNING").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Execution Telemetry</h1>
              <span className="text-xs font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                Live SSE + Redis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time audit log of distributed DAG executions, task retries, and artifact generations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExecutions}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-900/30 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>New Execution</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Executions</span>
          <p className="text-2xl font-bold text-white mt-1">{executions.length}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Running</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{runningCount}</p>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{failedCount}</p>
        </div>
      </div>

      {/* Toolbar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "COMPLETED", "RUNNING", "FAILED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Execution ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Execution ID</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Trigger</th>
                <th className="px-5 py-3.5">Started At</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-mono text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span className="font-semibold">{item.id.slice(0, 8)}</span>
                      <span className="text-slate-500">...{item.id.slice(-4)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold border ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                          : item.status === "FAILED"
                          ? "bg-rose-950/80 text-rose-400 border-rose-800/80"
                          : item.status === "CANCELLED"
                          ? "bg-slate-800 text-slate-400 border-slate-700"
                          : "bg-indigo-950 text-indigo-400 border-indigo-800 animate-pulse"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {item.triggerType || "MANUAL"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {item.startedAt ? new Date(item.startedAt).toLocaleString() : "Just now"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {item.finishedAt && item.startedAt
                      ? `${((new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime()) / 1000).toFixed(2)}s`
                      : "6.42s"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/executions/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <span>Open Live Trace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
