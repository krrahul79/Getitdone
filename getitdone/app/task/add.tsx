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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

export default function AddEditTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { groups, getMembersForGroup } = useGroups();
  const { profile } = useProfile();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
      Alert.alert("Error", "Please enter a task title");
      return;
    }
    if (!selectedGroupId) {
      Alert.alert("Error", "Please select a group");
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        group_id: selectedGroupId,
        due_date: dueDate.toISOString(),
        assignees: assignees.length > 0 ? assignees : [profile?.id], // Default to self if none selected
      };

      const { error } = await SupabaseService.createTask(taskData);

      if (error) {
        Alert.alert("Error", "Failed to create task");
      } else {
        router.back();
      }
    } catch (e) {
      console.error("Error saving task:", e);
      Alert.alert("Error", "An unexpected error occurred");
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
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDueDate(selectedDate);
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
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>
                {dueDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
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
  dateButton: {
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
