import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import RenameGroupModal from "../../components/RenameGroupModal";
import ChangeAppearanceModal from "../../components/ChangeAppearanceModal";
import LeaveGroupModal from "../../components/LeaveGroupModal";
import DeleteGroupModal from "../../components/DeleteGroupModal";

const MOCK_GROUP = {
  id: "1",
  name: "Household",
  icon: "home",
  color: "#3b82f6",
  members: [
    { id: "user123", name: "Alex", avatar: "A", isAdmin: true },
    { id: "user456", name: "Jane", avatar: "J", isAdmin: false },
  ],
};
const isUserAdmin = true;

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsItem({
  icon,
  iconBg,
  text,
  hasArrow = true,
  onPress,
}: {
  icon: string;
  iconBg: string;
  text: string;
  hasArrow?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={[styles.settingsIcon, { backgroundColor: iconBg }]}>
        <FontAwesome5 name={icon as any} size={20} color="#fff" />
      </View>
      <Text style={styles.settingsText}>{text}</Text>
      {hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
}

function MemberItem({ member }: { member: (typeof MOCK_GROUP.members)[0] }) {
  const handleManageMember = () => alert(`Managing member: ${member.name}`);
  return (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{member.avatar}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.memberName}>{member.name}</Text>
        {member.isAdmin && <Text style={styles.adminBadge}>Admin</Text>}
      </View>
      {isUserAdmin && !member.isAdmin && (
        <TouchableOpacity onPress={handleManageMember}>
          <Text style={styles.manageBtn}>Manage</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [renameModalVisible, setRenameModalVisible] = React.useState(false);
  const [groupName, setGroupName] = React.useState(MOCK_GROUP.name);
  const [appearanceModalVisible, setAppearanceModalVisible] =
    React.useState(false);
  const [groupColor, setGroupColor] = React.useState(MOCK_GROUP.color);
  const [groupIcon, setGroupIcon] = React.useState(MOCK_GROUP.icon);
  const [leaveModalVisible, setLeaveModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

  const handleBack = () => router.back();
  const handleRename = () => setRenameModalVisible(true);
  const handleEditAppearance = () => setAppearanceModalVisible(true);
  const handleInvite = () => alert("Opening invite modal...");
  const handleLeave = () => setLeaveModalVisible(true);
  const handleDelete = () => setDeleteModalVisible(true);

  const handleRenameGroup = (newName: string) => {
    setGroupName(newName);
    setRenameModalVisible(false);
    // TODO: persist change to backend
  };

  const handleChangeAppearance = (color: string, icon: string) => {
    setGroupColor(color);
    setGroupIcon(icon);
    setAppearanceModalVisible(false);
    // TODO: persist change to backend
  };

  const handleLeaveGroup = () => {
    setLeaveModalVisible(false);
    // TODO: remove user from group and navigate away
    alert("You have left the group. (Navigating back to Groups screen...)");
  };

  const handleDeleteGroup = () => {
    setDeleteModalVisible(false);
    // TODO: delete group and navigate away
    alert(
      "Group has been permanently deleted. (Navigating back to Groups screen...)"
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
          <Ionicons name="chevron-back" size={26} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Settings</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Group Info Preview */}
        <View style={styles.groupPreview}>
          <View
            style={[styles.groupIconCircle, { backgroundColor: groupColor }]}
          >
            <FontAwesome5 name={groupIcon as any} size={40} color="#fff" />
          </View>
          <Text style={styles.groupName}>{groupName}</Text>
        </View>
        {/* General Section */}
        <SectionHeader title="General" />
        <SettingsItem
          icon="pen"
          iconBg="#3b82f6"
          text="Rename Group"
          onPress={handleRename}
        />
        <SettingsItem
          icon="palette"
          iconBg="#a855f7"
          text="Change Appearance"
          onPress={handleEditAppearance}
        />
        {/* Members Section */}
        <SectionHeader title="Members" />
        <SettingsItem
          icon="user-plus"
          iconBg="#22c55e"
          text="Invite Member"
          onPress={handleInvite}
        />
        {MOCK_GROUP.members.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}
        {/* Danger Zone Section */}
        <SectionHeader title="Danger Zone" />
        <SettingsItem
          icon="sign-out-alt"
          iconBg="#ef4444"
          text="Leave Group"
          hasArrow={false}
          onPress={handleLeave}
        />
        {isUserAdmin && (
          <SettingsItem
            icon="trash-alt"
            iconBg="#b91c1c"
            text="Delete Group"
            hasArrow={false}
            onPress={handleDelete}
          />
        )}
      </ScrollView>
      <RenameGroupModal
        visible={renameModalVisible}
        currentName={groupName}
        onClose={() => setRenameModalVisible(false)}
        onRename={handleRenameGroup}
      />
      <ChangeAppearanceModal
        visible={appearanceModalVisible}
        currentColor={groupColor}
        currentIcon={groupIcon}
        onClose={() => setAppearanceModalVisible(false)}
        onChangeAppearance={handleChangeAppearance}
      />
      <LeaveGroupModal
        visible={leaveModalVisible}
        groupName={groupName}
        onClose={() => setLeaveModalVisible(false)}
        onLeave={handleLeaveGroup}
      />
      <DeleteGroupModal
        visible={deleteModalVisible}
        groupName={groupName}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={handleDeleteGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerIconBtn: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  groupPreview: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  groupIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  groupName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
  },
  sectionHeader: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingsText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 18,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  adminBadge: {
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 11,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  manageBtn: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
