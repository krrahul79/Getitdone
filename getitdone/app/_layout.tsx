import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { ProfileProvider } from "./ProfileContext";
import { GroupsProvider } from "./GroupsContext";
import { TaskProvider } from "./TaskContext";
import { ToastProvider } from "../context/ToastContext";

import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants/theme";

export default function RootLayout() {
  return (
    <ToastProvider>
      <ProfileProvider>
        <GroupsProvider>
          <TaskProvider>
            <View style={styles.container}>
              <StatusBar style="dark" backgroundColor="transparent" translucent />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }} />
            </View>
          </TaskProvider>
        </GroupsProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
