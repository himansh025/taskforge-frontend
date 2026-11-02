"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Plus,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  FileText,
  Search,
  Filter,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  BarChart3
} from "lucide-react";

const WORKSPACE_ID = "e7c051b5-e677-4724-a98a-4179cd14d0cf";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

interface ExecutionItem {
  id: string;
  status: string;
  workflowId: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"workflows" | "executions" | "artifacts">("workflows");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("invoice");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Run Modal
  const [showRunModal, setShowRunModal] = useState(false);
  const [selectedWorkflowForRun, setSelectedWorkflowForRun] = useState<string | null>(null);
  const [runFile, setRunFile] = useState<File | null>(null);
  const [runThreshold, setRunThreshold] = useState("10000");
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [wfRes, execRes] = await Promise.all([
        fetch(`/api/v1/workspaces/${WORKSPACE_ID}/workflows`),
        fetch(`/api/v1/workspaces/${WORKSPACE_ID}/executions`),
      ]);

      if (wfRes.ok) {
        const wfData = await wfRes.json();
        setWorkflows(wfData);
      }
      if (execRes.ok) {
        const execData = await execRes.json();
        setExecutions(execData);
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/workspaces/${WORKSPACE_ID}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTitle,
          description: newDesc || "Custom DAG workflow pipeline",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        setNewTitle("");
        setNewDesc("");
        router.push(`/workflows/${created.id}/edit`);
      }
    } catch (e) {
      alert("Failed to create workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    const wfId = selectedWorkflowForRun || (workflows[0] ? workflows[0].id : null);
    if (!wfId) return;

    try {
      setIsRunningPipeline(true);
      let artifactKey = "workspaces/e7c051b5-e677-4724-a98a-4179cd14d0cf/uploads/sample-invoices.csv";

      // If user provided a file, upload to MinIO first
      if (runFile) {
        const formData = new FormData();
        formData.append("file", runFile);
        const uploadRes = await fetch(`/api/v1/workspaces/${WORKSPACE_ID}/uploads`, {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          artifactKey = uploadData.artifactKey;
        }
      }

      // Trigger Execution
      const execRes = await fetch(`/api/v1/workflows/${wfId}/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            sourceArtifactKey: artifactKey,
            threshold: parseFloat(runThreshold) || 10000,
          },
        }),
      });

      if (execRes.ok) {
        const execData = await execRes.json();
        setShowRunModal(false);
        router.push(`/executions/${execData.executionId}`);
      }
    } catch (e) {
      alert("Failed to start workflow execution");
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedExecs = executions.filter((e) => e.status === "COMPLETED").length;
  const successRate = executions.length > 0 ? Math.round((completedExecs / executions.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Top Banner: Greeting & Quick Trigger CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 bg-indigo-900/60 border border-indigo-700/60 px-2.5 py-0.5 rounded-full">
                Workspace Orchestrator
              </span>
              <span className="text-xs text-slate-400">ID: {WORKSPACE_ID.slice(0, 8)}...</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Workflow Automation Platform
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Design DAG pipelines with reactive visual canvas, dispatch stateless tasks across Kafka partitions, and stream execution progress live via Redis Pub/Sub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRunModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition text-sm"
            >
              <Play className="w-4 h-4 fill-white" /> Run Invoice Pipeline
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-900/30 transition text-sm"
            >
              <Plus className="w-4 h-4" /> New Workflow
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workflows */}
        <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-5 rounded-xl backdrop-blur transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workflows</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mt-2">{workflows.length}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">{workflows.filter((w) => w.status === "PUBLISHED").length} Published</span>
            <span>•</span>
            <span>{workflows.filter((w) => w.status === "DRAFT").length} Drafts</span>
          </div>
        </div>

        {/* Total Executions */}
        <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-5 rounded-xl backdrop-blur transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Executions</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">{executions.length}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successRate}% Success Rate</span>
          </div>
        </div>

        {/* Distributed Workers */}
        <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-5 rounded-xl backdrop-blur transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cluster Runtime</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mt-2">3 Replicas</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-sky-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Kafka Partition 0 Active</span>
          </div>
        </div>

        {/* MinIO Artifacts */}
        <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 p-5 rounded-xl backdrop-blur transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Object Storage</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-2">MinIO S3</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">taskforge-artifacts</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("workflows")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "workflows"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab("executions")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "executions"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recent Executions ({executions.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab 1: Workflows Grid */}
      {activeTab === "workflows" && (
        <div>
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-400" />
              Loading workflows from database...
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No workflows found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Get started by creating an automated DAG pipeline for invoice intake, normalization, and email alerts.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition"
              >
                <Plus className="w-4 h-4" /> Create Your First Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="group bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold border ${
                          workflow.status === "PUBLISHED"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                            : "bg-amber-950/80 text-amber-400 border-amber-800/80"
                        }`}
                      >
                        {workflow.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">v1.0</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                        {workflow.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {workflow.description || "Directed acyclic graph workflow pipeline."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWorkflowForRun(workflow.id);
                          setShowRunModal(true);
                        }}
                        className="p-2 hover:bg-slate-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition"
                        title="Run this workflow"
                      >
                        <Play className="w-4 h-4 fill-emerald-400" />
                      </button>
                      <Link
                        href={`/workflows/${workflow.id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
                      >
                        <span>Edit Canvas</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Recent Executions Table */}
      {activeTab === "executions" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Execution Audit Trail</h2>
            </div>
            <span className="text-xs text-slate-400">Total: {executions.length} runs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Execution ID</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Started At</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        <span className="font-semibold">{exec.id.slice(0, 8)}</span>
                        <span className="text-slate-500">...{exec.id.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold border ${
                          exec.status === "COMPLETED"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                            : exec.status === "FAILED"
                            ? "bg-rose-950/80 text-rose-400 border-rose-800/80"
                            : exec.status === "CANCELLED"
                            ? "bg-slate-800 text-slate-400 border-slate-700"
                            : "bg-indigo-950 text-indigo-400 border-indigo-800 animate-pulse"
                        }`}
                      >
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString() : "Just now"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {exec.finishedAt && exec.startedAt
                        ? `${((new Date(exec.finishedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(2)}s`
                        : "6.42s"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/executions/${exec.id}`}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <span>Inspect DAG</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white">Create New Workflow</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Vendor Invoice Processing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the pipeline goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Architecture Preset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedTemplate("invoice")}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedTemplate === "invoice"
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-slate-200">Invoice DAG (5 Nodes)</div>
                    <div className="text-[11px] text-slate-500 mt-1">CSV &rarr; Transform &rarr; Branch &rarr; MinIO &rarr; Mail</div>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate("custom")}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedTemplate === "custom"
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-slate-200">Blank Custom DAG</div>
                    <div className="text-[11px] text-slate-500 mt-1">Start with an empty canvas</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
                >
                  {isSubmitting ? "Creating..." : "Create & Open Canvas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Run Execution Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-emerald-400" />
                </div>
                <h2 className="text-base font-bold text-white">Execute Invoice Workflow</h2>
              </div>
              <button
                onClick={() => setShowRunModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleRunPipeline} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Workflow
                </label>
                <select
                  value={selectedWorkflowForRun || (workflows[0] ? workflows[0].id : "")}
                  onChange={(e) => setSelectedWorkflowForRun(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Upload Invoices CSV to MinIO S3
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 text-center bg-slate-950 cursor-pointer transition">
                  <input
                    type="file"
                    accept=".csv"
                    id="csv-file-input"
                    className="hidden"
                    onChange={(e) => setRunFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-200">
                      {runFile ? runFile.name : "Click to select CSV file"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {runFile ? `${(runFile.size / 1024).toFixed(1)} KB` : "Leave empty to use sample invoice data"}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Threshold Rule ($)
                </label>
                <input
                  type="number"
                  value={runThreshold}
                  onChange={(e) => setRunThreshold(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  placeholder="10000"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Invoices exceeding this amount branch into audit report generation and alert email dispatch.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunningPipeline}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  {isRunningPipeline ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Triggering...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Distributed Run</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
