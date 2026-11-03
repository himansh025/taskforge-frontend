import type { Metadata } from "next";
import "./globals.css";
import ConsoleShell from "@/components/ConsoleShell";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

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
      <body className="min-h-screen bg-[#090a0d] text-[#ededed] antialiased selection:bg-[#2e323e] selection:text-white flex">
        <WorkspaceProvider>
          <ConsoleShell>{children}</ConsoleShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
