import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SupabaseService } from "../../services/supabaseService";
import { useGroups } from "../GroupsContext";
import { useProfile } from "../ProfileContext";
import { useToast } from "../../context/ToastContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

export default function AddEditTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { groups, getMembersForGroup } = useGroups();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  const isEditMode = !!params.id;

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups]);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMembers(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadGroupMembers = async (groupId: string) => {
    setMembersLoading(true);
    try {
      const members = await getMembersForGroup(groupId);
      setGroupMembers(members);
    } catch (e) {
      console.error("Error loading members:", e);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Validation Error", "Please enter a task title", "error");
      return;
    }
    if (!selectedGroupId) {
       showToast("Validation Error", "Please select a group", "error");
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        group_id: selectedGroupId,
        due_date: dueDate.toISOString(),
        assignees: assignees.length > 0 ? assignees : (profile?.id ? [profile.id] : []), // Default to self if none selected
      };

      const { error } = await SupabaseService.createTask(taskData);

      if (error) {
        showToast("Error", "Failed to create task", "error");
      } else {
        showToast("Success", isEditMode ? "Task updated" : "Task created successfully", "success");
        router.back();
      }
    } catch (e) {
      console.error("Error saving task:", e);
      showToast("Error", "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter((id) => id !== userId));
    } else {
      setAssignees([...assignees, userId]);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(dueDate);
      currentDate.setFullYear(selectedDate.getFullYear());
      currentDate.setMonth(selectedDate.getMonth());
      currentDate.setDate(selectedDate.getDate());
      setDueDate(currentDate);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const currentDate = new Date(dueDate);
      currentDate.setHours(selectedDate.getHours());
      currentDate.setMinutes(selectedDate.getMinutes());
      setDueDate(currentDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Task" : "New Task"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Group</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
            >
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.chip,
                    selectedGroupId === group.id && {
                      backgroundColor: group.color || COLORS.primary,
                      borderColor: group.color || COLORS.primary,
                    },
                  ]}
                  onPress={() => setSelectedGroupId(group.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedGroupId === group.id && styles.chipTextSelected,
                    ]}
                  >
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateButton, showDatePicker && styles.activeDateButton]}
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
                <Text style={[styles.dateText, showDatePicker && styles.activeDateText]}>
                  {dueDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateButton, showTimePicker && styles.activeDateButton]}
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
                <Text style={[styles.dateText, showTimePicker && styles.activeDateText]}>
                  {dueDate.toLocaleTimeString("en-US", {
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
                    value={dueDate}
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
                    value={dueDate}
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
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Assign To</Text>
            {membersLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.assigneeList}
              >
                {groupMembers.map((member) => {
                  const isSelected = assignees.includes(member.id);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.assigneeItem,
                        isSelected && styles.assigneeItemSelected,
                      ]}
                      onPress={() => toggleAssignee(member.id)}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {member.full_name?.[0] || "?"}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkmarkBadge}>
                            <Ionicons name="checkmark" size={10} color="#fff" />
                          </View>
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.assigneeName,
                          isSelected && styles.assigneeNameSelected
                        ]} 
                        numberOfLines={1}
                      >
                        {member.id === profile?.id ? "Me" : member.full_name?.split(" ")[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditMode ? "Save Changes" : "Create Task"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  content: {
    padding: SPACING.l,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.s,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  textArea: {
    minHeight: 100,
  },
  chipList: {
    gap: SPACING.s,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: "#fff",
    fontFamily: FONTS.bold,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.s,
    ...SHADOWS.small,
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
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    marginTop: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  dateText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  assigneeList: {
    gap: SPACING.m,
    paddingVertical: 4,
  },
  assigneeItem: {
    alignItems: "center",
    width: 60,
  },
  assigneeItemSelected: {
    opacity: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  checkmarkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  assigneeName: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  assigneeNameSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  footer: {
    padding: SPACING.l,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.l,
    paddingVertical: SPACING.m,
    alignItems: "center",
    ...SHADOWS.primary,
  },
  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#fff",
  },
});
