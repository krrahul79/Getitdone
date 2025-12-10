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
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

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
  const [isFocused, setIsFocused] = useState(false);

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
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.centered}>
          <Animated.View
            style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}
          >
            <View style={styles.headerIcon}>
                <View style={styles.iconCircle}>
                  <Ionicons name="trash-outline" size={32} color={COLORS.error} />
                </View>
            </View>

            <Text style={styles.header}>Delete Group?</Text>
            <Text style={styles.bodyText}>
              This is a permanent action. All tasks will be deleted for{" "}
              <Text style={styles.bold}>all members</Text> of this group.
            </Text>
            
            <View style={styles.inputContainer}>
                 <Text style={styles.instructionText}>
                  Type <Text style={styles.bold}>{groupName}</Text> to confirm.
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused && styles.inputFocused
                  ]}
                  value={confirmationText}
                  onChangeText={setConfirmationText}
                  placeholder="Type group name"
                  placeholderTextColor={COLORS.textTertiary}
                  autoFocus={true} // Auto focus when modal opens usually good UX here
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
            </View>

            <View style={styles.buttonCol}>
              <TouchableOpacity
                style={[
                  styles.deleteBtn,
                  isDeleteDisabled && styles.deleteBtnDisabled,
                ]}
                onPress={handleDelete}
                disabled={isDeleteDisabled}
              >
                <Text style={styles.deleteBtnText}>Delete Group</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: SPACING.l,
  },
  modal: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.large,
  },
  headerIcon: {
      marginBottom: SPACING.m,
  },
  iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(239, 68, 68, 0.1)", // Light red
      alignItems: "center",
      justifyContent: "center",
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: "center",
  },
  bodyText: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: SPACING.l,
    textAlign: "center",
    lineHeight: 22,
  },
  bold: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inputContainer: {
      width: '100%',
      marginBottom: SPACING.l,
  },
  instructionText: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: SPACING.s,
      textAlign: 'left',
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: 12,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputFocused: {
      borderColor: COLORS.error,
      backgroundColor: "#fff",
  },
  buttonCol: {
    width: "100%",
    flexDirection: "column",
    gap: SPACING.m,
  },
  deleteBtn: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: 14,
    alignItems: "center",
    ...SHADOWS.small,
  },
  deleteBtnDisabled: {
    backgroundColor: COLORS.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});
