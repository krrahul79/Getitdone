import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

const { width } = Dimensions.get("window");

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
          duration: 250,
          easing: Easing.out(Easing.back(1.5)), // nice pop effect
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.centered}>
          <Animated.View
            style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}
          >
             <View style={styles.headerIcon}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="log-out-outline"
                    size={32}
                    color={COLORS.error}
                  />
                </View>
             </View>
            
            <Text style={styles.header}>Leave Group?</Text>
            <Text style={styles.bodyText}>
              Are you sure you want to leave <Text style={styles.bold}>{groupName}</Text>? You won't be able to access tasks until you join again.
            </Text>
            
            <View style={styles.buttonRow}>
               <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
                <Text style={styles.leaveBtnText}>Leave Group</Text>
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
    maxWidth: 340,
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
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: SPACING.m,
  },
  leaveBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: 12,
    alignItems: "center",
    ...SHADOWS.small,
  },
  leaveBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
});
