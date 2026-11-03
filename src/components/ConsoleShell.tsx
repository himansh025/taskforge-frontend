"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex-1 flex items-center justify-center bg-[#090a0d] p-4">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Operational Status Bar */}
        <header className="h-12 border-b border-[#1c1e24] bg-[#0c0d11]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 text-xs font-mono text-[#8b949e]">
          <div className="flex items-center gap-2">
            <span className="text-[#ededed]">TaskForge Console</span>
            <span className="text-[#525866]">/</span>
            <span>Workflow Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span className="text-[#ededed]">Cluster: Healthy</span>
            </div>
            <span className="text-[#2b2f3a]">•</span>
            <span>Port: 3000 (UI) &bull; 8080 (API)</span>
          </div>
        </header>

        {/* Primary View Area */}
        <main className="flex-1 p-6 max-w-[1520px] w-full mx-auto">
          {children}
        </main>

        {/* Subtle Technical Footer */}
        <footer className="border-t border-[#191b22] bg-[#090a0d] py-3 px-6 text-xs text-[#525866] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span>TaskForge Engine v1.4.0</span>
            <span>•</span>
            <span>Worker Group: <code className="text-[#8b949e]">taskforge-worker-v1</code></span>
          </div>
          <div>
            <span>Environment: Localhost Linux</span>
          </div>
        </footer>
      </div>
    </>
  );
}
