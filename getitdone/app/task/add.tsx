import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const MOCK_GROUPS = [
  { id: "g1", name: "Household" },
  { id: "g2", name: "Family" },
  { id: "g3", name: "Weekend Project" },
];
const MOCK_GROUP_MEMBERS = {
  g1: [
    { id: "user123", name: "Alex" },
    { id: "user456", name: "Jane" },
  ],
  g2: [
    { id: "user123", name: "Alex" },
    { id: "user789", name: "Bob" },
  ],
  g3: [
    { id: "user123", name: "Alex" },
    { id: "user456", name: "Jane" },
  ],
};
const MOCK_EDIT_TASK = {
  title: "Buy groceries",
  description:
    "Get milk, eggs, bread, and coffee. Also check if we need laundry detergent.",
  selectedGroup: "g1",
  assignedMembers: ["user123", "user456"],
  dueDate: "2025-11-03",
};

export default function AddEditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditMode = Boolean(id);

  // Prefill for edit mode
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>(MOCK_GROUPS[0].id);
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState<Date | null>(null);

  useEffect(() => {
    if (isEditMode) {
      setTitle(MOCK_EDIT_TASK.title);
      setDescription(MOCK_EDIT_TASK.description);
      setSelectedGroup(MOCK_EDIT_TASK.selectedGroup);
      setAssignedMembers([...MOCK_EDIT_TASK.assignedMembers]);
      setDueDate(MOCK_EDIT_TASK.dueDate);
      setDateValue(new Date(MOCK_EDIT_TASK.dueDate));
    }
  }, [isEditMode]);

  const availableMembers: { id: string; name: string }[] =
    (MOCK_GROUP_MEMBERS as any)[selectedGroup] || [];

  const handleMemberToggle = (memberId: string) => {
    setAssignedMembers((prev: string[]) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = () => {
    const taskData = {
      title,
      description,
      selectedGroup,
      assignedMembers,
      dueDate,
    };
    if (isEditMode) {
      alert("Task Updated! Check the console.");
    } else {
      alert("Task Created! Check the console.");
    }
    router.back();
  };

  // Format date for display
  const formatDateTime = (date: Date | null) => {
    if (!date) return "Select date & time";
    // Use locale from device
    const locale = I18nManager.isRTL ? "ar" : undefined;
    return date.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateValue(selectedDate);
      setDueDate(selectedDate.toISOString().slice(0, 16).replace("T", " "));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.fullScreen}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="times" size={24} color="#6b7280" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Task" : "New Task"}
          </Text>
          <Pressable onPress={handleSave}>
            <Text style={styles.headerSaveText}>Save</Text>
          </Pressable>
        </View>
        {/* Form Body */}
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Do laundry"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Separate whites and colors"
              multiline
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Group</Text>
            <View style={styles.selectBox}>
              {MOCK_GROUPS.map((group) => (
                <Pressable
                  key={group.id}
                  style={[
                    styles.selectOption,
                    selectedGroup === group.id && styles.selectOptionActive,
                  ]}
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      selectedGroup === group.id &&
                        styles.selectOptionTextActive,
                    ]}
                  >
                    {group.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Assign to</Text>
            <View style={styles.chipRow}>
              {availableMembers.map((member: { id: string; name: string }) => (
                <Pressable
                  key={member.id}
                  style={[
                    styles.chip,
                    assignedMembers.includes(member.id)
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => handleMemberToggle(member.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      assignedMembers.includes(member.id) &&
                        styles.chipTextActive,
                    ]}
                  >
                    {member.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date</Text>
            <View style={styles.dateRow}>
              <Pressable
                style={[styles.input, styles.dateInput, { flex: 1 }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={{
                    color: dateValue ? "#1f2937" : "#6b7280",
                    fontSize: 16,
                  }}
                >
                  {formatDateTime(dateValue)}
                </Text>
                <FontAwesome
                  name="calendar"
                  size={18}
                  color="#6b7280"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={dateValue || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  style={styles.datePicker}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSaveText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 17,
  },
  formScroll: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 12,
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
  selectBox: {
    flexDirection: "row",
    gap: 8,
  },
  selectOption: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  selectOptionActive: {
    backgroundColor: "#2563eb",
  },
  selectOptionText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "500",
  },
  selectOptionTextActive: {
    color: "#fff",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipInactive: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  chipText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 12,
    minHeight: 48,
    marginBottom: 0,
  },
  datePicker: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 48,
    zIndex: 10,
  },
});
