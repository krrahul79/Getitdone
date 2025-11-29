import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SupabaseService } from "../services/supabaseService";
import { useProfile } from "./ProfileContext";

interface Task {
  id: number;
  title: string;
  groupName: string;
  dueDate: string;
  isComplete: boolean;
}

const { width } = Dimensions.get("window");

function getRelativeDate(dateStr: string) {
  const today = new Date("2025-11-03");
  const date = new Date(dateStr);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HomeScreen() {
  const { profile } = useProfile();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchUserNameAndTasks = async () => {
      try {
        // Fetch user's groups
        const groupsRes = await SupabaseService.getMyGroups();
        const firstGroup =
          groupsRes.data && groupsRes.data.length > 0
            ? groupsRes.data[0]
            : null;
        if (firstGroup) {
          setGroupId(firstGroup.id);
          // Fetch tasks for the first group
          const fetchedTasks = await SupabaseService.getGroupTasks(
            firstGroup.id
          );
          // Map Supabase fields to local Task type
          const mappedTasks = (fetchedTasks.data || []).map((task: any) => ({
            id: task.id,
            title: task.title,
            groupName: firstGroup.name,
            dueDate: task.due_date,
            isComplete: task.status === "complete",
          }));
          setTasks(mappedTasks);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      }
    };
    fetchUserNameAndTasks();
  }, []);

  const handleToggleComplete = async (taskId: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const newStatus = task.isComplete ? "incomplete" : "complete";
      // Update status in Supabase
      await SupabaseService.updateTaskStatus(taskId, newStatus);
      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, isComplete: !t.isComplete } : t
        )
      );
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  };

  const incompleteTasks = tasks.filter((t) => !t.isComplete);
  const completeTasks = tasks.filter((t) => t.isComplete);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerWelcome}>Welcome back,</Text>
          <Text style={styles.headerName}>{profile?.full_name || ""}</Text>
        </View>
        <Pressable
          style={styles.headerAvatar}
          onPress={() => router.replace("/tabs/profile")}
        >
          <FontAwesome name="user" size={28} color="#6b7280" />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>You have</Text>
          <Text style={styles.summaryCount}>
            {incompleteTasks.length}{" "}
            {incompleteTasks.length === 1 ? "task" : "tasks"}
          </Text>
          <Text style={styles.summarySub}>pending for this week.</Text>
        </View>
        {/* Task List */}
        <View style={styles.tasksSection}>
          <Text style={styles.tasksTitle}>Your Tasks</Text>
          {incompleteTasks.length === 0 && completeTasks.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <FontAwesome
                name="smile-o"
                size={64}
                color="#93c5fd"
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyStateTitle}>No tasks yet!</Text>
              <Text style={styles.emptyStateText}>
                Enjoy your free time or add a new task to get started.
              </Text>
              <Pressable
                style={styles.emptyStateButton}
                onPress={() => router.push("/task/add")}
              >
                <Text style={styles.emptyStateButtonText}>Add Task</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {incompleteTasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <Pressable onPress={() => handleToggleComplete(task.id)}>
                    <FontAwesome
                      name={task.isComplete ? "check-circle" : "circle"}
                      size={24}
                      color={task.isComplete ? "#10b981" : "#d1d5db"}
                      style={{ marginRight: 12 }}
                    />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/task/[id]",
                          params: { id: task.id },
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.taskTitle,
                          task.isComplete && styles.taskTitleComplete,
                        ]}
                      >
                        {task.title}
                      </Text>
                    </Pressable>
                    <Text style={styles.taskGroup}>{task.groupName}</Text>
                  </View>
                  <Text
                    style={[
                      styles.taskDue,
                      getRelativeDate(task.dueDate) === "Today" &&
                        styles.taskDueToday,
                    ]}
                  >
                    {getRelativeDate(task.dueDate)}
                  </Text>
                </View>
              ))}
              {completeTasks.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={styles.completedTitle}>Completed</Text>
                    <Pressable
                      onPress={() =>
                        setTasks((prev) => prev.filter((t) => !t.isComplete))
                      }
                    >
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </Pressable>
                  </View>
                  {completeTasks.map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Pressable onPress={() => handleToggleComplete(task.id)}>
                        <FontAwesome
                          name={task.isComplete ? "check-circle" : "circle"}
                          size={24}
                          color={task.isComplete ? "#10b981" : "#d1d5db"}
                          style={{ marginRight: 12 }}
                        />
                      </Pressable>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.taskTitle, styles.taskTitleComplete]}
                        >
                          {task.title}
                        </Text>
                        <Text style={styles.taskGroup}>{task.groupName}</Text>
                      </View>
                      <Text style={styles.taskDue}>
                        {getRelativeDate(task.dueDate)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button */}
      {(incompleteTasks.length > 0 || completeTasks.length > 0) && (
        <Pressable style={styles.fab} onPress={() => router.push("/task/add")}>
          <FontAwesome name="plus" size={32} color="#fff" />
        </Pressable>
      )}
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <FontAwesome name="home" size={24} color="#2563eb" />
          <Text style={styles.navTextActive}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <FontAwesome name="users" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Groups</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <FontAwesome name="pie-chart" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Activity</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <FontAwesome name="user" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // bg-gray-100
  },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  headerWelcome: {
    fontSize: 14,
    color: "#6b7280",
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#2563eb",
    margin: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  summaryText: {
    color: "#dbeafe",
    fontSize: 16,
    fontWeight: "400",
  },
  summaryCount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginVertical: 4,
  },
  summarySub: {
    color: "#93c5fd",
    fontSize: 16,
    fontWeight: "500",
  },
  tasksSection: {
    paddingHorizontal: 20,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1f2937",
  },
  taskTitleComplete: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  taskGroup: {
    fontSize: 13,
    color: "#6b7280",
  },
  taskDue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  taskDueToday: {
    color: "#ef4444",
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 112,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 5,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "700",
    marginTop: 2,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  emptyStateButton: {
    backgroundColor: "#2563eb",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
