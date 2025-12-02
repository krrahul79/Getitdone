import React, { createContext, useContext, useState, useEffect } from "react";
import { SupabaseService } from "../services/supabaseService";
import { useProfile } from "./ProfileContext";

export type Task = {
  id: string | number;
  title: string;
  description?: string | null;
  group_id?: string | null;
  due_date?: string | null;
  is_complete?: boolean;
  created_by?: string | null;
  assignees?: string[];
};

const TaskContext = createContext<{
  tasks: Task[];
  refreshMyTasks: () => Promise<void>;
  loading: boolean;
}>({
  tasks: [],
  refreshMyTasks: async () => {},
  loading: false,
});

export const useTasks = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();

  const refreshMyTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await SupabaseService.getMyAssignedTasks();
      // If there's no auth session, don't treat it as an error to surface in logs
      if (error) {
        const errAny: any = error;
        const msg = (errAny && (errAny.message || String(errAny))) || "";
        if (
          String(msg).includes("AuthSessionMissing") ||
          String(msg).includes("Auth session missing")
        ) {
          // Not logged in yet - clear tasks silently
          setTasks([]);
          return;
        }
        console.error("[TaskProvider] Failed to load tasks:", error);
        setTasks([]);
        return;
      }
      setTasks(data || []);
    } catch (e) {
      console.error("[TaskProvider] Exception loading tasks:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load when we have an authenticated profile
    if (profile && profile.id) {
      refreshMyTasks();
    } else {
      // clear tasks when signed out
      setTasks([]);
    }
  }, [profile?.id]);

  return (
    <TaskContext.Provider value={{ tasks, refreshMyTasks, loading }}>
      {children}
    </TaskContext.Provider>
  );
};
