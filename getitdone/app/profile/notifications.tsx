import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ToggleItem({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.toggleItem, disabled && { opacity: 0.5 }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#ccc", true: "#3b82f6" }}
        thumbColor={value ? "#fff" : "#fff"}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [notifyNewTask, setNotifyNewTask] = useState(true);
  const [notifyTaskCompleted, setNotifyTaskCompleted] = useState(true);
  const [notifyRescheduled, setNotifyRescheduled] = useState(true);
  const [notifyDueDate, setNotifyDueDate] = useState(true);

  const handleClose = () => router.back();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <SectionHeader title="Push Notifications" />
        <View style={styles.sectionCard}>
          <ToggleItem
            label="Allow Push Notifications"
            description="Receive alerts when the app is closed."
            value={pushEnabled}
            onValueChange={() => setPushEnabled(!pushEnabled)}
          />
        </View>
        <SectionHeader title="In-App Activity" />
        <View style={styles.sectionCard}>
          <ToggleItem
            label="Show In-App Banners"
            description="Show alerts at the top of the app."
            value={inAppEnabled}
            onValueChange={() => setInAppEnabled(!inAppEnabled)}
          />
        </View>
        <SectionHeader title="Notify me about..." />
        <View style={styles.sectionCard}>
          <ToggleItem
            label="New Task Assigned"
            description="When a member assigns a new task to you."
            value={notifyNewTask}
            onValueChange={() => setNotifyNewTask(!notifyNewTask)}
            disabled={!pushEnabled && !inAppEnabled}
          />
          <ToggleItem
            label="Task Completed"
            description="When a task you assigned is completed."
            value={notifyTaskCompleted}
            onValueChange={() => setNotifyTaskCompleted(!notifyTaskCompleted)}
            disabled={!pushEnabled && !inAppEnabled}
          />
          <ToggleItem
            label="Task Rescheduled"
            description="When a task's due date is changed."
            value={notifyRescheduled}
            onValueChange={() => setNotifyRescheduled(!notifyRescheduled)}
            disabled={!pushEnabled && !inAppEnabled}
          />
          <ToggleItem
            label="Due Date Reminders"
            description="24 hours before a task is due."
            value={notifyDueDate}
            onValueChange={() => setNotifyDueDate(!notifyDueDate)}
            disabled={!pushEnabled && !inAppEnabled}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
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
  headerBtn: { width: 32, alignItems: "center" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  sectionHeader: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  toggleLabel: { fontSize: 17, color: "#1f2937", fontWeight: "600" },
  toggleDesc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
});
