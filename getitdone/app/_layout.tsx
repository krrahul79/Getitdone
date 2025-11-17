import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6", // match your app background
  },
});
