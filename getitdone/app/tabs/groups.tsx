import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CreateGroupModal from "../components/CreateGroupModal";

const mockGroups = [
  {
    id: "1",
    name: "Product Team",
    members: 5,
    pendingTasks: 3,
    color: "#3b82f6",
    icon: "users",
  },
  {
    id: "2",
    name: "Designers",
    members: 4,
    pendingTasks: 1,
    color: "#ef4444",
    icon: "heart",
  },
  {
    id: "3",
    name: "QA Squad",
    members: 3,
    pendingTasks: 0,
    color: "#22c55e",
    icon: "briefcase",
  },
];

type Group = {
  id: string;
  name: string;
  members: number;
  pendingTasks: number;
  color: string;
  icon: string;
};

export default function GroupsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const router = useRouter();

  const handleGroupPress = (groupId: string) => {
    router.push({ pathname: "/groups/[id]", params: { id: groupId } });
  };

  const handleCreateGroup = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalCreate = (group: {
    name: string;
    color: string;
    icon: string;
  }) => {
    setGroups([
      ...groups,
      {
        id: String(groups.length + 1),
        name: group.name,
        members: 1,
        pendingTasks: 0,
        color: group.color,
        icon: group.icon,
      },
    ]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Groups</Text>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateGroup}>
          <Ionicons name="add-circle" size={24} color="#2563eb" />
          <Text style={styles.createBtnText}>Create New Group</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleGroupPress(group.id)}
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.groupIconCircle,
                  { backgroundColor: group.color },
                ]}
              >
                <FontAwesome5 name={group.icon as any} size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMeta}>
                  {group.members} members
                  {group.pendingTasks > 0
                    ? ` · ${group.pendingTasks} pending tasks`
                    : ""}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <CreateGroupModal
        visible={modalVisible}
        onClose={handleModalClose}
        onCreate={handleModalCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  createBtnText: {
    marginLeft: 6,
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  groupMeta: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
});
