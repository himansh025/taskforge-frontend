"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, Play, Plus, Trash2, FileCheck, Split, RefreshCw, Mail, FileText } from "lucide-react";

const initialNodes: Node[] = [
  {
    id: "node-1",
    type: "default",
    data: { label: "1. CSV Intake & Validation", taskType: "CSV_VALIDATE" },
    position: { x: 250, y: 50 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #3b82f6", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-2",
    type: "default",
    data: { label: "2. Cleanse & Normalize Records", taskType: "DATA_TRANSFORM" },
    position: { x: 250, y: 170 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #8b5cf6", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-3",
    type: "default",
    data: { label: "3. Check Invoice Threshold (> $10k)", taskType: "CONDITION" },
    position: { x: 250, y: 290 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #f59e0b", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-4",
    type: "default",
    data: { label: "4. Generate Summary Report", taskType: "GENERATE_REPORT" },
    position: { x: 120, y: 410 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #10b981", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-5",
    type: "default",
    data: { label: "5. Dispatch Notification Email", taskType: "SEND_EMAIL" },
    position: { x: 380, y: 410 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #06b6d4", borderRadius: "8px", padding: "10px" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "node-1", target: "node-2", animated: true },
  { id: "e2-3", source: "node-2", target: "node-3", animated: true },
  { id: "e3-4", source: "node-3", target: "node-4", label: "Threshold Passed" },
  { id: "e3-5", source: "node-3", target: "node-5", label: "Flag for Review" },
];

export default function WorkflowEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/workflows/${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(wf => {
        if (wf && wf.draftDefinition) {
          try {
            const parsed = JSON.parse(wf.draftDefinition);
            if (parsed.nodes && parsed.nodes.length > 0) setNodes(parsed.nodes);
            if (parsed.edges && parsed.edges.length > 0) setEdges(parsed.edges);
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, [params.id, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (label: string, taskType: string, typeColor: string) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id,
      type: "default",
      data: { label, taskType },
      position: { x: 250, y: (nodes.length + 1) * 90 },
      style: { background: "#1e293b", color: "#f8fafc", border: `1px solid ${typeColor}`, borderRadius: "8px", padding: "10px" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveDraft = async () => {
    try {
      await fetch(`/api/v1/workflows/${params.id}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Invoice Intake & Approval Pipeline",
          description: "End-to-end automated invoice validation, threshold branching, and alert delivery",
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
      await fetch(`/api/v1/workflows/${params.id}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Invoice Intake & Approval Pipeline",
          description: "End-to-end automated invoice validation, threshold branching, and alert delivery",
          draftDefinition: JSON.stringify({ nodes, edges }),
        }),
      });

      const res = await fetch(`/api/v1/workflows/${params.id}/publish`, {
        method: "POST",
      });

      if (res.ok) {
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

  const handleRun = async () => {
    try {
      setIsRunning(true);
      // Auto-save and auto-publish draft before running
      await fetch(`/api/v1/workflows/${params.id}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Invoice Intake & Approval Pipeline",
          description: "End-to-end automated invoice validation, threshold branching, and alert delivery",
          draftDefinition: JSON.stringify({ nodes, edges }),
        }),
      });
      await fetch(`/api/v1/workflows/${params.id}/publish`, { method: "POST" });

      const res = await fetch(`/api/v1/workflows/${params.id}/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: `batch-${Date.now()}`,
          threshold: 10000,
          sourceArtifactKey: "workspaces/uploads/sample-invoices.csv"
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/executions/${data.executionId}`);
      } else {
        setIsRunning(false);
        alert("Failed to trigger execution");
      }
    } catch (e) {
      setIsRunning(false);
      alert("Error triggering execution");
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Invoice Intake & Approval Pipeline</h2>
              <span className="text-xs bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full font-mono">DAG EDITOR</span>
            </div>
            <p className="text-xs text-slate-400">ID: {params.id} • Distributed Execution Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <Save className="w-4 h-4" /> {isSaved ? "Saved!" : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg transition"
          >
            <UploadCloud className="w-4 h-4" /> {isPublished ? "Published!" : "Publish Version"}
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition shadow-lg shadow-indigo-600/30"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? "animate-spin" : ""}`} /> {isRunning ? "Submitting..." : "Run Workflow"}
          </button>
        </div>
      </div>

      {/* Editor Main Canvas with Sidebar */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Node Palette */}
        <div className="w-64 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Node Palette</h3>
          
          <div className="space-y-2 text-xs">
            <button
              onClick={() => addNode("Validate CSV File", "CSV_VALIDATE", "#3b82f6")}
              className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition text-left"
            >
              <FileCheck className="w-4 h-4 text-blue-400" />
              <span>CSV Validator</span>
            </button>
            <button
              onClick={() => addNode("Cleanse & Transform", "DATA_TRANSFORM", "#8b5cf6")}
              className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition text-left"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span>Data Transform</span>
            </button>
            <button
              onClick={() => addNode("Check Threshold", "CONDITION", "#f59e0b")}
              className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition text-left"
            >
              <Split className="w-4 h-4 text-amber-400" />
              <span>Condition Branch</span>
            </button>
            <button
              onClick={() => addNode("Generate PDF Report", "GENERATE_REPORT", "#10b981")}
              className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition text-left"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Report Generator</span>
            </button>
            <button
              onClick={() => addNode("Send Email Alert", "SEND_EMAIL", "#06b6d4")}
              className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700/60 transition text-left"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Email Notification</span>
            </button>
          </div>

          <div className="mt-auto p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">DAG Rules:</p>
            <p>• Drag handles to connect nodes.</p>
            <p>• Cycles are detected and blocked.</p>
            <p>• All tasks run asynchronously via Kafka.</p>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <Background color="#334155" variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls className="bg-slate-900 border-slate-700 fill-slate-200" />
            <MiniMap 
              nodeColor="#3b82f6" 
              maskColor="rgba(15, 23, 42, 0.7)"
              className="bg-slate-900 border-slate-800 rounded-lg"
            />
          </ReactFlow>

          {/* Node Inspector Floating Drawer */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Node Inspector</span>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-slate-400">Node ID</label>
                  <p className="font-mono text-slate-200 bg-slate-950 p-1.5 rounded">{selectedNode.id}</p>
                </div>
                <div>
                  <label className="text-slate-400">Label</label>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                  setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                  setSelectedNode(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Node
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
