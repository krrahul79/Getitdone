import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
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

export default function ChangeAppearanceModal({
  visible,
  currentColor,
  currentIcon,
  onClose,
  onChangeAppearance,
}: {
  visible: boolean;
  currentColor: string;
  currentIcon: string;
  onClose: () => void;
  onChangeAppearance: (color: string, icon: string) => void;
}) {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedColor(currentColor);
    setSelectedIcon(currentIcon);
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
  }, [visible, currentColor, currentIcon]);

  const handleSave = () => {
    onChangeAppearance(selectedColor, selectedIcon);
  };

  if (!visible && !slideAnim) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.header}>Appearance</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>PREVIEW</Text>
              <View
                style={[styles.previewCircle, { backgroundColor: selectedColor }]}
              >
                <FontAwesome5 name={selectedIcon as any} size={40} color="#fff" />
              </View>
            </View>

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
                      borderColor: selectedColor === c.bg ? c.bg : "transparent",
                      borderWidth: selectedColor === c.bg ? 0 : 0,
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
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
             <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
             </TouchableOpacity>
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
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.xl + 10,
    maxHeight: "85%", // Limit height
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
  previewSection: {
    alignItems: "center",
    paddingVertical: SPACING.l,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.l,
    marginBottom: SPACING.l,
  },
  previewLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: SPACING.m,
    letterSpacing: 1,
  },
  previewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
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
      borderColor: COLORS.inputBg, // Ring effect
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
    width: (48), // approx
    height: 48,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "22%", // Create a grid
    flexGrow: 1,
  },
  iconBtnSelected: {
    backgroundColor: COLORS.primary,
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: SPACING.m,
      marginTop: SPACING.s,
      paddingTop: SPACING.m,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
  },
  cancelBtn: {
      paddingVertical: SPACING.m,
      paddingHorizontal: SPACING.l,
  },
  cancelBtnText: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      color: COLORS.textSecondary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.primary,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
