"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Server,
  Activity,
  Layers,
  HardDrive
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useWorkspace();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) return;

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result = await register(displayName, email, password);
    setIsLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMsg(result.error || "Registration failed. Email may already be in use.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#08090c] font-sans selection:bg-[#2e323e] selection:text-white">
      {/* Left Column: Brand & Architecture Showcase */}
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
            <span>Zero-Config Provisioning</span>
          </div>
        </div>

        {/* Middle Value Statement & Showcase */}
        <div className="relative z-10 space-y-6 max-w-xl my-auto py-12">
          <div className="space-y-3">
            <div className="text-[11px] font-bold font-mono text-[#10b981] uppercase tracking-wider">
              Instant Workspace Setup
            </div>
            <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-snug">
              Start building fault-tolerant event pipelines in seconds.
            </h2>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              Signing up automatically initializes your dedicated multi-tenant workspace,
              connects to Kafka partitions, and provisions your MinIO artifact bucket.
            </p>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#111318] border border-[#1f222a] space-y-1.5">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Dedicated Workspace</span>
              </div>
              <p className="text-[#8b949e] text-[11px] leading-relaxed">
                Complete tenant isolation for pipelines, runs, and credentials.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#111318] border border-[#1f222a] space-y-1.5">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>MinIO S3 Bucket</span>
              </div>
              <p className="text-[#8b949e] text-[11px] leading-relaxed">
                Direct uploads for datasets, artifacts, and generated reports.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#111318] border border-[#1f222a] space-y-1.5">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Event Streams</span>
              </div>
              <p className="text-[#8b949e] text-[11px] leading-relaxed">
                Real-time Redis SSE terminal logs streamed straight to UI.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#111318] border border-[#1f222a] space-y-1.5">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Zero Dual-Write</span>
              </div>
              <p className="text-[#8b949e] text-[11px] leading-relaxed">
                Transactional outbox guarantees tasks execute without state loss.
              </p>
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

      {/* Right Column: Centered Registration Form - ALWAYS vertically centered */}
      <div className="min-h-screen lg:col-span-6 xl:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand badge if screen is small */}
          <div className="lg:hidden text-center mb-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-[#161820] border border-[#2b2f3a] flex items-center justify-center font-bold text-xs text-[#e5a93c] font-mono">
                TF
              </div>
              <span className="font-semibold text-white tracking-tight text-xs font-mono">taskforge/engine</span>
            </Link>
          </div>

          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create TaskForge Account</h1>
            <p className="text-xs text-[#8b949e]">
              Set up your operator profile and automatically provision your workspace.
            </p>
          </div>

          {/* Registration Card */}
          <div className="bg-[#0e0f13] border border-[#1f222a] rounded-xl p-6 sm:p-7 shadow-2xl space-y-5 text-xs">
            {errorMsg && (
              <div className="p-3 bg-[#250e12] border border-[#441920] rounded-lg text-[#f43f5e] flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[#8b949e] text-[11px] font-medium font-mono">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Himanshu Singh"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#8b949e] text-[11px] font-medium font-mono">Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#8b949e] text-[11px] font-medium font-mono">Password (min. 6 characters)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
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
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="p-3 rounded-lg bg-[#111319] border border-[#1d202a] flex items-center gap-2 text-[11px] text-[#8b949e]">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
              <span>A dedicated personal workspace will be automatically created.</span>
            </div>

            {/* Link to Sign In */}
            <div className="text-center pt-2 border-t border-[#1a1c22]">
              <p className="text-[11px] text-[#8b949e]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#e5a93c] hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
