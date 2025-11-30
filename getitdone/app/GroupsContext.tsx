import React, { createContext, useContext, useState, useEffect } from "react";
import { SupabaseService } from "../services/supabaseService";
import { useProfile } from "./ProfileContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Member = {
  id: string;
  name?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
};

export type Group = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  members?: number;
  pendingTasks?: number;
  join_code?: string;
};

const STORAGE_KEY_PREFIX = "members:";
const MEMBERS_TTL_MS = 1000 * 60 * 5; // 5 minutes

const GroupsContext = createContext<{
  groups: Group[];
  refreshGroups: () => Promise<void>;
  addGroup: (group: Group) => void;
  // members cache API
  getMembersForGroup: (
    groupId: string,
    opts?: { force?: boolean }
  ) => Promise<Member[]>;
  refreshMembersForGroup: (groupId: string) => Promise<Member[]>;
  membersByGroup: Record<string, Member[]>;
}>({
  groups: [],
  refreshGroups: async () => {},
  addGroup: () => {},
  getMembersForGroup: async () => [],
  refreshMembersForGroup: async () => [],
  membersByGroup: {},
});

export const useGroups = () => useContext(GroupsContext);

export const GroupsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { profile } = useProfile();
  const [groups, setGroups] = useState<Group[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<
    Record<string, Member[]>
  >({});

  const saveMembersToStorage = async (groupId: string, members: Member[]) => {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEY_PREFIX}${groupId}`,
        JSON.stringify({ ts: Date.now(), members })
      );
    } catch (e) {
      // ignore storage failures
      console.warn("[GroupsProvider] Failed to save members to storage", e);
    }
  };

  const loadMembersFromStorage = async (groupId: string) => {
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${groupId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.ts || !parsed?.members) return null;
      if (Date.now() - parsed.ts > MEMBERS_TTL_MS) return null;
      return parsed.members as Member[];
    } catch (e) {
      return null;
    }
  };

  const refreshGroups = async () => {
    try {
      const { data, error } = await SupabaseService.getMyGroups();
      if (error) {
        console.error("[GroupsProvider] Failed to load groups:", error);
        setGroups([]);
        return;
      }
      const mapped = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        color: g.color,
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
      setMembersByGroup({});
    }
  }, [profile?.id]);

  const addGroup = (group: Group) => {
    setGroups((prev) => [group, ...prev]);
    // initialize empty members list for new group (can be updated later)
    setMembersByGroup((prev) => ({
      ...prev,
      [group.id]: prev[group.id] ?? [],
    }));
  };

  const fetchMembersFromServer = async (groupId: string) => {
    const res = await SupabaseService.getGroupWithMembers(groupId);
    if (res.error) throw res.error;
    const members = res.data?.members || [];
    return members as Member[];
  };

  const getMembersForGroup = async (
    groupId: string,
    opts: { force?: boolean } = { force: false }
  ) => {
    if (!groupId) return [];
    // return in-memory cache if present and not forcing
    if (
      !opts.force &&
      membersByGroup[groupId] &&
      membersByGroup[groupId].length
    ) {
      return membersByGroup[groupId];
    }

    // try loading from storage (stale-while-revalidate)
    if (!opts.force) {
      const fromStorage = await loadMembersFromStorage(groupId);
      if (fromStorage) {
        setMembersByGroup((prev) => ({ ...prev, [groupId]: fromStorage }));
        // continue to revalidate in background
        fetchMembersFromServer(groupId)
          .then((fresh) => {
            setMembersByGroup((prev) => ({ ...prev, [groupId]: fresh }));
            saveMembersToStorage(groupId, fresh);
          })
          .catch(() => {});
        return fromStorage;
      }
    }

    // fetch from server
    try {
      const fresh = await fetchMembersFromServer(groupId);
      setMembersByGroup((prev) => ({ ...prev, [groupId]: fresh }));
      saveMembersToStorage(groupId, fresh);
      return fresh;
    } catch (e) {
      console.error("[GroupsProvider] Failed to fetch members:", e);
      return membersByGroup[groupId] ?? [];
    }
  };

  const refreshMembersForGroup = async (groupId: string) => {
    return getMembersForGroup(groupId, { force: true });
  };

  // helpers for updating cache when membership changes
  const addMemberToGroup = (groupId: string, member: Member) => {
    setMembersByGroup((prev) => {
      const curr = prev[groupId] || [];
      const exists = curr.find((m) => m.id === member.id);
      if (exists) return prev;
      const updated = [member, ...curr];
      saveMembersToStorage(groupId, updated);
      return { ...prev, [groupId]: updated };
    });
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    setMembersByGroup((prev) => {
      const curr = prev[groupId] || [];
      const updated = curr.filter((m) => m.id !== memberId);
      saveMembersToStorage(groupId, updated);
      return { ...prev, [groupId]: updated };
    });
  };

  return (
    <GroupsContext.Provider
      value={{
        groups,
        refreshGroups,
        addGroup,
        getMembersForGroup,
        refreshMembersForGroup,
        membersByGroup,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};
