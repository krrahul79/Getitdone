import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { SupabaseService } from "../../services/supabaseService";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notifyNewTask, setNotifyNewTask] = useState(true);
  const [notifyTaskComplete, setNotifyTaskComplete] = useState(true);
  const [notifyGroupJoin, setNotifyGroupJoin] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPushEnabled(status === "granted");
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!Device.isDevice) {
      Alert.alert("Error", "Must use physical device for Push Notifications");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Permission required", "Please enable notifications in settings.");
      setPushEnabled(false);
      return;
    }

    setPushEnabled(true);
    
    // Get the token
    try {
      if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
          console.log('Skipping push token registration in Expo Go Android');
          // Don't error, just return or set a "fake" state if needed
          Alert.alert("Development Build Required", "Push notifications on Android require a Development Build in Expo SDK 53+. Please refer to the guide.");
          return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;
        
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenData.data;
      console.log("Push Token:", token);

      // Save to Supabase
      await SupabaseService.registerPushToken(token);
    } catch (e: any) {
        // Fallback for the specific error string if appOwnership doesn't catch it
        if (e.message && e.message.includes("functionality provided by expo-notifications was removed")) {
             Alert.alert("Development Build Required", "Push notifications require a Development Build. See guide.");
        } else {
             console.error("Error getting push token:", e);
        }
    }
  };

  const togglePush = (value: boolean) => {
    if (value) {
      registerForPushNotificationsAsync();
    } else {
      // Ideally we would unregister or delete token, but for now just toggle state
      setPushEnabled(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Allow Push Notifications</Text>
              <Text style={styles.rowSubtitle}>Receive updates on your device</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={togglePush}
              trackColor={{ false: COLORS.inputBg, true: COLORS.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionSubtitle}>Customize what you want to be notified about</Text>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>New Tasks</Text>
              <Text style={styles.rowSubtitle}>When a task is assigned to you</Text>
            </View>
            <Switch
              value={notifyNewTask}
              onValueChange={setNotifyNewTask}
              disabled={!pushEnabled}
              trackColor={{ false: COLORS.inputBg, true: COLORS.primary }}
              thumbColor={"#fff"}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Task Completion</Text>
              <Text style={styles.rowSubtitle}>When a task in your group is done</Text>
            </View>
            <Switch
              value={notifyTaskComplete}
              onValueChange={setNotifyTaskComplete}
              disabled={!pushEnabled}
              trackColor={{ false: COLORS.inputBg, true: COLORS.primary }}
              thumbColor={"#fff"}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Group Updates</Text>
              <Text style={styles.rowSubtitle}>New members or group changes</Text>
            </View>
            <Switch
              value={notifyGroupJoin}
              onValueChange={setNotifyGroupJoin}
              disabled={!pushEnabled}
              trackColor={{ false: COLORS.inputBg, true: COLORS.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  content: {
    padding: SPACING.l,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.m,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.s,
    ...SHADOWS.small,
  },
  rowInfo: {
    flex: 1,
    paddingRight: SPACING.m,
  },
  rowTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
