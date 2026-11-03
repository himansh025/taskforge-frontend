"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitBranch,
  Activity,
  HardDrive,
  Mail,
  ExternalLink,
  ChevronDown,
  Check,
  Plus,
  LogOut,
  LogIn
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    workflowCount,
    currentUser,
    logout,
  } = useWorkspace();

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isCreatingWs, setIsCreatingWs] = useState(false);

  // Hide sidebar on authentication pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const isPipelinesActive = pathname === "/" || pathname.startsWith("/workflows");
  const isExecutionsActive = pathname.startsWith("/executions");

  const handleCreateNewWs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setIsCreatingWs(true);
    const created = await createWorkspace(newWsName.trim());
    setIsCreatingWs(false);
    if (created) {
      setNewWsName("");
      setShowCreateModal(false);
      setIsWorkspaceDropdownOpen(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "OP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <aside className="w-64 min-h-screen bg-[#0c0d11] border-r border-[#1c1e24] flex flex-col justify-between shrink-0 select-none">
        <div className="p-4 space-y-6">
          {/* Brand & Workspace Context */}
          <div className="space-y-3 relative">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 rounded bg-[#16181f] border border-[#2b2f3a] group-hover:border-[#e5a93c] flex items-center justify-center font-mono font-bold text-xs text-[#e5a93c] transition shadow-inner">
                TF
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="font-semibold text-white tracking-tight">taskforge</span>
                <span className="text-[#525866]">/</span>
                <span className="text-[#8b949e]">engine</span>
              </div>
            </Link>

            {/* Clean & Modern Workspace Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="w-full text-left p-2 rounded-lg bg-[#111318] hover:bg-[#161820] border border-[#1f222a] hover:border-[#2f3340] text-xs font-mono transition flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-6 w-6 rounded bg-[#181a22] border border-[#2b2f3a] text-[#e5a93c] flex items-center justify-center font-bold text-xs shrink-0">
                    {currentWorkspace?.name ? currentWorkspace.name[0].toUpperCase() : "W"}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-[#ededed] truncate group-hover:text-white transition leading-tight">
                      {currentWorkspace?.name || "Workspace"}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8b949e] shrink-0 transition ${
                    isWorkspaceDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Workspace Dropdown Panel */}
              {isWorkspaceDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#111318] border border-[#23262f] rounded-lg shadow-2xl p-1 z-50 text-xs font-mono space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#525866] uppercase">
                    Workspaces ({workspaces.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          switchWorkspace(ws.id);
                          setIsWorkspaceDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition ${
                          currentWorkspace?.id === ws.id
                            ? "bg-[#181a22] text-[#e5a93c] font-semibold"
                            : "text-[#8b949e] hover:bg-[#161820] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {currentWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-[#e5a93c]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-[#1f222a]">
                    <button
                      onClick={() => {
                        setIsWorkspaceDropdownOpen(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-[#ededed] hover:bg-[#161820] rounded-md transition"
                    >
                      <Plus className="w-3 h-3 text-[#e5a93c]" />
                      <span>Create New Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Core Navigation */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#525866]">
              Core Orchestration
            </div>

            <Link
              href="/"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono transition ${
                isPipelinesActive
                  ? "bg-[#181a22] text-white border-l-2 border-[#e5a93c] font-semibold"
                  : "text-[#8b949e] hover:text-[#ededed] hover:bg-[#14151b]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GitBranch className={`w-3.5 h-3.5 ${isPipelinesActive ? "text-[#e5a93c]" : "text-[#525866]"}`} />
                <span>Pipelines</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#13141a] border border-[#1e2028] text-[#8b949e]">
                {workflowCount}
              </span>
            </Link>

            <Link
              href="/executions"
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono transition ${
                isExecutionsActive
                  ? "bg-[#181a22] text-white border-l-2 border-[#e5a93c] font-semibold"
                  : "text-[#8b949e] hover:text-[#ededed] hover:bg-[#14151b]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className={`w-3.5 h-3.5 ${isExecutionsActive ? "text-[#e5a93c]" : "text-[#525866]"}`} />
                <span>Run History</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0d1f14] text-[#10b981] border border-[#163821]">
                live
              </span>
            </Link>
          </div>

          {/* Section 2: Infrastructure Services */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#525866]">
              Infrastructure Services
            </div>

            <a
              href="http://localhost:9001"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono text-[#8b949e] hover:text-[#ededed] hover:bg-[#14151b] transition group"
            >
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-3.5 h-3.5 text-[#525866] group-hover:text-[#ededed]" />
                <span>MinIO S3 Store</span>
              </div>
              <ExternalLink className="w-3 h-3 text-[#525866] group-hover:text-[#ededed]" />
            </a>

            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-mono text-[#8b949e] hover:text-[#ededed] hover:bg-[#14151b] transition group"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#525866] group-hover:text-[#ededed]" />
                <span>Mailpit SMTP</span>
              </div>
              <ExternalLink className="w-3 h-3 text-[#525866] group-hover:text-[#ededed]" />
            </a>
          </div>
        </div>

        {/* Sidebar Footer: User Profile & Authentication */}
        <div className="p-3 border-t border-[#1c1e24] bg-[#0a0b0e] space-y-2">
          {currentUser ? (
            <div className="flex items-center justify-between px-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded bg-[#161820] border border-[#2b2f3a] flex items-center justify-center font-mono font-bold text-xs text-[#ededed] shrink-0">
                  {getInitials(currentUser.name)}
                </div>
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-semibold text-[#ededed] truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#525866] truncate">{currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 hover:bg-[#161820] rounded text-[#8b949e] hover:text-[#f43f5e] transition shrink-0 ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1.5">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-xs font-mono text-white rounded transition"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex-1 flex items-center justify-center py-1.5 px-2 bg-white hover:bg-[#e4e4e7] text-black text-xs font-mono font-semibold rounded transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          <div className="px-1.5 text-[10px] font-mono text-[#525866] flex items-center justify-between pt-1">
            <span>TaskForge v1.4.0</span>
            <span>x86_64</span>
          </div>
        </div>
      </aside>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e0f13] border border-[#23262f] rounded-lg max-w-sm w-full p-4 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f222a]">
              <h3 className="font-semibold text-white">Create New Workspace</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8b949e] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewWs} className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8b949e] mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Risk Analytics Team"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-[#13151b] border border-[#1f222a] rounded p-2 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f222a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-[#8b949e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWs}
                  className="px-3 py-1.5 bg-white text-black font-semibold rounded"
                >
                  {isCreatingWs ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
