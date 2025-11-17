import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const MOCK_USER = {
  id: "user123",
  name: "Alex",
  email: "alex@example.com",
  avatar: "A",
};

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
    </View>
  );
}

function ProfileHeader({ user }: { user: typeof MOCK_USER }) {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.avatar}</Text>
      </View>
      <Text style={styles.profileName}>{user.name}</Text>
      <Text style={styles.profileEmail}>{user.email}</Text>
    </View>
  );
}

function SettingsItem({
  icon,
  iconBg,
  text,
  onPress,
}: {
  icon: string;
  iconBg: any;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={[styles.settingsIcon, iconBg]}>
        <FontAwesome5 name={icon} size={20} color="#fff" />
      </View>
      <Text style={styles.settingsText}>{text}</Text>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function ProfileTabScreen() {
  const router = useRouter();
  const handleEditProfile = () => router.push("/profile/edit");
  const handleNotifications = () => router.push("/profile/notifications");
  const handleHelp = () =>
    Alert.alert("Help & Feedback", "Navigating to Help Center...");
  const handleLogout = () =>
    Alert.alert(
      "Log Out",
      "This would open a modal to CONFIRM logout. (Logging out...)"
    );

  return (
    <View style={styles.container}>
      <Header />
      <ProfileHeader user={MOCK_USER} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <SectionHeader title="Account" />
        <View style={styles.sectionCard}>
          <SettingsItem
            icon="user-edit"
            iconBg={styles.bgBlue}
            text="Edit Profile"
            onPress={handleEditProfile}
          />
        </View>
        <SectionHeader title="Settings" />
        <View style={styles.sectionCard}>
          <SettingsItem
            icon="bell"
            iconBg={styles.bgPurple}
            text="Notifications"
            onPress={handleNotifications}
          />
        </View>
        <SectionHeader title="Support" />
        <View style={styles.sectionCard}>
          <SettingsItem
            icon="question-circle"
            iconBg={styles.bgGreen}
            text="Help & Feedback"
            onPress={handleHelp}
          />
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Bottom NavBar visual only, actual navigation handled by tabs */}
      <View style={styles.bottomNavBar}>
        <View style={styles.navBtn}>
          <Ionicons name="home" size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Home</Text>
        </View>
        <View style={styles.navBtn}>
          <Ionicons name="people" size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Groups</Text>
        </View>
        <View style={styles.navBtn}>
          <Ionicons name="pie-chart" size={24} color="#6b7280" />
          <Text style={styles.navLabel}>Activity</Text>
        </View>
        <View style={styles.navBtnActive}>
          <Ionicons name="person" size={24} color="#2563eb" />
          <Text style={styles.navLabelActive}>Profile</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1f2937" },
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { color: "#2563eb", fontWeight: "700", fontSize: 40 },
  profileName: { fontSize: 28, fontWeight: "800", color: "#1f2937" },
  profileEmail: { fontSize: 18, color: "#6b7280", marginTop: 4 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingsText: { fontSize: 17, color: "#1f2937", fontWeight: "600", flex: 1 },
  bgBlue: { backgroundColor: "#2563eb" },
  bgPurple: { backgroundColor: "#a78bfa" },
  bgGreen: { backgroundColor: "#22c55e" },
  logoutBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: { color: "#ef4444", fontSize: 18, fontWeight: "600" },
  bottomNavBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 50,
  },
  navBtn: { flex: 1, alignItems: "center" },
  navBtnActive: { flex: 1, alignItems: "center" },
  navLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  navLabelActive: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "700",
    marginTop: 2,
  },
});
