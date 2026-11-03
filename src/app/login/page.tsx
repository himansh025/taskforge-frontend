"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Server,
  Activity,
  Layers,
  HardDrive
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useWorkspace();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg(null);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMsg(result.error || "Invalid email or password");
    }
  };

  const handleDemoLogin = async () => {
    setEmail("himanshu@taskforge.dev");
    setPassword("password123");
    setIsLoading(true);
    setErrorMsg(null);

    const result = await login("himanshu@taskforge.dev", "password123");
    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMsg(result.error || "Demo login failed");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#08090c] font-sans selection:bg-[#2e323e] selection:text-white">
      {/* Left Column: Brand & Distributed Architecture Showcase */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#0b0c10] border-r border-[#1c1e24] p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f222a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-[#16181f] border border-[#2b2f3a] group-hover:border-[#e5a93c] flex items-center justify-center font-bold text-xs text-[#e5a93c] transition shadow-inner font-mono">
              TF
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="font-semibold text-white tracking-tight">taskforge</span>
              <span className="text-[#525866]">/</span>
              <span className="text-[#8b949e]">engine</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8b949e] px-2.5 py-1 rounded-full bg-[#111318] border border-[#1f222a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span>Cluster: Healthy</span>
            <span className="text-[#525866]">&bull;</span>
            <span className="text-[#e5a93c]">0ms lag</span>
          </div>
        </div>

        {/* Middle Value Statement & Live Architecture Card */}
        <div className="relative z-10 space-y-6 max-w-xl my-auto py-12">
          <div className="space-y-3">
            <div className="text-[11px] font-bold font-mono text-[#e5a93c] uppercase tracking-wider">
              Distributed Workflow Platform
            </div>
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-snug">
              Event-driven workflow orchestration with transactional guarantees.
            </h2>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              TaskForge coordinates complex microservice pipelines with zero dual-write inconsistency,
              streaming execution milestones directly into your browser console.
            </p>
          </div>

          {/* Simulated Active Pipeline Blueprint */}
          <div className="p-4 rounded-xl bg-[#0e1015] border border-[#20232e] space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-semibold text-white">Invoice Intake Blueprint</span>
              </div>
              <span className="text-[#10b981] text-[11px]">ALL 5 STEPS OK</span>
            </div>

            {/* 5 Node mini diagram */}
            <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono text-center pt-1">
              <div className="p-2 rounded bg-[#13151b] border border-[#1f222a] space-y-1">
                <div className="text-[#38bdf8] font-bold">1. INPUT</div>
                <div className="text-white font-medium truncate">CSV Check</div>
              </div>
              <div className="p-2 rounded bg-[#13151b] border border-[#1f222a] space-y-1">
                <div className="text-[#a78bfa] font-bold">2. FORMAT</div>
                <div className="text-white font-medium truncate">Transform</div>
              </div>
              <div className="p-2 rounded bg-[#13151b] border border-[#1f222a] space-y-1">
                <div className="text-[#e5a93c] font-bold">3. RULE</div>
                <div className="text-white font-medium truncate">&ge; $10k Gate</div>
              </div>
              <div className="p-2 rounded bg-[#13151b] border border-[#1f222a] space-y-1">
                <div className="text-[#10b981] font-bold">4. REPORT</div>
                <div className="text-white font-medium truncate">MinIO S3</div>
              </div>
              <div className="p-2 rounded bg-[#13151b] border border-[#1f222a] space-y-1">
                <div className="text-[#06b6d4] font-bold">5. SINK</div>
                <div className="text-white font-medium truncate">Mail Alert</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#525866]">
              <span>Orchestrator: Kafka Partition 0</span>
              <span>Redis SSE: Connected</span>
            </div>
          </div>
        </div>

        {/* Footer Technical Badges */}
        <div className="relative z-10 flex items-center gap-3 text-[11px] font-mono text-[#525866]">
          <span>Apache Kafka 7.6</span>
          <span>&bull;</span>
          <span>Redis 7.0</span>
          <span>&bull;</span>
          <span>PostgreSQL 16</span>
          <span>&bull;</span>
          <span>MinIO S3</span>
        </div>
      </div>

      {/* Right Column: Centered Login Form - ALWAYS vertically centered */}
      <div className="min-h-screen lg:col-span-6 xl:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand badge if screen is small */}
          <div className="lg:hidden text-center mb-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-[#16181f] border border-[#2b2f3a] flex items-center justify-center font-bold text-xs text-[#e5a93c] font-mono">
                TF
              </div>
              <span className="font-semibold text-white tracking-tight text-xs font-mono">taskforge/engine</span>
            </Link>
          </div>

          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to TaskForge</h1>
            <p className="text-xs text-[#8b949e]">
              Enter your credentials to access workspaces, pipelines, and live run history.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#0e0f13] border border-[#1f222a] rounded-xl p-6 sm:p-7 shadow-2xl space-y-5 text-xs">
            {errorMsg && (
              <div className="p-3 bg-[#250e12] border border-[#441920] rounded-lg text-[#f43f5e] flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[#8b949e] text-[11px] font-medium font-mono">Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@taskforge.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#8b949e] text-[11px] font-medium font-mono">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#e4e4e7] text-black font-semibold rounded-md transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#1f222a]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-[#525866] uppercase">or quick access</span>
              <div className="flex-grow border-t border-[#1f222a]"></div>
            </div>

            {/* 1-Click Demo Operator button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-[#13151b] hover:bg-[#181a22] border border-[#1f222a] hover:border-[#2f3340] text-[#ededed] rounded-md transition text-left flex items-center justify-between group"
            >
              <div className="truncate pr-2">
                <div className="text-[#ededed] font-medium truncate group-hover:text-white">
                  Demo Operator (Himanshu Singh)
                </div>
                <div className="text-[10px] font-mono text-[#525866]">himanshu@taskforge.dev</div>
              </div>
              <span className="text-[10px] font-mono bg-[#1a231d] text-[#10b981] border border-[#23422a] px-2 py-0.5 rounded shrink-0">
                Click to fill
              </span>
            </button>

            {/* Link to Signup */}
            <div className="text-center pt-2 border-t border-[#1a1c22]">
              <p className="text-[11px] text-[#8b949e]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[#e5a93c] hover:underline font-semibold">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
