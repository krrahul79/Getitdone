import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CreateGroupModal from "../components/CreateGroupModal";
import JoinGroupModal from "../components/JoinGroupModal";
import { useGroups, Group } from "../GroupsContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function GroupsScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const { groups, refreshGroups, addGroup } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    refreshGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (groupId: string) => {
    router.push({ pathname: "/groups/[id]", params: { id: groupId } });
  };

  const handleModalCreate = (group: Group) => {
    addGroup(group);
    setCreateModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerBackground}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
        <Text style={styles.headerSubtitle}>Manage your teams and projects</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(99, 102, 241, 0.1)" }]}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Create Group</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => setJoinModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(236, 72, 153, 0.1)" }]}>
            <Ionicons name="enter-outline" size={24} color={COLORS.secondary} />
          </View>
          <Text style={styles.actionText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="users" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>You haven't joined any groups yet.</Text>
            <Text style={styles.emptySubText}>Create one or join an existing one to get started!</Text>
          </View>
        ) : (
          groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => handleGroupPress(group.id)}
            >
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.groupIconCircle,
                    { backgroundColor: group.color || COLORS.primary },
                  ]}
                >
                  <FontAwesome5 name={group.icon as any || "users"} size={20} color="#fff" />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={styles.groupMetaRow}>
                    <FontAwesome5 name="user-friends" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.groupMeta}>
                      {group.members} {group.members === 1 ? "member" : "members"}
                    </Text>
                    {(group.pendingTasks || 0) > 0 && (
                      <>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.pendingTasks}>
                          {group.pendingTasks} pending
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <CreateGroupModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleModalCreate}
      />
      
      <JoinGroupModal
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        onJoin={() => {
          setJoinModalVisible(false);
          refreshGroups();
        }}
      />
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
    height: 180,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.l,
  },
  headerTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: "#fff",
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.l,
    gap: SPACING.m,
    marginTop: SPACING.s,
    marginBottom: SPACING.m,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.s,
    ...SHADOWS.medium,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
    paddingTop: SPACING.s,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  groupIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.m,
    ...SHADOWS.small,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  groupMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupMeta: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  dot: {
    marginHorizontal: 6,
    color: COLORS.textTertiary,
    fontSize: 10,
  },
  pendingTasks: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
