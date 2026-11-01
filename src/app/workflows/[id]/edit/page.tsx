"use client";

import React, { useState, useCallback } from "react";
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
    data: { label: "1. CSV Intake & Validation" },
    position: { x: 250, y: 50 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #3b82f6", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-2",
    type: "default",
    data: { label: "2. Cleanse & Normalize Records" },
    position: { x: 250, y: 170 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #8b5cf6", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-3",
    type: "default",
    data: { label: "3. Check Invoice Threshold (> $10k)" },
    position: { x: 250, y: 290 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #f59e0b", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-4",
    type: "default",
    data: { label: "4. Generate Summary Report" },
    position: { x: 120, y: 410 },
    style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #10b981", borderRadius: "8px", padding: "10px" },
  },
  {
    id: "node-5",
    type: "default",
    data: { label: "5. Dispatch Notification Email" },
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (label: string, typeColor: string) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const newNode: Node = {
      id,
      data: { label },
      position: { x: 250, y: (nodes.length + 1) * 90 },
      style: { background: "#1e293b", color: "#f8fafc", border: `1px solid ${typeColor}`, borderRadius: "8px", padding: "10px" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveDraft = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePublish = () => {
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 2500);
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
              <span className="text-xs bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full font-mono">DRAFT</span>
            </div>
            <p className="text-xs text-slate-400">ID: {params.id} • Target Service: orchestrator-service</p>
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
            <UploadCloud className="w-4 h-4" /> {isPublished ? "Published v2!" : "Publish Version"}
          </button>
          <Link
            href={`/executions/${params.id}`}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-4 h-4 fill-current" /> Run Workflow
          </Link>
        </div>
      </div>

      {/* Editor Main Canvas with Sidebar */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Node Palette */}
        <div className="w-64 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs uppercase font-semibold text-slate-400">Task Node Library</div>
            <div className="space-y-2">
              <button
                onClick={() => addNode("Validate Invoice CSV", "#3b82f6")}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-slate-200 transition"
              >
                <FileCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <div>CSV Validate</div>
                  <div className="text-[10px] text-slate-500">Row schema & checksum</div>
                </div>
              </button>

              <button
                onClick={() => addNode("Transform & Cleanse", "#8b5cf6")}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-slate-200 transition"
              >
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <div>
                  <div>Data Transform</div>
                  <div className="text-[10px] text-slate-500">Normalize and map data</div>
                </div>
              </button>

              <button
                onClick={() => addNode("Evaluate Condition", "#f59e0b")}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-slate-200 transition"
              >
                <Split className="w-4 h-4 text-amber-400" />
                <div>
                  <div>Condition</div>
                  <div className="text-[10px] text-slate-500">Branching rule logic</div>
                </div>
              </button>

              <button
                onClick={() => addNode("Generate PDF Report", "#10b981")}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-slate-200 transition"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <div>
                  <div>Generate Report</div>
                  <div className="text-[10px] text-slate-500">Write summary to MinIO</div>
                </div>
              </button>

              <button
                onClick={() => addNode("Send Email Alert", "#06b6d4")}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-medium text-slate-200 transition"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <div>
                  <div>Send Email</div>
                  <div className="text-[10px] text-slate-500">Mailpit / SMTP task</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">DAG Rules:</div>
            <div>• Connect output handles to inputs</div>
            <div>• Cycles will be rejected on publish</div>
            <div>• Kafka event-driven execution</div>
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
            <Controls className="bg-slate-900 border-slate-800 text-white fill-white" />
            <MiniMap
              nodeStrokeColor="#6366f1"
              nodeColor="#1e293b"
              maskColor="rgba(15, 23, 42, 0.7)"
              className="bg-slate-900 border border-slate-800 rounded-lg"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
          </ReactFlow>

          {/* Node Inspector Floating Drawer */}
          {selectedNode && (
            <div className="absolute right-4 top-4 w-72 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-2xl space-y-3 z-10 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-white">Node Inspector</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div>
                <span className="text-slate-400">Node ID:</span>
                <span className="ml-2 font-mono text-indigo-400">{selectedNode.id}</span>
              </div>
              <div>
                <span className="text-slate-400">Label:</span>
                <div className="mt-1 font-medium text-slate-200 bg-slate-950 p-2 rounded border border-slate-800">
                  {String(selectedNode.data?.label || "")}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Retry Policy:</span>
                <div className="mt-1 text-slate-300">Max Attempts: 3 • Exponential Backoff</div>
              </div>
              <button
                onClick={() => {
                  setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                  setSelectedNode(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 p-2 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/60 rounded-lg transition font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Node
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
