import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";
import type { Group, UserProfile, Task } from "../../services/types";
import { useTasks } from "../TaskContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "../../context/ToastContext";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, refreshMyTasks } = useTasks();
  const { showToast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "members">("tasks");

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await SupabaseService.getGroupWithMembers(
        id as string
      );
      if (error) {
        console.error("Error fetching group details:", error);
      } else if (data) {
        setGroup(data.group);
        setMembers(data.members || []);
      }
    } catch (e) {
      console.error("Exception fetching group details:", e);
    } finally {
      setLoading(false);
    }
  };

  const groupTasks = tasks.filter((t) => t.group_id === id);
  const incompleteTasks = groupTasks.filter((t) => !t.is_completed);
  const completedTasks = groupTasks.filter((t) => t.is_completed);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    // Optimistic update
    // In a real app, we'd update local state first.
    // For now, we'll just call the service and refresh.
    await SupabaseService.updateTaskStatus(taskId, !currentStatus);
    refreshMyTasks();
    // Optional: showToast("Success", "Task status updated", "success");
    // (Keeping it silent for quick checking is often better, but adding error handling is key)
  };

  const handleInvite = async () => {
    if (!group?.join_code) return;
    try {
      await Share.share({
        message: `Join my group "${group.name}" on GetItDone! Use code: ${group.join_code}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      showToast("Error", "Failed to share invite code", "error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[group.color || COLORS.primary, COLORS.background]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleInvite}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.groupInfo}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name={group.icon || "users"} size={40} color={group.color || COLORS.primary} />
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Code:</Text>
            <Text style={styles.codeValue}>{group.join_code}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "tasks" && styles.activeTab]}
            onPress={() => setActiveTab("tasks")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "tasks" && styles.activeTabText,
              ]}
            >
              Tasks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "members" && styles.activeTab]}
            onPress={() => setActiveTab("members")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "members" && styles.activeTabText,
              ]}
            >
              Members
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === "tasks" ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>To Do</Text>
                <TouchableOpacity
                  style={styles.addTaskBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/task/add",
                      params: { groupId: group.id },
                    })
                  }
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addTaskText}>Add Task</Text>
                </TouchableOpacity>
              </View>

              {incompleteTasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No pending tasks</Text>
                </View>
              ) : (
                incompleteTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => router.push(`/task/${task.id}`)}
                  >
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => handleToggleTask(task.id, task.is_completed)}
                    >
                      <Ionicons name="ellipse-outline" size={24} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      {task.due_date && (
                        <Text style={styles.taskDate}>
                          Due {new Date(task.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Text>
                      )}
                      <View style={styles.assigneesRow}>
                        {task.assignee_profiles?.map((p: UserProfile, i: number) => (
                          <View key={i} style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                            <Text style={styles.miniAvatarText}>
                              {p.full_name?.[0]}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}

              {completedTasks.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
                    Completed
                  </Text>
                  {completedTasks.map((task) => (
                    <View key={task.id} style={[styles.taskCard, styles.completedCard]}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => handleToggleTask(task.id, task.is_completed)}
                      >
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                      </TouchableOpacity>
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, styles.completedText]}>
                          {task.title}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <View style={styles.membersList}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.full_name?.[0] || "?"}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.full_name}</Text>
                    <Text style={styles.memberRole}>
                      {member.id === group.created_by ? "Admin" : "Member"}
                    </Text>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity style={styles.inviteCard} onPress={handleInvite}>
                <View style={styles.inviteIcon}>
                  <Ionicons name="person-add" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.inviteText}>Invite new member</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerActions: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  actionBtn: {
    padding: SPACING.xs,
  },
  groupInfo: {
    alignItems: "center",
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
    ...SHADOWS.medium,
  },
  groupName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text, // Changed to dark text as it sits on lighter part of gradient/bg
    marginBottom: SPACING.xs,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: SPACING.m,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  codeLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  codeValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    marginRight: SPACING.xl,
    paddingBottom: SPACING.s,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  content: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
    marginTop: SPACING.s,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  addTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  addTaskText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.s,
    ...SHADOWS.small,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: COLORS.inputBg,
  },
  checkbox: {
    marginRight: SPACING.m,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
  taskDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 4,
  },
  assigneesRow: {
    flexDirection: "row",
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  miniAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  membersList: {
    gap: SPACING.m,
    marginTop: SPACING.s,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    ...SHADOWS.small,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  memberAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  memberRole: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  inviteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  inviteText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
});
