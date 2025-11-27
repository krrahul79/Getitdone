import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>We've sent a confirmation link to:</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.instructions}>
          Please open your email and click the link to confirm your account.
          Once confirmed, you can log in.
        </Text>
        <View style={{ marginTop: 32 }}>
          <Text
            style={styles.loginButton}
            onPress={() => router.replace("/login")}
          >
            ← Back to Login
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  email: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginTop: 8,
  },
  loginButton: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
  },
});
