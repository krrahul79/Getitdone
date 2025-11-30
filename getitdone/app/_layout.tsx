import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { ProfileProvider } from "./ProfileContext";
import { GroupsProvider } from "./GroupsContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <GroupsProvider>
        <SafeAreaView style={styles.safeArea}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </GroupsProvider>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", // match your app background
  },
});
