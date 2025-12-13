import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";
import { useProfile } from "../ProfileContext";
import { Group } from "../GroupsContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

const GROUP_COLORS = [
  { bg: "#ef4444" }, // red
  { bg: "#3b82f6" }, // blue
  { bg: "#22c55e" }, // green
  { bg: "#eab308" }, // yellow
  { bg: "#a855f7" }, // purple
  { bg: "#ec4899" }, // pink
  { bg: "#f97316" }, // orange
  { bg: "#06b6d4" }, // cyan
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
  "star",
  "music",
  "gamepad",
  "book",
];

export default function CreateGroupModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (group: Group) => void;
}) {
  const { profile } = useProfile();
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[1].bg); // blue default
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current; 
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
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
    
    if (!profile || !profile.id) {
      setError("No user profile found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await SupabaseService.createGroup(
        groupName,
        selectedIcon,
        selectedColor,
        join_code
      );
      setSelectedIcon(ICONS[0]);
      setLoading(false);
      onClose();
    } catch (e: any) {
      setError(
        e?.message || String(e) || "Failed to create group. Please try again."
      );
      setLoading(false);
    }
  };

  if (!visible && !slideAnim) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0], // Slide up
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.header}>Create New Group</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Form */}
            <View style={styles.form}>
                
                {/* Group Name */}
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused
                ]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g., Household, Family"
                placeholderTextColor={COLORS.textTertiary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                />

                {/* Color Picker */}
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorRow}>
                {GROUP_COLORS.map((c) => (
                    <TouchableOpacity
                    key={c.bg}
                    style={[
                        styles.colorCircle,
                        {
                        backgroundColor: c.bg,
                        },
                        selectedColor === c.bg && styles.selectedColorStats
                    ]}
                    onPress={() => setSelectedColor(c.bg)}
                    >
                        {selectedColor === c.bg && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </TouchableOpacity>
                ))}
                </View>

                {/* Icon Picker */}
                <Text style={styles.label}>Icon</Text>
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
                        size={20}
                        color={selectedIcon === icon ? "#fff" : COLORS.primary}
                    />
                    </TouchableOpacity>
                ))}
                </View>

                {error && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
                )}

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
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.xl + 10,
    maxHeight: "90%",
    ...SHADOWS.large,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.m,
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  closeBtn: {
      padding: SPACING.xs,
  },
  scrollContent: {
      paddingBottom: SPACING.l,
  },
  form: {
    gap: SPACING.s,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputFocused: {
      borderColor: COLORS.primary,
      backgroundColor: "#fff",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.m,
    marginBottom: SPACING.m,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorStats: {
      borderWidth: 3,
      borderColor: COLORS.inputBg,
      ...SHADOWS.small,
      transform: [{scale: 1.1}]
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.s,
    marginBottom: SPACING.m,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "22%", 
    flexGrow: 1,
  },
  iconBtnSelected: {
    backgroundColor: COLORS.primary,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: SPACING.m,
    alignItems: "center",
    marginTop: SPACING.l,
    ...SHADOWS.primary,
  },
  createBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  errorText: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: COLORS.error,
      textAlign: 'center',
      marginTop: SPACING.s,
  }
});
