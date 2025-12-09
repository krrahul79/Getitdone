import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";
import { useProfile } from "../ProfileContext";
import { useToast } from "../../context/ToastContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const { showToast } = useToast();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await SupabaseService.signOut();
      setProfile(null);
      setLogoutModalVisible(false);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuItems = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      onPress: () => router.push("/profile/edit"),
      color: COLORS.primary,
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => router.push("/profile/notifications"),
      color: COLORS.secondary,
    },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      onPress: () => showToast("Support", "Contact us at support@getitdone.com", "info"),
      color: COLORS.warning,
    },
    {
      icon: "log-out-outline",
      label: "Log Out",
      onPress: () => setLogoutModalVisible(true),
      color: COLORS.error,
      isDestructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerBackground}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.[0] || "?"}
              </Text>
            </View>
            <Text style={styles.name}>{profile?.full_name || "User"}</Text>
            <Text style={styles.email}>{profile?.email || "user@example.com"}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[
                  styles.menuLabel,
                  item.isDestructive && styles.destructiveLabel
                ]}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    marginTop: SPACING.m,
    ...SHADOWS.medium,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
    borderWidth: 4,
    borderColor: "#fff",
    ...SHADOWS.small,
  },
  avatarText: {
    fontFamily: FONTS.extraBold,
    fontSize: 40,
    color: COLORS.primary,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.l,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  menuSection: {
    marginTop: SPACING.xl,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  destructiveLabel: {
    color: COLORS.error,
  },
  versionText: {
    textAlign: "center",
    marginTop: SPACING.xl,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.xl,
    width: "100%",
    alignItems: "center",
    ...SHADOWS.large,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  modalText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: SPACING.m,
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: COLORS.error,
    alignItems: "center",
  },
  modalButtonConfirmText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "#fff",
  },
});
