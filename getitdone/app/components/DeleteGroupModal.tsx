import React, { useState, useEffect, useRef } from "react";
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
import { FontAwesome5 } from "@expo/vector-icons";

export default function DeleteGroupModal({
  visible,
  groupName,
  onClose,
  onDelete,
}: {
  visible: boolean;
  groupName: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    setConfirmationText("");
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
  }, [visible, groupName]);

  const isDeleteDisabled = confirmationText !== groupName;

  const handleDelete = () => {
    if (isDeleteDisabled) return;
    onDelete();
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.centered}>
          <Animated.View
            style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="trash-alt" size={32} color="#dc2626" />
            </View>
            <Text style={styles.header}>Delete Group?</Text>
            <Text style={styles.bodyText}>
              This is a permanent action. All tasks will be deleted for{" "}
              <Text style={styles.bold}>all members</Text> of this group.
            </Text>
            <Text style={styles.bodyText}>
              To confirm, please type{" "}
              <Text style={styles.bold}>{groupName}</Text> below.
            </Text>
            <TextInput
              style={styles.input}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder={`Type "${groupName}" to confirm`}
              placeholderTextColor="#9ca3af"
              autoFocus={visible}
            />
            <View style={styles.buttonCol}>
              <TouchableOpacity
                style={[
                  styles.deleteBtn,
                  isDeleteDisabled && styles.deleteBtnDisabled,
                ]}
                onPress={handleDelete}
                disabled={isDeleteDisabled}
              >
                <Text style={styles.deleteBtnText}>Delete this group</Text>
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
    marginBottom: 12,
    textAlign: "center",
  },
  bold: {
    fontWeight: "700",
    color: "#1f2937",
  },
  input: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 18,
  },
  buttonCol: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  deleteBtn: {
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
  deleteBtnDisabled: {
    backgroundColor: "#d1d5db",
  },
  deleteBtnText: {
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
