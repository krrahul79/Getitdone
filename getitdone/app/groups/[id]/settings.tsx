import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SupabaseService } from "../../../services/supabaseService";
import type { Group, UserProfile } from "../../../services/types";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../../constants/theme";
import RenameGroupModal from "../../components/RenameGroupModal";
import ChangeAppearanceModal from "../../components/ChangeAppearanceModal";
import LeaveGroupModal from "../../components/LeaveGroupModal";
import DeleteGroupModal from "../../components/DeleteGroupModal";
import { useToast } from "../../../context/ToastContext";

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsItem({
  icon,
  iconBg,
  text,
  hasArrow = true,
  onPress,
  danger = false,
}: {
  icon: string;
  iconBg: string;
  text: string;
  hasArrow?: boolean;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={[styles.settingsIcon, { backgroundColor: iconBg }]}>
        <FontAwesome5 name={icon as any} size={18} color="#fff" />
      </View>
      <Text style={[styles.settingsText, danger && { color: COLORS.error }]}>{text}</Text>
      {hasArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

function MemberItem({ member, isAdmin, isCurrentUserFactory, onKick }: { member: any, isAdmin: boolean, isCurrentUserFactory: boolean, onKick: () => void }) {
  return (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{member.full_name?.[0] || "?"}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.memberName}>{member.full_name}</Text>
        {member.is_admin && <Text style={styles.adminBadge}>Admin</Text>}
      </View>
      {/* Show kick button if current user is admin, targeting non-admin, and not self */}
      {isAdmin && !member.is_admin && !isCurrentUserFactory && (
         // Just a placeholder for kick functionality if needed later, generic 'Manage' logic
         // For now, let's keep it read-only for members list in settings unless requested
         <TouchableOpacity onPress={onKick}>
           {/* <Text style={styles.manageBtn}>Remove</Text> */}
         </TouchableOpacity>
      )}
    </View>
  );
}

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [renameModalVisible, setRenameModalVisible] = React.useState(false);
  const [appearanceModalVisible, setAppearanceModalVisible] = React.useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { user, profile } = await SupabaseService.getCurrentUser();
      setCurrentUser((user && profile) ? { 
        ...profile, 
        id: user.id,
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || null
      } : null);

      if (typeof id === 'string') {
        const { data, error } = await SupabaseService.getGroupWithMembers(id);
        if (error) {
           console.error("Error fetching group:", error);
           showToast("Error", "Failed to load group settings", "error");
        } else if (data) {
           setGroup(data.group);
           setMembers(data.members || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

  const handleRenameGroup = async (newName: string) => {
    if (!group) return;
    setRenameModalVisible(false);
    
    // Optimistic
    const oldName = group.name;
    setGroup({ ...group, name: newName });

    const { error } = await SupabaseService.updateGroup(group.id, { name: newName });
    if (error) {
      setGroup({ ...group, name: oldName }); // Revert
      showToast("Error", "Failed to rename group", "error");
    } else {
      showToast("Success", "Group renamed", "success");
    }
  };

  const handleChangeAppearance = async (color: string, icon: string) => {
    if (!group) return;
    setAppearanceModalVisible(false);

    const oldColor = group.color;
    const oldIcon = group.icon;
    setGroup({ ...group, color, icon });

    const { error } = await SupabaseService.updateGroup(group.id, { color, icon });
    if (error) {
      setGroup({ ...group, color: oldColor, icon: oldIcon });
      showToast("Error", "Failed to update appearance", "error");
    } else {
      showToast("Success", "Appearance updated", "success");
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    setLeaveModalVisible(false);
    const { error } = await SupabaseService.leaveGroup(group.id);
    if (error) {
      showToast("Error", "Failed to leave group", "error");
    } else {
      showToast("Success", "You left the group", "success");
      router.replace("/tabs/groups"); 
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    setDeleteModalVisible(false);
    const { error } = await SupabaseService.deleteGroup(group.id);
    if (error) {
      showToast("Error", "Failed to delete group", "error");
    } else {
      showToast("Success", "Group deleted", "success");
      router.replace("/tabs/groups");
    }
  };

  const handleInvite = () => {
     // Navigate to invite or show share sheet (could reuse logic from main screen or add specific invite screen)
     // For now, simpler is creating an alert with code
     Alert.alert("Invite Code", `Share this code: ${group?.join_code}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!group || !currentUser) {
    return (
      <View style={styles.container}>
        <Text>Group not found</Text>
      </View>
    );
  }

  const isUserAdmin = group.created_by === currentUser.id;

  return (
    <View style={styles.container}>
      <LinearGradient
         colors={[COLORS.primary, COLORS.primaryDark]}
         style={styles.headerBackground}
      />
      
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Group Info Preview */}
        <View style={styles.card}>
          <View style={[styles.groupIconCircle, { backgroundColor: group.color }]}>
            <FontAwesome5 name={group.icon as any} size={40} color="#fff" />
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupCode}>Code: {group.join_code}</Text>
        </View>

        {/* General Section */}
        <SectionHeader title="General" />
        <View style={styles.sectionCard}>
          <SettingsItem
            icon="pen"
            iconBg={COLORS.primary}
            text="Rename Group"
            onPress={() => setRenameModalVisible(true)}
          />
          <SettingsItem
            icon="palette"
            iconBg={COLORS.secondary}
            text="Change Appearance"
            onPress={() => setAppearanceModalVisible(true)}
          />
        </View>

        {/* Members Section */}
        <SectionHeader title="Members" />
        <View style={styles.sectionCard}>
          <SettingsItem
            icon="user-plus"
            iconBg={COLORS.success}
            text="Invite Member"
            onPress={handleInvite}
          />
          {members.map((member) => (
            <MemberItem 
              key={member.id} 
              member={member} 
              isAdmin={isUserAdmin}
              isCurrentUserFactory={member.id === currentUser.id}
              onKick={() => console.log("Kick", member.id)} 
            />
          ))}
        </View>

        {/* Danger Zone Section */}
        <SectionHeader title="Danger Zone" />
        <View style={[styles.sectionCard, { borderColor: COLORS.error, borderWidth: 1 }]}>
          <SettingsItem
            icon="sign-out-alt"
            iconBg={COLORS.warning}
            text="Leave Group"
            hasArrow={false}
            danger
            onPress={() => setLeaveModalVisible(true)}
          />
          {isUserAdmin && (
            <SettingsItem
              icon="trash-alt"
              iconBg={COLORS.error}
              text="Delete Group"
              hasArrow={false}
              danger
              onPress={() => setDeleteModalVisible(true)}
            />
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <RenameGroupModal
        visible={renameModalVisible}
        currentName={group.name}
        onClose={() => setRenameModalVisible(false)}
        onRename={handleRenameGroup}
      />
      <ChangeAppearanceModal
        visible={appearanceModalVisible}
        currentColor={group.color}
        currentIcon={group.icon}
        onClose={() => setAppearanceModalVisible(false)}
        onChangeAppearance={handleChangeAppearance}
      />
      <LeaveGroupModal
        visible={leaveModalVisible}
        groupName={group.name}
        onClose={() => setLeaveModalVisible(false)}
        onLeave={handleLeaveGroup}
      />
      <DeleteGroupModal
        visible={deleteModalVisible}
        groupName={group.name}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={handleDeleteGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.l,
  },
  headerIconBtn: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: SPACING.l,
    marginTop: SPACING.s,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.xl,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  groupIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.m,
  },
  groupName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  groupCode: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: SPACING.m,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.m,
  },
  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginLeft: SPACING.xl,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
  },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: SPACING.l,
    borderRadius: BORDER_RADIUS.m,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
  },
  settingsText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  memberName: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.text,
  },
  adminBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 10,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  manageBtn: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
});
