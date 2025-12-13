import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Easing,
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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      setCode("");
      setError(null);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
        fadeAnim.setValue(0);
        slideAnim.setValue(0);
    }
  }, [visible]);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // The service now handles uppercasing and detailed validation
      const { error: joinError } = await SupabaseService.joinGroupByCode(code);
      if (joinError) {
        setError(typeof joinError === "string" ? joinError : "Failed to join group.");
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

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.overlayContainer}>
          {/* Background Overlay - Handles closing and dimming */}
          <TouchableWithoutFeedback onPress={onClose}>
            <Animated.View 
              style={[
                StyleSheet.absoluteFill, 
                { backgroundColor: "rgba(0,0,0,0.5)", opacity: fadeAnim }
              ]} 
            />
          </TouchableWithoutFeedback>

          {/* Modal Content - Sits on top */}
          <Animated.View 
              style={[
                  styles.modal,
                  {
                      transform: [{
                          translateY: slideAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [600, 0]
                          })
                      }]
                  }
              ]}
          >
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
                  style={[
                      styles.input,
                      isFocused && styles.inputFocused,
                      error && styles.inputError
                  ]}
                  value={code}
                  onChangeText={(text) => {
                  setCode(text);
                  setError(null);
                  }}
                  placeholder="e.g., A8X-992"
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
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
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    paddingBottom: SPACING.xl + 20,
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
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.l,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: SPACING.m,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "transparent",
    textAlign: "center",
    letterSpacing: 4,
  },
  inputFocused: {
      borderColor: COLORS.primary,
      backgroundColor: "#fff",
  },
  inputError: {
      borderColor: COLORS.error,
      color: COLORS.error,
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
    borderRadius: BORDER_RADIUS.m,
    paddingVertical: SPACING.m,
    alignItems: "center",
    ...SHADOWS.primary,
  },
  joinBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "#fff",
  },
});
