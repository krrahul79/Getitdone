import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SupabaseService } from "../services/supabaseService"; // <--- Use the Service
import { useProfile } from "./ProfileContext";
import { useGroups } from "./GroupsContext";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setProfile } = useProfile();
  const { refreshGroups } = useGroups();

  const handleAuth = async () => {
    // 1. Basic Validation
    if (!email || !password || (isSignUp && !fullName)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      let result;

      // 2. Call the Service (Abstracts away the direct Supabase calls)
      if (isSignUp) {
        result = await SupabaseService.signUp(email, password, fullName);
      } else {
        result = await SupabaseService.signIn(email, password);
      }

      const { data, error } = result;

      // 3. Handle Errors
      if (error) {
        Alert.alert("Authentication Failed", error.message);
        setLoading(false);
        return;
      }

      // 4. Handle Email Confirmation (Specific to Supabase)
      // If a user object exists but no session, they need to verify email.
      if (isSignUp && data?.user && !data?.session) {
        setLoading(false);
        Alert.alert(
          "Check your email",
          "Please click the confirmation link sent to your email to finish signing up."
        );
        return;
      }

      // 5. Fetch Profile & Update Context
      // We don't need to poll anymore. The DB trigger made the profile instantly.
      const profileResult = await SupabaseService.getCurrentUser();
      const { profile } = profileResult;

      if (profile) {
        setProfile(profile);
        try {
          // Load user's groups into context after profile is set
          await refreshGroups();
        } catch (e) {
          console.warn("Failed to refresh groups after login:", e);
        }
      } else {
        console.warn(
          "User logged in, but profile fetch failed:",
          profileResult
        );
      }

      // 6. Navigate
      if (isSignUp) {
        // Optional: Go to onboarding if it's a new user
        router.replace("/onboarding");
      } else {
        router.replace("/tabs/home");
      }
    } catch (e) {
      console.error("Auth Exception:", e);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={48}
      >
        <View style={styles.content}>
          <View style={{ marginBottom: 32 }}>
            <Text style={styles.title}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? "Sign up to start organizing."
                : "Log in to see your tasks."}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? "Sign Up" : "Log In"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? "Already have an account? Log In"
                  : "New here? Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 4,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 0,
    textAlign: "left",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 0,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  toggleButton: {
    marginTop: 16,
    alignItems: "center",
  },
  toggleText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
