"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Play,
  Plus,
  Trash2,
  FileCheck,
  Split,
  RefreshCw,
  Mail,
  FileText,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Settings,
  Sparkles,
  Info
} from "lucide-react";

const WORKSPACE_ID = "e7c051b5-e677-4724-a98a-4179cd14d0cf";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "default",
    data: { label: "1. CSV Intake & Validation", taskType: "CSV_VALIDATE", config: { requiredColumns: "invoiceNumber, customer, amount, dueDate, status" } },
    position: { x: 260, y: 40 },
    style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #3b82f6", borderRadius: "10px", padding: "12px 16px", minWidth: 200, boxShadow: "0 4px 14px rgba(59, 130, 246, 0.2)" },
  },
  {
    id: "node-2",
    type: "default",
    data: { label: "2. Cleanse & Normalize Records", taskType: "DATA_TRANSFORM", config: { currency: "USD", sanitizeStrings: true } },
    position: { x: 260, y: 160 },
    style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #8b5cf6", borderRadius: "10px", padding: "12px 16px", minWidth: 200, boxShadow: "0 4px 14px rgba(139, 92, 246, 0.2)" },
  },
  {
    id: "node-3",
    type: "default",
    data: { label: "3. Check Invoice Threshold (> $10k)", taskType: "CONDITION", config: { threshold: 10000, condition: "amount >= threshold" } },
    position: { x: 260, y: 280 },
    style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #f59e0b", borderRadius: "10px", padding: "12px 16px", minWidth: 200, boxShadow: "0 4px 14px rgba(245, 158, 11, 0.2)" },
  },
  {
    id: "node-4",
    type: "default",
    data: { label: "4. Generate Summary Report", taskType: "GENERATE_REPORT", config: { format: "JSON_AUDIT", bucket: "taskforge-artifacts" } },
    position: { x: 120, y: 410 },
    style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #10b981", borderRadius: "10px", padding: "12px 16px", minWidth: 190, boxShadow: "0 4px 14px rgba(16, 185, 129, 0.2)" },
  },
  {
    id: "node-5",
    type: "default",
    data: { label: "5. Dispatch Notification Email", taskType: "SEND_EMAIL", config: { recipient: "ops@taskforge.local", subject: "Workflow Alert" } },
    position: { x: 400, y: 410 },
    style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #06b6d4", borderRadius: "10px", padding: "12px 16px", minWidth: 190, boxShadow: "0 4px 14px rgba(6, 182, 212, 0.2)" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "node-1", target: "node-2", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
  { id: "e2-3", source: "node-2", target: "node-3", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
  { id: "e3-4", source: "node-3", target: "node-4", label: "Threshold Passed", animated: true, style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "e3-5", source: "node-3", target: "node-5", label: "Flag for Review", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2 } },
];

export default function WorkflowEditorPage() {
  const router = useRouter();
  const routeParams = useParams();
  const workflowId = (routeParams?.id as string) || "";
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [workflowTitle, setWorkflowTitle] = useState("Invoice Intake & Approval Pipeline");
  const [workflowDesc, setWorkflowDesc] = useState("Automated invoice parsing, threshold checking, report generation and email dispatch.");
  const [workflowStatus, setWorkflowStatus] = useState("PUBLISHED");

  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [runFile, setRunFile] = useState<File | null>(null);
  const [runThreshold, setRunThreshold] = useState("10000");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!workflowId) return;
    fetch(`/api/v1/workflows/${workflowId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((wf) => {
        if (wf) {
          if (wf.name) setWorkflowTitle(wf.name);
          if (wf.description) setWorkflowDesc(wf.description);
          if (wf.status) setWorkflowStatus(wf.status);
          if (wf.draftDefinition) {
            try {
              const parsed = JSON.parse(wf.draftDefinition);
              if (parsed.nodes && parsed.nodes.length > 0) setNodes(parsed.nodes);
              if (parsed.edges && parsed.edges.length > 0) setEdges(parsed.edges);
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  }, [workflowId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#6366f1", strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = (label: string, taskType: string, typeColor: string) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id,
      type: "default",
      data: { label, taskType, config: {} },
      position: { x: 260, y: (nodes.length + 1) * 90 },
      style: {
        background: "#0f172a",
        color: "#f8fafc",
        border: `1px solid ${typeColor}`,
        borderRadius: "10px",
        padding: "12px 16px",
        minWidth: 190,
        boxShadow: `0 4px 14px ${typeColor}33`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleValidateGraph = () => {
    if (nodes.length === 0) {
      setValidationResult({ valid: false, message: "Graph cannot be empty." });
      return;
    }
    // Simple cycle and root validation
    const targetSet = new Set(edges.map((e) => e.target));
    const roots = nodes.filter((n) => !targetSet.has(n.id));

    if (roots.length === 0) {
      setValidationResult({ valid: false, message: "Cycle detected! Graph has no root trigger node." });
    } else {
      setValidationResult({
        valid: true,
        message: `Graph valid: ${nodes.length} nodes, ${edges.length} edges. Root trigger: "${roots[0].data?.label || roots[0].id}".`,
      });
    }

    setTimeout(() => setValidationResult(null), 4000);
  };

  const handleSaveDraft = async () => {
    try {
      await fetch(`/api/v1/workflows/${workflowId}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowTitle,
          description: workflowDesc,
          draftDefinition: JSON.stringify({ nodes, edges }),
        }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      alert("Failed to save draft");
    }
  };

  const handlePublish = async () => {
    try {
      await fetch(`/api/v1/workflows/${workflowId}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowTitle,
          description: workflowDesc,
          draftDefinition: JSON.stringify({ nodes, edges }),
        }),
      });

      const res = await fetch(`/api/v1/workflows/${workflowId}/publish`, {
        method: "POST",
      });

      if (res.ok) {
        setWorkflowStatus("PUBLISHED");
        setIsPublished(true);
        setTimeout(() => setIsPublished(false), 2500);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to publish workflow");
      }
    } catch (e) {
      alert("Error publishing workflow");
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRunning(true);
      let artifactKey = "workspaces/e7c051b5-e677-4724-a98a-4179cd14d0cf/uploads/sample-invoices.csv";

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

      // Save & Publish
      await fetch(`/api/v1/workflows/${workflowId}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowTitle,
          description: workflowDesc,
          draftDefinition: JSON.stringify({ nodes, edges }),
        }),
      });
      await fetch(`/api/v1/workflows/${workflowId}/publish`, { method: "POST" });

      const res = await fetch(`/api/v1/workflows/${workflowId}/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            sourceArtifactKey: artifactKey,
            threshold: parseFloat(runThreshold) || 10000,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/executions/${data.executionId}`);
      } else {
        setIsRunning(false);
        alert("Failed to start workflow execution");
      }
    } catch (e) {
      setIsRunning(false);
      alert("Error starting execution");
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Editor Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 outline-none transition"
              />
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold border ${
                  workflowStatus === "PUBLISHED"
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                    : "bg-amber-950/80 text-amber-400 border-amber-800/80"
                }`}
              >
                {workflowStatus} v1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ID: {workflowId ? workflowId.slice(0, 8) : "wf"}... • Distributed DAG Execution Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleValidateGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Validate DAG</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? "Saved!" : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 rounded-xl transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isPublished ? "Published!" : "Publish Version"}</span>
          </button>

          <button
            onClick={() => setShowRunModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-900/40 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Pipeline</span>
          </button>
        </div>
      </div>

      {/* Validation Banner if Triggered */}
      {validationResult && (
        <div
          className={`px-4 py-2.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in transition ${
            validationResult.valid
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
              : "bg-rose-950/80 text-rose-300 border-rose-800/80"
          }`}
        >
          {validationResult.valid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span className="font-medium">{validationResult.message}</span>
        </div>
      )}

      {/* Main Canvas + Sidebar Palette */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Component Palette */}
        <div className="w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Node Library</span>
            <span className="text-[10px] text-slate-500 font-mono">6 Nodes</span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            <button
              onClick={() => addNode("Validate Invoice CSV", "CSV_VALIDATE", "#3b82f6")}
              className="w-full flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 rounded-xl border border-slate-800 hover:border-blue-500/50 transition text-left group"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">CSV Validate</div>
                <div className="text-[11px] text-slate-500">Inspect schema & rows</div>
              </div>
            </button>

            <button
              onClick={() => addNode("Transform & Normalize", "DATA_TRANSFORM", "#8b5cf6")}
              className="w-full flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 rounded-xl border border-slate-800 hover:border-purple-500/50 transition text-left group"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">Data Transform</div>
                <div className="text-[11px] text-slate-500">Normalize and cleanse</div>
              </div>
            </button>

            <button
              onClick={() => addNode("Threshold Check", "CONDITION", "#f59e0b")}
              className="w-full flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 rounded-xl border border-slate-800 hover:border-amber-500/50 transition text-left group"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                <Split className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">Condition Rule</div>
                <div className="text-[11px] text-slate-500">Branch on threshold</div>
              </div>
            </button>

            <button
              onClick={() => addNode("Generate Report", "GENERATE_REPORT", "#10b981")}
              className="w-full flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition text-left group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">Generate Report</div>
                <div className="text-[11px] text-slate-500">Write report to MinIO S3</div>
              </div>
            </button>

            <button
              onClick={() => addNode("Send Email Notice", "SEND_EMAIL", "#06b6d4")}
              className="w-full flex items-center gap-3 p-3 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition text-left group"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">Send Email</div>
                <div className="text-[11px] text-slate-500">Mailpit SMTP delivery</div>
              </div>
            </button>
          </div>

          <div className="mt-auto p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Canvas Instructions</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Drag from circle handles to connect steps. When executing, the Orchestrator runs children only after all upstream dependencies succeed.
            </p>
          </div>
        </div>

        {/* React Flow Visual Canvas */}
        <div className="flex-1 bg-[#090d18] border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls className="bg-slate-900 border-slate-800" />
            <MiniMap
              nodeColor="#6366f1"
              maskColor="rgba(7, 11, 20, 0.8)"
              className="bg-slate-900 border-slate-800 rounded-xl"
            />
          </ReactFlow>

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl space-y-4 text-xs animate-in slide-in-from-right-4 transition">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">Node Inspector</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Node ID</label>
                  <p className="font-mono text-slate-200 bg-slate-950 p-2 rounded-xl mt-1 border border-slate-800">
                    {selectedNode.id}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Display Label</label>
                  <input
                    type="text"
                    value={String(selectedNode.data?.label || "")}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      setNodes((nds) =>
                        nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n))
                      );
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: newLabel } });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2 text-white outline-none mt-1 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Task Type</label>
                  <div className="font-mono text-indigo-400 bg-slate-950 p-2 rounded-xl mt-1 border border-slate-800">
                    {String(selectedNode.data?.taskType || "TASK")}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                  setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                  setSelectedNode(null);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-xl font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Node</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Run Pipeline Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-emerald-400" />
                </div>
                <h2 className="text-base font-bold text-white">Execute Invoice Pipeline</h2>
              </div>
              <button
                onClick={() => setShowRunModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleExecute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Upload Invoice CSV (MinIO Storage)
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 text-center bg-slate-950 cursor-pointer transition">
                  <input
                    type="file"
                    accept=".csv"
                    id="run-csv-file"
                    className="hidden"
                    onChange={(e) => setRunFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="run-csv-file" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-200">
                      {runFile ? runFile.name : "Select or Drop CSV file"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {runFile ? `${(runFile.size / 1024).toFixed(1)} KB` : "Leave empty to use sample invoice dataset"}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Threshold Value ($)
                </label>
                <input
                  type="number"
                  value={runThreshold}
                  onChange={(e) => setRunThreshold(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  placeholder="10000"
                />
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
                  disabled={isRunning}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching to Kafka...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Dispatch Execution</span>
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
