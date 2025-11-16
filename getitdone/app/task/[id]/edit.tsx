import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

const isEditMode = true; // Always in edit mode for this demo
const task = MOCK_TASKS[0]; // For demo, just use the first task

export default function EditTaskScreen() {
  const router = useRouter();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [groupName, setGroupName] = useState(task?.groupName ?? "");
  // For demo, just show names
  const [assignedTo, setAssignedTo] = useState(
    task?.assignedTo.map((u) => u.name).join(", ") ?? ""
  );

  const handleSave = () => {
    // TODO: Save changes to backend
    alert("Task updated!");
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color="#6b7280" />
        </Pressable>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Task description"
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Group</Text>
        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Group name"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput
          style={styles.input}
          value={assignedTo}
          onChangeText={setAssignedTo}
          placeholder="Assignee names (comma separated)"
        />
      </View>
      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
});
