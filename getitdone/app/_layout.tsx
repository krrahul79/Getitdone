import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { ProfileProvider } from "./ProfileContext";
import { GroupsProvider } from "./GroupsContext";
import { TaskProvider } from "./TaskContext";
import { ToastProvider } from "../context/ToastContext";

export default function RootLayout() {
  return (
    <ToastProvider>
      <ProfileProvider>
        <GroupsProvider>
          <TaskProvider>
            <SafeAreaView style={styles.safeArea}>
              <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaView>
          </TaskProvider>
        </GroupsProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", // match your app background
  },
});
