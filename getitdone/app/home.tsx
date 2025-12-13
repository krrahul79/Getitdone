import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SupabaseService } from "../services/supabaseService";
import { useProfile } from "./ProfileContext"; // In the same directory
import { useTasks } from "./TaskContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";



const { width } = Dimensions.get("window");

function getRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = compareDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days, ${timeStr}`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HomeScreen() {
  const { profile } = useProfile();
   const { tasks, refreshMyTasks } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Tasks are already loaded by Context, but we allow manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMyTasks();
    setRefreshing(false);
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const newStatus = !task.is_completed;
      
      // We rely on Context to update UI after service call or optimistic updates could be handled in Context.
      // For now, we call service and then refresh to be safe, or just call service if Context subscribes.
      // Ideally, updateTaskStatus should be wrapped in context or we just refresh.
      await SupabaseService.updateTaskStatus(taskId, newStatus);
      refreshMyTasks(); 
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  };

  const incompleteTasks = tasks.filter((t) => !t.is_completed);
  const completeTasks = tasks.filter((t) => t.is_completed);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerWelcome}>Welcome back,</Text>
            <Text style={styles.headerName}>{profile?.full_name || "Guest"}</Text>
          </View>
          <Pressable
            style={styles.headerAvatar}
            onPress={() => router.push("/tabs/profile")}
          >
            <Text style={styles.headerAvatarText}>
                {profile?.full_name?.[0] || "?"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        >
          {/* Summary Card - Glassmorphismish look */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
                <View>
                    <Text style={styles.summaryLabel}>Pending Tasks</Text>
                    <Text style={styles.summaryCount}>
                        {incompleteTasks.length}
                    </Text>
                </View>
                <View style={styles.summaryIconContainer}>
                    <Ionicons name="time" size={32} color={COLORS.primary} />
                </View>
            </View>
            <Text style={styles.summarySub}>
                {incompleteTasks.length > 0 
                  ? "Keep up the momentum!" 
                  : "All caught up! 🎉"}
            </Text>
          </View>

          {/* Task List */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Your Tasks</Text>
            
            {incompleteTasks.length === 0 && completeTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={64}
                  color="#cbd5e1"
                  style={{ marginBottom: 16 }}
                />
                <Text style={styles.emptyStateTitle}>No tasks yet</Text>
                <Text style={styles.emptyStateText}>
                  Add a task to get started on your journey!
                </Text>
              </View>
            ) : (
              <>
                {incompleteTasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <Pressable
                        style={styles.checkboxArea}
                        onPress={() => handleToggleComplete(task.id)}
                    >
                      <Ionicons
                        name={task.is_completed ? "checkmark-circle" : "ellipse-outline"}
                        size={28}
                        color={task.is_completed ? COLORS.success : COLORS.textTertiary}
                      />
                    </Pressable>
                    
                    <Pressable 
                        style={styles.taskContent}
                        onPress={() =>
                          router.push({
                            pathname: "/task/[id]",
                            params: { id: task.id },
                          })
                        }
                    >
                        <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                        <View style={styles.taskMetaRow}>
                            <View style={styles.groupBadge}>
                                <Text style={styles.groupBadgeText}>{task.groupName || "Group"}</Text>
                            </View>
                            {task.due_date && (
                                <Text style={[
                                    styles.taskDue,
                                    getRelativeDate(task.due_date).includes("Today") && styles.taskDueUrgent
                                ]}>
                                    {getRelativeDate(task.due_date)}
                                </Text>
                            )}
                        </View>
                    </Pressable>
                  </View>
                ))}

                {completeTasks.length > 0 && (
                  <View style={styles.completedSection}>
                    <Text style={styles.completedHeader}>Completed</Text>
                    {completeTasks.map((task) => (
                      <View key={task.id} style={[styles.taskCard, styles.completedCard]}>
                        <Pressable
                            style={styles.checkboxArea}
                            onPress={() => handleToggleComplete(task.id)}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={28}
                            color={COLORS.success}
                          />
                        </Pressable>
                        <View style={styles.taskContent}>
                           <Text style={[styles.taskTitle, styles.completedText]}>
                                {task.title}
                           </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Button */}
      <Pressable 
        style={styles.fab} 
        onPress={() => router.push("/task/add")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200, // Reduced height to prevent text overlap
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    paddingBottom: SPACING.l,
  },
  headerWelcome: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  headerName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: "#fff",
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#fff",
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: SPACING.l,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  summaryLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryCount: {
    fontFamily: FONTS.extraBold,
    fontSize: 42,
    color: COLORS.text,
    lineHeight: 48,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  summarySub: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.success,
  },
  tasksSection: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.m,
    marginTop: SPACING.s, 
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.m,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    marginBottom: SPACING.s, // 8
    ...SHADOWS.small,
  },
  checkboxArea: {
    marginRight: SPACING.m,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6,
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  taskDue: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  taskDueUrgent: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
  },
  completedSection: {
    marginTop: SPACING.l,
  },
  completedHeader: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.m,
  },
  completedCard: {
      opacity: 0.7,
      backgroundColor: "#f8fafc",
      shadowOpacity: 0
  },
  completedText: {
      textDecorationLine: "line-through",
      color: COLORS.textSecondary
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.large,
    shadowColor: COLORS.primary, // Glow effect
  },
});
