"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Server,
  Layers,
  HardDrive,
  Copy,
  Terminal,
  Activity,
  Sliders
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  draftDefinition?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExecutionItem {
  id: string;
  status: string;
  workflowId: string;
  triggerType?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentWorkspace, setWorkflowCount, telemetry } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "e7c051b5-e677-4724-a98a-4179cd14d0cf";

  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [executions, setExecutions] = useState<ExecutionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"pipelines" | "runs">("pipelines");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedWfId, setCopiedWfId] = useState<string | null>(null);

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

  const fetchData = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setIsLoading(true);
      const [wfRes, execRes] = await Promise.all([
        fetch(`/api/v1/workspaces/${workspaceId}/workflows`),
        fetch(`/api/v1/workspaces/${workspaceId}/executions`),
      ]);

      if (wfRes.ok) {
        const wfData: WorkflowItem[] = await wfRes.json();
        setWorkflows(wfData);
        setWorkflowCount(wfData.length);
      }
      if (execRes.ok) {
        const execData: ExecutionItem[] = await execRes.json();
        setExecutions(execData);
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, setWorkflowCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTitle,
          description: newDesc || "Directed acyclic graph data pipeline",
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
      alert("Failed to create workflow pipeline");
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
      let artifactKey = `workspaces/${workspaceId}/uploads/sample-invoices.csv`;

      if (runFile) {
        const formData = new FormData();
        formData.append("file", runFile);
        const uploadRes = await fetch(`/api/v1/workspaces/${workspaceId}/uploads`, {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          artifactKey = uploadData.artifactKey;
        }
      }

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

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedWfId(id);
    setTimeout(() => setCopiedWfId(null), 2000);
  };

  const getTopologySummary = (draftDef?: string) => {
    if (!draftDef) {
      return { taskCount: 5, conditions: 1, hasMinio: true, hasEmail: true, hasCsv: true };
    }
    try {
      const parsed = JSON.parse(draftDef);
      const nodes = parsed.nodes || [];
      const taskCount = nodes.length || 0;
      const conditions = nodes.filter(
        (n: any) => n.type === "CONDITION" || n.data?.taskType === "CONDITION"
      ).length;
      const hasMinio = nodes.some(
        (n: any) => n.type === "GENERATE_REPORT" || n.data?.taskType === "GENERATE_REPORT"
      );
      const hasEmail = nodes.some(
        (n: any) => n.type === "SEND_EMAIL" || n.data?.taskType === "SEND_EMAIL"
      );
      const hasCsv = nodes.some(
        (n: any) => n.type === "CSV_VALIDATE" || n.data?.taskType === "CSV_VALIDATE"
      );
      return { taskCount, conditions, hasMinio, hasEmail, hasCsv };
    } catch (e) {
      return { taskCount: 0, conditions: 0, hasMinio: false, hasEmail: false, hasCsv: false };
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedExecs = executions.filter((e) => e.status === "COMPLETED").length;
  const successRatio = executions.length > 0 ? Math.round((completedExecs / executions.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Workspace Operational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1c1e24]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {currentWorkspace?.name || "Workspace"} Pipelines
            </h1>
            <span className="text-[11px] font-mono text-[#8b949e] px-2 py-0.5 rounded bg-[#161820] border border-[#23262f]">
              {workflows.length} registered
            </span>
          </div>
          <p className="text-xs text-[#8b949e] font-mono">
            Workspace: <code className="text-[#ededed]">{currentWorkspace?.slug || "finance-team"}</code> &bull; ID: {workspaceId}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (workflows.length > 0) setSelectedWorkflowForRun(workflows[0].id);
              setShowRunModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-xs font-mono text-[#ededed] transition"
          >
            <Play className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span>Run Pipeline</span>
            <kbd className="hidden sm:inline-block ml-1">R</kbd>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white hover:bg-[#e4e4e7] text-black text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Pipeline</span>
            <kbd className="hidden sm:inline-block ml-1 bg-black/10 border-black/20 text-black">N</kbd>
          </button>
        </div>
      </div>

      {/* Dynamic Cluster Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Pipelines */}
        <div className="p-3.5 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
            <span>ALL PIPELINES</span>
            <GitBranch className="w-3.5 h-3.5 text-[#525866]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">{workflows.length}</div>
          <div className="text-[11px] font-mono text-[#525866]">
            {workflows.filter((w) => w.status === "PUBLISHED").length} published &bull; {workflows.filter((w) => w.status === "DRAFT").length} draft
          </div>
        </div>

        {/* Executions & SLA */}
        <div className="p-3.5 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
            <span>TOTAL RUNS</span>
            <Activity className="w-3.5 h-3.5 text-[#525866]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">{executions.length}</div>
          <div className="text-[11px] font-mono text-[#10b981] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span>{successRatio}% Success Rate</span>
          </div>
        </div>

        {/* Kafka Broker Status */}
        <div className="p-3.5 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
            <span>MESSAGE QUEUE</span>
            <Server className="w-3.5 h-3.5 text-[#525866]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {telemetry?.kafka?.lag ?? 0}ms lag
          </div>
          <div className="text-[11px] font-mono text-[#8b949e]">
            partition {telemetry?.kafka?.partition ?? 0} &bull; {telemetry?.workers?.replicas ?? 3} replicas
          </div>
        </div>

        {/* MinIO Object Storage */}
        <div className="p-3.5 rounded-lg bg-[#0e0f13] border border-[#1f222a] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
            <span>FILE STORAGE</span>
            <HardDrive className="w-3.5 h-3.5 text-[#525866]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {telemetry?.minio?.status === "UP" ? "MinIO S3" : "Storage"}
          </div>
          <div className="text-[11px] font-mono text-[#525866] truncate">
            bucket: {telemetry?.minio?.bucket || "taskforge-artifacts"}
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-[#0e0f13] border border-[#1f222a]">
          <button
            onClick={() => setActiveTab("pipelines")}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              activeTab === "pipelines"
                ? "bg-[#1f222c] text-white font-semibold"
                : "text-[#8b949e] hover:text-[#ededed]"
            }`}
          >
            Pipelines ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab("runs")}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              activeTab === "runs"
                ? "bg-[#1f222c] text-white font-semibold"
                : "text-[#8b949e] hover:text-[#ededed]"
            }`}
          >
            Recent Runs ({executions.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e0f13] border border-[#1f222a] focus:border-[#383d4a] rounded-md pl-8 pr-3 py-1.5 text-xs font-mono text-[#ededed] placeholder-[#525866] outline-none transition"
            />
          </div>
          <button
            onClick={fetchData}
            title="Refresh Ledger"
            className="p-2 rounded-md bg-[#0e0f13] hover:bg-[#161820] border border-[#1f222a] text-[#8b949e] hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tab 1: Pipeline Manifest Grid */}
      {activeTab === "pipelines" && (
        <div>
          {isLoading ? (
            <div className="text-center py-16 text-[#8b949e] text-xs font-mono">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e5a93c]" />
              Loading pipelines...
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-16 bg-[#0e0f13] border border-dashed border-[#1f222a] rounded-lg p-6 space-y-3">
              <div className="h-10 w-10 rounded bg-[#161820] border border-[#2b2f3a] text-[#8b949e] flex items-center justify-center mx-auto">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">No pipelines configured in this workspace</h3>
              <p className="text-xs text-[#8b949e] font-mono max-w-sm mx-auto">
                Define an event-driven DAG pipeline for processing incoming CSV data, threshold branching, and alert delivery.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-3 py-1.5 rounded-md text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Initialize Pipeline
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWorkflows.map((workflow) => {
                const summary = getTopologySummary(workflow.draftDefinition);
                return (
                  <div
                    key={workflow.id}
                    className="group bg-[#0e0f13] border border-[#1f222a] hover:border-[#2f3340] rounded-lg p-4 transition flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Header: Status & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium border flex items-center gap-1.5 ${
                              workflow.status === "PUBLISHED"
                                ? "bg-[#0d1f14] text-[#10b981] border-[#163821]"
                                : "bg-[#221706] text-[#e5a93c] border-[#38260a]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                workflow.status === "PUBLISHED" ? "bg-[#10b981]" : "bg-[#e5a93c]"
                              }`}
                            ></span>
                            <span>{workflow.status}</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#525866]">
                            updated {new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#525866]">
                          <span>id: {workflow.id.slice(0, 8)}</span>
                          <button
                            onClick={() => copyId(workflow.id)}
                            className="hover:text-[#8b949e] p-0.5 rounded transition"
                            title="Copy workflow ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedWfId === workflow.id && (
                            <span className="text-[10px] text-[#10b981]">copied</span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#ededed] group-hover:text-white transition">
                          {workflow.name}
                        </h3>
                        <p className="text-xs text-[#8b949e] mt-1 line-clamp-2 leading-relaxed font-mono">
                          {workflow.description || "Directed acyclic graph data pipeline."}
                        </p>
                      </div>

                      {/* Dynamic Topology Metadata Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13151b] border border-[#1c1e26] text-[#8b949e]">
                          {summary.taskCount} tasks
                        </span>
                        {summary.conditions > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13151b] border border-[#1c1e26] text-[#8b949e]">
                            {summary.conditions} condition {summary.conditions > 1 ? "rules" : "rule"}
                          </span>
                        )}
                        {summary.hasCsv && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13151b] border border-[#1c1e26] text-[#8b949e]">
                            CSV Ingest
                          </span>
                        )}
                        {summary.hasMinio && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13151b] border border-[#1c1e26] text-[#8b949e]">
                            MinIO S3
                          </span>
                        )}
                        {summary.hasEmail && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13151b] border border-[#1c1e26] text-[#8b949e]">
                            Mailpit SMTP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Bar: Timestamp & Action Buttons */}
                    <div className="pt-3 border-t border-[#181a20] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#525866]">
                        <Clock className="w-3 h-3" />
                        <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWorkflowForRun(workflow.id);
                            setShowRunModal(true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-xs font-mono text-[#e5a93c] transition"
                          title="Run Pipeline"
                        >
                          <Play className="w-3 h-3 fill-[#e5a93c]" />
                          <span>Run</span>
                        </button>

                        <Link
                          href={`/workflows/${workflow.id}/edit`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1f222c] hover:bg-[#2a2e3b] text-white text-xs font-mono font-medium transition"
                        >
                          <span>Edit Canvas</span>
                          <ChevronRight className="w-3 h-3 text-[#8b949e]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Recent Runs Audit Table */}
      {activeTab === "runs" && (
        <div className="bg-[#0e0f13] border border-[#1f222a] rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#1f222a] flex items-center justify-between text-xs font-mono text-[#8b949e]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span className="font-semibold text-white">Run History</span>
            </div>
            <span>{executions.length} runs recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#090a0d] border-b border-[#1f222a] text-[#525866] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Run ID</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Trigger</th>
                  <th className="px-4 py-2.5">Started At</th>
                  <th className="px-4 py-2.5">Duration</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181a20]">
                {executions.map((exec) => {
                  const durationSec =
                    exec.finishedAt && exec.startedAt
                      ? `${((new Date(exec.finishedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(2)}s`
                      : exec.status === "RUNNING"
                      ? "running..."
                      : "-";

                  return (
                    <tr key={exec.id} className="hover:bg-[#13151b] transition">
                      <td className="px-4 py-2.5 text-[#ededed]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8b949e]">#</span>
                          <span className="font-semibold text-white">{exec.id.slice(0, 8)}</span>
                          <span className="text-[#525866]">...{exec.id.slice(-4)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium border flex items-center gap-1.5 w-fit ${
                            exec.status === "COMPLETED"
                              ? "bg-[#0d1f14] text-[#10b981] border-[#163821]"
                              : exec.status === "FAILED"
                              ? "bg-[#250e12] text-[#f43f5e] border-[#441920]"
                              : exec.status === "CANCELLED"
                              ? "bg-[#181a20] text-[#8b949e] border-[#23262f]"
                              : "bg-[#221706] text-[#e5a93c] border-[#38260a] animate-pulse"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              exec.status === "COMPLETED"
                                ? "bg-[#10b981]"
                                : exec.status === "FAILED"
                                ? "bg-[#f43f5e]"
                                : exec.status === "CANCELLED"
                                ? "bg-[#8b949e]"
                                : "bg-[#e5a93c]"
                            }`}
                          ></span>
                          <span>{exec.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#8b949e]">
                        {exec.triggerType || "MANUAL_DISPATCH"}
                      </td>
                      <td className="px-4 py-2.5 text-[#525866]">
                        {exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString() : "Just now"}
                      </td>
                      <td className="px-4 py-2.5 text-[#8b949e]">{durationSec}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          href={`/executions/${exec.id}`}
                          className="inline-flex items-center gap-1 text-[#8b949e] hover:text-white transition font-medium"
                        >
                          <span>Inspect</span>
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
      )}

      {/* New Pipeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e0f13] border border-[#23262f] rounded-lg max-w-lg w-full p-5 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f222a]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#161820] border border-[#2b2f3a] text-white flex items-center justify-center font-mono text-xs">
                  +
                </div>
                <h2 className="text-sm font-semibold text-white font-mono">Create Pipeline Topology</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8b949e] hover:text-white text-xs font-mono"
              >
                esc
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Pipeline Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. invoice-reconciliation-pipeline"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#383d4a] rounded-md px-3 py-1.5 text-xs font-mono text-white placeholder-[#525866] outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Operational Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingest invoices from MinIO, validate columns, evaluate threshold, write audit JSON..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#383d4a] rounded-md px-3 py-1.5 text-xs font-mono text-white placeholder-[#525866] outline-none transition resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Topology Preset
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div
                    onClick={() => setSelectedTemplate("invoice")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      selectedTemplate === "invoice"
                        ? "border-[#e5a93c] bg-[#1a1710] text-white"
                        : "border-[#1f222a] bg-[#13151b] text-[#8b949e] hover:border-[#2f3340]"
                    }`}
                  >
                    <div className="font-semibold text-[#ededed]">Standard Invoice DAG</div>
                    <div className="text-[10px] text-[#525866] mt-1">5 Nodes: CSV &rarr; Transform &rarr; Branch &rarr; Report &rarr; Mail</div>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate("custom")}
                    className={`p-3 rounded-md border cursor-pointer transition ${
                      selectedTemplate === "custom"
                        ? "border-[#e5a93c] bg-[#1a1710] text-white"
                        : "border-[#1f222a] bg-[#13151b] text-[#8b949e] hover:border-[#2f3340]"
                    }`}
                  >
                    <div className="font-semibold text-[#ededed]">Blank Canvas</div>
                    <div className="text-[10px] text-[#525866] mt-1">Empty graph with manual node wiring</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1f222a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-mono text-[#8b949e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-white hover:bg-[#e4e4e7] text-black text-xs font-mono font-semibold rounded-md transition"
                >
                  {isSubmitting ? "Creating..." : "Initialize Canvas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Run Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e0f13] border border-[#23262f] rounded-lg max-w-lg w-full p-5 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f222a]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#161820] border border-[#2b2f3a] text-[#e5a93c] flex items-center justify-center font-mono text-xs">
                  <Play className="w-3 h-3 fill-[#e5a93c]" />
                </div>
                <h2 className="text-sm font-semibold text-white font-mono">Dispatch Pipeline Run</h2>
              </div>
              <button
                onClick={() => setShowRunModal(false)}
                className="text-[#8b949e] hover:text-white text-xs font-mono"
              >
                esc
              </button>
            </div>

            <form onSubmit={handleRunPipeline} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Target Pipeline ({currentWorkspace?.name})
                </label>
                <select
                  value={selectedWorkflowForRun || (workflows[0] ? workflows[0].id : "")}
                  onChange={(e) => setSelectedWorkflowForRun(e.target.value)}
                  className="w-full bg-[#13151b] border border-[#1f222a] rounded-md px-3 py-1.5 text-xs font-mono text-white outline-none"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Input Invoices CSV (MinIO Storage)
                </label>
                <div className="border border-dashed border-[#23262f] hover:border-[#383d4a] rounded-md p-4 text-center bg-[#13151b] cursor-pointer transition">
                  <input
                    type="file"
                    accept=".csv"
                    id="csv-file-input"
                    className="hidden"
                    onChange={(e) => setRunFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer space-y-1 block">
                    <UploadCloud className="w-5 h-5 text-[#8b949e] mx-auto" />
                    <div className="text-xs font-mono text-[#ededed]">
                      {runFile ? runFile.name : "Select or drag custom CSV file"}
                    </div>
                    <div className="text-[10px] font-mono text-[#525866]">
                      {runFile
                        ? `${(runFile.size / 1024).toFixed(1)} KB selected for MinIO upload`
                        : "Leave empty to use pre-seeded sample-invoices.csv dataset"}
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Threshold Value ($)
                </label>
                <input
                  type="number"
                  value={runThreshold}
                  onChange={(e) => setRunThreshold(e.target.value)}
                  className="w-full bg-[#13151b] border border-[#1f222a] rounded-md px-3 py-1.5 text-xs font-mono text-white outline-none"
                  placeholder="10000"
                />
                <span className="text-[10px] font-mono text-[#525866] mt-0.5 block">
                  Condition node routes to audit report generation & email dispatch if total &ge; threshold.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1f222a]">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-3 py-1.5 text-xs font-mono text-[#8b949e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunningPipeline}
                  className="px-4 py-1.5 bg-white hover:bg-[#e4e4e7] text-black text-xs font-mono font-semibold rounded-md transition flex items-center gap-1.5 shadow-sm"
                >
                  {isRunningPipeline ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Starting Run...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Start Execution</span>
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
