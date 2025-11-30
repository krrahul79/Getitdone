import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";

type Member = {
  id: string;
  name?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean;
};

type Task = {
  id: number | string;
  title: string;
  assignedTo: string[];
  dueDate: string;
  isComplete: boolean;
};

type GroupData = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  join_code?: string;
  members?: Member[];
};

export default function GroupTaskListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;
  const [activeTab, setActiveTab] = useState("todo");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [group, setGroup] = useState<GroupData | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!groupId) return;
      const res = await SupabaseService.getGroupWithMembers(groupId as string);
      if (res.error) {
        console.error("Failed to load group:", res.error);
        return;
      }
      const data = res.data;
      if (!data) return;
      // Combine group and members into a single object for UI
      setGroup({ ...data.group, members: data.members });
      // Optionally fetch tasks for the group here
    };
    load();
  }, [groupId]);

  const todoTasks = tasks.filter((t) => !t.isComplete);
  const completedTasks = tasks.filter((t) => t.isComplete);

  const handleBack = () => router.back();
  const handleInvite = () => alert("Invite modal would open.");
  const handleSettings = () =>
    router.push({ pathname: "/groups/[id]/settings", params: { id: groupId } });
  const handleAddTask = () =>
    router.push({ pathname: "/task/add", params: { groupId: groupId } });
  const handleSelectTask = (taskId: string | number) =>
    router.push({ pathname: "/task/[id]", params: { id: String(taskId) } });
  const handleToggleComplete = (taskId: string | number) => {
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(taskId)
          ? { ...t, isComplete: !t.isComplete }
          : t
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={handleBack} style={styles.headerIconBtn}>
          <Ionicons name="chevron-back" size={26} color="#6b7280" />
        </Pressable>
        <Text style={styles.headerTitle}>Group Tasks</Text>
        <View style={{ width: 32 }} />
      </View>
      {/* Group Card */}
      <View style={styles.groupCard}>
        <Text style={styles.groupName}>{group?.name ?? "Group"}</Text>
        <Text style={styles.membersLabel}>Members</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.membersRow}
        >
          {(group?.members || []).map((m: Member) => (
            <View key={m.id} style={styles.memberCol}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {m.name ? m.name.charAt(0) : "?"}
                </Text>
              </View>
              <Text style={styles.memberName}>{m.name || "Unknown"}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.memberCol} onPress={handleInvite}>
            <View style={styles.memberAvatarInvite}>
              <Ionicons name="add" size={22} color="#6b7280" />
            </View>
            <Text style={styles.memberName}>Invite</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.groupActionsRow}>
          <TouchableOpacity style={styles.settingsBtn} onPress={handleSettings}>
            <FontAwesome5
              name="cog"
              size={18}
              color="#374151"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.settingsBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "todo" && styles.tabBtnActive]}
          onPress={() => setActiveTab("todo")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "todo" && styles.tabTextActive,
            ]}
          >
            To-Do ({todoTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "completed" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.tabTextActive,
            ]}
          >
            Completed ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>
      {/* Task List */}
      <ScrollView
        style={styles.taskList}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {(activeTab === "todo" ? todoTasks : completedTasks).map(
          (task: Task) => {
            const assignee =
              (group?.members || []).find((m) => m.id === task.assignedTo[0])
                ?.name || "Unassigned";
            return (
              <TouchableOpacity
                key={String(task.id)}
                style={styles.taskCard}
                onPress={() => handleSelectTask(task.id)}
                activeOpacity={0.85}
              >
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(task.id);
                  }}
                  style={{ marginRight: 12 }}
                >
                  <Ionicons
                    name={
                      task.isComplete ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={26}
                    color={task.isComplete ? "#22c55e" : "#d1d5db"}
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.isComplete && styles.taskTitleComplete,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskMeta}>
                    Due:{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    <Text style={{ marginHorizontal: 6 }}> · </Text>
                    {assignee}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#d1d5db" />
              </TouchableOpacity>
            );
          }
        )}
        {activeTab === "todo" && todoTasks.length === 0 && (
          <Text style={styles.emptyText}>No pending tasks. All done! 🎉</Text>
        )}
        {activeTab === "completed" && completedTasks.length === 0 && (
          <Text style={styles.emptyText}>No completed tasks yet.</Text>
        )}
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTask}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerIconBtn: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  groupCard: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  groupName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 10,
  },
  membersLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 6,
  },
  membersRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  memberCol: {
    alignItems: "center",
    marginRight: 16,
    width: 56,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 20,
  },
  memberAvatarInvite: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
    textAlign: "center",
  },
  groupActionsRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  settingsBtnText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginHorizontal: 20,
    marginBottom: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#2563eb",
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  taskTitleComplete: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  taskMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 50,
  },
});
