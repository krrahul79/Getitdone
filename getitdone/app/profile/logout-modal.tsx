import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LogoutModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, clear credentials here
    router.replace("/"); // Navigate to Welcome screen
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={styles.modalContent}>
          <View style={styles.iconWrap}>
            <FontAwesome5 name="sign-out-alt" size={32} color="#2563eb" />
          </View>
          <Text style={styles.modalHeader}>Log Out?</Text>
          <Text style={styles.modalBody}>
            Are you sure you want to log out? You will be returned to the
            Welcome screen.
          </Text>
          <View style={styles.buttonCol}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    backgroundColor: "#dbeafe",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  modalBody: {
    color: "#6b7280",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonCol: { width: "100%" },
  logoutBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { color: "#374151", fontSize: 18, fontWeight: "700" },
});
