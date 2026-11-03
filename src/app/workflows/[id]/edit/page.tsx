"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
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
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Play,
  Trash2,
  FileCheck,
  Split,
  RefreshCw,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Settings,
  HardDrive,
  Info,
  Layers,
  Database
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

// Category Color & Indicator Registry
const TASK_TYPE_META: Record<string, { label: string; tag: string; color: string; border: string }> = {
  CSV_VALIDATE: {
    label: "CSV Intake & Validator",
    tag: "INGEST",
    color: "#38bdf8",
    border: "#1e3a5f",
  },
  DATA_TRANSFORM: {
    label: "Cleanse & Normalize",
    tag: "TRANSFORM",
    color: "#a78bfa",
    border: "#3b2b5f",
  },
  CONDITION: {
    label: "Threshold Rule Gate",
    tag: "LOGIC",
    color: "#e5a93c",
    border: "#4d3810",
  },
  GENERATE_REPORT: {
    label: "Generate Audit Report",
    tag: "STORAGE",
    color: "#10b981",
    border: "#163e26",
  },
  SEND_EMAIL: {
    label: "Dispatch Email Alert",
    tag: "SINK",
    color: "#06b6d4",
    border: "#154249",
  },
};

// Bespoke Custom Hardware/Dataflow React Flow Node
function PipelineTaskNode({ data, selected }: NodeProps) {
  const taskType = (data.taskType as string) || "CSV_VALIDATE";
  const meta = TASK_TYPE_META[taskType] || {
    label: "Task Node",
    tag: "STEP",
    color: "#8b949e",
    border: "#23262f",
  };

  const isCondition = taskType === "CONDITION";

  return (
    <div
      className={`w-60 rounded-md bg-[#111216] border transition-all text-left shadow-lg ${
        selected ? "border-[#e5a93c] ring-1 ring-[#e5a93c]/50" : "border-[#22252e] hover:border-[#383d4a]"
      }`}
    >
      {/* Top Tag & Type Stripe */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1c1e26] bg-[#0c0d10] rounded-t-md">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          ></span>
          <span
            className="text-[10px] font-mono font-bold tracking-wider"
            style={{ color: meta.color }}
          >
            {meta.tag}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#525866]">
          {String(data.label || "").split(".")[0] || "STEP"}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-3 space-y-2">
        <div className="text-xs font-semibold text-[#ededed] leading-snug">
          {String(data.label || meta.label)}
        </div>

        {/* Parameter / Config Snippet */}
        <div className="text-[10px] font-mono text-[#8b949e] bg-[#161820] px-2 py-1 rounded border border-[#1f222a] truncate">
          {isCondition ? (
            <span>Rule: amount &ge; $10k</span>
          ) : taskType === "GENERATE_REPORT" ? (
            <span>Target: taskforge-artifacts</span>
          ) : taskType === "SEND_EMAIL" ? (
            <span>To: ops@taskforge.local</span>
          ) : (
            <span>Task: {taskType}</span>
          )}
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#e5a93c] !border-2 !border-[#111216]"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#e5a93c] !border-2 !border-[#111216]"
      />
    </div>
  );
}

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "pipelineNode",
    data: { label: "1. CSV Intake & Validation", taskType: "CSV_VALIDATE", config: { requiredColumns: "invoiceNumber, customer, amount, dueDate, status" } },
    position: { x: 280, y: 30 },
  },
  {
    id: "node-2",
    type: "pipelineNode",
    data: { label: "2. Cleanse & Normalize Records", taskType: "DATA_TRANSFORM", config: { currency: "USD", sanitizeStrings: true } },
    position: { x: 280, y: 160 },
  },
  {
    id: "node-3",
    type: "pipelineNode",
    data: { label: "3. Check Invoice Threshold (> $10k)", taskType: "CONDITION", config: { threshold: 10000, condition: "amount >= threshold" } },
    position: { x: 280, y: 290 },
  },
  {
    id: "node-4",
    type: "pipelineNode",
    data: { label: "4. Generate Summary Report", taskType: "GENERATE_REPORT", config: { format: "JSON_AUDIT", bucket: "taskforge-artifacts" } },
    position: { x: 130, y: 430 },
  },
  {
    id: "node-5",
    type: "pipelineNode",
    data: { label: "5. Dispatch Notification Email", taskType: "SEND_EMAIL", config: { recipient: "ops@taskforge.local", subject: "Workflow Alert" } },
    position: { x: 430, y: 430 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "node-1", target: "node-2", animated: true, style: { stroke: "#525866", strokeWidth: 1.5 } },
  { id: "e2-3", source: "node-2", target: "node-3", animated: true, style: { stroke: "#525866", strokeWidth: 1.5 } },
  { id: "e3-4", source: "node-3", target: "node-4", label: "Threshold Passed", animated: true, style: { stroke: "#10b981", strokeWidth: 1.5 } },
  { id: "e3-5", source: "node-3", target: "node-5", label: "Flag for Review", animated: true, style: { stroke: "#e5a93c", strokeWidth: 1.5 } },
];

export default function WorkflowEditorPage() {
  const router = useRouter();
  const routeParams = useParams();
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || "e7c051b5-e677-4724-a98a-4179cd14d0cf";
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

  const nodeTypes = useMemo(() => ({ pipelineNode: PipelineTaskNode }), []);

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
              if (parsed.nodes && parsed.nodes.length > 0) {
                // Ensure nodes use custom node type
                const formattedNodes = parsed.nodes.map((n: Node) => ({
                  ...n,
                  type: "pipelineNode",
                }));
                setNodes(formattedNodes);
              }
              if (parsed.edges && parsed.edges.length > 0) {
                setEdges(parsed.edges);
              }
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
            style: { stroke: "#525866", strokeWidth: 1.5 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const addNode = (label: string, taskType: string) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id,
      type: "pipelineNode",
      data: { label, taskType, config: {} },
      position: { x: 280, y: (nodes.length + 1) * 90 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleValidateGraph = () => {
    if (nodes.length === 0) {
      setValidationResult({ valid: false, message: "Topology cannot be empty." });
      return;
    }
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
      setTimeout(() => setIsSaved(false), 2000);
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
        setTimeout(() => setIsPublished(false), 2000);
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
    <div className="h-[calc(100vh-125px)] flex flex-col space-y-3">
      {/* Topology Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e0f13] border border-[#1f222a] px-4 py-2.5 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-md bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-[#8b949e] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                className="text-sm font-semibold text-white bg-transparent border-b border-transparent hover:border-[#2b2f3a] focus:border-[#e5a93c] outline-none transition font-mono"
              />
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium border flex items-center gap-1.5 ${
                  workflowStatus === "PUBLISHED"
                    ? "bg-[#0d1f14] text-[#10b981] border-[#163821]"
                    : "bg-[#221706] text-[#e5a93c] border-[#38260a]"
                }`}
              >
                <span>{workflowStatus}</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#525866]">
              Topology ID: {workflowId ? workflowId.slice(0, 8) : "wf"} &bull; DAG Execution Engine
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidateGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#8b949e] hover:text-white bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] rounded-md transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span>Validate</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#8b949e] hover:text-white bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] rounded-md transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? "Saved" : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#ededed] hover:text-white bg-[#18231c] hover:bg-[#1f3025] border border-[#284a34] rounded-md transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#10b981]" />
            <span>{isPublished ? "Published" : "Publish"}</span>
          </button>

          <button
            onClick={() => setShowRunModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold text-black bg-white hover:bg-[#e4e4e7] rounded-md transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Validation Banner if Triggered */}
      {validationResult && (
        <div
          className={`px-3 py-2 rounded-md border text-xs font-mono flex items-center gap-2 transition ${
            validationResult.valid
              ? "bg-[#0d1f14] text-[#10b981] border-[#163821]"
              : "bg-[#250e12] text-[#f43f5e] border-[#441920]"
          }`}
        >
          {validationResult.valid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-[#f43f5e]" />
          )}
          <span>{validationResult.message}</span>
        </div>
      )}

      {/* Canvas Workspace & Sidebar Library */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Component Library */}
        <div className="w-64 bg-[#0e0f13] border border-[#1f222a] rounded-lg p-3 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f222a]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8b949e]">
              Task Catalog
            </span>
            <span className="text-[10px] font-mono text-[#525866]">5 modules</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto pr-0.5">
            {/* Ingest */}
            <button
              onClick={() => addNode("Validate CSV File", "CSV_VALIDATE")}
              className="w-full flex items-center gap-2.5 p-2 bg-[#13151b] hover:bg-[#181a22] text-left rounded-md border border-[#1f222a] hover:border-[#383d4a] transition text-xs font-mono group"
            >
              <div className="p-1 rounded bg-[#162534] text-[#38bdf8]">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-white">CSV Validate</div>
                <div className="text-[10px] text-[#525866]">Inspect schema & rows</div>
              </div>
            </button>

            {/* Transform */}
            <button
              onClick={() => addNode("Cleanse & Format", "DATA_TRANSFORM")}
              className="w-full flex items-center gap-2.5 p-2 bg-[#13151b] hover:bg-[#181a22] text-left rounded-md border border-[#1f222a] hover:border-[#383d4a] transition text-xs font-mono group"
            >
              <div className="p-1 rounded bg-[#271d3d] text-[#a78bfa]">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-white">Data Transform</div>
                <div className="text-[10px] text-[#525866]">Normalize & cast types</div>
              </div>
            </button>

            {/* Rule Gate */}
            <button
              onClick={() => addNode("Threshold Gate", "CONDITION")}
              className="w-full flex items-center gap-2.5 p-2 bg-[#13151b] hover:bg-[#181a22] text-left rounded-md border border-[#1f222a] hover:border-[#383d4a] transition text-xs font-mono group"
            >
              <div className="p-1 rounded bg-[#31230c] text-[#e5a93c]">
                <Split className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-white">Condition Rule</div>
                <div className="text-[10px] text-[#525866]">Branch on threshold</div>
              </div>
            </button>

            {/* Report */}
            <button
              onClick={() => addNode("Generate Report", "GENERATE_REPORT")}
              className="w-full flex items-center gap-2.5 p-2 bg-[#13151b] hover:bg-[#181a22] text-left rounded-md border border-[#1f222a] hover:border-[#383d4a] transition text-xs font-mono group"
            >
              <div className="p-1 rounded bg-[#102919] text-[#10b981]">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-white">Generate Report</div>
                <div className="text-[10px] text-[#525866]">Write JSON to MinIO</div>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={() => addNode("Send Email Alert", "SEND_EMAIL")}
              className="w-full flex items-center gap-2.5 p-2 bg-[#13151b] hover:bg-[#181a22] text-left rounded-md border border-[#1f222a] hover:border-[#383d4a] transition text-xs font-mono group"
            >
              <div className="p-1 rounded bg-[#112d35] text-[#06b6d4]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-white">Send Email</div>
                <div className="text-[10px] text-[#525866]">Mailpit SMTP socket</div>
              </div>
            </button>
          </div>

          <div className="mt-auto p-2.5 bg-[#13151b] border border-[#1f222a] rounded-md text-[11px] font-mono text-[#525866] space-y-1">
            <div className="flex items-center gap-1.5 text-[#8b949e]">
              <Info className="w-3 h-3 text-[#e5a93c]" />
              <span className="font-semibold">Execution Semantics</span>
            </div>
            <p className="leading-relaxed">
              Orchestrator schedules child nodes only when upstream dependencies succeed.
            </p>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 bg-[#090a0d] border border-[#1f222a] rounded-lg overflow-hidden relative shadow-inner">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <Background color="#1f222a" variant={BackgroundVariant.Dots} gap={18} size={1} />
            <Controls className="bg-[#0e0f13] border-[#1f222a]" />
            <MiniMap
              nodeColor="#e5a93c"
              maskColor="rgba(9, 10, 13, 0.85)"
              className="bg-[#0e0f13] border-[#1f222a] rounded-md"
            />
          </ReactFlow>

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <div className="absolute top-3 right-3 w-72 bg-[#0e0f13]/95 border border-[#23262f] p-4 rounded-lg shadow-xl space-y-3 text-xs font-mono animate-in slide-in-from-right-4 transition">
              <div className="flex items-center justify-between border-b border-[#1f222a] pb-2">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-[#e5a93c]" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">Node Inspector</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-0.5 hover:bg-[#161820] rounded text-[#8b949e] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-[#525866] uppercase">Node Identifier</label>
                  <p className="text-[#ededed] bg-[#13151b] p-1.5 rounded mt-0.5 border border-[#1f222a]">
                    {selectedNode.id}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#525866] uppercase">Display Label</label>
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
                    className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#383d4a] rounded p-1.5 text-white outline-none mt-0.5 transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#525866] uppercase">Task Type</label>
                  <div className="text-[#e5a93c] bg-[#13151b] p-1.5 rounded mt-0.5 border border-[#1f222a]">
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
                className="w-full flex items-center justify-center gap-1.5 p-2 bg-[#250e12] hover:bg-[#341419] border border-[#441920] text-[#f43f5e] rounded font-medium transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Node</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Run Modal */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e0f13] border border-[#23262f] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f222a]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#161820] border border-[#2b2f3a] text-[#e5a93c] flex items-center justify-center font-mono text-xs">
                  <Play className="w-3 h-3 fill-[#e5a93c]" />
                </div>
                <h2 className="text-sm font-semibold text-white font-mono">Execute Pipeline</h2>
              </div>
              <button
                onClick={() => setShowRunModal(false)}
                className="text-[#8b949e] hover:text-white text-xs font-mono"
              >
                esc
              </button>
            </div>

            <form onSubmit={handleExecute} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-[#8b949e]">
                  Upload CSV File (MinIO S3)
                </label>
                <div className="border border-dashed border-[#23262f] hover:border-[#383d4a] rounded-md p-4 text-center bg-[#13151b] cursor-pointer transition">
                  <input
                    type="file"
                    accept=".csv"
                    id="run-csv-file"
                    className="hidden"
                    onChange={(e) => setRunFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="run-csv-file" className="cursor-pointer space-y-1 block">
                    <UploadCloud className="w-5 h-5 text-[#8b949e] mx-auto" />
                    <div className="text-xs font-mono text-[#ededed]">
                      {runFile ? runFile.name : "Select CSV to upload"}
                    </div>
                    <div className="text-[10px] font-mono text-[#525866]">
                      {runFile ? `${(runFile.size / 1024).toFixed(1)} KB` : "Leave empty to use sample invoice data"}
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
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-white hover:bg-[#e4e4e7] text-black text-xs font-mono font-semibold rounded-md transition flex items-center gap-1.5"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching to Kafka...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
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
