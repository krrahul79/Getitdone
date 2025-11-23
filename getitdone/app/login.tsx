import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const phoneInput = React.useRef<PhoneInput>(null);

  const handleContinue = async () => {
    setLoading(true);
    // TODO: Implement Supabase OTP logic here
    setTimeout(() => {
      setLoading(false);
      router.replace("/onboarding" as any); // Proceed to onboarding after login
    }, 1200);
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple ID login logic
    router.replace("/onboarding" as any); // Placeholder
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={[styles.title, styles.interFont]}>Sign In</Text>
        <Text style={[styles.subtitle, styles.interFont]}>
          Log in to continue organizing your household tasks.
        </Text>
        <View style={styles.inputContainer}>
          <PhoneInput
            ref={phoneInput}
            defaultValue={phone}
            defaultCode="US"
            layout="first"
            onChangeFormattedText={setPhone}
            containerStyle={{
              width: "100%",
              borderRadius: 10,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#d1d5db",
            }}
            textContainerStyle={{
              borderRadius: 10,
              backgroundColor: "#e0e7ff", // Changed to light color for visibility
              paddingHorizontal: 8,
            }}
            textInputStyle={{
              fontFamily: "Inter",
              fontSize: 17,
              color: "#111827",
              paddingLeft: 0,
              paddingRight: 0,
              margin: 0,
            }}
            codeTextStyle={{
              fontFamily: "Inter",
              fontSize: 17,
              marginLeft: 2,
              marginRight: 2,
              color: "#111827",
            }}
            flagButtonStyle={{
              borderWidth: 2,
              borderColor: "#ef4444", // Red border for visibility
              borderRadius: 6,
              width: 25,
            }}
            disabled={loading}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            styles.signUpButton,
            loading && { opacity: 0.6 },
          ]}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={loading || phone.length < 8}
          accessibilityLabel="Continue with Mobile Number"
        >
          <Text
            style={[
              styles.buttonText,
              styles.signUpButtonText,
              styles.interFont,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={[styles.orText, styles.interFont]}>OR</Text>
          <View style={styles.divider} />
        </View>
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          activeOpacity={0.8}
          onPress={handleAppleLogin}
          accessibilityLabel="Sign in with Apple"
        >
          <FontAwesome
            name="apple"
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.buttonText,
              styles.appleButtonText,
              styles.interFont,
            ]}
          >
            Sign in with Apple
          </Text>
        </TouchableOpacity>
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
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
    maxWidth: 320,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
  },
  button: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  signUpButton: {
    backgroundColor: "#2563eb",
  },
  signUpButtonText: {
    color: "#fff",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    width: "100%",
    justifyContent: "center",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
    marginHorizontal: 8,
  },
  orText: {
    fontSize: 15,
    color: "#6b7280",
  },
  appleButton: {
    backgroundColor: "#111",
  },
  appleButtonText: {
    color: "#fff",
  },
  interFont: {
    fontFamily: "Inter",
  },
});
