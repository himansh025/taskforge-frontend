"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  GitBranch,
  Activity,
  Layers,
  Server,
  Zap,
  ShieldCheck,
  Cpu,
  Database,
  HardDrive,
  Mail,
  CheckCircle2,
  Play,
  ExternalLink,
  ChevronRight,
  Terminal,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function LandingPage() {
  const router = useRouter();
  const { demoLogin } = useWorkspace();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setIsDemoLoading(true);
    const res = await demoLogin();
    setIsDemoLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-[#ededed] font-sans selection:bg-[#2e323e] selection:text-white flex flex-col relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-gradient-to-b from-[#e5a93c]/12 via-[#e5a93c]/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#38bdf8]/5 blur-[100px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-[#1c1e24] bg-[#090a0d]/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-[#14161f] border border-[#2b2f3a] group-hover:border-[#e5a93c] flex items-center justify-center font-bold text-xs text-[#e5a93c] transition shadow-inner font-mono">
              TF
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="font-semibold text-white tracking-tight text-sm">taskforge</span>
              <span className="text-[#525866]">/</span>
              <span className="text-[#8b949e]">engine</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[#8b949e] font-mono">
            <a href="#pipeline" className="hover:text-white transition">Pipeline Rail</a>
            <a href="#architecture" className="hover:text-white transition">Distributed Arch</a>
            <a href="#telemetry" className="hover:text-white transition">Live Telemetry</a>
            <a href="http://localhost:9001" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
              <span>MinIO S3</span>
              <ExternalLink className="w-3 h-3 text-[#525866]" />
            </a>
            <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
              <span>Mailpit</span>
              <ExternalLink className="w-3 h-3 text-[#525866]" />
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-white hover:bg-[#141620] border border-transparent hover:border-[#2b2f3a] transition font-mono"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg text-xs bg-white hover:bg-[#e4e4e7] text-black font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <span>Create Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-16 sm:pt-20 pb-24 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-7 max-w-4xl mx-auto">
          {/* Engineering Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12141c] border border-[#232733] text-xs text-[#8b949e] font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Distributed Event-Driven DAG Engine</span>
            <span className="text-[#525866]">&bull;</span>
            <span className="text-[#e5a93c] font-semibold">v1.4.0</span>
          </div>

          {/* Large Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            High-Throughput Workflow Orchestrator for Distributed Systems
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed max-w-2xl mx-auto font-sans font-normal">
            TaskForge executes multi-stage DAG pipelines with transactional Kafka outbox guarantees,
            real-time Redis pub/sub telemetry, and resilient microservice task dispatching.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="px-6 py-3 rounded-lg bg-white hover:bg-[#e4e4e7] text-black text-sm font-semibold shadow-lg shadow-white/5 flex items-center gap-2.5 transition active:scale-[0.98]"
            >
              {isDemoLoading ? (
                <span>Connecting to Engine...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Launch Demo Console</span>
                </>
              )}
            </button>

            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-[#141620] hover:bg-[#1a1d28] border border-[#2b2f3a] text-white text-sm font-medium flex items-center gap-2.5 transition"
            >
              <span>Set Up Free Workspace</span>
              <ArrowRight className="w-4 h-4 text-[#8b949e]" />
            </Link>
          </div>

          {/* Live System Spec Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-6 max-w-3xl mx-auto font-mono text-left">
            <div className="p-3.5 rounded-lg bg-[#0e1016]/80 border border-[#1b1e27] space-y-1">
              <div className="text-[11px] text-[#8b949e]">Outbox Lag</div>
              <div className="text-base sm:text-lg font-bold text-[#10b981] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span>0ms</span>
              </div>
              <div className="text-[10px] text-[#525866]">Kafka Partition 0</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0e1016]/80 border border-[#1b1e27] space-y-1">
              <div className="text-[11px] text-[#8b949e]">Telemetry Stream</div>
              <div className="text-base sm:text-lg font-bold text-[#38bdf8] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                <span>&lt;2ms</span>
              </div>
              <div className="text-[10px] text-[#525866]">Redis Pub/Sub SSE</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0e1016]/80 border border-[#1b1e27] space-y-1">
              <div className="text-[11px] text-[#8b949e]">Cluster Workers</div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#e5a93c]" />
                <span>3 Active</span>
              </div>
              <div className="text-[10px] text-[#525866]">taskforge-worker-v1</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0e1016]/80 border border-[#1b1e27] space-y-1">
              <div className="text-[11px] text-[#8b949e]">State Guarantee</div>
              <div className="text-base sm:text-lg font-bold text-[#e5a93c] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e5a93c]" />
                <span>Atomic</span>
              </div>
              <div className="text-[10px] text-[#525866]">PostgreSQL 16 Outbox</div>
            </div>
          </div>
        </div>

        {/* Live DAG Blueprint Rail Section */}
        <section id="pipeline" className="rounded-2xl bg-[#0c0d12] border border-[#1e212b] p-6 sm:p-8 shadow-2xl space-y-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#1a1d26]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-semibold text-white text-base">Pipeline Blueprint: Invoice Intake &amp; Audit</span>
                <span className="text-[10px] font-mono text-[#8b949e] px-2 py-0.5 rounded bg-[#161822] border border-[#272b38]">
                  DAG FLOW
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                5 sequential task stages orchestrated across microservices with automatic retries and payload passing
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#8b949e] bg-[#12141c] px-3 py-1.5 rounded-lg border border-[#1f222e]">
              <span>Execution ID:</span>
              <code className="text-[#e5a93c]">exec-9b38f12a</code>
              <span className="text-[#525866]">•</span>
              <span className="text-[#10b981] font-semibold">ALL STEPS OK</span>
            </div>
          </div>

          {/* 5-Step Pipeline Rail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-[#101218] border border-[#20232e] hover:border-[#38bdf8]/50 transition space-y-2.5 group">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#38bdf8] font-bold">1. INPUT</span>
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-sm font-semibold text-white">CSV Validate</div>
              <p className="text-xs text-[#8b949e] leading-snug">
                Parses 142 invoice rows and enforces strict column schema
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#525866]">
                <span>142 rows</span>
                <span className="text-[#10b981]">0.12s</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-[#101218] border border-[#20232e] hover:border-[#a78bfa]/50 transition space-y-2.5 group">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#a78bfa] font-bold">2. FORMAT</span>
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-sm font-semibold text-white">Data Transform</div>
              <p className="text-xs text-[#8b949e] leading-snug">
                Normalizes customer strings and formats numbers into USD
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#525866]">
                <span>JSON 4.8 KB</span>
                <span className="text-[#10b981]">0.18s</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-[#101218] border border-[#20232e] hover:border-[#e5a93c]/50 transition space-y-2.5 group">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#e5a93c] font-bold">3. RULE</span>
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-sm font-semibold text-white">Threshold Check</div>
              <p className="text-xs text-[#8b949e] leading-snug">
                Evaluates condition: total invoice sum &ge; $10,000.00
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#525866]">
                <span>BRANCH: TRUE</span>
                <span className="text-[#10b981]">0.08s</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-[#101218] border border-[#20232e] hover:border-[#10b981]/50 transition space-y-2.5 group">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#10b981] font-bold">4. REPORT</span>
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-sm font-semibold text-white">Generate Report</div>
              <p className="text-xs text-[#8b949e] leading-snug">
                Builds JSON audit summary &amp; uploads to MinIO S3 bucket
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#525866]">
                <span>S3: 200 OK</span>
                <span className="text-[#10b981]">0.22s</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-[#101218] border border-[#20232e] hover:border-[#06b6d4]/50 transition space-y-2.5 group">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#06b6d4] font-bold">5. ALERT</span>
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-sm font-semibold text-white">Send Email</div>
              <p className="text-xs text-[#8b949e] leading-snug">
                Dispatches alert notification over SMTP socket to Mailpit
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#525866]">
                <span>SMTP: DELIVERED</span>
                <span className="text-[#10b981]">0.15s</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Architecture Pillars */}
        <section id="architecture" className="space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Architected for Zero Data Loss and Real-Time Feedback
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              TaskForge replaces fragile cron scripts with production-grade distributed orchestration patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-[#1e212b] space-y-4 hover:border-[#2b2f3d] transition">
              <div className="h-10 w-10 rounded-xl bg-[#151722] border border-[#282c3c] text-[#e5a93c] flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Transactional Kafka Outbox</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Dual-write inconsistencies between PostgreSQL and Kafka are mathematically eliminated.
                Pipeline status transitions commit inside an atomic DB transaction before tasks dispatch to message topics.
              </p>
              <div className="text-[11px] font-mono text-[#525866] pt-1">
                PostgreSQL 16 &bull; Spring Transaction Manager
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-[#1e212b] space-y-4 hover:border-[#2b2f3d] transition">
              <div className="h-10 w-10 rounded-xl bg-[#151722] border border-[#282c3c] text-[#10b981] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Zero-Polling Redis SSE Stream</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Browser consoles do not repeatedly poll SQL tables. Workers publish task step updates
                over Redis Pub/Sub channels, instantly relayed to your browser via Server-Sent Events (SSE).
              </p>
              <div className="text-[11px] font-mono text-[#525866] pt-1">
                Redis 7.0 &bull; EventSource SSE &bull; &lt;2ms
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c0d12] border border-[#1e212b] space-y-4 hover:border-[#2b2f3d] transition">
              <div className="h-10 w-10 rounded-xl bg-[#151722] border border-[#282c3c] text-[#38bdf8] flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Multi-Tenant S3 Storage</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Every customer organization operates inside an isolated workspace. Large datasets,
                CSV uploads, and generated reports reside in MinIO S3 object storage organized per workspace ID.
              </p>
              <div className="text-[11px] font-mono text-[#525866] pt-1">
                MinIO S3 &bull; Workspace-Scoped Buckets
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Ribbon */}
        <section id="telemetry" className="p-6 rounded-2xl bg-[#0c0d12] border border-[#1e212b] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span className="text-white font-semibold">Engine Infrastructure Stack</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[#8b949e]">
            <span className="px-3 py-1 bg-[#12141c] border border-[#20232f] rounded-md">Apache Kafka 7.6</span>
            <span className="px-3 py-1 bg-[#12141c] border border-[#20232f] rounded-md">Redis 7.0</span>
            <span className="px-3 py-1 bg-[#12141c] border border-[#20232f] rounded-md">PostgreSQL 16</span>
            <span className="px-3 py-1 bg-[#12141c] border border-[#20232f] rounded-md">MinIO S3</span>
            <span className="px-3 py-1 bg-[#12141c] border border-[#20232f] rounded-md">Spring Boot 3.3</span>
            <span className="px-3 py-1 bg-[#12141c] border border-[#20232f] rounded-md">Next.js 16</span>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="text-center py-16 px-6 sm:px-12 rounded-3xl bg-gradient-to-b from-[#12141d] to-[#0a0b0f] border border-[#212533] space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#e5a93c]/10 blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight relative z-10">
            Ready to orchestrate your event-driven pipelines?
          </h2>
          <p className="text-sm text-[#8b949e] max-w-md mx-auto leading-relaxed relative z-10 font-sans">
            Create an account to provision your personal workspace, or jump into the interactive console demo to inspect live runs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-white hover:bg-[#e4e4e7] text-black text-xs font-semibold shadow-md transition"
            >
              Create Free Workspace
            </Link>
            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="px-6 py-3 rounded-lg bg-[#161822] hover:bg-[#1f222e] border border-[#2d3140] text-white text-xs font-medium transition"
            >
              Open Console Demo
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#191b22] py-8 px-6 md:px-12 text-xs text-[#525866] font-mono flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#07080a]">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-white">TaskForge Engine v1.4.0</span>
          <span>&bull;</span>
          <span>Himanshu Singh</span>
        </div>
        <div>
          <span>Localhost Linux Architecture &bull; Port 3000 (UI) &bull; Port 8080 (API)</span>
        </div>
      </footer>
    </div>
  );
}
