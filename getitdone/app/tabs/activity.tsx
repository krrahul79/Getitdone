import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const MOCK_ACTIVITY: ActivityItemType[] = [
  { id: 1, type: "completed", actor: "Jane", object: "Buy groceries", group: "Household", time: "5m ago" },
  { id: 2, type: "rescheduled", actor: "Alex", object: "Take out the trash", group: "Household", time: "1h ago", from: "Today", to: "Tomorrow" },
  { id: 3, type: "created", actor: "Alex", object: "Plan weekend trip", group: "Family", time: "3h ago" },
  { id: 4, type: "joined", actor: "Bob", object: "Weekend Project", group: null, time: "Yesterday" },
  { id: 5, type: "created", actor: "Jane", object: "Call the plumber", group: "Household", time: "Yesterday" },
];

type ActivityType = "completed" | "rescheduled" | "created" | "joined" | "other";
type ActivityItemType = {
  id: number;
  type: ActivityType;
  actor: string;
  object: string;
  group?: string | null;
  time: string;
  from?: string;
  to?: string;
};

function ActivityIcon({ type }: { type: ActivityType }) {
  switch (type) {
    case "completed":
      return <Ionicons name="checkmark-circle" size={24} color="#22c55e" style={styles.iconBgGreen} />;
    case "rescheduled":
      return <FontAwesome5 name="calendar-alt" size={22} color="#f59e42" style={styles.iconBgOrange} />;
    case "created":
      return <Ionicons name="add-circle" size={24} color="#2563eb" style={styles.iconBgBlue} />;
    case "joined":
      return <FontAwesome5 name="user-plus" size={22} color="#a78bfa" style={styles.iconBgPurple} />;
    default:
      return <Ionicons name="information-circle" size={24} color="#6b7280" style={styles.iconBgGray} />;
  }
}

function ActivityItem({ item }: { item: ActivityItemType }) {
  let text;
  switch (item.type) {
    case "completed":
      text = (
        <Text>
          <Text style={styles.bold}>{item.actor}</Text> completed <Text style={styles.bold}>&quot;{item.object}&quot;</Text> in {item.group}
        </Text>
      );
      break;
    case "rescheduled":
      text = (
        <Text>
          <Text style={styles.bold}>{item.actor}</Text> rescheduled <Text style={styles.bold}>&quot;{item.object}&quot;</Text> from {item.from} to {item.to}
        </Text>
      );
      break;
    case "created":
      text = (
        <Text>
          <Text style={styles.bold}>{item.actor}</Text> created <Text style={styles.bold}>&quot;{item.object}&quot;</Text> in {item.group}
        </Text>
      );
      break;
    case "joined":
      text = (
        <Text>
          <Text style={styles.bold}>{item.actor}</Text> joined the <Text style={styles.bold}>&quot;{item.object}&quot;</Text> group
        </Text>
      );
      break;
    default:
      text = <Text>{item.object}</Text>;
  }
  return (
    <View style={styles.activityItem}>
      <View style={styles.iconWrap}><ActivityIcon type={item.type} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityText}>{text}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );
}

function DateHeader({ title }: { title: string }) {
  return <Text style={styles.dateHeader}>{title}</Text>;
}

export default function ActivityTabScreen() {
  const todayActivities = MOCK_ACTIVITY.filter((item) => item.time.includes("ago"));
  const yesterdayActivities = MOCK_ACTIVITY.filter((item) => item.time === "Yesterday");

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Activity Feed</Text></View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        <DateHeader title="Today" />
        {todayActivities.map((item) => <ActivityItem key={item.id} item={item} />)}
        <DateHeader title="Yesterday" />
        {yesterdayActivities.map((item) => <ActivityItem key={item.id} item={item} />)}
        {MOCK_ACTIVITY.length === 0 && (
          <Text style={styles.emptyText}>No activity yet. Go create a task!</Text>
        )}
      </ScrollView>
      {/* Bottom NavBar visual only, actual navigation handled by tabs */}
      <View style={styles.bottomNavBar}>
        <View style={styles.navBtn}><Ionicons name="home" size={24} color="#6b7280" /><Text style={styles.navLabel}>Home</Text></View>
        <View style={styles.navBtn}><Ionicons name="people" size={24} color="#6b7280" /><Text style={styles.navLabel}>Groups</Text></View>
        <View style={styles.navBtnActive}><Ionicons name="pie-chart" size={24} color="#2563eb" /><Text style={styles.navLabelActive}>Activity</Text></View>
        <View style={styles.navBtn}><Ionicons name="person" size={24} color="#6b7280" /><Text style={styles.navLabel}>Profile</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "#fff", padding: 20, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1f2937" },
  scroll: { flex: 1, padding: 20 },
  dateHeader: { fontSize: 13, color: "#6b7280", fontWeight: "600", marginVertical: 10, textTransform: "uppercase" },
  activityItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 16 },
  iconBgGreen: { backgroundColor: "#bbf7d0", borderRadius: 20, padding: 4 },
  iconBgOrange: { backgroundColor: "#fed7aa", borderRadius: 20, padding: 4 },
  iconBgBlue: { backgroundColor: "#dbeafe", borderRadius: 20, padding: 4 },
  iconBgPurple: { backgroundColor: "#ede9fe", borderRadius: 20, padding: 4 },
  iconBgGray: { backgroundColor: "#f3f4f6", borderRadius: 20, padding: 4 },
  activityText: { color: "#374151", fontSize: 16 },
  activityTime: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  bold: { fontWeight: "700", color: "#1f2937" },
  emptyText: { color: "#6b7280", fontSize: 16, textAlign: "center", marginTop: 24 },
  bottomNavBar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 80, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e7eb", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 4, zIndex: 50 },
  navBtn: { flex: 1, alignItems: "center" },
  navBtnActive: { flex: 1, alignItems: "center" },
  navLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  navLabelActive: { fontSize: 12, color: "#2563eb", fontWeight: "700", marginTop: 2 },
});
