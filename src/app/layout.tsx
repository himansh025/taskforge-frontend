import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskForge — Enterprise Workflow Automation",
  description: "Distributed workflow automation platform with visual DAG builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                TF
              </div>
              <div>
                <span className="font-semibold text-lg text-white">TaskForge</span>
                <span className="ml-2 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-full font-mono">v0.1.0</span>
              </div>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
              <a href="/" className="hover:text-white transition">Workflows</a>
              <a href="/executions" className="hover:text-white transition">Executions</a>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">Workspace: Default (finance-ops)</span>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
