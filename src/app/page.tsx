"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Plus, GitBranch, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version: number;
  lastRun?: string;
  lastStatus?: "COMPLETED" | "RUNNING" | "FAILED";
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: "a100-invoice-intake",
    name: "Automated Invoice Intake & Validation",
    description: "Parses monthly vendor CSVs, validates line items, verifies tax ID and routes for automated payment approval.",
    status: "PUBLISHED",
    version: 3,
    lastRun: "10 mins ago",
    lastStatus: "COMPLETED",
  },
  {
    id: "b200-employee-onboarding",
    name: "Employee Onboarding Provisioning",
    description: "Coordinates HR account creation, generates welcome pack and provisions email & access rights.",
    status: "DRAFT",
    version: 1,
    lastRun: "2 days ago",
    lastStatus: "COMPLETED",
  },
  {
    id: "c300-daily-sales-report",
    name: "Daily Sales Aggregation & Dispatch",
    description: "Aggregates branch sales from PostgreSQL, transforms metrics and sends a daily summary to Slack & Email.",
    status: "PUBLISHED",
    version: 2,
    lastRun: "Yesterday at 23:00",
    lastStatus: "COMPLETED",
  },
];

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item: WorkflowItem = {
      id: `wf-${Date.now()}`,
      name: newTitle,
      description: newDesc,
      status: "DRAFT",
      version: 1,
    };
    setWorkflows([item, ...workflows]);
    setShowModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-medium">Total Workflows</div>
          <div className="text-2xl font-bold text-white mt-1">{workflows.length}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 2 Published
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-medium">Executions (24h)</div>
          <div className="text-2xl font-bold text-white mt-1">1,429</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            99.8% Success Rate
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-medium">Active Workers</div>
          <div className="text-2xl font-bold text-white mt-1">3 Replicas</div>
          <div className="text-xs text-indigo-400 mt-2 font-mono">Kafka Consumer Group: OK</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-slate-400 text-xs uppercase font-medium">Avg Execution Time</div>
          <div className="text-2xl font-bold text-white mt-1">1.84s</div>
          <div className="text-xs text-slate-400 mt-2">P95: 3.20s</div>
        </div>
      </div>

      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-slate-400 mt-1">
            Build, publish and inspect distributed DAG workflows in your workspace.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    wf.status === "PUBLISHED"
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      : "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                  }`}
                >
                  {wf.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">v{wf.version}</span>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition">
                {wf.name}
              </h3>
              <p className="text-sm text-slate-400 mt-2 line-clamp-2">{wf.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{wf.lastRun || "Never run"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/workflows/${wf.id}/edit`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium transition"
                >
                  Edit DAG
                </Link>
                <Link
                  href={`/executions/${wf.id}`}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition"
                  title="Trigger Run"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Create New Workflow</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Invoice Intake & Approval"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the workflow purpose and expected inputs..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
