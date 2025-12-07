import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { SupabaseService } from "../../services/supabaseService";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface ActivityItem {
  id: number;
  description: string;
  created_at: string;
  type: "task_created" | "task_completed" | "group_joined" | "group_created";
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch (type) {
    case "task_completed":
      return { name: "check-circle", color: COLORS.success, bg: "rgba(16, 185, 129, 0.1)" };
    case "task_created":
      return { name: "plus-circle", color: COLORS.primary, bg: "rgba(99, 102, 241, 0.1)" };
    case "group_joined":
      return { name: "user-plus", color: COLORS.secondary, bg: "rgba(236, 72, 153, 0.1)" };
    case "group_created":
      return { name: "users", color: COLORS.warning, bg: "rgba(245, 158, 11, 0.1)" };
    default:
      return { name: "bell", color: COLORS.textSecondary, bg: COLORS.inputBg };
  }
}

export default function ActivityScreen() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = async () => {
    try {
      const { data, error } = await SupabaseService.getActivityFeed();
      if (error) {
        console.error("Error fetching activity:", error);
      } else {
        setActivities(data || []);
      }
    } catch (e) {
      console.error("Exception fetching activity:", e);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivity();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerBackground}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <Text style={styles.headerSubtitle}>Recent updates from your groups</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="history" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No recent activity.</Text>
            <Text style={styles.emptySubText}>
              Actions taken by you and your group members will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {activities.map((item, index) => {
              const iconData = getActivityIcon(item.type);
              const isLast = index === activities.length - 1;

              return (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={styles.leftColumn}>
                    <View style={[styles.iconCircle, { backgroundColor: iconData.bg }]}>
                      <FontAwesome5 name={iconData.name as any} size={16} color={iconData.color} />
                    </View>
                    {!isLast && <View style={styles.line} />}
                  </View>
                  
                  <View style={styles.rightColumn}>
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.userName}>
                          {item.profiles?.full_name || "Unknown User"}
                        </Text>
                        <Text style={styles.timeAgo}>
                          {getRelativeTime(item.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: 100,
  },
  timeline: {
    marginTop: SPACING.s,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: SPACING.s,
  },
  leftColumn: {
    alignItems: "center",
    width: 40,
    marginRight: SPACING.m,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: -4,
    marginBottom: -4,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: SPACING.l,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  timeAgo: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  description: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 250,
  },
});
