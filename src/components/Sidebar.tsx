"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitBranch,
  Activity,
  HardDrive,
  Mail,
  ExternalLink,
  Server,
  Layers,
  Cpu,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Database
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const isPipelinesActive = pathname === "/" || pathname.startsWith("/workflows");
  const isExecutionsActive = pathname.startsWith("/executions");

  return (
    <aside className="w-64 min-h-screen bg-[#0c0d11] border-r border-[#1c1e24] flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Brand & Workspace Context */}
        <div className="space-y-3">
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

          {/* Active Tenant Box */}
          <div className="p-2.5 rounded-md bg-[#111318] border border-[#1f222a] text-xs font-mono">
            <div className="flex items-center justify-between text-[#8b949e]">
              <span className="text-[10px] text-[#525866] uppercase">Tenant Workspace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            </div>
            <div className="font-semibold text-[#ededed] mt-0.5 truncate">finance-core</div>
            <div className="text-[10px] text-[#525866] truncate mt-0.5 font-mono">
              id: e7c051b5-e677...
            </div>
          </div>
        </div>

        {/* Section 1: Core Orchestration */}
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
              1
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
              <span>Audit Ledger</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0d1f14] text-[#10b981] border border-[#163821]">
              live
            </span>
          </Link>
        </div>

        {/* Section 2: Infrastructure & Integrations */}
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

        {/* Section 3: Live Telemetry Widget */}
        <div className="space-y-2 pt-2 border-t border-[#191b22]">
          <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#525866]">
            Cluster Health
          </div>

          <div className="p-2.5 rounded-md bg-[#090a0d] border border-[#1c1e24] space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Kafka Bus:</span>
              <span className="text-[#10b981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                0ms lag
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Redis Bus:</span>
              <span className="text-[#10b981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                stream OK
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Workers:</span>
              <span className="text-[#ededed]">3 replicas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer: User Identity & Version */}
      <div className="p-3 border-t border-[#1c1e24] bg-[#0a0b0e] space-y-2">
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="h-7 w-7 rounded bg-[#161820] border border-[#2b2f3a] flex items-center justify-center font-mono font-bold text-xs text-[#ededed]">
            HS
          </div>
          <div className="text-left font-mono truncate">
            <div className="text-xs font-semibold text-[#ededed] truncate">Himanshu Singh</div>
            <div className="text-[10px] text-[#525866] leading-none">lead engineer</div>
          </div>
        </div>

        <div className="px-1.5 text-[10px] font-mono text-[#525866] flex items-center justify-between">
          <span>TaskForge v1.4.0</span>
          <span>x86_64</span>
        </div>
      </div>
    </aside>
  );
}
