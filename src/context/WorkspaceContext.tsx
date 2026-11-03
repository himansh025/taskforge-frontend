"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClusterTelemetry {
  status: string;
  kafka: {
    status: string;
    partition: number;
    lag: number;
    consumerGroup: string;
  };
  redis: {
    status: string;
    pingMs: number;
    channel: string;
  };
  minio: {
    status: string;
    bucket: string;
  };
  workers: {
    status: string;
    replicas: number;
    concurrency?: number;
  };
  timestamp?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoadingWorkspaces: boolean;
  switchWorkspace: (id: string) => void;
  createWorkspace: (name: string, slug?: string) => Promise<Workspace | null>;
  telemetry: ClusterTelemetry | null;
  workflowCount: number;
  setWorkflowCount: (count: number) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  refreshWorkspaces: () => Promise<void>;
}

const defaultTelemetry: ClusterTelemetry = {
  status: "HEALTHY",
  kafka: { status: "UP", partition: 0, lag: 0, consumerGroup: "taskforge-worker-v1" },
  redis: { status: "UP", pingMs: 1, channel: "execution-events" },
  minio: { status: "UP", bucket: "taskforge-artifacts" },
  workers: { status: "ACTIVE", replicas: 3 },
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [telemetry, setTelemetry] = useState<ClusterTelemetry | null>(defaultTelemetry);
  const [workflowCount, setWorkflowCount] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: "Himanshu Singh",
    role: "Lead Engineer",
    email: "himanshudeolia0825@gmail.com",
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoadingWorkspaces(true);
      const res = await fetch("/api/v1/workspaces");
      if (res.ok) {
        const data: Workspace[] = await res.json();
        setWorkspaces(data);

        // Check if there is a saved workspace ID in localStorage
        const savedId = typeof window !== "undefined" ? localStorage.getItem("taskforge_active_workspace") : null;
        const matched = data.find((w) => w.id === savedId) || data.find((w) => w.slug === "finance-team") || data[0];

        if (matched) {
          setCurrentWorkspace(matched);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch workspaces from API:", e);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, []);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/system/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      // Fallback to active defaults
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, [fetchWorkspaces, fetchTelemetry]);

  const switchWorkspace = (id: string) => {
    const target = workspaces.find((w) => w.id === id);
    if (target) {
      setCurrentWorkspace(target);
      if (typeof window !== "undefined") {
        localStorage.setItem("taskforge_active_workspace", target.id);
      }
    }
  };

  const createWorkspace = async (name: string, slug?: string): Promise<Workspace | null> => {
    try {
      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (res.ok) {
        const created: Workspace = await res.json();
        await fetchWorkspaces();
        switchWorkspace(created.id);
        return created;
      }
    } catch (e) {
      console.error("Create workspace failed:", e);
    }
    return null;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        isLoadingWorkspaces,
        switchWorkspace,
        createWorkspace,
        telemetry,
        workflowCount,
        setWorkflowCount,
        currentUser,
        setCurrentUser,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
