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
} from "react-native";
import { useRouter } from "expo-router";
import { supabaseAuthClient } from "../services/supabaseService";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !fullName)) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    let error: null | { message: string } = null;
    let session, user;
    if (isSignUp) {
      // Real Supabase sign up
      const { data, error: signUpError } = await supabaseAuthClient.auth.signUp(
        {
          email,
          password,
          options: { data: { full_name: fullName } },
        }
      );
      console.log("SignUp response:", data, signUpError);
      error = signUpError ? { message: signUpError.message } : null;
      session = data?.session;
      user = data?.user;
      // Wait for profile creation in public.profiles
      if (user && !session) {
        // If user is present but session is null, likely needs email confirmation
        // Poll for profile creation
        let profileExists = false;
        for (let i = 0; i < 10; i++) {
          const { data: profile } = await supabaseAuthClient
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();
          if (profile) {
            profileExists = true;
            break;
          }
          await new Promise((r) => setTimeout(r, 1000)); // wait 1s
        }
        if (!profileExists) {
          // Show a dedicated screen/message instead of alert
          setLoading(false);
          router.replace({
            pathname: "/check-email",
            params: { email },
          });
          return;
        }
      }
    } else {
      // Real Supabase sign in
      const { data, error: signInError } =
        await supabaseAuthClient.auth.signInWithPassword({
          email,
          password,
        });
      console.log("SignIn response:", data, signInError);
      error = signInError ? { message: signInError.message } : null;
      session = data?.session;
      user = data?.user;
    }
    setLoading(false);
    if (error) {
      alert(`Authentication Failed: ${error.message}`);
    } else {
      router.replace("/onboarding" as any);
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
