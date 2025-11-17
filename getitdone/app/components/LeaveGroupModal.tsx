import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function LeaveGroupModal({
  visible,
  groupName,
  onClose,
  onLeave,
}: {
  visible: boolean;
  groupName: string;
  onClose: () => void;
  onLeave: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.centered}>
          <Animated.View
            style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5
                name="exclamation-triangle"
                size={32}
                color="#dc2626"
              />
            </View>
            <Text style={styles.header}>Leave Group?</Text>
            <Text style={styles.bodyText}>
              Are you sure you want to leave the{" "}
              <Text style={styles.bold}>{groupName}</Text> group? You will be
              removed from all tasks.
            </Text>
            <View style={styles.buttonCol}>
              <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
                <Text style={styles.leaveBtnText}>Leave</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  bodyText: {
    color: "#52525b",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  bold: {
    fontWeight: "700",
    color: "#1f2937",
  },
  buttonCol: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  leaveBtn: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#dc2626",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  leaveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#1f2937",
    fontWeight: "700",
    fontSize: 18,
  },
});
