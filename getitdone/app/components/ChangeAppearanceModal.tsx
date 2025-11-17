import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const COLORS = [
  { bg: "#ef4444" }, // red
  { bg: "#3b82f6" }, // blue
  { bg: "#22c55e" }, // green
  { bg: "#eab308" }, // yellow
  { bg: "#a855f7" }, // purple
  { bg: "#ec4899" }, // pink
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
  const slideAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setSelectedColor(currentColor);
    setSelectedIcon(currentIcon);
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
  }, [visible, currentColor, currentIcon]);

  const handleSave = () => {
    onChangeAppearance(selectedColor, selectedIcon);
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
            <Text style={styles.header}>Change Appearance</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>
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
          <Text style={[styles.label, { marginTop: 10 }]}>Pick a color</Text>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c.bg}
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor: c.bg,
                    borderColor: selectedColor === c.bg ? c.bg : "#fff",
                    borderWidth: selectedColor === c.bg ? 3 : 1,
                  },
                ]}
                onPress={() => setSelectedColor(c.bg)}
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
          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
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
  previewSection: {
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#f3f4f6",
    borderRadius: 18,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  previewCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
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
  saveBtn: {
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
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
