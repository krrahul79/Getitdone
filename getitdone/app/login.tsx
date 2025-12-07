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
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SupabaseService } from "../services/supabaseService";
import { useProfile } from "./ProfileContext";
import { useGroups } from "./GroupsContext";
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

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
    if (!email || !password || (isSignUp && !fullName)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await SupabaseService.signUp(email, password, fullName);
      } else {
        result = await SupabaseService.signIn(email, password);
      }

      const { data, error } = result;

      if (error) {
        Alert.alert("Authentication Failed", error.message);
        setLoading(false);
        return;
      }

      if (isSignUp && data?.user && !data?.session) {
        setLoading(false);
        Alert.alert(
          "Check your email",
          "Please click the confirmation link sent to your email to finish signing up."
        );
        return;
      }

      const profileResult = await SupabaseService.getCurrentUser();
      const { profile } = profileResult;

      if (profile) {
        setProfile(profile);
        try {
          await refreshGroups();
        } catch (e) {
          console.warn("Failed to refresh groups after login:", e);
        }
      }

      if (isSignUp) {
        router.replace("/tabs/home"); // Go straight to home, onboarding can be part of home empty state
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
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                {isSignUp ? "Create Account" : "Welcome Back"}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? "Join us to start organizing your life."
                  : "Log in to access your groups and tasks."}
              </Text>
            </View>

            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={COLORS.textTertiary}
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
                  placeholderTextColor={COLORS.textTertiary}
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
                  placeholderTextColor={COLORS.textTertiary}
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
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isSignUp ? "Sign Up" : "Log In"}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>
                    {isSignUp ? "Log In" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: "center",
    paddingTop: 80, // Ensure content clears the back button
  },
  backButton: {
    position: "absolute",
    top: SPACING.xl,
    left: SPACING.xl,
    zIndex: 10,
    padding: SPACING.s,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: SPACING.l,
  },
  inputGroup: {
    gap: SPACING.s,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.l,
    paddingVertical: SPACING.m,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.s,
    ...SHADOWS.primary,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.m,
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  linkText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
  },
});
