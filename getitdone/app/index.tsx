import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated, // Import Animated
  TouchableOpacity,
} from "react-native"; // Reverted to "react-native" for your mobile app
import { FontAwesome } from "@expo/vector-icons"; // Correct path for mobile
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react"; // Import useEffect and useRef
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { SupabaseService } from "../services/supabaseService";

export default function WelcomeScreen() {
  // Create animated values for each element group
  const logoAnim = useRef(new Animated.Value(0)).current; // 0 = invisible, 1 = visible
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  // Remove device-based identity logic
  // useEffect for animation only
  useEffect(() => {
    // Run animation on component mount
    Animated.stagger(200, [
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Empty array ensures this runs only once

  // Helper function to interpolate values for each animation
  const animatedStyle = (animValue: Animated.Value) => ({
    opacity: animValue, // Fade from 0 to 1
    transform: [
      {
        translateY: (animValue as Animated.Value).interpolate({
          // Slide up
          inputRange: [0, 1],
          outputRange: [10, 0], // from translateY(10px) to 0
        }),
      },
    ],
  });

  // Load Inter font
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null; // Wait for font to load
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Top Section: Logo and Tagline */}
        <View style={styles.topSection}>
          {/* App Logo Placeholder */}
          <Animated.View
            style={[styles.logoContainer, animatedStyle(logoAnim)]}
            accessibilityLabel="App Logo"
          >
            <View
              style={{
                width: 64,
                height: 64,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <FontAwesome
                name="check"
                size={45}
                color="white"
                style={{ position: "absolute", top: 1, left: 12, opacity: 0.7 }}
              />
              <FontAwesome
                name="check"
                size={55}
                color="white"
                style={{ position: "absolute", top: 17, left: 9 }}
              />
            </View>
          </Animated.View>

          <Animated.Text
            style={[styles.title, animatedStyle(titleAnim), styles.interFont]}
          >
            Get It Done
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subtitle,
              animatedStyle(subtitleAnim),
              styles.interFont,
            ]}
          >
            Organize your household tasks, together.
          </Animated.Text>
        </View>
        {/* Bottom Section: Get Started Button */}
        <Animated.View
          style={[styles.bottomSection, animatedStyle(buttonsAnim)]}
        >
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            activeOpacity={0.8}
            onPress={() => router.replace("/login" as any)}
            //onPress={() => router.replace("/flagtest" as any)}
            accessibilityLabel="Get Started"
          >
            <Text
              style={[
                styles.buttonText,
                styles.signUpButtonText,
                styles.interFont,
              ]}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// Define all your styles at the bottom
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // match SafeAreaView and tab background
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 32, // p-8
  },
  topSection: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50, // move top section up
  },
  logoContainer: {
    width: 128, // w-32
    height: 128, // h-32
    backgroundColor: "#2563eb", // bg-blue-600
    borderRadius: 24, // rounded-3xl
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24, // mb-6
    // shadow-lg (This is the native version of icon-shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 36, // text-4xl
    fontWeight: "800", // font-extrabold
    color: "#1f2937", // text-gray-800
    marginBottom: 12, // mb-3
  },
  subtitle: {
    fontSize: 18, // text-lg
    color: "#6b7280", // text-gray-500
    maxWidth: 320, // max-w-xs
    textAlign: "center",
  },
  bottomSection: {
    flexShrink: 0,
    gap: 16, // space-y-4
    marginBottom: 0, // reset
    marginTop: 64, // move button down
  },
  button: {
    width: "100%",
    paddingVertical: 16, // py-4
    borderRadius: 12, // rounded-xl
    // shadow-lg
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }], // This is the 'hover:scale-105' (or active:scale-95) effect
  },
  signUpButton: {
    backgroundColor: "#2563eb", // bg-blue-600
  },
  signUpButtonText: {
    color: "#ffffff", // text-white
  },
  logInButton: {
    backgroundColor: "#2563eb", // bg-blue-600
    borderWidth: 2,
    borderColor: "#2563eb", // border-2 border-blue-600
  },
  logInButtonText: {
    color: "#ffffff", // text-white
  },
  buttonText: {
    // Common text styles for buttons
    fontSize: 18, // text-lg
    fontWeight: "700", // font-bold
    textAlign: "center",
  },
  interFont: {
    fontFamily: "Inter",
  },
});
