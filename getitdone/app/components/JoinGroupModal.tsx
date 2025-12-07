import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

export default function JoinGroupModal({
  visible,
  onClose,
  onJoin,
}: {
  visible: boolean;
  onClose: () => void;
  onJoin: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await SupabaseService.joinGroupByCode(code.trim());
      if (error) {
        setError("Invalid code or already a member.");
      } else {
        setCode("");
        onJoin();
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <View style={styles.modal}>
                <View style={styles.headerRow}>
                  <Text style={styles.header}>Join Group</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.description}>
                  Enter the invite code shared by the group admin.
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={(text) => {
                      setCode(text);
                      setError(null);
                    }}
                    placeholder="e.g., A8X-992"
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.joinBtn, loading && { opacity: 0.7 }]}
                  onPress={handleJoin}
                  disabled={loading || !code.trim()}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.joinBtnText}>Join Group</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl, // Extra padding for bottom safe area
    ...SHADOWS.large,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  description: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.l,
  },
  inputContainer: {
    marginBottom: SPACING.m,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: "center",
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.m,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.l,
    paddingVertical: SPACING.m,
    alignItems: "center",
    ...SHADOWS.primary,
  },
  joinBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#fff",
  },
});
