import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";
import { useProfile } from "../ProfileContext";
import { Group } from "../GroupsContext";

const COLORS = [
  { bg: "#ef4444", ring: "#ef4444" }, // red
  { bg: "#3b82f6", ring: "#3b82f6" }, // blue
  { bg: "#22c55e", ring: "#22c55e" }, // green
  { bg: "#eab308", ring: "#eab308" }, // yellow
  { bg: "#a855f7", ring: "#a855f7" }, // purple
  { bg: "#ec4899", ring: "#ec4899" }, // pink
];

const ICONS = [
  "users",
  "heart",
  "briefcase",
  "home",
  "utensils",
  "paw",
  "plane",
  "car",
];

export default function CreateGroupModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  // onCreate now receives the fully created group returned from Supabase
  onCreate: (group: Group) => void;
}) {
  const { profile } = useProfile();
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[1].ring); // blue default
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(1);
    }
  }, [visible]);

  function generateJoinCode() {
    // Example: A8X-992
    const part1 = Math.random().toString(36).substring(2, 5).toUpperCase();
    const part2 = Math.floor(100 + Math.random() * 900);
    return `${part1}-${part2}`;
  }

  const handleSubmit = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    setError(null);
    const join_code = generateJoinCode();
    console.log("[CreateGroupModal] Profile context:", profile);
    if (!profile || !profile.id) {
      setError("No user profile found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      console.log("[CreateGroupModal] Creating group with:", {
        name: groupName,
        icon: selectedIcon,
        color: selectedColor,
        join_code,
        profileId: profile?.id,
      });
      const { data, error } = await SupabaseService.createGroup(
        groupName,
        selectedIcon,
        selectedColor,
        join_code
      );
      if (error) {
        console.error("[CreateGroupModal] Supabase error:", error);
        setError(
          typeof error === "string"
            ? error
            : error?.message || "Failed to create group. Please try again."
        );
        setLoading(false);
        return;
      }
      console.log("[CreateGroupModal] Group created:", data);
      // Map the returned Supabase row into our Group shape
      const createdGroup: Group = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        members:
          data._count?.members ??
          (data.group_members ? data.group_members.length : 1),
        pendingTasks: data.pending_tasks_count ?? 0,
        join_code: data.join_code,
      };
      // Pass the created group back to the caller (so they can add to context)
      onCreate(createdGroup);
      setGroupName("");
      setSelectedColor(COLORS[1].ring);
      setSelectedIcon(ICONS[0]);
      setLoading(false);
      onClose();
    } catch (e: any) {
      console.error("[CreateGroupModal] Exception:", e);
      setError(
        e?.message || String(e) || "Failed to create group. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 500],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.header}>Create New Group</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {/* Form */}
          <View style={styles.form}>
            {/* Group Name */}
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g., Household, Family"
              placeholderTextColor="#9ca3af"
            />
            {/* Color Picker */}
            <Text style={[styles.label, { marginTop: 18 }]}>Pick a color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c.bg}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: c.bg,
                      borderColor: selectedColor === c.ring ? c.ring : "#fff",
                      borderWidth: selectedColor === c.ring ? 3 : 1,
                    },
                  ]}
                  onPress={() => setSelectedColor(c.ring)}
                />
              ))}
            </View>
            {/* Icon Picker */}
            <Text style={[styles.label, { marginTop: 18 }]}>Pick an icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconBtn,
                    selectedIcon === icon && styles.iconBtnSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <FontAwesome5
                    name={icon as any}
                    size={22}
                    color={selectedIcon === icon ? "#fff" : "#2563eb"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {/* Create Button */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.createBtnText}>
                {loading ? "Creating..." : "Create Group"}
              </Text>
            </TouchableOpacity>
            {error && (
              <Text
                style={{ color: "#ef4444", marginTop: 8, textAlign: "center" }}
              >
                {error}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
  },
  form: {
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 2,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 2,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
    marginTop: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  iconBtnSelected: {
    backgroundColor: "#2563eb",
  },
  createBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2563eb",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
