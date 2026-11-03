"use client";

import React from "react";
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
  Terminal
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function LandingPage() {
  const router = useRouter();
  const { demoLogin } = useWorkspace();
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);

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
    <div className="min-h-screen bg-[#08090c] text-[#ededed] font-mono selection:bg-[#2e323e] selection:text-white flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#1c1e24] bg-[#0c0d11]/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-[#16181f] border border-[#2b2f3a] group-hover:border-[#e5a93c] flex items-center justify-center font-bold text-xs text-[#e5a93c] transition shadow-inner">
              TF
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-white tracking-tight">taskforge</span>
              <span className="text-[#525866]">/</span>
              <span className="text-[#8b949e]">engine</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[#8b949e]">
            <a href="#architecture" className="hover:text-white transition">Architecture</a>
            <a href="#pipeline" className="hover:text-white transition">Pipeline Engine</a>
            <a href="#telemetry" className="hover:text-white transition">Live Telemetry</a>
            <a href="http://localhost:9001" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
              <span>MinIO</span>
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
            className="px-3 py-1.5 rounded-md text-xs text-[#8b949e] hover:text-white hover:bg-[#161820] border border-transparent hover:border-[#2b2f3a] transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-md text-xs bg-white hover:bg-[#e4e4e7] text-black font-semibold shadow-sm transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl w-full mx-auto px-6 pt-16 pb-20 space-y-12">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Engineering Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-[#23262f] text-[11px] text-[#8b949e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Distributed Event-Driven DAG Engine</span>
            <span className="text-[#525866]">&bull;</span>
            <span className="text-[#e5a93c]">v1.4.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            High-Throughput Workflow Orchestrator for Distributed Systems
          </h1>

          <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed max-w-2xl mx-auto font-sans">
            TaskForge coordinates microservices with transactional Kafka outbox guarantees,
            real-time Redis pub/sub telemetry, and resilient DAG task retry semantics.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-[#e4e4e7] text-black text-xs font-semibold shadow-md flex items-center gap-2 transition"
            >
              {isDemoLoading ? (
                <span>Launching Console...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Launch Demo Console</span>
                </>
              )}
            </button>

            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-lg bg-[#14161d] hover:bg-[#1a1d26] border border-[#2b2f3a] text-white text-xs font-medium flex items-center gap-2 transition"
            >
              <span>Create Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8b949e]" />
            </Link>
          </div>
        </div>

        {/* Live Architecture Graphic Preview */}
        <div id="pipeline" className="rounded-xl bg-[#0e0f13] border border-[#1f222a] p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1c1e24] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span className="font-semibold text-white">Pipeline Blueprint: Invoice Intake & Audit</span>
              <span className="text-[10px] text-[#525866] px-1.5 py-0.5 rounded bg-[#161820] border border-[#23262f]">DAG</span>
            </div>
            <div className="flex items-center gap-4 text-[#8b949e] text-[11px]">
              <span>Kafka Lag: <code className="text-[#10b981]">0ms</code></span>
              <span>Workers: <code className="text-white">3 active</code></span>
              <span>Redis Stream: <code className="text-[#10b981]">live</code></span>
            </div>
          </div>

          {/* Simulated 5-Step Pipeline Rail */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            {/* Step 1 */}
            <div className="p-3 rounded-lg bg-[#111318] border border-[#1f222a] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#38bdf8] font-bold">1. INPUT</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-xs font-semibold text-white">CSV Validate</div>
              <p className="text-[10px] text-[#525866]">Inspect 142 invoice rows and required headers</p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-lg bg-[#111318] border border-[#1f222a] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#a78bfa] font-bold">2. FORMAT</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-xs font-semibold text-white">Data Transform</div>
              <p className="text-[10px] text-[#525866]">Normalize customer strings & cast amounts to USD</p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-lg bg-[#111318] border border-[#1f222a] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#e5a93c] font-bold">3. RULE</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-xs font-semibold text-white">Threshold Check</div>
              <p className="text-[10px] text-[#525866]">Evaluates sum &ge; $10,000 boolean branch</p>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-lg bg-[#111318] border border-[#1f222a] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#10b981] font-bold">4. REPORT</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-xs font-semibold text-white">Generate Report</div>
              <p className="text-[10px] text-[#525866]">Uploads JSON audit summary to MinIO S3 bucket</p>
            </div>

            {/* Step 5 */}
            <div className="p-3 rounded-lg bg-[#111318] border border-[#1f222a] space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#06b6d4] font-bold">5. ALERT</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-xs font-semibold text-white">Send Email</div>
              <p className="text-[10px] text-[#525866]">Dispatches alert over SMTP socket to Mailpit</p>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div id="architecture" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-5 rounded-xl bg-[#0e0f13] border border-[#1f222a] space-y-3">
            <div className="h-8 w-8 rounded bg-[#161820] border border-[#2b2f3a] text-[#e5a93c] flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Transactional Kafka Outbox</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed font-sans">
              Eliminate distributed dual-write inconsistency bugs. TaskForge commits pipeline state transitions
              atomically to PostgreSQL before safely dispatching tasks to Apache Kafka.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0e0f13] border border-[#1f222a] space-y-3">
            <div className="h-8 w-8 rounded bg-[#161820] border border-[#2b2f3a] text-[#10b981] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero-Polling Redis Streaming</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed font-sans">
              No continuous database polling. Worker nodes broadcast task completion events over Redis Pub/Sub,
              delivering sub-second live updates to browser clients via Server-Sent Events (SSE).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0e0f13] border border-[#1f222a] space-y-3">
            <div className="h-8 w-8 rounded bg-[#161820] border border-[#2b2f3a] text-[#38bdf8] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Multi-Tenant S3 Artifacts</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed font-sans">
              Organize workflows by workspace. MinIO S3 object storage isolates uploaded CSV datasets,
              intermediate payloads, and generated audit report files per tenant organization.
            </p>
          </div>
        </div>

        {/* Stack Ribbon */}
        <div className="p-6 rounded-xl bg-[#0c0d11] border border-[#1c1e24] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#525866]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span className="text-[#8b949e] font-semibold">Infrastructure Ecosystem</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#8b949e]">
            <span className="px-2 py-1 bg-[#13151b] border border-[#1f222a] rounded">Apache Kafka 7.6</span>
            <span className="px-2 py-1 bg-[#13151b] border border-[#1f222a] rounded">Redis 7.0</span>
            <span className="px-2 py-1 bg-[#13151b] border border-[#1f222a] rounded">PostgreSQL 16</span>
            <span className="px-2 py-1 bg-[#13151b] border border-[#1f222a] rounded">MinIO S3</span>
            <span className="px-2 py-1 bg-[#13151b] border border-[#1f222a] rounded">Spring Boot 3.3</span>
            <span className="px-2 py-1 bg-[#13151b] border border-[#1f222a] rounded">Next.js 16</span>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-[#111318] to-[#0c0d11] border border-[#1f222a] space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ready to orchestrate your event-driven pipelines?
          </h2>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto font-sans">
            Create an account in 10 seconds or launch the live interactive console to inspect DAG executions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-[#e4e4e7] text-black text-xs font-semibold shadow-md transition"
            >
              Create Free Workspace
            </Link>
            <button
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="px-5 py-2.5 rounded-lg bg-[#161820] hover:bg-[#1f222c] border border-[#2b2f3a] text-white text-xs font-medium transition"
            >
              Open Console Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#191b22] py-6 px-6 md:px-12 text-xs text-[#525866] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>TaskForge Engine v1.4.0</span>
          <span>&bull;</span>
          <span>Himanshu Singh</span>
        </div>
        <div>
          <span>Localhost Linux Architecture &bull; Port 3000 &bull; Port 8080</span>
        </div>
      </footer>
    </div>
  );
}
