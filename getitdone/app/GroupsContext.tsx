import React, { createContext, useContext, useState, useEffect } from "react";
import { SupabaseService } from "../services/supabaseService";
import { useProfile } from "./ProfileContext";

export type Group = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  members?: number;
  pendingTasks?: number;
  join_code?: string;
};

const GroupsContext = createContext<{
  groups: Group[];
  refreshGroups: () => Promise<void>;
  addGroup: (group: Group) => void;
}>({ groups: [], refreshGroups: async () => {}, addGroup: () => {} });

export const useGroups = () => useContext(GroupsContext);

export const GroupsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { profile } = useProfile();
  const [groups, setGroups] = useState<Group[]>([]);

  const refreshGroups = async () => {
    if (!profile || !profile.id) {
      setGroups([]);
      return;
    }
    try {
      const { data, error } = await SupabaseService.getMyGroups();
      if (error) {
        console.error("[GroupsProvider] Failed to load groups:", error);
        setGroups([]);
        return;
      }
      // Map Supabase rows into our Group shape
      const mapped = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        color: g.color,
        // optional: compute members/pendingTasks if available
        members:
          g._count?.members ?? (g.group_members ? g.group_members.length : 0),
        pendingTasks: g.pending_tasks_count ?? 0,
        join_code: g.join_code,
      }));
      setGroups(mapped);
    } catch (e) {
      console.error("[GroupsProvider] Exception loading groups:", e);
      setGroups([]);
    }
  };

  useEffect(() => {
    // Refresh groups when profile becomes available or changes
    if (profile && profile.id) {
      refreshGroups();
    } else {
      setGroups([]);
    }
  }, [profile?.id]);

  const addGroup = (group: Group) => {
    setGroups((prev) => [group, ...prev]);
  };

  return (
    <GroupsContext.Provider value={{ groups, refreshGroups, addGroup }}>
      {children}
    </GroupsContext.Provider>
  );
};
