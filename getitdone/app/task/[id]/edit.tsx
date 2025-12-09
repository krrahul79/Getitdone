import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SupabaseService } from "../../../services/supabaseService";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../../constants/theme";

// Types
import { UserProfile } from "../../../services/types";
import { useToast } from "../../../context/ToastContext";

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  
  // Data State
  const [groupMembers, setGroupMembers] = useState<UserProfile[]>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Task Details
      const { data: task, error: taskError } = await SupabaseService.getTask(
        id as string
      );
      
      if (taskError || !task) {
        console.error("Error fetching task:", taskError);
        showToast("Error", "Failed to load task details.", "error");
        return;
      }

      setTitle(task.title);
      setDescription(task.description);
      setAssigneeIds(task.assignees || []);
      setGroupName(task.groupName || "");

      // 2. Fetch Group Members (using group_id from task)
      if (task.group_id) {
        const { data: groupData, error: groupError } = 
          await SupabaseService.getGroupWithMembers(task.group_id);
          
        if (groupError) {
          console.error("Error fetching members:", groupError);
        } else if (groupData && groupData.members) {
           setGroupMembers(groupData.members);
        }
      }

    } catch (e) {
      console.error("Exception loading edit data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignee = (userId: string) => {
    setAssigneeIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Validation", "Title is required.", "error");
      return;
    }

    setSaving(true);
    try {
      const { error } = await SupabaseService.updateTaskDetails(
        id as string,
        { title, description },
        assigneeIds
      );

      if (error) {
        console.error("Update Error:", error);
        showToast("Error", "Failed to update task.", "error");
      } else {
        showToast("Success", "Task updated successfully.", "success");
        router.back();
      }
    } catch (e) {
      console.error("Exception saving task:", e);
      showToast("Error", "An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <FontAwesome name="times" size={24} color={COLORS.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <Pressable 
          onPress={handleSave} 
          disabled={saving}
          style={[styles.headerBtn, saving && { opacity: 0.5 }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
             <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Title Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Description Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Group Info (Read Only) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Group</Text>
          <View style={styles.readOnlyField}>
            <FontAwesome name="group" size={16} color={COLORS.textSecondary} style={{marginRight: 8}}/>
            <Text style={styles.readOnlyText}>{groupName || "Loading..."}</Text>
          </View>
        </View>

        {/* Assignees Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Assigned To</Text>
          <View style={styles.membersList}>
            {groupMembers.map((member) => {
              const isSelected = assigneeIds.includes(member.id);
              return (
                <Pressable
                  key={member.id}
                  style={[
                    styles.memberRow,
                    isSelected && styles.memberRowSelected
                  ]}
                  onPress={() => handleToggleAssignee(member.id)}
                >
                  <View style={styles.memberInfo}>
                    {member.avatar_url ? (
                      <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                         <Text style={styles.avatarText}>{member.full_name?.[0]}</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.memberName,
                      isSelected && styles.memberNameSelected
                    ]}>
                      {member.full_name}
                    </Text>
                  </View>
                  
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Full white background for clean edit screen
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16, // SafeArea buffer
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#fff",
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  saveText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    padding: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  textArea: {
    minHeight: 120,
  },
  readOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    padding: 16,
    opacity: 0.7,
  },
  readOnlyText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  membersList: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    overflow: "hidden",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  memberRowSelected: {
    backgroundColor: "#e0e7ff", // Light indigo
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  memberName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  memberNameSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
