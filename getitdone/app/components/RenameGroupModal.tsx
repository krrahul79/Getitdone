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
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

export default function RenameGroupModal({
  visible,
  currentName,
  onClose,
  onRename,
}: {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}) {
  const [groupName, setGroupName] = useState(currentName);
  const [isFocused, setIsFocused] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; 
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setGroupName(currentName);
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1, // Animate to 1 for visible
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
  }, [visible, currentName]);

  useEffect(() => {
    const keyboardWillShow = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardWillHide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(keyboardWillShow, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false, // Layout animation
      }).start();
    });

    const hideSub = Keyboard.addListener(keyboardWillHide, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = () => {
    if (!groupName.trim()) return;
    onRename(groupName.trim());
    setGroupName("");
  };

  if (!visible && !slideAnim) return null; // Simple check, though normally we rely on Modal visible prop

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { paddingBottom: keyboardHeight }]}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0], // Slide up from bottom
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.header}>Rename Group</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                isFocused && styles.inputFocused,
              ]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter a new group name"
              placeholderTextColor={COLORS.textTertiary}
              selectionColor={COLORS.primary}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus={true} 
            />
            
            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                    <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // Bottom sheet style
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    paddingBottom: SPACING.xl + 20, // Safe area padding
    ...SHADOWS.large,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.l,
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  closeBtn: {
      padding: SPACING.xs,
  },
  form: {
    gap: SPACING.m,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
  footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: SPACING.m,
      marginTop: SPACING.m,
  },
  cancelBtn: {
      paddingVertical: SPACING.m,
      paddingHorizontal: SPACING.l,
      borderRadius: BORDER_RADIUS.m,
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
