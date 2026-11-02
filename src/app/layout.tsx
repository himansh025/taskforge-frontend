import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { GitBranch, Activity, HardDrive, Mail, Terminal, Search, ChevronRight, Server, Shield, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "TaskForge — Distributed Workflow Orchestrator Console",
  description: "High-throughput event-driven DAG execution engine, Kafka outbox broker, and Redis telemetry stream.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0d] text-[#ededed] antialiased selection:bg-[#2e323e] selection:text-white flex flex-col">
        {/* Engineering Command Bar / Main Navigation */}
        <header className="border-b border-[#1c1e24] bg-[#0c0d11]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[1520px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Left: Brand Identity & Breadcrumb */}
            <div className="flex items-center gap-6">
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

              {/* Workspace Context Selector */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12141a] border border-[#1f222a] text-xs font-mono text-[#8b949e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span className="text-[#ededed]">finance-core</span>
                <span className="text-[#525866]">#</span>
                <span className="text-[#525866]">e7c051b5</span>
              </div>

              {/* Functional Nav Tabs */}
              <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-md text-[#ededed] hover:text-white hover:bg-[#161820] transition flex items-center gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>Pipelines</span>
                </Link>
                <Link
                  href="/executions"
                  className="px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#ededed] hover:bg-[#161820] transition flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>Audit Ledger</span>
                </Link>
                <a
                  href="http://localhost:9001"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#ededed] hover:bg-[#161820] transition flex items-center gap-1.5"
                >
                  <HardDrive className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>MinIO S3</span>
                  <ExternalLink className="w-3 h-3 text-[#525866]" />
                </a>
                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md text-[#8b949e] hover:text-[#ededed] hover:bg-[#161820] transition flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>Mailpit</span>
                  <ExternalLink className="w-3 h-3 text-[#525866]" />
                </a>
              </nav>
            </div>

            {/* Right: Live Telemetry Ticker & User Badge */}
            <div className="flex items-center gap-4">
              {/* Telemetry Indicator */}
              <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded bg-[#111317] border border-[#1c1e24] text-[11px] font-mono text-[#8b949e]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-[#ededed]">Kafka 3.7</span>
                  <span className="text-[#525866]">|</span>
                  <span>outbox OK</span>
                </div>
                <span className="text-[#2b2f3a]">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#ededed]">Redis 7</span>
                  <span className="text-[#525866]">|</span>
                  <span className="text-[#10b981]">stream live</span>
                </div>
                <span className="text-[#2b2f3a]">•</span>
                <span className="text-[#8b949e]">3 workers</span>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#1c1e24]">
                <div className="h-7 w-7 rounded bg-[#1c1f28] border border-[#2e3342] flex items-center justify-center font-mono font-semibold text-xs text-[#ededed]">
                  HS
                </div>
                <div className="hidden sm:block text-left font-mono">
                  <div className="text-xs font-medium text-[#ededed] leading-none">Himanshu S.</div>
                  <div className="text-[10px] text-[#525866] mt-0.5 leading-none">lead engineer</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Work Area */}
        <main className="max-w-[1520px] mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
          {children}
        </main>

        {/* Precision Engineering Footer */}
        <footer className="border-t border-[#191b22] bg-[#090a0d] py-3 text-xs text-[#525866] font-mono">
          <div className="max-w-[1520px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>TaskForge DAG Engine v1.4.0</span>
              <span>•</span>
              <span>Stateless Consumer Group: <code className="text-[#8b949e]">taskforge-worker-v1</code></span>
            </div>
            <div className="flex items-center gap-4">
              <span>Host: Linux x86_64</span>
              <span>Port: 3000 (UI) &bull; 8080 (API)</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
