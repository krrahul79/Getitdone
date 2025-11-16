import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

// Mock data for demo; in a real app, fetch by id
const MOCK_TASKS = [
  {
    id: 1,
    title: "Buy groceries",
    description:
      "Get milk, eggs, bread, and coffee. Also check if we need laundry detergent.",
    groupName: "Household",
    dueDate: "2025-11-03",
    isComplete: false,
    assignedTo: [
      { id: "user123", name: "Alex" },
      { id: "user456", name: "Jane" },
    ],
    createdBy: "Jane",
  },
  // ...add more tasks as needed
];

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const task = MOCK_TASKS.find((t) => t.id === Number(id));
  const [isComplete, setIsComplete] = useState(task?.isComplete ?? false);

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#ef4444", fontSize: 18 }}>Task not found.</Text>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color="#6b7280" />
        </Pressable>
      </View>
    );
  }

  const handleToggleComplete = () => {
    setIsComplete((prev) => !prev);
  };

  const handleReschedule = () => {
    // TODO: open date picker
    alert("This would open a date picker to reschedule.");
  };

  const handleEdit = () => {
    alert(
      "This would navigate to the Add/Edit Task screen, pre-filled with this task's data."
    );
  };

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
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroRow}>
          <Pressable onPress={handleToggleComplete} style={{ marginRight: 16 }}>
            <FontAwesome
              name={isComplete ? "check-circle" : "circle"}
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
      <ScrollView
        style={styles.detailsScroll}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <DetailItem
          icon="align-left"
          label="Description"
          value={task.description || "No description provided."}
        />
        <DetailItem
          icon="calendar"
          label="Due Date"
          value={new Date(task.dueDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
        <DetailItem icon="layer-group" label="Group" value={task.groupName} />
        <AssigneeItem assignees={task.assignedTo} />
        <DetailItem icon="user" label="Created By" value={task.createdBy} />
      </ScrollView>
      {/* Footer Delete Button */}
      <View style={styles.footerDeleteRow}>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => alert("Task deleted. (Navigating back to list...)")}
        >
          <FontAwesome
            name="trash"
            size={18}
            color="#ef4444"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.deleteBtnText}>Delete Task</Text>
        </Pressable>
      </View>
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
        size={22}
        color="#9ca3af"
        style={{ width: 28, textAlign: "center", marginTop: 2 }}
      />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function AssigneeItem({
  assignees,
}: {
  assignees: { id: string; name: string }[];
}) {
  return (
    <View style={styles.detailItem}>
      <FontAwesome
        name="users"
        size={22}
        color="#9ca3af"
        style={{ width: 28, textAlign: "center", marginTop: 2 }}
      />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.detailLabel}>Assigned To</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 4,
          }}
        >
          {assignees.map((user) => (
            <View key={user.id} style={styles.assigneeChip}>
              <Text style={styles.assigneeChipText}>{user.name}</Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerEditBtn: {
    minWidth: 40,
    alignItems: "flex-end",
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
    alignItems: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flexShrink: 1,
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
  detailsScroll: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 17,
    color: "#1f2937",
    fontWeight: "600",
    marginTop: 2,
  },
  assigneeChip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  assigneeChipText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  footerDeleteRow: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
});
