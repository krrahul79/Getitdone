import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SupabaseService } from "../../services/supabaseService";
import { useTasks } from "../TaskContext";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { refreshMyTasks } = useTasks();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await SupabaseService.getTask(id as string);
      if (error) {
        console.error("Error fetching task:", error);
      } else {
        setTask(data);
        setIsComplete(data.is_completed);
      }
    } catch (err) {
      console.error("Exception fetching task:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTaskDetails();
    setRefreshing(false);
  };

  const handleToggleComplete = async () => {
    // Optimistic UI update
    const newStatus = !isComplete;
    setIsComplete(newStatus);

    // Call API
    try {
      await SupabaseService.updateTaskStatus(task.id, newStatus);
      refreshMyTasks(); // Refresh global task state if needed
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setIsComplete(!newStatus);
      Alert.alert("Error", "Failed to update task status.");
    }
  };

  const handleReschedule = () => {
    // TODO: Implement date picker logic similar to add task
    Alert.alert("Feature coming soon", "Rescheduling will be available soon.");
  };

  const handleEdit = () => {
    router.push({ pathname: "/task/[id]/edit", params: { id: task.id } });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement delete in SupabaseService if not exists, for now just logic placeholder
            // await SupabaseService.deleteTask(task.id);
            // refreshMyTasks();
            // router.back();
            Alert.alert("Not Implemented", "Delete functionality is coming soon.");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Task not found.</Text>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color="#6b7280" />
          <Text style={styles.closeBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerIconBtn}>
          <FontAwesome name="chevron-left" size={24} color="#6b7280" />
        </Pressable>
        <Text style={styles.headerTitle}>Task Details</Text>
        <Pressable onPress={handleEdit} style={styles.headerEditBtn}>
          <Text style={styles.headerEditText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroRow}>
            <Pressable
              onPress={handleToggleComplete}
              style={{ marginRight: 16 }}
            >
              <FontAwesome
                name={isComplete ? "check-circle" : "circle-thin"}
                size={36}
                color={isComplete ? "#10b981" : "#d1d5db"}
              />
            </Pressable>
            <Text
              style={[styles.heroTitle, isComplete && styles.heroTitleComplete]}
            >
              {task.title}
            </Text>
          </View>
          <Pressable style={styles.rescheduleBtn} onPress={handleReschedule}>
            <FontAwesome
              name="clock-o"
              size={18}
              color="#2563eb"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.rescheduleBtnText}>Reschedule</Text>
          </Pressable>
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <DetailItem
            icon="align-left"
            label="Description"
            value={task.description || "No description provided."}
          />
          <DetailItem
            icon="calendar"
            label="Due Date"
            value={
              task.due_date
                ? new Date(task.due_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No due date"
            }
          />
          <DetailItem
            icon="group"
            label="Group"
            value={task.groupName || "Personal"}
          />
          {task.assignee_profiles && task.assignee_profiles.length > 0 && (
            <AssigneeItem assignees={task.assignee_profiles} />
          )}
          {/* Created by could be added here if needed, but often redundant if self */}
        </View>

        {/* Footer Delete Button */}
        <View style={styles.footerDeleteRow}>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <FontAwesome
              name="trash"
              size={18}
              color="#ef4444"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.deleteBtnText}>Delete Task</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <FontAwesome
        name={icon as any}
        size={20}
        color="#9ca3af"
        style={styles.detailIcon}
      />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function AssigneeItem({
  assignees,
}: {
  assignees: { id: string; full_name: string; avatar_url: string | null }[];
}) {
  return (
    <View style={styles.detailItem}>
      <FontAwesome
        name="users"
        size={20}
        color="#9ca3af"
        style={styles.detailIcon}
      />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>Assigned To</Text>
        <View style={styles.assigneeList}>
          {assignees.map((user, idx) => (
            <View key={user.id || idx} style={styles.assigneeChip}>
              <Text style={styles.assigneeChipText}>
                {user.full_name || "Unknown"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    marginBottom: 20,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  closeBtnText: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 16,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerEditBtn: {
    padding: 4,
  },
  headerEditText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 15,
  },
  heroSection: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    lineHeight: 32,
  },
  heroTitleComplete: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  rescheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  rescheduleBtnText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 16,
  },
  detailsContainer: {
    padding: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    // shadowing
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailIcon: {
    width: 24,
    textAlign: "center",
    marginTop: 2,
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    lineHeight: 22,
  },
  assigneeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  assigneeChip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  assigneeChipText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  footerDeleteRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 16,
  },
});
