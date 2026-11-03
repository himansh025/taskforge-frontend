"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-2">
          <div className="h-9 w-9 rounded-lg bg-[#16181f] border border-[#2b2f3a] group-hover:border-[#e5a93c] flex items-center justify-center font-mono font-bold text-sm text-[#e5a93c] transition shadow-inner">
            TF
          </div>
          <div className="flex items-center gap-1.5 font-mono text-sm">
            <span className="font-semibold text-white tracking-tight">taskforge</span>
            <span className="text-[#525866]">/</span>
            <span className="text-[#8b949e]">engine</span>
          </div>
        </Link>
        <h1 className="text-xl font-bold text-white tracking-tight font-mono">Create TaskForge Account</h1>
        <p className="text-xs text-[#8b949e] font-mono">
          Set up your operator profile and automatically provision your workspace.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-[#0e0f13] border border-[#1f222a] rounded-xl p-6 shadow-2xl space-y-5 font-mono text-xs">
        {errorMsg && (
          <div className="p-3 bg-[#250e12] border border-[#441920] rounded-lg text-[#f43f5e] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[#8b949e] text-[11px] font-medium">Full Name</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Himanshu Singh"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#8b949e] text-[11px] font-medium">Work Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#8b949e] text-[11px] font-medium">Password (min. 6 characters)</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866]"
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
                <span>Create Account & Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="p-2.5 bg-[#13151b] border border-[#1f222a] rounded-md text-[10px] text-[#525866] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          <span>A dedicated personal workspace will be automatically created.</span>
        </div>

        {/* Link to Login */}
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
  );
}
