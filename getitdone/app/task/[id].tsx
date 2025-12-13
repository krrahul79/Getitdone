import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SupabaseService } from "../../services/supabaseService";
import { useTasks } from "../TaskContext";
import { useToast } from "../../context/ToastContext";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { refreshMyTasks } = useTasks();
  const { showToast } = useToast();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Reschedule State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchTaskDetails();
      }
    }, [id])
  );

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
      showToast("Error", "Failed to update task status.", "error");
    }
  };

  const handleReschedule = () => {
    const start = task.due_date ? new Date(task.due_date) : new Date();
    setTempDate(start);
    setIsRescheduling(true);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const cancelReschedule = () => {
    setIsRescheduling(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const saveReschedule = async () => {
    setLoading(true);
    try {
      const { data, error } = await SupabaseService.rescheduleTask(
        task.id,
        tempDate.toISOString()
      );
      if (error) throw error;
      setTask(data);
      showToast("Success", "Task rescheduled.", "success");
      setIsRescheduling(false);
      refreshMyTasks();
    } catch (e) {
      console.error("Reschedule Error:", e);
      showToast("Error", "Failed to reschedule task.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const currentDate = new Date(tempDate);
      currentDate.setFullYear(selectedDate.getFullYear());
      currentDate.setMonth(selectedDate.getMonth());
      currentDate.setDate(selectedDate.getDate());
      setTempDate(currentDate);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
        setShowTimePicker(false);
    }
    if (selectedDate) {
      const currentDate = new Date(tempDate);
      currentDate.setHours(selectedDate.getHours());
      currentDate.setMinutes(selectedDate.getMinutes());
      setTempDate(currentDate);
    }
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
            try {
              const { error } = await SupabaseService.deleteTask(task.id);
              if (error) throw error;
              
              showToast("Success", "Task deleted successfully.", "success");
              refreshMyTasks(); // Refresh list on home/group screen
              router.back();
            } catch (e) {
              console.error("Delete error:", e);
              showToast("Error", "Failed to delete task.", "error");
            }
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
          {!isRescheduling ? (
            <Pressable style={styles.rescheduleBtn} onPress={handleReschedule}>
              <FontAwesome
                name="clock-o"
                size={18}
                color="#2563eb"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </Pressable>
          ) : (
            <View style={styles.rescheduleContainer}>
                <Text style={styles.rescheduleLabel}>Pick a new due date:</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    showDatePicker && styles.activeDateButton,
                  ]}
                  onPress={() => {
                    setShowTimePicker(false);
                    setShowDatePicker(!showDatePicker);
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={showDatePicker ? COLORS.primary : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      showDatePicker && styles.activeDateText,
                    ]}
                  >
                    {tempDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    showTimePicker && styles.activeDateButton,
                  ]}
                  onPress={() => {
                    setShowDatePicker(false);
                    setShowTimePicker(!showTimePicker);
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={showTimePicker ? COLORS.primary : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      showTimePicker && styles.activeDateText,
                    ]}
                  >
                    {tempDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {(showDatePicker || showTimePicker) && (
                <View style={styles.pickerContainer}>
                  {showDatePicker && (
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      onChange={onDateChange}
                      minimumDate={new Date()}
                      accentColor={COLORS.primary}
                      textColor={COLORS.text}
                      themeVariant="light"
                    />
                  )}

                  {showTimePicker && (
                    <DateTimePicker
                      value={tempDate}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={onTimeChange}
                      accentColor={COLORS.primary}
                      textColor={COLORS.text}
                      themeVariant="light"
                    />
                  )}
                </View>
              )}

              <View style={styles.rescheduleActions}>
                  <Pressable style={styles.cancelActionBtn} onPress={cancelReschedule}>
                      <Text style={styles.cancelActionText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.saveActionBtn} onPress={saveReschedule}>
                      <Text style={styles.saveActionText}>Save Changes</Text>
                  </Pressable>
              </View>
            </View>
          )}
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
                ? new Date(task.due_date).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
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
    paddingHorizontal: 16, // Reduced from 20 to give more room
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
  rescheduleContainer: {
      marginTop: 12,
      backgroundColor: "#f9fafb",
      padding: 8, // Reduced from 12
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e5e7eb"
  },
  rescheduleLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      marginBottom: 8
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
    shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
  },
  activeDateButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.inputBg,
  },
  activeDateText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 0, // Removed horizontal padding
    alignItems: "center", // Center the picker
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    // SHADOWS.small
    shadowColor: "#000",
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  rescheduleActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
      gap: 12
  },
  cancelActionBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
  },
  cancelActionText: {
      color: "#6b7280",
      fontWeight: "600",
      fontSize: 14
  },
  saveActionBtn: {
      backgroundColor: COLORS.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8
  },
  saveActionText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14
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
