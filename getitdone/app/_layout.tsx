import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { ProfileProvider } from "./ProfileContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <SafeAreaView style={styles.safeArea}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", // match your app background
  },
});
