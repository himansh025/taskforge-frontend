"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
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
        <h1 className="text-xl font-bold text-white tracking-tight font-mono">Sign In to TaskForge</h1>
        <p className="text-xs text-[#8b949e] font-mono">
          Enter your credentials to access your workflows and run history.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#0e0f13] border border-[#1f222a] rounded-xl p-6 shadow-2xl space-y-5 font-mono text-xs">
        {errorMsg && (
          <div className="p-3 bg-[#250e12] border border-[#441920] rounded-lg text-[#f43f5e] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[#8b949e] text-[11px] font-medium">Work Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@taskforge.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#13151b] border border-[#1f222a] focus:border-[#e5a93c] rounded-md pl-9 pr-3 py-2 text-white outline-none transition placeholder-[#525866]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[#8b949e] text-[11px] font-medium">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#525866] absolute left-3 top-3" />
              <input
                type="password"
                required
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
                <span>Authenticating...</span>
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
          <span className="flex-shrink mx-3 text-[10px] text-[#525866] uppercase">or quick access</span>
          <div className="flex-grow border-t border-[#1f222a]"></div>
        </div>

        {/* Demo Fast Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-2 px-3 bg-[#13151b] hover:bg-[#181a22] border border-[#1f222a] hover:border-[#2f3340] text-[#ededed] rounded-md transition text-left flex items-center justify-between group"
        >
          <div className="truncate pr-2">
            <div className="text-[#ededed] font-medium truncate group-hover:text-white">
              Demo Operator (Himanshu Singh)
            </div>
            <div className="text-[10px] text-[#525866]">himanshu@taskforge.dev</div>
          </div>
          <span className="text-[10px] bg-[#1a231d] text-[#10b981] border border-[#23422a] px-1.5 py-0.5 rounded shrink-0">
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
  );
}
