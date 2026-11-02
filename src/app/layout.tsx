import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Zap, GitMerge, Layers, HardDrive, CheckCircle2, ChevronDown, User, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "TaskForge — Distributed Workflow Orchestration Platform",
  description: "Enterprise event-driven workflow automation platform powered by Kafka, DAG Orchestrator, Redis Pub/Sub, and MinIO S3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Navigation Bar */}
        <header className="border-b border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Brand & Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition">
                  <Zap className="w-5 h-5 fill-white text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">TaskForge</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                    Enterprise
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-2"
                >
                  <GitMerge className="w-4 h-4 text-indigo-400" />
                  Workflows
                </Link>
                <Link
                  href="/executions"
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Executions
                </Link>
                <a
                  href="http://localhost:9001"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-2"
                >
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  MinIO S3
                </a>
                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-sky-400" />
                  Mailpit
                </a>
              </nav>
            </div>

            {/* Right: Cluster Status, Workspace & Profile */}
            <div className="flex items-center gap-3">
              {/* Cluster Health Pill */}
              <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300">Cluster: Healthy</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Kafka + Redis</span>
              </div>

              {/* Workspace Badge */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs transition cursor-default">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="font-medium text-slate-200">finance-ops</span>
                <span className="text-[10px] text-slate-400 font-mono">e7c051b5</span>
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-xs text-white border border-indigo-400/30 shadow-sm">
                  HS
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
