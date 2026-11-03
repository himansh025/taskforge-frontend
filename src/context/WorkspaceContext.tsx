"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdBy?: string;
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
  id?: string;
  name: string;
  email: string;
  role: string;
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
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (displayName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [telemetry, setTelemetry] = useState<ClusterTelemetry | null>(defaultTelemetry);
  const [workflowCount, setWorkflowCount] = useState<number>(1);

  // Restore session from localStorage on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("taskforge_token");
      const savedUserStr = localStorage.getItem("taskforge_user");
      if (savedToken) {
        setToken(savedToken);
      }
      if (savedUserStr) {
        try {
          setCurrentUser(JSON.parse(savedUserStr));
        } catch (e) {}
      } else {
        // Default operator session if none exists
        setCurrentUser({
          name: "Himanshu Singh",
          email: "himanshu@taskforge.dev",
          role: "Workspace Owner",
        });
      }
    }
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoadingWorkspaces(true);
      const headers: Record<string, string> = {};
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("taskforge_token") : null);
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/v1/workspaces", { headers });
      if (res.ok) {
        const data: Workspace[] = await res.json();
        setWorkspaces(data);

        const savedId = typeof window !== "undefined" ? localStorage.getItem("taskforge_active_workspace") : null;
        const matched = data.find((w) => w.id === savedId) || data[0];

        if (matched) {
          setCurrentWorkspace(matched);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch workspaces from API:", e);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, [token]);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/system/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {}
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
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("taskforge_token") : null);
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers,
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.message || "Invalid email or password" };
      }

      const data = await res.json();
      const userProfile: UserProfile = {
        id: data.userId,
        name: data.displayName || email.split("@")[0],
        email: data.email,
        role: "Workspace Owner",
      };

      setToken(data.token);
      setCurrentUser(userProfile);

      if (typeof window !== "undefined") {
        localStorage.setItem("taskforge_token", data.token);
        localStorage.setItem("taskforge_user", JSON.stringify(userProfile));
        if (data.defaultWorkspaceId) {
          localStorage.setItem("taskforge_active_workspace", data.defaultWorkspaceId);
        }
      }

      await fetchWorkspaces();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error during login" };
    }
  };

  const register = async (displayName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.message || "Registration failed. Email may already be in use." };
      }

      const data = await res.json();
      const userProfile: UserProfile = {
        id: data.userId,
        name: data.displayName,
        email: data.email,
        role: "Workspace Owner",
      };

      setToken(data.token);
      setCurrentUser(userProfile);

      if (typeof window !== "undefined") {
        localStorage.setItem("taskforge_token", data.token);
        localStorage.setItem("taskforge_user", JSON.stringify(userProfile));
        if (data.defaultWorkspaceId) {
          localStorage.setItem("taskforge_active_workspace", data.defaultWorkspaceId);
        }
      }

      await fetchWorkspaces();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error during registration" };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("taskforge_token");
      localStorage.removeItem("taskforge_user");
      localStorage.removeItem("taskforge_active_workspace");
    }
    fetchWorkspaces();
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
        isAuthenticated: !!token || !!currentUser,
        token,
        login,
        register,
        logout,
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
